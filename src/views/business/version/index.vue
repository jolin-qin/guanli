<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属平台:" prop="platformType">
        <el-select @change="paramsChange" v-model="queryParams.platformType" placeholder="所属平台">
          <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
            :value="item.dictValue" />
        </el-select>
      </el-form-item>

      </el-form-item>
      <el-form-item label="游戏产品:" prop="productId">
         <el-select v-model="queryParams.productId" placeholder="请选择">
          <el-option v-for="item in advertList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
            :value="item.targetIdColumnInputSelect"></el-option>
         </el-select>
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
          v-hasPermi="['business:version:add']"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="versionList" @selection-change="handleSelectionChange">
      <el-table-column label="所属平台" align="center" prop="platformType">
        <template slot-scope="scope">
          <div v-html="scope.row.platformType"></div>
        </template>
      </el-table-column>
      <el-table-column label="产品名称" align="center"  prop="productName" />
      <el-table-column label="线上版本号" align="center" prop="version" />
      <el-table-column label="版本上线时间" align="center" prop="onlineTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.onlineTime,'{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <router-link :to="'/versionRecord/record/' + scope.row.productId" class="link-type">
              <span>版本记录</span>
            </router-link>
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

    <!-- 添加或修改产品版本管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="所属平台" prop="platformType">
          <el-select v-model="form.platformType" placeholder="所属平台" @change="selectChanged">
            <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
              :value="item.dictValue" />
          </el-select>
        </el-form-item>
        <el-form-item label="游戏产品:">
           <el-select v-model="form.productId" placeholder="请选择" prop="productId">
            <el-option v-for="item in productList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
              :value="item.targetIdColumnInputSelect"></el-option>
           </el-select>
        </el-form-item>
        <el-form-item label="版本号" prop="version">
          <el-input v-model="form.version" placeholder="请输入版本号" />
        </el-form-item>
        <el-form-item label="版本更新内容" prop="versionContent">
          <el-input v-model="form.versionContent" type="textarea" :autosize="{minRows:8}" placeholder="请输入内容" />
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
            <el-option v-for="item in dictCache.is_online.details" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue" />
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
      advertList:[],// 游戏产品数组
      productList:[],// 游戏产品数组
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
      // 产品版本管理表格数据
      versionList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      dictCache: qpShop.globalCache.shopCache.dictCache,//用于获取游戏属于平台数据
      // 查询参数
      queryParams: {
        pageNum: 1,
        onlineStatus:0,
        pageSize: 10,
        productId: undefined,
        platformType: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        platformType: [{
          required: true,
          message: "所属平台不能为空",
          trigger: "change"
        }],
        productId: [{
          required: true,
          message: "游戏不能为空",
          trigger: "change"
        }],
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
    //this._defaultPlatform() //设置默认平台
    this.getList()
  },

  methods: {
    /** 查询产品版本管理列表 */
    getList() {
      this.loading = true;
      listVersion(this.queryParams).then(response => {
        this.versionList = this.shuxinDataFormat("matrix_product_version", response.rows);
        if(this.versionList!=null&&this.versionList.length>0){
          for(var i=0;i<this.versionList.length;i++){
            this.versionList[i].productName=response.rows[i].productName
          }
        }

        //this.versionList = response.rows;
        console.log("this.versionList",this.versionList);
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
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加产品版本管理";
      this._defaultPlatformOther();
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getVersion(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改产品版本管理";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
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
    handleDelete(row) {
      const ids = row.id || this.ids;
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
    },


    // 设置默认平台
    _defaultPlatform() {
      let arr = this.dictCache.platform_type.details
      let value = arr[0].dictValue
      this.queryParams.platformType = value
      this.defaultPlatformType = value
      this.asyncCall()
    },


    // 异步函数同步话执行
    async asyncCall() {
      await this.paramsChange() //等此函数执行完再执行getList()
      this.getList()
    },

    //平台change事件
    paramsChange() {
      return new Promise((res, rej) => {
        let platformType = this.queryParams["platformType"];
        let params = {
          platformType: qpTool.isEmpty(platformType) ? '' : platformType,
          groupByIds: ''
        };
        this.advertInputSelect(null, params, res);
      })
    },

    // 获取游戏产品options
    advertInputSelect(query, params, res) {
      this.advertList = [] //options需要清空
      this.queryParams.productId = '' //产品显示也需要清空
      var that = this;
      if(params == undefined) {
        params = {
          platformType: '',
          groupByIds: ''
        }
      }
      this.inputSelectList("t_filter", "product_id", query, function(data) {
        if(data.length > 0) {
          that.advertList = data
          // 默认第一个option
         // that.queryParams.productId = data[0].targetIdColumnInputSelect
          res && res()
        }
      }, JSON.stringify(params))
    },


    // 设置默认平台
    _defaultPlatformOther() {
      let arr = this.dictCache.platform_type.details
      let value = arr[0].dictValue
      this.form.platformType = value

      let arrOnlien = this.dictCache.is_online.details
      let valueOnlien = arrOnlien[0].dictValue
      this.form.isOnline = valueOnlien

      this.selectChanged()
    },



    //平台change事件
    selectChanged() {
      return new Promise((res, rej) => {
        let platformType = this.form.platformType;
        let params = {
          platformType: qpTool.isEmpty(platformType) ? '' : platformType,
          groupByIds: ''
        };
        this.advertInputSelectOther(null, params, res);
      })
    },

    // 获取游戏产品options
    advertInputSelectOther(query, params, res) {
      this.productList = [] //options需要清空
      this.form.productId = '' //产品显示也需要清空
      var that = this;
      if(params == undefined) {
        params = {
          platformType: '',
          groupByIds: ''
        }
      }
      this.inputSelectList("t_filter", "product_id", query, function(data) {
        if(data.length > 0) {
          that.productList = data
          // 默认第一个option
          that.form.productId = data[0].targetIdColumnInputSelect
          res && res()
        }
      }, JSON.stringify(params))
    },
  }
};
</script>
