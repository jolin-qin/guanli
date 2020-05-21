<template>
  <div class="app-container">
    <!-- 顶部select项 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属平台:">
        <el-select v-model="queryParams.platformType" placeholder="所属平台">
          <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
            :value="item.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="游戏产品:">
         <el-select v-model="queryParams.productId" multiple placeholder="请选择">
          <el-option v-for="item in advertList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
            :value="item.targetIdColumnInputSelect"></el-option>
         </el-select>
      </el-form-item>
      <el-form-item label="事件名称:">
        <el-input v-model="queryParams.eventName" placeholder="请输入事件名称" clearable size="small" @keyup.enter.native="handleQuery" />
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

    <!-- 表格统计 -->
    <el-row :gutter="10" class="mb8 qphead">
      <el-col :span="1.5">
        <h2>表格统计</h2>
      </el-col>
      <el-col :span="1.5" style="float: right;">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="exportNoTarde"
          v-hasPermi="['system:config:export']"
        >导出详细数据</el-button>
      </el-col>
    </el-row>
    <!-- 汇总表格 -->
    <el-table v-loading="loading" :data="exportNoTradeList" >
      <el-table-column label="事件名称" prop="eventName"/>
      <el-table-column label="事件ID" prop="eventId"/>
      <el-table-column label="触发用户数" prop="triggerUserNumber"/>
      <el-table-column label="触发次数" prop="triggerNumber"/>
      <el-table-column label="人均次数" prop="perCapita"/>
      <el-table-column label="参数明细" prop="parameter"/>
    </el-table>
  </div>
</template>
<script>
  import * as qpShop from '@/api/global-cache'
  import { downLoadZip } from '@/utils/zipdownload'
  //import LineChart from '../../dashboard/LineChart.vue' //引进了Echarts封装好的组件
  import request from '@/utils/request'
  export default {
    name: "playerEvents",
    // components: {
    //   LineChart
    // },
    data() {
      return {
        // 图表对比tab项index
        activeIndex: 0,
        // 游戏产品数组
        advertList:[],
        // 游戏分组数组
        groupList:[],
        // x时间轴
        xData: [],
        // y value值轴
        yData: [],
        // 遮罩层
        loading: true,
        // 玩家等级数据格式，返给的数据应按等级排好了序，就像按时间搜索返回的数据一样，都有顺序的
        exportNoTradeList: [
          {
            eventName: '领取金币',
            eventId: 'getGold',
            triggerUserNumber: 20,
            triggerNumber: 40,
            perCapita: 2,
            parameter: '无'
          },
          {
            eventName: '浇水',
            eventId: 'watering',
            triggerUserNumber: 5,
            triggerNumber: 20,
            perCapita: 4,
            parameter: '无'
          },
          {
            eventName: '调戏',
            eventId: 'flirt',
            triggerUserNumber: 200,
            triggerNumber: 1000,
            perCapita: 5,
            parameter: '无'
          }
        ],
        // 乘放筛选时间数组
        dateRange: [],
        //乘放游戏平台/分组/产品筛选条件的数组
        queryParams: {
          platformType: undefined,
          gameGroup: [],
          productId: [],
          eventName: ''
        },
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        //用于获取游戏属于平台数据
        dictCache: qpShop.globalCache.shopCache.dictCache,
      }
    },
    created() {
      this.getList();
      this.advertInputSelect();
      this.groupInputSelect();
      // console.log(this.dictCache);
    },

    methods: {
      /** 查询角色列表 */
      getList() {
        this.loading = true;
        request({
          url: '/reportGameQuery/querySyntheticalData',
          method: 'post',
          data: JSON.stringify(this.getQueryData())
        }).then(res => {
            console.log(res.data)
            //this.exportNoTradeList = res.data.summaryList || []
            // console.log(this.exportNoTradeList)
            // 不管是刚进页面还是搜索或者重置,都需要清空xData,yData
            // this.tabs.forEach((tab, index) => {
            //   tab.xData = []
            //   tab.yData = []
            //   this.exportNoTradeList.forEach(item => {
            //     tab.xData.push(item.levelNumber)
            //     tab.yData.push(item[tab.key])
            //   })
            // })
            // console.log(this.tabs[this.activeIndex].xData)
            this.loading = false
          })
      },
      // tab项被选中时触发
      tabHandleClick(tab, event) {
        // 此事件默认会切换tab,因此改变的参数需要在display变为block后进行,所以用了$nextTick方法
        this.activeIndex = Number(tab.index)
        console.log(this.tabs[this.activeIndex].yData)
      },
      // 请求参数对象
      getQueryData(){
        return {
          "beginTime": this.dateRange[0],
          "endTime": this.dateRange[1],
          "productIds": this.queryParams["productId"],
          "groupByIds": this.queryParams["gameGroup"],
          "platformType": this.queryParams["platformType"],
        }
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.getList();
        this.advertInputSelect();
        this.groupInputSelect();
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
      /**  导出综合监控  */
      exportNoTarde(){
          var filterJsonStr = JSON.stringify(this.getQueryData());
          // downLoadZip(encodeURI("/reportGameExport/gameExportNoTrade?filterJson=" + filterJsonStr), "exportNoTrade",true);
          downLoadZip(encodeURI("/reportGameExport/gameGeorgeOuData?filterJson=" + filterJsonStr), "exportNoTrade",true);
      },

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
      // 下拉数据
      groupInputSelect(query) {
        var that = this;
        this.inputSelectList("t_filter", "group_id", query, function(data) {
          that.groupList = data;
        })
      },
      changeHandler() {
        console.log(this.values)
      },
      // 给日期加上两个"-"号
      composeNewStr(str) {
        const things = [
          { thing: "-", sp: 4 },
          { thing: "-", sp: 6 }
        ]
        const strArr = str.split("");
        things.forEach(item => {
          const { sp: index, thing = "" } = item;
          strArr[index] = thing + (strArr[index] || "");
        });
        return strArr.join("");
      }
    }
  }
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
  .data-item{
    text-align: center;
     font-size: 14px;
     width: auto;
     box-sizing: border-box;
     padding: 0 2%;
     margin: 15px 0;
     display: inline-block;
     vertical-align: top;
     border-left: 1px solid #e7e7eb;
  }
  .data-item:first-child{
        border-left-width: 0;
  }
  .data-title {
      color: #9a9a9a;
      font-weight: 400;
      border-left: 1px solid #e7e7eb;
      border-left-width: 0;
      font-size: 1.3rem;
  }
  .chart-wrapper {
    width: 100%;
  }
  p, ul {
      margin: 0;
      padding: 0;
  }
  .data-desc {
      padding: 15px 0;
      font-size:1.8rem;
  }
  .data-percent {
    font-size: 1.1rem;
  }
  .data-percent  li p{
    float: right;
    width: 50%;
  }
  .data-percent  label {
      color: #9a9a9a;
      float: left;
      width: 30%;
      text-align: left;
  }
  .data-percent li{
    list-style: none;
    padding: 18px 0;
  }
  .qpdata{
    text-align: center;
    border-left: 1px solid #eee;
  }
  .qpdata:first-child{
    border-left: none;
  }
  .warn{
    color: #e15f63;
  }
  .success {
    color: #7fba4f;
  }
  .labelTitle {
    line-height: 36px;
  }
</style>
