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
          type="date"
          :picker-options="pickerOptions"
          value-format="yyyy-MM-dd"
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
            <el-col :span="12">
              <el-select v-model="dType" multiple @remove-tag="handleMaterialTypeRemoveTag" @change="changeHandler">
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
            <line-chart :x="tabs[0].xData" :yNames="yNames" :ys="ys" />
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
    <el-table v-loading="loading" :data="exportNoTradeList" >
      <el-table-column label="等级数" prop="level_number"/>
      <el-table-column label="等级类型" prop="level_type"/>
      <el-table-column label="活跃人数" prop="active_people_number"/>
      <el-table-column label="总人数" prop="people_number"/>
      <el-table-column label="与昨日对比" prop="contrast_with_yesterday" :formatter="contrast_with_yesterday"/>
      <el-table-column label="总占比" prop="total_percentage" :formatter="_totalPercentage" />
      <el-table-column label="新注册用户" prop="new_register"  />
      <el-table-column label="注册占比" prop="register_percentage" :formatter="_registerPercentage"/>
    </el-table>
  </div>
</template>
<script>
  import * as qpShop from '@/api/global-cache'
  import { downLoadZip } from '@/utils/zipdownload'
  import LineChart from '../../dashboard/LineChart.vue' //引进了Echarts封装好的组件
  import request from '@/utils/request'
  import { standardDateFormat } from '@/api/shuxin'
  import * as qpTool from '@/utils/shuxin-tool'
  export default {
    name: "playerLevels",
    components: {
      LineChart
    },
    data() {
      return {
        // 游戏产品数组
        advertList:[],
        // x轴
        xData: [],
        // 遮罩层
        loading: true,
        // 玩家等级数据格式，返给的数据应按等级排好了序，就像按时间搜索返回的数据一样，都有顺序的
        exportNoTradeList: [],
        // 乘放游戏平台默认值
        defaultPlatformType: '',
        //乘放游戏平台/分组/产品筛选条件的数组
        queryParams: {
            platformType: '',
            dateRange: '',
            productId: []
        },
        // el-date-picker的配置
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          }
        },
        //用于获取游戏属于平台数据
        dictCache: qpShop.globalCache.shopCache.dictCache,
        // 切换图表
        tabs: [
          {
            label: '活跃人数',
            value: 0,
            xData: [],
            yData: [],
            key: 'active_people_number'
          },
          {
            label: '总人数',
            value: 1,
            xData: [],
            yData: [],
            key: 'people_number'
          },
          {
            label: '与昨日对比',
            value: 2,
            xData: [],
            yData: [],
            key: 'contrast_with_yesterday'
          },
          {
            label: '总占比',
            value: 3,
            xData: [],
            yData: [],
            key: 'total_percentage'
          },
          {
            label: '新注册用户',
            value: 4,
            xData: [],
            yData: [],
            key: 'new_register'
          },
          {
            label: '注册占比',
            value: 5,
            xData: [],
            yData: [],
            key: 'register_percentage'
          }
        ],
        colors: ['#FFDB82','#7DDDC5','#F1A9D1','red', 'green', 'purple'],
        yNames: [
          {
            name: '活跃人数',
            textStyle: {
              color: '#FFDB82'
            }
          }
        ],
        // 控制图表有几种折线
        ys: [],
        // 图表Y轴展示项select绑定值
        dType: [0],
        compareType: [0] //用于点击select子项的tag时比较要移除的子项是不是默认值
      }
    },
    created() {
      this.queryParams.dateRange = standardDateFormat() //设置默认搜索时间
      this._defaultPlatform() //设置默认平台
    },
    methods: {
      /** 查询角色列表 */
      getList() {
        this.loading = true;
        request({
          url: '/business/level/matrixLevelList',
          method: 'post',
          data: JSON.stringify(this.getQueryData())
        }).then(res => {
            console.log(res.data)
            this.dType = [0] //默认只显示活跃人数的折线
            this.ys = [] //清空
            this.exportNoTradeList = res.data.matrixLevelList || []
            // 不管是刚进页面还是搜索或者重置,都需要清空xData,yData
            this.tabs.forEach((tab, index) => {
              tab.xData = [] // 清空xData
              tab.yData = []// 清空yData
              if(this.exportNoTradeList.length !== 0) {
                this.exportNoTradeList.forEach(item => {
                  tab.xData.push(item.level_number)
                  tab.yData.push(item[tab.key])
                })
              }
            })
            this.ys.push(this.tabs[0].yData) //只要重新调用getList(),把select多选设置只默认查询“活跃人数”
            this.loading = false
          })
      },
      // 请求参数对象
      getQueryData(){
        return {
          selectDate: '' + this.queryParams["dateRange"],
          productId: '' + this.queryParams["productId"]
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
        this.queryParams.dateRange = standardDateFormat()
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
            that.queryParams.productId = data[0].targetIdColumnInputSelect
            res && res()
          }
        }, JSON.stringify(params));
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
          // console.log(this.ys)
          // console.log(this.yNames)
        }, 20)
      },
      /**  导出玩家等级数据  */
      exportNoTarde(){
          var filterJsonStr = JSON.stringify(this.getQueryData());
          downLoadZip(encodeURI("/business/level/exportMatrixLevelList?filterJson=" + filterJsonStr), "exportPlayerLevel",true);
      },
      // 表格中"与昨日对比"转%
      contrast_with_yesterday (row, column) {
        return (row.contrast_with_yesterday * 100) + '%'
      },
      // 表格中"总占比"转%
      _totalPercentage (row, column) {
        return (row.total_percentage * 100) + '%'
      },
      // 表格中"注册占比"转%
      _registerPercentage (row, column) {
        return (row.register_percentage * 100) + '%'
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
