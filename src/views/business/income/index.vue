<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="产品名称" prop="productId">
        <el-select v-model="queryParams.productId" multiple placeholder="选择产品" @change="productChange">
          <el-option v-for="item in advertList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
            :value="item.targetIdColumnInputSelect"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="日期" prop="dataDate">
        <el-date-picker v-model="queryParams.dataDate" size="small" style="width: 240px" value-format="yyyy-MM-dd" type="daterange"
          range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>

      <el-form-item label="所属平台" prop="platformType">
        <el-select v-model="queryParams.platformType" placeholder="所属平台">
          <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
            :value="item.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['business:income:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['business:income:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport">数据模板下载</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-upload :action="uploadUrl()" :before-upload="beforeUpload" :on-success="uploadSuccess" :show-file-list="false">
          <el-button size="small" type="primary">导入数据</el-button>
        </el-upload>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="incomeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="产品名称" align="center" prop="productId" />
      <el-table-column label="日期" align="center" prop="dataDate" :formatter="dateFormat" />
      <el-table-column label="买量成本" align="center" prop="buyExpend" />
      <el-table-column label="导出收入" align="center" prop="exportIncome" />
      <el-table-column label="广告收入" align="center" prop="advertIncome" />
      <el-table-column label="总收入" align="center" prop="allIncome" />
      <el-table-column label="所属平台" align="center" prop="platformType">
        <template slot-scope="scope">
          <div v-html="scope.row.platformType"></div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:income:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['business:income:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改导出收入列表对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form"  :model="form" :rules="rules" label-width="80px">
        <el-form-item label="产品" prop="productId">
          <el-select v-model="form.productId" placeholder="选择产品">
            <el-option v-for="item in advertList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
              :value="item.targetIdColumnInputSelect"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="dataDate">
          <el-date-picker clearable size="small" style="width: 200px" v-model="form.dataDate" type="date" value-format="yyyy-MM-dd"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="买量成本" prop="buyExpend">
          <el-input v-model="form.buyExpend" placeholder="请输入买量成本" oninput="if(isNaN(value)) { value = null } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" />
        </el-form-item>
        <el-form-item label="导出收入" prop="exportIncome">
          <el-input v-model="form.exportIncome" placeholder="请输入导出收入" oninput="if(isNaN(value)) { value = null } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"/>
        </el-form-item>
        <el-form-item label="广告收入" prop="advertIncome">
          <el-input v-model="form.advertIncome" placeholder="请输入广告收入" oninput="if(isNaN(value)) { value = null } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"/>
        </el-form-item>
        <el-form-item label="总收入" prop="allIncome">
          <el-input v-model="form.allIncome" placeholder="请输入总收入" oninput="if(isNaN(value)) { value = null } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"/>
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
  import {
    listIncome,
    getIncome,
    delIncome,
    addIncome,
    updateIncome,
    exportIncome
  } from "@/api/business/matrix_income";
  import * as qpShop from '@/api/global-cache'
  import {
    downLoadZip
  } from "@/utils/zipdownload";

  export default {
    name: "Income",
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
        // 导出收入列表表格数据
        incomeList: [],
        // 产品下拉数据
        advertList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          isDel: 0,
          pageNum: 1,
          pageSize: 10,
          appId: undefined,
          dataDate: undefined,
          buyExpend: undefined,
          exportIncome: undefined,
          advertIncome: undefined,
          allIncome: undefined,
          platformType: undefined,
          advertId: undefined,
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {

          productId: [{
            required: true,
            message: "产品不能为空",
            trigger: "change"
          }],
          dataDate: [{
            required: true,
            message: "日期不能为空",
            trigger: "blur"
          }],
          buyExpend: [{
            required: true,
            message: "买量成本不能为空",
            trigger: "blur"
          }],
          exportIncome: [{
            required: true,
            message: "导出收入不能为空",
            trigger: "blur"
          }],
          advertIncome: [{
            required: true,
            message: "广告收入不能为空",
            trigger: "blur"
          }],
          allIncome: [{
            required: true,
            message: "总收入不能为空",
            trigger: "blur"
          }],
          platformType: [{
            required: true,
            message: "所属平台不能为空",
            trigger: "change"
          }],
        },
        dictCache: qpShop.globalCache.shopCache.dictCache,
      };
    },
    created() {
      this.getList(); // 商场下拉数据
      this.productInputSelect();
    },
    methods: {

      uploadUrl: function() {
        return "/dev-api/business/income/game/incomeImport";
      },

      //上传成功回调
      uploadSuccess(response, file, fileList) {
         console.log('response:', response.code);
        if(response.code==500){
           this.msgError(response.msg);
        }
        this.handleQuery();
      },
      // 覆盖默认的上传行为
      async requestUpload(option) {
        console.log('采用oss上传 option:', option);
        console.log('oss:', oss);
        oss.upload(option)
      },
      // 上传预处理
      beforeUpload(file) {
        console.log('file', file.type);
        if (file.type.indexOf("excel") == -1) {
          this.msgError("文件格式错误，请上传excel文件。");
          return false;
        } else {
          //todo 保留作为图片预览用
          /* const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            console.log('reader:',reader);
          }; */
        }
      },

      /** 查询导出收入列表列表 */
      getList() {
        this.loading = true;
        listIncome(this.queryParams).then(response => {
          this.incomeList = this.shuxinDataFormat("matrix_income", response.rows);
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
          appId: undefined,
          dataDate: undefined,
          buyExpend: undefined,
          exportIncome: undefined,
          advertIncome: undefined,
          allIncome: undefined,
          platformType: undefined,
          createBy: undefined,
          createTime: undefined,
          updateBy: undefined,
          updateTime: undefined
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
        this.single = selection.length != 1
        this.multiple = !selection.length
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.isSubmit=false;
        this.reset();
        this.open = true;
        this.title = "添加导出收入列表";
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
         this.isSubmit=false;
        this.reset();
        const id = row.id || this.ids
        getIncome(id).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "修改导出收入列表";
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
              updateIncome(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("修改成功");
                  this.open = false;
                  this.getList();
                } else {
                   this.isSubmit=false;
                  this.msgError(response.msg);
                }
              });
            } else {
              addIncome(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("新增成功");
                  this.open = false;
                  this.getList();
                } else {
                   this.isSubmit=false;
                  this.msgError(response.msg);
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
        this.$confirm('是否确认删除导出收入列表编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delIncome(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
      },
      /** 导出按钮操作 */
      handleExport() {
        downLoadZip(encodeURI("/business/income/incomeReport"), "exportCategory", true);
      },

      // 商场下拉数据
      productInputSelect(query) {
        var that = this;
        this.inputSelectList("matrix_income", "product_id", query, function(data) {
          that.advertList = data;
        });
      },

      productChange(e) {
        var area = e.join(",");
        this.productId = area;
        this.queryParams.label = '';sss
        this.queryParams.id = '';
        this.labelList = []
        this.robotList = []
        if (e != '') {
          this.labelInputSelect(area);
        }
      },

      dateFormat: function(row, column) {
        var date = row[column.property];
        if (date == undefined) {
          return ''
        };
        let dt = new Date(date)
        let result= dt.getFullYear()+"-";
        if (dt.getMonth() < 9) {
            result+= "0"
        }
        result+= (dt.getMonth() + 1)+"-";
        if (dt.getDate() < 9) {
            result+= "0"
        }
        result+= dt.getDate()
        return result;
      }
    }
  };
</script>
