<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属平台:">
        <el-select @change="paramsChange" v-model="queryParams.platformType" placeholder="所属平台">
          <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
            :value="item.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="游戏分组:">
        <el-select @change="paramsChange" v-model="queryParams.gameGroup" multiple placeholder="分组" clearable size="small">
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

  <div class="qpgame">
    <el-row :gutter="10" type="flex" justify="space-around" class="mb8 qphead">
      <el-col :span="5">
        <h2>导出游戏统计<span>时间段每天</span></h2>
      </el-col>
      <el-col :span="3" :offset="15">
        <el-button type="warning" icon="el-icon-download" @click="exportCategory">导出详细数据</el-button>
      </el-col>
    </el-row>
    <el-table v-loading="loading" :data="categoryReportList">
      <el-table-column label="日期" prop="createTime" />
      <el-table-column label="活跃人数" prop="activeCount" />
      <el-table-column label="导出人数" prop="exportPeopleSum"  />
      <el-table-column label="导出次数" prop="exportCount"  />
      <el-table-column label="导出率" prop="exportRate"  />
    </el-table>
  </div>


  </div>
</template>

<script>
import * as qpShop from '@/api/global-cache'
import { downLoadZip } from "@/utils/zipdownload";
import request from '@/utils/request'
import * as qpTool from '@/utils/shuxin-tool.js'

export default {
  name: "categoryReport",
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
      // 类目监控表格
      categoryReportList: [],
      dateRange:[],
      queryParams:{
          platformType:undefined,
          gameGroup:undefined,
          productId:undefined
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
      this.categoryList().then(
        response => {
          this.categoryReportList = response.data;
          this.loading = false;
        }
      );
    },
    categoryList(){
      return request({
        url: '/reportGameQuery/queryCategoryData',
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
          platformType:undefined,
          gameGroup:undefined,
          productId:undefined
      }
      this.resetForm("queryForm");
      this.handleQuery();
    },
    getQueryData(){
      return {
        "beginTime": this.dateRange[0],
        "endTime": this.dateRange[1],
        "productIds": this.queryParams["productId"],
        "groupByIds": this.queryParams["gameGroup"],
        "platformType": this.queryParams["platformType"],
      };
    },
    /**  导出类目监控  */
    exportCategory(){
        var filterJsonStr = JSON.stringify(this.getQueryData());
        downLoadZip(encodeURI("/reportGameExport/gameCategoryExport?filterJson=" + filterJsonStr), "exportCategory",true);
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

    // 商场下拉数据
      advertInputSelect(query) {
        var that = this;
        this.inputSelectList("t_filter", "product_id", query, function(data) {
          that.advertList = data;
        });
      },

      // 商场下拉数据
        groupInputSelect(query) {
          var that = this;
          this.inputSelectList("t_filter", "group_id", query, function(data) {
            that.groupList = data;
          });
        },


    //平台、分组change事件
        paramsChange(){
           let groupByIds = this.queryParams["gameGroup"];
           let platformType = this.queryParams["platformType"];
           let groupByIdsStr = "";
           for(let i = 0;i < groupByIds.length;i++){
             groupByIdsStr += "'" + groupByIds[i] +"',";
           }
           if(groupByIdsStr.length > 0){
             groupByIdsStr = groupByIdsStr.substring(0,groupByIdsStr.length - 1);
           }
           let params = {
                platformType:qpTool.isEmpty(platformType)?'':platformType,
                groupByIds: groupByIdsStr
           };
           this.advertInputSelect(null,params);
        },
    
    //产品下拉
      advertInputSelect(query,params) {
        var that = this;
        if(undefined == params){
           params = {
             platformType:'',
             groupByIds:''
           };
        }
        this.inputSelectList("t_filter", "product_id", query, function(data) {
          that.advertList = data;
        },JSON.stringify(params));
      },
    
    
      // 分组下拉
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
  .qpgame{
    margin-bottom: 35px;
  }
</style>
