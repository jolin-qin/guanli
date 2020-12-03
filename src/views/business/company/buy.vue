<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="公司名称" prop="companyName">
        <el-input
          v-model="queryParams.companyName"
          placeholder="请输入公司名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="登录名" prop="loginAccount">
        <el-input
          v-model="queryParams.loginAccount"
          placeholder="请输入登录名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['business:commpany:add']"
        >新增</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['business:commpany:remove']"
        >删除</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="groupList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="公司名称" align="center" prop="companyName" />
      <el-table-column label="登录名" align="center" prop="loginAccount" />
      <el-table-column label="联系人" align="center" prop="liaisonMan" />
      <el-table-column label="电话"   align="center" prop="liaisonPhone" />
      <el-table-column label="是否内部"   align="center" prop="externalFlag" >
        <template slot-scope="scope">
          <div v-html="scope.row.externalFlag"></div>
        </template>
      </el-table-column>

      <el-table-column label="添加时间" align="center" prop="createTime" >
        <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['business:commpany:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['business:commpany:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改产品分组对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="公司名称" prop="companyName">
          <el-input  style="width: 60%;" v-model="form.companyName" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="登录名" prop="loginAccount">
          <el-input  style="width: 60%;" v-if="form.id!=null" disabled="" v-model="form.loginAccount"  />
          <el-input  style="width: 60%;" v-else   v-model="form.loginAccount"  placeholder="请输入登录名" />
        </el-form-item>
        <el-form-item label="登录密码" prop="loginPwd">
          <el-input  style="width: 60%;" v-if="form.id!=null" disabled=""  v-model="form.loginPwd" />
          <el-input  style="width: 60%;" v-else v-model="form.loginPwd" placeholder="请输入登录密码" />
        </el-form-item>
        <el-form-item label="联系人" prop="liaisonMan">
          <el-input  style="width: 60%;" v-model="form.liaisonMan" placeholder="请输入联系人" />
        </el-form-item>
         <el-form-item label="电话" prop="liaisonPhone">
           <el-input  style="width: 60%;" v-model="form.liaisonPhone" placeholder="请输入电话"  maxlength="11" oninput="if(isNaN(value)) { value = null }"/>
         </el-form-item>
         <el-form-item label="是否内部产品" prop="externalFlag">
           <el-select v-model="form.externalFlag" placeholder="是否是内部产品">
             <el-option v-for="item in dictCache.matrix_yes_no.details" :key="item.dictValue" :label="item.dictLabel"
               :value="item.dictValue" />
           </el-select>
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
import { listGroup, getGroup, delGroup, addGroup, updateGroup, exportGroup } from "@/api/business/company";
  import * as qpShop from '@/api/global-cache'

export default {
  name: "Group",
  data() {
    return {
       isSubmit:false,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 产品分组表格数据
      groupList: [],
      advertList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        isDel: 0,
        companyType:1,
        companyName:""
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        companyName: [{
          required: true,
          message: "公司名称不能为空",
          trigger: "blur"
        }],
        loginAccount: [{
          required: true,
          message: "登录名不能为空",
          trigger: "blur"
        }],
        loginPwd: [{
          required: true,
          message: "登录密码不能为空",
          trigger: "blur"
        }],
        liaisonMan: [{
          required: true,
          message: "联系人不能为空",
          trigger: "blur"
        }],
        liaisonPhone: [
          { required: true, message: "电话不能为空", trigger: "blur" },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur"
          }
        ],
        externalFlag: [{
          required: true,
          message: "是否为内部产品不能为空",
          trigger: "blur"
        }]
      },
       dictCache: qpShop.globalCache.shopCache.dictCache,
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询产品分组列表 */
    getList() {
      this.loading = true;
      listGroup(this.queryParams).then(response => {
        this.groupList=this.shuxinDataFormat("wechat_company_info", response.rows);
        console.log("this.groupList",this.groupList)
        this.total = response.total;
        this.loading = false;
      });
      this.selectAccountProductId();
    },


    // selectAccountProductId(){
    //   var params={
    //       loginAccount:'123'
    //   }
    //   this.inputSelectList("t_filter", "account_product_id", null, function(data) {
    //     if(data.length > 0) {
    //       console.log(data);
    //       res && res()
    //     }
    //   }, JSON.stringify(params))
    // },


    selectAccountProductId(){
      var params={
          loginAccount:'123'
      }
      this.inputSelectList("t_filter", "buy_account_product_id", null, function(data) {
        if(data.length > 0) {
          console.log(data);
        }
      }, JSON.stringify(params))
    },



    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        companyType: 1,
        commpanyName: undefined,
        liaisonMan: undefined,
        liaisonPhone: undefined,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.isSubmit=false;
      this.reset();
      this.open = true;
      this.title = "新增买量公司";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.isSubmit=false;
      this.reset();
      const id = row.id || this.ids
      getGroup(id).then(response => {
        this.form = response.data;
        this.form.loginPwd="******"
        this.form.externalFlag=this.form.externalFlag+"";
        this.open = true;
        this.title = "修改买量公司";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if(this.isSubmit){
            return ;
          }
          this.isSubmit=true;
          if (this.form.id != undefined) {
            delete this.form.updateProductTime
            updateGroup(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                  this.isSubmit=false;
              }
            });
          } else {
            this.form.isDel=0;
            this.form.advertId=0;
            this.form.fId=0;
            addGroup(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              } else {
                  this.isSubmit=false;
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      var ids = [];
      row.id ? ids.push(row.id) : ids = this.ids;
      this.$confirm('是否确认删除卖量公司编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delGroup(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
  }
};
</script>
