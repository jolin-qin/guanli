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
      <!-- <el-form-item label="游戏分组:">
       <el-select v-model="queryParams.gameGroup" multiple placeholder="分组" size="small">
         <el-option v-for="item in groupList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
           :value="item.targetIdColumnInputSelect"></el-option>
       </el-select> -->
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
    <!-- 对比图表 -->
    <div class="qpgame">
      <el-row :gutter="10" type="flex" justify="space-around" class="mb8 qphead">
        <el-col :span="24">
          <h2>对比图表</h2>
        </el-col>
      </el-row>
      <!-- Y轴展示项 -->
      <el-row>
        <el-col :span="1">
          <span class="labelTitle">展示项:</span>
        </el-col>
        <el-col :span="6">
          <el-select v-model="values" multiple @change="changeHandler">
            <el-option v-for="(item, index) in tabs" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-col>
      </el-row>
      <el-row>
        <line-chart :x="tabs[activeIndex].xData" :y="tabs[activeIndex].yData" />
      </el-row>
    </div>
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
      <!-- <el-table-column label="产品名称" prop="registerSevenRetain"  /> -->
      <el-table-column label="关卡ID" prop="id"/>
      <el-table-column label="关卡名称" prop="name"/>
      <el-table-column label="平均通关时间" prop="clearanceTime"/>
      <el-table-column label="进入玩家数" prop="enterPlayNum"/>
      <el-table-column label="进入次数" prop="enterNum"/>
      <el-table-column label="成功次数" prop="successNum"  />
      <el-table-column label="通关率" prop="successProbability"/>
      <el-table-column label="失败次数" prop="failureNum"  />
      <el-table-column label="失败率" prop="failureProbability"/>
      <el-table-column label="中止次数" prop="suspendNum"/>
      <el-table-column label="中止率" prop="suspendProbability"/>
      <el-table-column label="关卡奖励次数" prop="rewardNum"/>
      <el-table-column label="关卡奖励玩家数" prop="rewardPlayerNum"/>
    </el-table>
  </div>

</template>

<script>
  import * as qpShop from '@/api/global-cache'
  import { downLoadZip } from '@/utils/zipdownload'
  import LineChart from '../../dashboard/LineChart.vue' //引进了Echarts封装好的组件
  import request from '@/utils/request'
  export default {
    name: "exportNoTardeReport",
    components: {
      LineChart
    },
    data() {
      return {
        // 图表对比tab项index
        activeIndex: 1,
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
        // 关卡IDs表格
        exportNoTradeList: [
          {
            id: '101',
            name: '101',
            clearanceTime: '00:01:15',
            enterPlayNum: 81,
            enterNum: 85,
            successNum: 2,
            successProbability: '2.35%',
            failureNum: 0,
            failureProbability: '0%',
            suspendNum: 83,
            suspendProbability: '97.65%',
            rewardNum: 0,
            rewardPlayerNum: 0
          },
          {
            id: '102',
            name: '102',
            clearanceTime: '00:00:24',
            enterPlayNum: 49,
            enterNum: 171,
            successNum: 82,
            successProbability: '47.95%',
            failureNum: 4,
            failureProbability: '2.34%',
            suspendNum: 85,
            suspendProbability: '49.71%',
            rewardNum: 0,
            rewardPlayerNum: 0
          },
          {
            id: '103',
            name: '103',
            clearanceTime: '00:00:35',
            enterPlayNum: 101,
            enterNum: 171,
            successNum: 82,
            successProbability: '47.95%',
            failureNum: 4,
            failureProbability: '2.34%',
            suspendNum: 85,
            suspendProbability: '49.71%',
            rewardNum: 0,
            rewardPlayerNum: 0
          }
        ],
        // 乘放筛选时间数组
        dateRange: [],
        //乘放游戏平台/分组/产品筛选条件的数组
        queryParams: {
            platformType: undefined,
            gameGroup: [],
            productId: []
        },
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        //用于获取游戏属于平台数据
        dictCache: qpShop.globalCache.shopCache.dictCache,
        // 日/周/月数据
        beforeYesterday: {},
        yesterday: {},
        weekday: {},
        monthday: {},
        // 切换图表
        tabs: [
          {
            label: '平均通关时间',
            value: 0,
            xData: [],
            yData: [],
            key: 'clearanceTime'
          },
          {
            label: '进入玩家数',
            value: 1,
            xData: [],
            yData: [],
            key: 'enterPlayNum'
          },
          {
            label: '进入次数',
            value: 2,
            xData: [],
            yData: [],
            key: 'enterNum'
          },
          {
            label: '成功次数',
            value: 3,
            xData: [],
            yData: [],
            key: 'successNum'
          },
          {
            label: '通关率',
            value: 4,
            xData: [],
            yData: [],
            key: 'successProbability'
          },
          {
            label: '失败次数',
            value: 5,
            xData: [],
            yData: [],
            key: 'failureNum'
          },
          {
            label: '失败率',
            value: 6,
            xData: [],
            yData: [],
            key: 'failureProbability'
          },
          {
            label: '中止次数',
            value: 7,
            xData: [],
            yData: [],
            key: 'suspendNum'
          },
          {
            label: '中止率',
            value: 8,
            xData: [],
            yData: [],
            key: 'suspendProbability'
          },
          {
            label: '关卡奖励次数',
            value: 9,
            xData: [],
            yData: [],
            key: 'rewardNum'
          },
          {
            label: '关卡奖励玩家数',
            value: 10,
            xData: [],
            yData: [],
            key: 'rewardPlayerNum'
          }
        ],
        // 图表Y轴展示项select绑定值
        values: [0]
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
            this.tabs.forEach((tab, index) => {
              tab.xData = []
              tab.yData = []
              this.exportNoTradeList.forEach(item => {
                tab.xData.push(item.id)
                tab.yData.push(item[tab.key])
              })
            })
            console.log(this.tabs[this.activeIndex].xData)
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
      // 下拉数据
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
