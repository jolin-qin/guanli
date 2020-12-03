<template>
  <div class="app-container">
    <el-form :model="queryParams"  ref="queryForm"  :inline="true" label-width="68px">
      <el-form-item label="公司名称" prop="companyName">
       <el-select   v-model="queryParams.buyCompanyId" filterable  placeholder="公司名称"  @change="companySelectChange">
           <el-option v-for="item in companyList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
             :value="item.targetIdColumnInputSelect"></el-option>
       </el-select>
      </el-form-item>
      <el-form-item label="广告产品" prop="loginAccount" label-width="100px">
       <el-select   v-model="queryParams.buyProductId" filterable placeholder="广告产品" >
           <el-option v-for="item in companySelectProductList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
             :value="item.targetIdColumnInputSelect"></el-option>
       </el-select>
      </el-form-item>
      <el-form-item label="查询日期" label-width="100px">
        <el-date-picker v-model="queryParams.dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd" type="daterange"
          range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
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

    <el-table v-loading="loading" :data="buyCompanyConfigList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="公司名称" align="center" prop="companyName" />
      <el-table-column label="广告产品" align="center" prop="buyProductName" />
      <el-table-column label="自有产品" align="center" prop="productName" />
      <el-table-column label="APPID" align="center" prop="appId" />
      <el-table-column label="推广链接" align="center" prop="promotionLink" />
      <el-table-column label="单价" align="center" prop="unitPrice" />
      <el-table-column label="添加时间" align="center" prop="createTime" :formatter="_getTime" />
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
        <el-form-item label="公司名称" prop="buyCompanyId">
          <el-select   v-model="form.buyCompanyId" placeholder="公司名称"  @change="companyChange">
              <el-option v-for="item in companyList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
                :value="item.targetIdColumnInputSelect"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属平台" prop="platformType">
          <el-select v-model="form.platformType" placeholder="所属平台"   @change="selectChanged">
            <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
              :value="item.dictValue" />
          </el-select>
        </el-form-item>
        <el-form-item label="广告产品" prop="buyProductId">
          <el-select   v-model="form.buyProductId" placeholder="公司名称">
              <el-option v-for="item in companyProductList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
                :value="item.targetIdColumnInputSelect"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="自有产品" prop="productId">
          <el-select v-model="form.productId" placeholder="自有产品" >
            <el-option v-for="item in productList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
              :value="item.targetIdColumnInputSelect"></el-option>
          </el-select>
        </el-form-item>
         <el-form-item label="单价" prop="unitPrice" >
            <el-input  style="width: 60%;" v-model="form.unitPrice"   placeholder="请输入单价"  maxlength="11" oninput="if(isNaN(value)) { value = null } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"/>
         </el-form-item>
         <el-form-item label="备注" prop="remark" >
            <el-input v-model="form.remark" style="width: 60%;" type="textarea" :autosize="{minRows:3,maxrow:10}" placeholder="请输入备注" />
         </el-form-item>
         <el-form-item label="状态" prop="configStatus">
             <el-switch
               v-model="form.configStatus"
               active-color="#13ce66"
               inactive-color="#adadad"
               active-value="1"
               inactive-value="2"
              >
             </el-switch>
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
import { listGroup, getGroup, delGroup, addGroup, updateGroup, exportGroup } from "@/api/business/company-buy-config";
import * as qpShop from '@/api/global-cache'
import * as shuxinTool from '@/utils/shuxin-tool'

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
      buyCompanyConfigList: [],
      advertList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      //公司列表
      companyList:[],
      companyProductList:[],
      //搜索选择公司产品
      companySelectProductList:[],
      productList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        isDel:0,
        dateRange: [],
        buyCompanyId: undefined,
        buyProductId: undefined
      },

      // 表单参数
      form: {},
      // 表单校验
      rules: {
        buyCompanyId: [{
          required: true,
          message: "请选择公司名称",
          trigger: "blur"
        }],
        platformType: [{
          required: true,
          message: "请选择平台",
          trigger: "blur"
        }],
        buyProductId: [{
          required: true,
          message: "请选择公司广告产品",
          trigger: "blur"
        }],
        productId: [{
          required: true,
          message: "请选择自有产品",
          trigger: "blur"
        }],
        unitPrice: [{
          required: true,
          message: "请输入单价",
          trigger: "blur"
        }]
      },
       dictCache: qpShop.globalCache.shopCache.dictCache,
    };
  },
  created() {
    this.companyInputSelect();
    this.getList();
  },
  methods: {
    /** 查询产品分组列表 */
    getList() {
      this.loading = true;
      console.log(this.queryParams.dateRange)
      listGroup(this.queryParams).then(response => {
        this.buyCompanyConfigList=response.rows;
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
       let times = new Date()
      this.form = {
        id: undefined,
        buyCompanyId: undefined,
        platformType: "0",
        buyProductId: undefined,
        productId: undefined,
        unitPrice:undefined,
        configStatus:"1",
        promotionLink:"?wxgamecid="+shuxinTool.uuidLink(),
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
      this.queryParams.buyCompanyId = ''
      this.queryParams.buyProductId = ''
      this.queryParams.dateRange = []
        //此处为什么不修改productId的值，是因为设置了平台，会联动到产品
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
      this.title = "新增买量公司应用";
      this.advertInputSelect(null, null, null)
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.isSubmit=false;
      this.reset();
      const id = row.id || this.ids
      getGroup(id).then(response => {
        this.form = response.data;
        this.form.configStatus=this.form.configStatus+"";
        this.form.platformType=this.form.platformType+"";
        this.open = true;
        this.title = "修改买量公司应用";

        this.selectChangedInfo();


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

      this.$confirm('是否确认删除卖量公司应用编号为"' + ids + '"的数据项?', "警告", {
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


    /**
     * 获取公司下拉数据
     */
      companyInputSelect() {
        var that = this;
        var params = {
          companyType: 1
        }
        this.inputSelectList("t_filter", "company_id", null, function(data) {
          that.companyList = data;
        }, JSON.stringify(params));
      },

      /**
       * 搜索切换公司时
       */
      companySelectChange(){
          this.buyCompanySelect();
      },

    /**
     * 修改公司数据时，数据动态变换
     */
      companyChange(){
          this.buyCompanyInputSelect();
      },
      _getTime(row, column) {
        return row.createTime.slice(0, 10)
      },
      /**
       * 获取买量公司产品信息
       */
      buyCompanySelect() {
        var that = this;
        var params = {
          companyId:this.queryParams.buyCompanyId
        }
        this.inputSelectList("t_filter", "buy_select_product_id", null, function(data) {
          that.companySelectProductList = data;
          that.queryParams.buyProductId='';
        }, JSON.stringify(params));
      },


      /**
       * 获取买量公司产品信息
       */
      buyCompanyInputSelect() {
        var that = this;
        var params = {
          platformType: this.form.platformType,
          companyId: this.form.buyCompanyId
        }
        this.inputSelectList("t_filter", "buy_product_id", null, function(data) {
          that.companyProductList = data
          if (data.length > 0) {
            // that.queryParams.productId.push(data[0].targetIdColumnInputSelect)
             that.form.buyProductId = data[0].targetIdColumnInputSelect;
          } else {
            // that.queryParams.productId = []
             that.form.buyProductId = ''
          }
        }, JSON.stringify(params));
      },


      // 获取游戏产品options
      advertInputSelect(query, params, res) {
        this.productList = [] //options需要清空
        this.queryParams.productId = '' //产品显示也需要清空
        var that = this;
        if(params == undefined) {
          params = {
            platformType: '0',
            groupByIds: ''
          }
        }
        this.inputSelectList("t_filter", "product_id", query, function(data) {
          if(data.length > 0) {
            that.productList = data
            res && res()
          }
        }, JSON.stringify(params))
      },

      //平台change事件
      selectChanged() {
        this.resetProduct();
        this.selectChangedInfo();
      },


       //平台change事件
       selectChangedInfo() {
         //清除选择的产品
         if(this.form.buyCompanyId!=null){
            this.buyCompanyInputSelect();
         }
         return new Promise((res, rej) => {
           let platformType = this.form.platformType;
           let params = {
             platformType: shuxinTool.isEmpty(platformType) ? '' : platformType,
             groupByIds: ''
           };
           this.advertInputSelect(null, params, res);
         })
       },


       // 表单重置
       resetProduct() {
         this.form.buyProductId=undefined;
         this.form.productId=undefined;
       },
  }
};
</script>
