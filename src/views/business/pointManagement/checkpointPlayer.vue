<template>
  <div class="app-container">
    <!-- 顶部select项 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属平台:">
        <el-select @change="paramsChange" v-model="queryParams.platformType" placeholder="所属平台">
          <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
            :value="item.dictValue" />
        </el-select>
      </el-form-item>

      </el-form-item>
      <el-form-item label="游戏产品:">
         <el-select v-model="queryParams.productId" placeholder="请选择">
          <el-option v-for="item in advertList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
            :value="item.targetIdColumnInputSelect"></el-option>
         </el-select>
      </el-form-item>
      <el-form-item label="查询日期:" prop="dateRange">
        <el-date-picker
          v-model="queryParams.dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions"
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
      <div class="chartDiv">
        <div class="canvasDiv">
          <!-- Y轴展示项 -->
          <el-row>
            <el-col :span="1">
              <span class="labelTitle">展示项:</span>
            </el-col>
            <el-col :span="7">
              <el-select v-model="dType" multiple @remove-tag="handleMaterialTypeRemoveTag" @change="changeHandler" style="width: 100%">
                <el-option
                 :disabled="compareType.includes(item.value)"
                 v-for="(item, index) in tabs"
                 :key="item.value"
                 :value="item.value"
                 :label="item.label"></el-option>
              </el-select>
            </el-col>
          </el-row>
          <el-row>
            <line-chart ref="lineEcharts" :x="tabs[1].xData" :yNames="yNames" :ys="ys" />
          </el-row>
        </div>
        <!-- <div class="mask" v-show="exportNoTradeList.length == 0">暂无数据</div> -->
      </div>
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
    <el-table v-loading="loading" :data="exportNoTradeList" stripe>
      <el-table-column label="关卡ID" prop="id"/>
      <el-table-column label="关卡名称" prop="name"/>
      <el-table-column label="平均通关时间" prop="clearanceTime"/>
      <el-table-column label="进入玩家数" prop="enterPlayNum"/>
      <el-table-column label="进入次数" prop="enterNum"/>
      <el-table-column label="成功次数" prop="successNum"/>
      <el-table-column label="通关率" prop="successProbability" :formatter="_successProbability"/>
      <el-table-column label="失败次数" prop="failureNum"/>
      <el-table-column label="失败率" prop="failureProbability" :formatter="_failureProbability"/>
      <el-table-column label="中止次数" prop="suspendNum"/>
      <el-table-column label="中止率" prop="suspendProbability" :formatter="_suspendProbability"/>
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
  import * as qpTool from '@/utils/shuxin-tool'
  import { setDefaultTime } from '@/api/shuxin'
  export default {
    name: "checkpointPlayer",
    components: {
      LineChart
    },
    data() {
      return {
        advertList:[],// 游戏产品数组
        xData: [],// x时间轴
        loading: true,// 遮罩层
        exportNoTradeList: [],// 关卡IDs表格
        defaultPlatformType: '',// 乘放游戏平台默认值
        //乘放游戏平台/分组/产品筛选条件的数组
        queryParams: {
          dateRange: ['', ''],
          platformType: '',
          productId: ''
        },
        // el-date-picker的配置
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          }
        },
        dictCache: qpShop.globalCache.shopCache.dictCache,//用于获取游戏属于平台数据
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
            key: 'rewardPlayerNum',
          }
        ],
        // 图表Y轴展示项select绑定值
        colors: ['#FFDB82','#7DDDC5','#F1A9D1','red', 'green', 'purple','blue','black','pink','orange','brown'],
        yNames: [
          {
            name: '进入玩家数',
            textStyle: {
              color: '#7DDDC5'
            }
          }
        ],
        ys: [],// 控制图表有几种折线
        dType: [1],// 图表Y轴展示项select绑定值
        compareType: [1] //用于点击select子项的tag时比较要移除的子项是不是默认值
      }
    },
    created() {
      this.queryParams.dateRange = setDefaultTime() //设置默认时间
      this._defaultPlatform() //设置默认平台
    },
    methods: {
      /** 查询角色列表 */
      getList() {
        this.loading = true;
        request({
          url: '/business/point/matrixPointList',
          method: 'post',
          data: JSON.stringify(this.getQueryData())
        }).then(res => {
            this.dType = [1] //默认只显示进入玩家数的折线
            this.ys = [] //清空
            let resultData = res.data.matrixPointResultList
            if(resultData) {
              this.exportNoTradeList = resultData
            } else {
              this.exportNoTradeList = []
            }
            console.log(this.exportNoTradeList)
            // 不管是刚进页面还是搜索或者重置,都需要清空xData,yData
            this.tabs.forEach((tab, index) => {
              tab.xData = [] // 清空xData
              tab.yData = []// 清空yData
              if(this.exportNoTradeList.length !== 0) {
                this.exportNoTradeList.forEach(item => {
                  tab.xData.push(item.name)
                  tab.yData.push(item[tab.key])
                })
              }
            })
            this.ys.push(this.tabs[1].yData) //只要重新调用getList(),把select多选设置只默认查询“进入玩家数”
            this.loading = false
          })
      },
      // 请求参数对象
      getQueryData(){
        return {
            "beginTime": this.queryParams.dateRange[0],
            "endTime": this.queryParams.dateRange[1],
            "productId": '' + this.queryParams["productId"],
            "platformType": this.queryParams["platformType"]
        }
      },
      /** 搜索按钮操作 */
      handleQuery() {
        // 没选产品不能请求
        if(this.queryParams.productId) {
          this.getList()
        }
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.queryParams.dateRange = setDefaultTime()
        this.queryParams.platformType = this.defaultPlatformType
        //此处为什么不修改productId的值，是因为设置了平台，会联动到产品
        this.resetForm("queryForm")
        this.asyncCall()
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
            that.queryParams.productId = data[0].targetIdColumnInputSelect
            res && res()
          }
        }, JSON.stringify(params))
      },
      handleMaterialTypeRemoveTag(value) {
        let index = this.compareType.indexOf(value)
        // 不等于-1说明要移除的是默认的值了
        if(index !== -1) {
          this.dType.splice(index, 0 ,value) //把移除的值在添加回来
        }
      },
      // 展示项的select选择触发函数
      changeHandler(values) {
        setTimeout(() => {
          this.ys = []
          this.yNames = []
          this.dType = values
          //change后不管是增了子项还是移除了子项，都把this.dType遍历一遍
          this.dType.forEach((item) => {
            this.ys.push(this.tabs[item].yData) //根据遍历修改this.ys数据
            // 生成yNames
            let obj = {}
            obj.name = this.tabs[item].label
            obj.textStyle = { 'color': this.colors[item] }
            this.yNames.push(obj)
          })
        }, 20)
      },
      /**  导出关卡玩家数据  */
      exportNoTarde(){
          var filterJsonStr = JSON.stringify(this.getQueryData());
          downLoadZip(encodeURI("/business/point/exportMatrixPointList?filterJson=" + filterJsonStr), "exportCheckpointPlayer",true);
      },
      // 表格中"通关率"转%
      _successProbability (row, column) {
        return (row.successProbability * 100) + '%'
      },
      // 表格中"失败率"转%
      _failureProbability (row, column) {
        return (row.failureProbability * 100) + '%'
      },
      // 表格中"中止率"转%
      _suspendProbability (row, column) {
        return (row.suspendProbability * 100) + '%'
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
  .chartDiv {
    position: relative;
  }
  .mask {
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #fff;
    z-index: 99;
    justify-content: center;
    align-items: center;
    color: #999;
  }
</style>
