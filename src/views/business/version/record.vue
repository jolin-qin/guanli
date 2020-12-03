<template>
  <div class="app-container">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            v-hasPermi="['business:version:add']"
          >新增版本</el-button>
        </el-col>
      </el-row>
      <div>
        <div v-for="item in versionList">
          <div class="divClass">
            <div style=" float: left;">
              <span style="background: red; padding: 5px;border-radius: 40px;margin-right: 10px;">{{item.index}}</span>
              <span style="font-weight: 700;">{{item.version}}版本</span>
              <span v-if="item.isOnline==1" style="background: #42b983;border-radius: 10px;padding: 5px 10px;padding-left: 10px;padding-right: 10px; margin-left: 20px;">已上线</span>
            </div>
            <div style="float: right;">
              <span @click="handleUpdate(item.id)" style="background-color: rgb(255, 204, 51);padding: 5px 10px;border-radius: 5px;">修改</span>
              <span @click="handleDelete(item.id)" style="background-color: rgb(228 84 29); padding: 5px 10px; border-radius: 5px; ">删除</span>
            </div>
          </div>
          <el-table v-loading="loading" :data="item.list">
            <el-table-column label="版本更新内容"  align="center"  prop="versionContent" />
            <el-table-column label="版本完成时间" align="center" prop="completeTime" >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.completeTime,'{y}-{m}-{d}') }}</span>
            </template>
            </el-table-column>
            <el-table-column label="版本上线时间" align="center" prop="onlineTime" >
              <template slot-scope="scope">
                <span>{{ parseTime(scope.row.onlineTime,'{y}-{m}-{d}') }}</span>
              </template>
              </el-table-column>
          </el-table>
        </div>
      </div>

    <!-- 添加或修改产品版本管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入产品id"  disabled=""/>
        </el-form-item>

        <el-form-item label="版本号" prop="version">
          <el-input v-model="form.version" placeholder="请输入版本号" />
        </el-form-item>
        <el-form-item label="版本更新内容" prop="versionContent">
          <el-input v-model="form.versionContent" type="textarea" :autosize="{minRows:8,maxrow:20}" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="项目完成时间" prop="completeTime">
          <el-date-picker clearable size="small" style="width: 200px"
            v-model="form.completeTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择项目完成时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="是否已上线" prop="isOnline">
          <el-select v-model="form.isOnline" placeholder="是否已上线">
            <el-option v-for="item in dictCache.is_online.details" :key="item.dictValue + ''" :label="item.dictLabel" :value="item.dictValue + ''" />
          </el-select>
        </el-form-item>

        <el-form-item label="项目上线时间" prop="onlineTime">
          <el-date-picker clearable size="small" style="width: 200px"
            v-model="form.onlineTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择项目上线时间">
          </el-date-picker>
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
  import * as qpShop from '@/api/global-cache'
import { listVersion, getVersion, delVersion, addVersion, updateVersion, exportVersion } from "@/api/business/matrix_product_version";
import request from '@/utils/request'
import * as qpTool from '@/utils/shuxin-tool'

export default {
  name: "Version",
  data() {
    return {
      tabelData:[{version:"1.0.1",list:[{versionContent:"游戏名车仓",completeTime:"2020-02-03",onlineTime:"2020-03-06"}]},{version:"1.0.1",list:[{versionContent:"游戏名车仓",completeTime:"2020-02-03",onlineTime:"2020-03-06"}]}],
      item:[{name:"游戏名车仓",time:"2020-02-03",time1:"2020-03-06"}],
      // 遮罩层
      loading: true,
      productName:null,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 产品版本管理表格数据
      versionList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
       dictCache: qpShop.globalCache.shopCache.dictCache,//用于获取游戏属于平台数据
      // 查询参数
      queryParams: {
        productId: undefined,
        platformType:undefined,
      },
      // 表单参数
      form: {
      },
     rules: {
       version: [{
         required: true,
         message: "版本不能为空",
         trigger: "change"
       }],
       versionContent: [{
         required: true,
         message: "更新内容不能为空",
         trigger: "change"
       }],
       completeTime: [{
         required: true,
         message: "完成时间不能为空",
         trigger: "change"
       }],
     }
    };
  },
  created() {
    const productId = this.$route.params && this.$route.params.productId;
    console.log("productId",productId);
    this.queryParams.productId=productId;
    this.getList();
  },
  methods: {
    /** 查询产品版本管理列表 */
    getList() {
      this.loading = true;
      listVersion(this.queryParams).then(response => {
        this.versionList = response.rows;
        for(var i=0;i<this.versionList.length;i++){
           this.productName=response.rows[i].productName;
          this.queryParams.platformType=response.rows[i].platformType;
          this.versionList[i].productName=response.rows[i].productName
        }
        this.total = response.total;
        this.loading = false;
      });
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
        productId: undefined,
        version: undefined,
        versionContent: undefined,
        completeTime: undefined,
        isOnline: undefined,
        platformType: undefined,
        onlineTime: undefined,
        createBy: undefined,
        createTime: undefined,
        updateBy: undefined,
        updateTime: undefined,
        onlineStatus: undefined
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
      this.reset();
      this.open = true;
      this.title = "添加产品版本管理";
      this.form.productName=this.productName;

      let arrOnlien = this.dictCache.is_online.details
      let valueOnlien = arrOnlien[0].dictValue
      this.form.isOnline = valueOnlien
    },

    /** 修改按钮操作 */
    handleUpdate(id) {
      this.reset();
      getVersion(id).then(response => {
        this.form = response.data;
        this.form.isOnline = this.form.isOnline + '';
        this.form.completeTime=qpTool.parseTime(response.data.completeTime,'{y}-{m}-{d}')
        if(response.data.onlineTime!=null){
            this.form.onlineTime=qpTool.parseTime(response.data.onlineTime,'{y}-{m}-{d}')
        }
        this.form.productName=this.productName;
        console.log("this.form",this.form);
        this.open = true;
        this.title = "修改产品版本管理";
      });
    },


    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
           this.form.productId=this.queryParams.productId;
            this.form.platformType=this.queryParams.platformType;
          if (this.form.id != undefined) {
            updateVersion(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            addVersion(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(ids) {
      this.$confirm('是否确认删除产品版本管理编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delVersion(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有产品版本管理数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportVersion(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>

<style>
   .divClass{
         height: 50px;
         padding: 10px;
         background-color: #cccccc;
         font-size: 14px;
         text-align: center;
         line-height: 30px;
   }

</style>
