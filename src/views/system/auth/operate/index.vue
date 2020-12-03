<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="4" style="width: 500px;">
        <el-card style="padding: 30px;">
          <ul>
            <li class="center-float-left item top-lr-scatter" :style="{background:group.flag?'':'#ecedef'}" v-for="(group,index) in dataAuths"
              @click="dataAuthSelected(group.operate, group.authList, index)">
              <span>{{ group.name }}</span><span v-if="group.empty">(空)</span>
              <i style="color: red;font-size: 24px;" class="el-icon-circle-close" @click="deleteDataAuth(index)"></i>
            </li>
          </ul>
        </el-card>
      </el-col>
      <el-col :span="16" style="width:996px;">
        <el-card style="padding: 30px;">
          <ul>
            <li v-for="(detail, index) in authDetail">
              <div class="center-float-left">
                <span class="mr20">权限组</span>
                <i style="color: red;font-size: 24px;" class="el-icon-circle-close" @click="deleteGroup(index)"></i>
              </div>
              <div class="center-float-left mt20" v-for="(auth, authIndex) in detail.auths">
                <el-form label-width="50px" :inline="true">
                  <el-form-item label="对象" prop="conditionType">
                    <el-select v-model="auth.conditionType" placeholder="请输入权限控制对象">
                      <el-option v-for="item in conditionObject" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="类型" prop="conditionObject" v-if="auth.conditionType == 1">
                    <el-select v-model="auth.conditionObject" placeholder="请输入权限控制类型" >
                      <el-option v-for="item in conditionType1" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="类型" prop="conditionObject" v-if="auth.conditionType == 2">
                    <el-select v-model="auth.conditionObject" placeholder="请输入权限控制类型" >
                      <el-option v-for="item in conditionType2" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="类型" prop="conditionObject" v-if="auth.conditionType == 4">
                    <el-select v-model="auth.conditionObject" placeholder="请输入权限控制类型" >
                      <el-option v-for="item in conditionType4" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="部门字段" prop="refColumn" v-if="auth.conditionType == 2 && (auth.conditionObject == 22 || auth.conditionObject == 23)">
                    <el-select v-model="auth.refColumn" placeholder="请输入部门">
                      <el-option v-for="item in deptColumn" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="用户字段" prop="refColumn" v-if="auth.conditionType == 2 && (auth.conditionObject == 24 || auth.conditionObject == 25)">
                    <el-select v-model="auth.refColumn" placeholder="请输入部门">
                      <el-option v-for="item in userColumn" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="用户字段" prop="refColumn" v-if="auth.conditionType == 1 && (auth.conditionObject == 13 || auth.conditionObject == 14)">
                    <el-select v-model="auth.refColumn" placeholder="请输入部门">
                      <el-option v-for="item in userColumn" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="部门" prop="department" v-if="auth.conditionType == 2 && auth.conditionObject == 21">
                    <el-select v-model="auth.department" placeholder="请输入部门">
                      <el-option v-for="item in deptList" :key="item.targetIdColumnInputSelect + ''" :label="item.targetNameColumnInputSelect"
                        :value="item.targetIdColumnInputSelect + ''" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="关系部门" prop="departmentRelation" v-if="auth.conditionType == 2 && (auth.conditionObject == 22 || auth.conditionObject == 25)">
                    <el-select v-model="auth.departmentRelation" placeholder="请输入部门">
                      <el-option v-for="item in deptRelation" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="角色" prop="role" v-if="auth.conditionType == 4 && auth.conditionObject == 41">
                    <el-select v-model="auth.role" placeholder="请输入角色">
                      <el-option v-for="item in roleList" :key="item.targetIdColumnInputSelect + ''" :label="item.targetNameColumnInputSelect"
                        :value="item.targetIdColumnInputSelect + ''" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="用户" prop="user" v-if="auth.conditionType == 1 && auth.conditionObject == 12">
                    <el-select v-model="auth.user" placeholder="请输入用户">
                      <el-option v-for="item in userList" :key="item.targetIdColumnInputSelect + ''" :label="item.targetNameColumnInputSelect"
                        :value="item.targetIdColumnInputSelect + ''" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="关系用户" prop="userRelation" v-if="auth.conditionType == 1 && auth.conditionObject == 14">
                    <el-select v-model="auth.userRelation" placeholder="请输入部门">
                      <el-option v-for="item in userRelation" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                  </el-form-item>
                <i style="color: red;font-size: 24px;" class="el-icon-circle-plus-outline" @click="addAuthDetail(index)"></i>
                <i style="color: red;font-size: 24px;" class="el-icon-circle-close" @click="deleteAuthDetail(index, authIndex)"></i>
                </el-form>

              </div>
            </li>
            <div class="mt30">
              <el-button type="primary" icon="el-icon-plus" size="mini" @click="addAuth">添加组</el-button>
              <el-button type="primary" icon="el-icon-plus" size="mini" @click="save">保存</el-button>
            </div>
          </ul>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as operateAuth from "@/api/system/operateauth";
import * as shuxinTool from '@/utils/shuxin-tool'

export default {
  data() {
    return {
      //当前选中操作
      operateKey: '',
      //单个组的权限明细
      authDetail: [],
      saveFlag: false,
      //当前选中的组
      selectedGroupIndex: '',
      dataAuths: [],
      //部门下拉数据
      deptList: [],
      //角色下拉数据
      roleList: [],
      //用户下拉数据
      userList: [],
      //权限控制对象
      conditionObject: [{
        id: '1',
        name: '登录用户'
      }, {
        id: '2',
        name: '登录用户的部门'
      }, {
        id: '4',
        name: '登录用户的角色'
      }],
      //权限控制类型
      conditionType1: [{
          id: '11',
          name: '任意用户'
        }, {
          id: '12',
          name: '固定用户'
        }, {
          id: '13',
          name: '数据组某个用户字段'
        }, {
          id: '14',
          name: '数据中某用户字段的关系字段'
        }
      ],
      conditionType2: [
        {
          id: '21',
          name: '固定部门'
        }, {
          id: '22',
          name: '数据中的某部门字段的关系部门'
        }, {
          id: '23',
          name: '数据中的某部门字段'
        }, {
          id: '24',
          name: '数据中的某用户字段的部门'
        }, {
          id: '25',
          name: '数据中的某用户字段的部门的关系部门'
        }
      ],
      conditionType4: [
        {
          id: '41',
          name: '固定角色'
        }
      ],
      //关系部门
      deptRelation: [{
        id: '0',
        name: '本级部门'
      }, {
        id: '1',
        name: '上一级部门'
      }, {
        id: '2',
        name: '上二级部门'
      }, {
        id: '3',
        name: '上三级部门'
      }],
      //关系用户
      userRelation: [{
        id: '0',
        name: '本级用户'
      }, {
        id: '1',
        name: '上一级用户'
      }, {
        id: '2',
        name: '上二级用户'
      }, {
        id: '3',
        name: '上三级用户'
      }],

      deptColumn: [],
      userColumn: [],
      form: {}
    };
  },
  created() {
    this.operateAuthList();
    this.deptInputSelect();
    this.roleInputSelect();
    this.userInputSelect();
  },
  methods: {
    forceChange(){
      this.$forceUpdate();
    },
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
    //查询操作权限
    operateAuthList() {
      operateAuth.getOperateAuth().then(response => {
        for (var i = 0; i < response.data.length; i++) {
          response.data[i].flag = true;
        }
        this.dataAuths = response.data;

        this.saveFlag = false;
        this.selectedGroupIndex = undefined;
      });
    },
    deleteGroup(index){
      if (shuxinTool.isEmpty(this.authDetail)) {
        return;
      }
      this.authDetail.splice(index, 1);
    },
    addAuthDetail(parentIndex){
      this.authDetail[parentIndex].auths.push({});
    },
    deleteAuthDetail(parentIndex, detailIndex) {
      this.authDetail[parentIndex].auths.splice(detailIndex, 1);
    },
    //添加权限
    addAuth() {
      this.saveFlag = true;
      if (shuxinTool.isEmpty(this.selectedGroupIndex)) {
        return;
      }
      this.saveFlag = true;
      if (shuxinTool.isEmpty(this.authDetail)) {
        this.authDetail = [];
      }
      this.authDetail.push({
        authType: 2,
        auths: [{
          department: '',
          role: '',
          user: ''
        }]
      });
    },
    dataAuthSelected(operateKey, authList, index) {
      this.operateKey = operateKey;
      var that = this;

      if (this.selectedGroupIndex == index){
          return;
      }

      if (this.saveFlag) {
        this.$confirm('未保存，是否确认切换', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          that.authDetail = authList;
          that.saveFlag = false;
          that.selectedGroupIndex = index;
        });
      } else {
        for (var i = 0; i < this.dataAuths.length; i++) {
          this.dataAuths[i].flag = true
          if (this.dataAuths[index].flag) {
            this.dataAuths[index].flag = false
          } else {
            this.dataAuths[i].flag = true
          }
        }
        this.authDetail = authList;
        this.selectedGroupIndex = index;
      }
    },
    //清空操作权限
    deleteDataAuth(index) {
      if (shuxinTool.isEmpty(this.dataAuths)) {
        return;
      }
      var that = this;
      //如果groupId 为空，则表示删除的为刚刚新增的。
      this.$confirm('是否确认清空权限', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function() {
        return operateAuth.deleteOperateAuth(that.dataAuths[index].operate);
      }).then(() => {
        that.operateAuthList();
        that.msgSuccess("删除成功");
      }).catch(function() {});
    },
    save() {
      var that = this;
      operateAuth.saveOperateAuth(this.operateKey, this.authDetail).then(response => {
        that.msgSuccess("保存成功");
        that.saveFlag = false;
        that.operateAuthList();
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
    padding: 10px 10px;
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
