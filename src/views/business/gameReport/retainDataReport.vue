<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属平台:">
        <el-select v-model="queryParams.platformType" placeholder="所属平台">
          <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
            :value="item.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="游戏分组:">
        <el-select v-model="queryParams.gameGroup" multiple placeholder="分组" clearable size="small">
          <el-option v-for="item in groupList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
            :value="item.targetIdColumnInputSelect"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="游戏产品:">
          <el-select v-model="queryParams.productId" multiple placeholder="请选择">
           <el-option v-for="item in advertList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
             :value="item.targetIdColumnInputSelect"></el-option>
          </el-select>
      </el-form-item>
      <el-form-item label="查询日期:">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8 qphead">
      <el-col :span="1.5">
        <h2>汇总统计</h2>
      </el-col>
     <!-- <el-col :span="1.5" >
         <label style="font-weight: normal;">素材位置编号</label>
         <el-select v-model="value" placeholder="位置编号1">
           <el-option
             v-for="item in options"
             :key="item.value"
             :label="item.label"
             :value="item.value">
           </el-option>
         </el-select>
     </el-col> -->
      <el-col :span="1.5" style="float: right;">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="exportRetain"
          v-hasPermi="['system:config:export']"
        >导出详细数据</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="retainReportList" >
      <el-table-column label="日期" prop="dataTime" />
      <el-table-column label="活跃人数" prop="activeCount"  />
      <el-table-column label="活跃次留" prop="activeOneRetain"  />
      <el-table-column label="活跃三留" prop="activeThreeRetain"  />
      <el-table-column label="活跃七留" prop="activeSevenRetain"  />
      <el-table-column label="注册人数" prop="registerCount"  />
      <el-table-column label="注册次留" prop="registerOneRetain"  />
      <el-table-column label="注册三留" prop="registerThreeRetain"  />
      <el-table-column label="注册七留" prop="registerSevenRetain"  />
    </el-table>
  </div>
</template>

<script>
import * as qpShop from '@/api/global-cache'
import { downLoadZip } from "@/utils/zipdownload";
import request from '@/utils/request'

export default {
  name: "materialReport",
  data() {
    return {
      advertList:[],
      groupList:[],
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
      // 素材监控
      retainReportList: [],
      dateRange:[],
      queryParams: {
          platformType: '',
          gameGroup: [],
          productId: []
      },
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      dictCache: qpShop.globalCache.shopCache.dictCache
    };
  },
  created() {
    this.getList();
    this.advertInputSelect();
    this.groupInputSelect();
  },
  methods: {
    /** 查询角色列表 */
    getList() {
      this.loading = true;
      this.shareList().then(
        response => {
          this.retainReportList = response.data;
          // console.log(response.data)
          this.loading = false;
        }
      );
    },
    shareList(){
      return request({
        url: '/reportGameQuery/queryRetainData',
        method: 'post',
        data:JSON.stringify(this.getQueryData())
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.queryParams = {
        platformType: '',
        gameGroup: [],
        productId: []
      };
      this.resetForm("queryForm");
      this.handleQuery();
    },
    getQueryData(){
      return {
          "beginTime":this.dateRange[0],
          "endTime":this.dateRange[1],
          "productIds":this.queryParams["productId"],
          "groupByIds":this.queryParams["gameGroup"],
          "platformType":this.queryParams["platformType"],
      }
    },
    /**  导出留存监控  */
    exportRetain(){
        var filterJsonStr = JSON.stringify(this.getQueryData());
        downLoadZip(encodeURI("/reportGameExport/gameExportRetainData?filterJson=" + filterJsonStr), "exportShare",true);
    },
    // 商场下拉数据
    // advertInputSelect(query) {
    //   var that = this;
    //   this.inputSelectList("t_filter", "product_id", query, function(data) {
    //     that.advertList = data;
    //   });
    // },
    advertInputSelect(query, params) {
      var that = this;
      if(undefined == params) {
        params = {
          platformType: '',
          groupByIds: ''
        }
      }
      this.inputSelectList("t_filter", "product_id", query, function(data) {
        that.advertList = data;
      }, JSON.stringify(params));
    },
    // 商场下拉数据
    groupInputSelect(query) {
      var that = this;
      this.inputSelectList("t_filter", "group_id", query, function(data) {
        that.groupList = data;
      });
    },
  }
};
</script>
<style scoped="scoped">
  .qphead h2{
    font-size: 1.1rem;
    margin-top: -1px;
    padding-top: 10px;
  }
  .qphead h2 span{
    margin: 0 15px;
    color: #ccc;
    font-size: 0.9rem;
  }
</style>
