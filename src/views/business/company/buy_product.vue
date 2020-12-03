<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="公司名称" prop="companyName">
        <el-input
          v-model="queryParams.companyName"
          placeholder="请输入公司名称"
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
          v-hasPermi="['business:plan:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['business:plan:remove']"
        >删除</el-button>
      </el-col>
    </el-row>

   <el-table v-loading="loading" :data="companyProductList" @selection-change="handleSelectionChange">
     <el-table-column type="selection" width="55" align="center" />
     <el-table-column label="公司名称" align="center" prop="companyName" />
     <el-table-column label="广告产品数" align="center" prop="productCount" />
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
    <!-- 添加或修改产品单价对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1200px">
      <el-form  ref="form" :inline="true"    :model="form"  :rules="rules" label-width="120px">
        <el-form-item v-if="form.id==null" label="公司名称" prop="companyId">
          <el-select   v-model="form.companyId" placeholder="公司名称" @change="companyChange">
              <el-option v-for="item in companyList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
                :value="item.targetIdColumnInputSelect"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-else label="公司名称" prop="companyName">
          <el-input v-model="form.companyName" disabled="" />
        </el-form-item>
        <el-form-item  label="是否内部产品" prop="externalFlag">
          <el-input v-model="form.externalFlag" disabled="" />
        </el-form-item>
        <el-table :data="form.productList">
          <el-table-column label="广告产品名称"  align="center" prop="productName">
            <template slot-scope="scope">
              <el-input type="text" placeholder="请输入广告产品名称" v-model="scope.row.productName"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="APPID"  align="center" prop="productAppid">
            <template slot-scope="scope">
              <el-input type="text" placeholder="请输入产品appid" v-model="scope.row.productAppid"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="所属平台"  align="center" prop="platformType">
            <template slot-scope="scope">
              <el-select v-model="scope.row.platformType"  placeholder="所属平台">
                <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
                  :value="item.dictValue" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column v-if="form.id!=null" label="更新时间"  align="center" prop="createTime">
            <template slot-scope="scope">
                <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" prop="disableFlag">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.disableFlag"
                active-color="#13ce66"
                inactive-color="#adadad"
                active-value="0"
                inactive-value="1"
               >
              </el-switch>
            </template>
          </el-table-column>
         <el-table-column  label="操作" align="center" class-name="small-padding fixed-width">
            <template   slot-scope="scope">
              <el-button   v-if="scope.row.id.length>11" size="mini" type="text" icon="el-icon-delete"  @click="deleteProduct(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="right-float-top pt30">
          <el-button type="primary" icon="el-icon-plus" circle @click="addProduct"></el-button>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
         <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancelProduct">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {listBuyProduct, listCompanyProduct,delCompanyProduct, getBuyProduct, delBuyProduct , addBuyProduct, updateBuyProduct, exportBuyProduct } from "@/api/business/company-buy-product";
import * as qpShop from '@/api/global-cache'
import * as shuxinTool from '@/utils/shuxin-tool'
  import request from '@/utils/request'

export default {
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
      // 广告投放计划表格数据
      productList: [],
      companyProductList: [],
      //公司列表
      companyList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        isDel: 0,
        isProduct:1,
        companyName: undefined,
      },
      // 表单参数
      form: {
      },

      // 表单校验
      rules: {
        companyId: [{
          required: true,
          message: "请选择买量公司",
          trigger: "change"
        }],
        productName: [{
          required: true,
          message: "广告产品名称不能为空",
          trigger: "change"
        }],
        productAppid: [{
          required: true,
          message: "产品appid不能为空",
          trigger: "blur"
        }],
      },
       dictCache: qpShop.globalCache.shopCache.dictCache,
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询广告投放计划列表 */
    getList() {
      this.loading = true;
      listCompanyProduct(this.queryParams).then(response => {
        this.companyProductList = response.rows;
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
        productList:[],
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
      this.form.isDel =0;
      this.open = true;
      this.title = "添加买量公司产品";
      this.companyInputSelect();
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.isSubmit=false;
      this.reset();
      const id = row.id || this.ids
      var params={
        companyId:row.id
      }
      request({
        url: '/business/buyCompanyProduct/productList',
        method: 'post',
        data:params
      }).then(res => {
        this.form = res.data;
        if(this.form.productList.length>0){
          for(var i=0;i<this.form.productList.length;i++){
              this.form.productList[i].disableFlag=this.form.productList[i].disableFlag+"";
              this.form.productList[i].platformType=this.form.productList[i].platformType+"";
          }
        }
        this.form.id=1;
        this.form.companyId=row.id;
        this.form.companyName=row.companyName
        this.form.externalFlag=row.externalFlag==0?'是':'否';
        this.open = true;
        this.title = "修改买量公司产品";
        this.companyInputSelect();

      })

    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if(this.isSubmit){
            return ;
          }
          this.isSubmit=true;
         addBuyProduct(this.form).then(response => {
           if (response.code === 200) {
             this.msgSuccess("新增成功");
             this.open = false;
             this.getList();
           } else {
              this.isSubmit=false;
           }
         });
        }
      });
    },


    /**
     * @param {Object} row
     * 检测保存的数据是否为空
     */
    checkSubmitData(){
      var isCheckSubmit=true;
      if(this.form.productList.length>0){
        for(var i=0;i<this.form.productList.length;i++){
          if(shuxinTool.isEmpty(this.form.productList[i].productName)){
            this.msgError('广告产品名称不能为空');
            break;
          }
          if(shuxinTool.isEmpty(this.form.productList[i].productAppid)){
            this.msgError('产品appid不能为空');
            break;
          }
        }
      }
      return isCheckSubmit;
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      var ids = [];
      row.id ? ids.push(row.id) : ids = this.ids;
      this.$confirm('是否确认删除广告投放计划编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delCompanyProduct(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },



      //公司下拉数据
      companyInputSelect(value) {
        var that = this;
        this.inputSelectList("t_filter", "company_product_id", null, function(data) {
          that.companyList = data;
        }, null);
      },


      // 添加商品
      addProduct() {
        var obj = {
          id: shuxinTool.uuid(),
          productName: '',
          productAppid: '',
          disableFlag: "0",
          companyId:this.form.companyId,
          platformType:"0"
        }
        this.form.productList.push(obj)
      },

      // 取消按钮
      cancelProduct() {
        this.open = false;
        this.reset();
      },


      // 删除单个商品
      deleteProduct(row) {
        if (shuxinTool.isEmpty(this.form.productList)) {
          return;
        }
        for (var i = 0; i < this.form.productList.length; i++) {
          if (row.id == this.form.productList[i].id) {
            this.form.productList.splice(i, 1);
            return;
          }
        }
      },

      companyChange(value){
        this.form.companyId=value;
        if(this.companyList.length>0){
          for(var i=0;i<this.companyList.length;i++){
            if(this.companyList[i].id==value){
                console.log("this.companyList[i].externalFlag",this.companyList[i].external_flag);
                this.form.externalFlag=this.companyList[i].external_flag==0?'是':'否';
            }
          }
        }
        this.changeProduct();
      },

      // 删除单个商品
      changeProduct() {
        if (shuxinTool.isEmpty(this.form.productList)) {
          return;
        }
        for (var i = 0; i < this.form.productList.length; i++) {
          this.form.productList[i].companyId= this.form.companyId
        }
      },

  }
};
</script>
