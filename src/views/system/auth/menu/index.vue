<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="6" style="width: 500px;">
        <el-card style="padding: 30px;">
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="addMenuAuth">添加</el-button>
          <ul>
            <li class="center-float-left item top-lr-scatter" :style="{background:group.flag?'':'#ecedef'}" v-for="(group,index) in menuGroupData"
              @click="memuGroupSelected(group.groupId, group.menuList,index)">
              <span>{{ group.name }}</span>
              <i style="color: red;font-size: 24px;" class="el-icon-circle-close" @click="deleteMenuAuth(index)"></i>
            </li>
          </ul>
        </el-card>
      </el-col>
      <el-col :span="4" style="width: 332px;">
        <el-card style="padding: 30px;">
          <el-tree :props="defaultProps" :data="menuTreeData" ref="tree" show-checkbox node-key="menuId"
            :default-expanded-keys="selectMenus" :default-checked-keys="selectMenus">
          </el-tree>
        </el-card>
      </el-col>
      <el-col :span="12" style="width:996px;">
        <el-card style="padding: 30px;">
          <ul>
            <li class="center-float-left item1 top-lr-scatter" v-for="(detail, index) in authDetail">
              <span>权限组</span>
              <div class="center-float-left" v-for="auth in detail.auths">
                <el-form label-width="50px" :inline="true">
                  <el-form-item label="部门" prop="department">
                    <el-select v-model="auth.department" placeholder="请输入部门">
                      <el-option v-for="item in deptList" :key="item.targetIdColumnInputSelect + ''" :label="item.targetNameColumnInputSelect"
                        :value="item.targetIdColumnInputSelect + ''" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="角色" prop="role">
                    <el-select v-model="auth.role" placeholder="请输入角色">
                      <el-option v-for="item in roleList" :key="item.targetIdColumnInputSelect + ''" :label="item.targetNameColumnInputSelect"
                        :value="item.targetIdColumnInputSelect + ''" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="用户" prop="user">
                    <el-select v-model="auth.user" placeholder="请输入用户">
                      <el-option v-for="item in userList" :key="item.targetIdColumnInputSelect + ''" :label="item.targetNameColumnInputSelect"
                        :value="item.targetIdColumnInputSelect + ''" />
                    </el-select>
                  </el-form-item>
                </el-form>
              </div>
              <!-- <el-button type="primary" icon="el-icon-plus" size="mini" @click="addAuthDetail(index)">添加</el-button> -->
              <i style="color: red;font-size: 24px;" class="el-icon-circle-close" @click="deleteAuthDetail(index)"></i>
            </li>
            <div class="mt30">
              <el-button type="primary" icon="el-icon-plus" size="mini" @click="addAuth">添加组</el-button>
              <el-button type="primary" icon="el-icon-plus" size="mini" @click="save">保存</el-button>
            </div>
          </ul>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加菜单组权限 对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="400px" :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="120px">
        <el-form-item label="菜单组名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜单组名称" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import * as menuAuth from "@/api/system/menuauth";
  import * as shuxinTool from '@/utils/shuxin-tool'

  export default {
    data() {
      return {
        defaultProps: {
          children: 'children',
          label: 'menuName'
        },
        open: false,
        title: '',
        //部门下拉数据
        deptList: [],
        //角色下拉数据
        roleList: [],
        //用户下拉数据
        userList: [],
        selectMenus: [],
        //菜单组数据
        menuGroupData: [],
        //菜单下拉树数据
        menuTreeData: [],
        //单个组的权限明细
        authDetail: [],
        //未保存提醒
        saveFlag: false,
        //选中的菜单组权限
        selectedGroupIndex: '',
        form: {}
      };
    },
    created() {
      this.menuAuthGroupList();
      this.menuTree();
      this.deptInputSelect();
      this.roleInputSelect();
      this.userInputSelect();
    },
    methods: {
      // 部门下拉
      deptInputSelect(query) {
        var that = this;
        this.inputSelectList("sys_user", "dept_id", query, function(data) {
          that.deptList = data;
        });
      },
      // 角色下拉
      roleInputSelect(query) {
        var that = this;
        this.inputSelectList("sys_user", "role_id", query, function(data) {
          that.roleList = data;
        });
      },
      // 用户下拉
      userInputSelect(query) {
        var that = this;
        this.inputSelectList("s_auth", "create_by", query, function(data) {
          that.userList = data;
        });
      },
      //查询菜单组权限
      menuAuthGroupList() {
        menuAuth.menuAuthGroupList().then(response => {
          for (var i = 0; i < response.data.length; i++) {
            response.data[i].flag = true
          }
          this.menuGroupData = response.data;

          this.saveFlag = false;
          this.selectedGroupIndex = undefined;
        });
      },
      menuTree() {
        menuAuth.getMenuTreeData().then(response => {
          this.menuTreeData = response.data;
        });
      },
      memuGroupChecked(groupId, menuList, index){
        this.selectedGroupIndex = index;
        menuAuth.getMenuTreeData().then(response => {
          var menuGroupData = this.menuGroupData;
          for (var i = 0; i < menuGroupData.length; i++) {
            menuGroupData[i].flag = true
            if (menuGroupData[index].flag) {
              menuGroupData[index].flag = false
            } else {
              menuGroupData[i].flag = true
            }
          }
          this.menuGroupData = menuGroupData;
          this.menuTreeData = response.data;
          this.selectMenus = menuList;
        });
        //菜单组权限明细
        menuAuth.getMenuGroupAuth(groupId).then(response => {
          this.authDetail = response.data;
        });
      },
      memuGroupSelected(groupId, menuList, index) {
        if (this.selectedGroupIndex == index){
            return;
        }
        var that = this;
        if (this.saveFlag){
          this.$confirm('未保存，是否确认切换', "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(function() {
            that.memuGroupChecked(groupId, menuList, index);
            that.saveFlag = false;
          });
        }else{
          this.memuGroupChecked(groupId, menuList, index);
        }
      },
      //删除菜单权限
      deleteMenuAuth(index) {
        if (shuxinTool.isEmpty(this.menuGroupData)) {
          return;
        }
        var groupId;
        for (var i = 0; i < this.menuGroupData.length; i++) {
          if (i == index) {
            groupId = this.menuGroupData[i].groupId;
            break;
          }
        }
        var that = this;
        //如果groupId 为空，则表示删除的为刚刚新增的。
        this.$confirm('是否确认删除', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          if (shuxinTool.isEmpty(groupId)) {
            for (var i = 0; i < that.menuGroupData.length; i++) {
              if (i == index) {
                that.menuGroupData.splice(i, 1);;
                break;
              }
            }
          }
          return menuAuth.delMenuGroupAuth(groupId);
        }).then(() => {
          this.menuAuthGroupList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
      },
      //添加菜单权限
      addMenuAuth() {
        this.open = true;
        this.title = '添加菜单组';
      },
      submitForm() {
        for (var i = 0; i < this.menuGroupData.length; i++) {
          this.menuGroupData[i].flag = true

          //菜单组名称不能重复校验
          if (this.menuGroupData[i].name == this.form.name){
            this.msgSuccess("名称不能重复");
            return;
          }
        }

        menuAuth.getMenuTreeData().then(response => {
          this.menuTreeData = response.data;
          this.selectMenus = [];
          this.authDetail = [];
          this.menuGroupData.push({
            flag: false,
            name: this.form.name,
            menuList: []
          })
          this.selectedGroupIndex = this.menuGroupData.length - 1;
          this.open = false;
        });
      },
      cancel() {
        this.open = false;
      },
      deleteAuthDetail(index) {
        this.saveFlag = true;
        if (shuxinTool.isEmpty(this.authDetail)) {
          return;
        }
        for (var i = 0; i < this.authDetail.length; i++) {
          if (i == index) {
            this.authDetail.splice(i, 1);
            return;
          }
        }
      },
      //添加菜单组权限
      addAuth() {
        if (shuxinTool.isEmpty(this.selectedGroupIndex)){
          return;
        }
        this.saveFlag = true;
        if (shuxinTool.isEmpty(this.authDetail)) {
          this.authDetail = [];
        }
        this.authDetail.push({
          authType: 1,
          auths: [{
          department: '',
          role: '',
          user: ''
        }]
        });
      },
      addAuthDetail(index) {
        this.saveFlag = true;
        this.authDetail[index].auths.push({
          department: '',
          role: '',
          user: ''
        });
      },
      //保存菜单权限
      save(){
        if (shuxinTool.isEmpty(this.selectedGroupIndex) || shuxinTool.isEmpty(this.menuGroupData)){
          return;
        }
        var memuGroup = this.menuGroupData[this.selectedGroupIndex];
        var nodes = this.$refs.tree.getCheckedNodes();
        var nodeIds = [];
        if (!shuxinTool.isEmpty(nodes)) {
          for (var i = 0; i < nodes.length; i++) {
            nodeIds.push(nodes[i].menuId);
          }
        }
        if (shuxinTool.isEmpty(nodeIds)){
          this.msgSuccess("请勾选菜单");
          return;
        }
        var that = this;
        menuAuth.saveMenuGroupAuth(memuGroup.groupId, memuGroup.name, nodeIds, this.authDetail).then(response => {
          that.saveFlag = false;
          that.msgSuccess("保存成功");
          that.menuAuthGroupList();
        });
      }
    }
  };
</script>
<style scoped="scoped">
  ul {
    padding: 20px 0;
    margin: 0;
  }

  ul li {
    list-style: none;
    padding: 0 10px;
    margin: 0;
  }

  .item,
  .item1 {
    height: 50px;
    line-height: 50px;
    border-bottom: 1px solid #ddd;
    color: #666;
    cursor: pointer;
  }

  .el-form-item {
    margin-bottom: 0;
  }
</style>
