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
      <el-form-item label="游戏分组:">
       <el-select v-model="queryParams.gameGroup" multiple placeholder="分组" size="small">
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
      <!-- 概况总览 -->
      <el-row :gutter="10" type="flex" justify="space-around" class="mb8 qphead">
        <el-col :span="24">
          <!-- <span>2020-04-09 12:00</span> -->
          <h2>概况总览</h2>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="4" class="qpdata">
          <div class="data-item">
            <span class="data-title">注册用户</span>
            <div>
              <p class="data-desc">{{yesterday.registerCount}}</p>
              <ul class="data-percent">
                <li class="data_overview_percent_item">
                  <div  class="data_overview_percent_item_inner">
                    <label>日</label>
                    <p class="tips_global">
                      <span class="mini_tips success">{{ beforeYesterday.registerRatio }}</span>
                    </p>
                  </div>
                </li>
                <li class="data_overview_percent_item">
                  <div  class="data_overview_percent_item_inner">
                    <label>周</label>
                    <p class="tips_global">
                      <span class="mini_tips warn">{{ weekday.registerRatio }}</span>
                    </p>
                  </div>
                </li>
                <li class="data_overview_percent_item">
                  <div  class="data_overview_percent_item_inner">
                    <label>月</label>
                    <p class="tips_global">
                      <span class="mini_tips warn">{{ monthday.registerRatio }}</span>
                    </p>
                  </div>
                </li>
              </ul>
           </div>
        </div>
        </el-col>
        <el-col :span="4" class="qpdata">
          <div class="data-item">
              <span class="data-title">活跃用户</span>
              <div>
                <p class="data-desc">{{ yesterday.activeCount }}</p>
                <ul class="data-percent">
                  <li class="data_overview_percent_item">
                    <div  class="data_overview_percent_item_inner">
                      <label>日</label>
                      <p class="tips_global">
                        <span class="mini_tips success">{{ beforeYesterday.activeRatio }}</span>
                      </p>
                    </div>
                  </li>
                  <li class="data_overview_percent_item">
                    <div  class="data_overview_percent_item_inner">
                      <label>周</label>
                      <p class="tips_global">
                        <span class="mini_tips warn">{{ weekday.activeRatio }}</span>
                      </p>
                    </div>
                  </li>
                  <li class="data_overview_percent_item">
                    <div  class="data_overview_percent_item_inner">
                      <label>月</label>
                      <p class="tips_global">
                        <span class="mini_tips warn">{{ monthday.activeRatio }}</span>
                      </p>
                    </div>
                  </li>
                </ul>
             </div>
          </div>
        </el-col>
        <el-col :span="4" class="qpdata">
          <div class="data-item">
              <span class="data-title">总收入</span>
              <div>
                <p class="data-desc">{{ yesterday.allinCome }}</p>
                <ul class="data-percent">
                  <li class="data_overview_percent_item">
                    <div  class="data_overview_percent_item_inner">
                      <label>日</label>
                      <p class="tips_global">
                        <span class="mini_tips success">{{ beforeYesterday.allinComeRatio }}</span>
                      </p>
                    </div>
                  </li>
                  <li class="data_overview_percent_item">
                    <div  class="data_overview_percent_item_inner">
                      <label>周</label>
                      <p class="tips_global">
                        <span class="mini_tips warn">{{ weekday.allinComeRatio }}</span>
                      </p>
                    </div>
                  </li>
                  <li class="data_overview_percent_item">
                    <div  class="data_overview_percent_item_inner">
                      <label>月</label>
                      <p class="tips_global">
                        <span class="mini_tips warn">{{ monthday.allinComeRatio }}</span>
                      </p>
                    </div>
                  </li>
                </ul>
             </div>
          </div>
        </el-col>
        <el-col :span="4" class="qpdata">
          <div class="data-item">
              <span class="data-title">活跃次留</span>
              <div>
                <p class="data-desc">{{ yesterday.activeOneCount }}</p>
                <ul class="data-percent">
                  <li class="data_overview_percent_item">
                    <div  class="data_overview_percent_item_inner">
                      <label>日</label>
                      <p class="tips_global">
                        <span class="mini_tips success">{{ beforeYesterday.activeOneRatio }}</span>
                      </p>
                    </div>
                  </li>
                  <li class="data_overview_percent_item">
                    <div  class="data_overview_percent_item_inner">
                      <label>周</label>
                      <p class="tips_global">
                        <span class="mini_tips warn">{{ weekday.activeOneRatio }}</span>
                      </p>
                    </div>
                  </li>
                  <li class="data_overview_percent_item">
                    <div  class="data_overview_percent_item_inner">
                      <label>月</label>
                      <p class="tips_global">
                        <span class="mini_tips warn">{{ monthday.activeOneRatio }}</span>
                      </p>
                    </div>
                  </li>
                </ul>
             </div>
          </div>
        </el-col>
        <el-col :span="4" class="qpdata">
          <div class="data-item">
              <span class="data-title">商业导出量</span>
              <div>
                <p class="data-desc">{{ yesterday.tradeExportPeople }}</p>
                <ul class="data-percent">
                  <li class="data_overview_percent_item">
                    <div  class="data_overview_percent_item_inner">
                      <label>日</label>
                      <p class="tips_global">
                        <span class="mini_tips success">{{ beforeYesterday.tradeExportRatio }}</span>
                      </p>
                    </div>
                  </li>
                  <li class="data_overview_percent_item">
                    <div  class="data_overview_percent_item_inner">
                      <label>周</label>
                      <p class="tips_global">
                        <span class="mini_tips warn">{{ weekday.tradeExportRatio }}</span>
                      </p>
                    </div>
                  </li>
                  <li class="data_overview_percent_item">
                    <div  class="data_overview_percent_item_inner">
                      <label>月</label>
                      <p class="tips_global">
                        <span class="mini_tips warn">{{ monthday.tradeExportRatio }}</span>
                      </p>
                    </div>
                  </li>
                </ul>
             </div>
          </div>
        </el-col>
      </el-row>
      <!-- 对比图表 -->
      <div class="qpgame" ref="qpgame">
        <el-row :gutter="10" type="flex" justify="space-around" class="mb8 qphead">
          <el-col  :span="24">
            <h2>对比图表</h2>
          </el-col>
        </el-row>
        <el-tabs type="border-card" @tab-click="tabHandleClick">
          <el-tab-pane v-for="(item, index) in tabs" :key="item.key" :label="item.title">
          </el-tab-pane>
          <line-chart :x="tabs[activeIndex].xData" :y="tabs[activeIndex].yData" />
        </el-tabs>
      </div>
    </div>
    <!-- 汇总统计标题 -->
    <el-row :gutter="10" class="mb8 qphead">
      <el-col :span="1.5">
        <h2>汇总统计</h2>
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
      <el-table-column label="日期" prop="dataTime" />
      <el-table-column label="注册用户" prop="registerCount"  />
      <el-table-column label="活跃用户" prop="activeCount"  />
      <el-table-column label="总收入" prop="allinCome"  />
      <el-table-column label="人均访问次数" prop="avgEntriesCount"  />
      <el-table-column label="活跃arpu" prop="avgArpu"  />
      <el-table-column label="裂变率" prop="fissionRate"  />
      <el-table-column label="商业导出量" prop="exportPeople"  />
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
        activeIndex: 0,
        // 游戏产品数组
        advertList:[],
        // 游戏分组数组
        groupList:[],
        // x时间轴
        xData: [],
        // y value值轴
        yDatas: [],
        yData: [],
        // 素材监控
        retainReportList: [],
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
        exportNoTradeList: [],
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
        // 对比图表切换tabs
        tabs: [
          {
            title: '注册用户',
            xData: [],
            yData: [],
            key: 'registerCount'
          },
          {
            title: '活跃用户',
            xData: [],
            yData: [],
            key: 'activeCount'
          },
          {
            title: '总收入',
            xData: [],
            yData: [],
            key: 'allinCome'
          },
          {
            title: '人均访问次数',
            xData: [],
            yData: [],
            key: 'avgEntriesCount'
          },
          {
            title: '活跃arpu',
            xData: [],
            yData: [],
            key: 'avgArpu'
          },
          {
            title: '裂变率',
            xData: [],
            yData: [],
            key: 'fissionRate'
          },
          {
            title: '商业导出量',
            xData: [],
            yData: [],
            key: 'exportPeople'
          }
        ]
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
            this.exportNoTradeList = res.data.summaryList || []
            // console.log(this.exportNoTradeList)
            // 不管是刚进页面还是搜索或者重置,都需要清空xData,yData
            this.tabs.forEach(tab => {
              tab.xData = []
              tab.yData = []
              this.exportNoTradeList.forEach(item => {
                tab.yData.push(item[tab.key])
                tab.xData.push(this.composeNewStr(item.dataTime))
              })
            })
            console.log(this.tabs[this.activeIndex].yData)
            // console.log(registerArr);
            let huizongArr = res.data.surveyJson
            this.beforeYesterday = huizongArr.beforeYesterday
            this.yesterday = huizongArr.yesterday
            this.weekday = huizongArr.weekday
            this.monthday = huizongArr.monthday
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
</style>
