<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="平台:">
        <el-select @change="paramsChange" v-model="queryParams.platformType" placeholder="请选择平台">
          <el-option v-for="(item, index) in dictCache.platform_type.details" :key="index" :label="item.dictLabel"
            :value="item.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="游戏:">
        <el-select v-model="queryParams.productId" @change="productParamsChange" placeholder="请选择游戏产品">
          <el-option v-for="(item, index) in advertList" :key="index" :label="item.targetNameColumnInputSelect"
            :value="item.targetIdColumnInputSelect"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="版本:">
        <el-select multiple v-model="queryParams.version" placeholder="请选择游戏版本" @change="handleChange">
          <el-option v-for="(item, index) in versionList" :key="index" :label="item.version"
            :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="submitForm()">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery()">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 汇总表格 -->
    <el-table v-loading="loading" :data="tableData" stripe>
      <el-table-column label="新老用户" prop="newRegister" align="center">
        <template slot-scope="scope">
          <span>{{scope.row['newRegister'] === 1 ? '老用户' : '新用户'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="事件ID" prop="eventCode" align="center"/>
      <el-table-column label="事件名称" prop="eventName" align="center"/>
      <el-table-column v-for="(item, index) in columnName" :key="index" :label="index % 2 == 0 ? item.version+'人均次数' : item.version+'触发占比(%)'" align="center">
        <template slot-scope="scope">
          <span>{{index % 2 == 0 ? scope.row[item.id+'_peopleAvgCount'] : scope.row[item.id+'_triggerScale']}}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <!-- <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"/> -->
    <!-- 触发占比 -->
    <div class="qpgame">
      <el-row :gutter="10" type="flex" justify="space-around" class="mb8 qphead">
        <el-col :span="24">
          <h2>触发占比</h2>
        </el-col>
      </el-row>
      <div class="chartDiv">
        <div class="canvasDiv">
          <el-row>
            <line-chart ref="lineEcharts" :x="xData" :yNames="yNames" :ys="ys" />
          </el-row>
        </div>
      </div>
    </div>
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
        versionList: [],//版本数组
        xData: [],// x时间轴
        loading: false,// 遮罩层
        exportNoTradeList: [],// 关卡IDs表格
        queryParams: {
          platformType: '',
          productId: '',
          version: [],
          pageNum: 1,
          pageSize: 10
        },
        tableData: [],//table绑定数据
        columnName: [],//控制table动态生成列
        dictCache: qpShop.globalCache.shopCache.dictCache,//用于获取游戏属于平台数据
        total: 0,// 总条数
        // 图表Y轴展示项select绑定值
        colors: ['#FFDB82','#7DDDC5','#F1A9D1','red', 'green', 'purple','blue','black','pink','orange','brown'],
        yNames: [],
        ys: [0,0,1,0],// 控制图表有几种折线
        xData: [1,2,3,4],//传echarts x轴数据
        showVersion: [],//选择版本数
        notNecessary: [] //利用它判断echarts组件是否隐藏/显示
      }
    },
    created() {
      //this.queryParams.dateRange = setDefaultTime() 设置默认时间
      //this._defaultPlatform() //设置默认平台
      // this._getAdvertList()
    },

    methods: {
      /** 搜索列表 */
      getList() {
        this.loading = true;
        request({
          url: '/eventReport/queryEventVersionContrast',
          method: 'post',
          data: JSON.stringify({
            productId: this.queryParams.productId,
            versionId: this.queryParams.version,
            paging: {
              pageSize: this.queryParams.pageSize,
              pageNumber: this.queryParams.pageNum
            }
          })
        }).then(res => {
            console.log(res)
            if (res.code === 200) {
              this.total = res.data.eventTableList.length
              this.ys = [] //清空
              this.yNames = [] //清空
              this.xData = [] // 清空
              this.tableData = res.data.eventTableList
              // 设置yNames
              this.showVersion.forEach((item, index) => {
                this.yNames.push({
                  name: item.version,
                  textStyle: {
                    color: this.colors[index]
                  }
                })
              })
              // 设置xData
              for (let i=0; i<res.data.maxDayInt + 1; i++) {
                this.xData.push(`第${i+1}天`)
              }
              // 设置ys
              this.notNecessary = res.data.brokenLineMap //利用它判断echarts组件是否隐藏/显示
              let brokenLineMapValues = Object.values(res.data.brokenLineMap)
              brokenLineMapValues.forEach((item, index) => {
                let arr = []
                item.forEach((item1) => {
                  arr.push(item1.triggerScale)
                })
                this.ys.push({
                  type: 'line',
                  name: this.showVersion[index].version,
                  smooth: true,
                  itemStyle: {
                    normal: {
                      color: this.colors[index],
                      lineStyle: {
                        color: this.colors[index],
                        width: 2
                      }
                    }
                  },
                  animationDuration: 2800,
                  animationEasing: 'cubicInOut',
                  data: arr
                })
              })
              this.loading = false
            } else {
              this.$message.error('' + res.msg)
              this.loading = false
            }
          })
      },
      /** 搜索按钮操作 */
      submitForm() {
        if (this.queryParams.version.length) {
          this.getList()
        } else {
          this.$message({
            message: '请选择版本号',
            type: 'warning'
          })
          return false
        }
      },
      /** 重置按钮操作 */
      resetQuery() {
        // console.log("chognzhi")
        this.advertList = [] //游戏产品列表需清空
        this.versionList = [] //版本列表需清空
        this.tableData = [] //清空table用数组
        this.ys = [] //清空
        this.yNames = [] //清空
        this.xData = [] // 清空
        this.queryParams = {
          platformType: '',
          productId: '',
          version: [],
          pageNum: 1,
          pageSize: 10
        }
      },
      //平台change事件
      paramsChange() {
        return new Promise((res, rej) => {
          let platformType = this.queryParams["platformType"]
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
      // 获取版本options
      productParamsChange() {
        let productId = this.queryParams.productId
        let params = {
          productId: qpTool.isEmpty(productId) ? '' : productId
        }
        this.versionList = [] //options需要清空
        this.queryParams.version = [] //版本显示也需要清空
        let that = this
        this.inputSelectList("t_filter", "version_id", null, function(data) {
          if(data.length > 0) {
            let arr = []
            data.forEach((item, index) => {
              arr.push({
                id: item.id,
                version: that.platformName(item.platform_type) + "_" + item.version
              })
              // item.version = that.platformName(item.platform_type) + "_" + item.version
            })
            that.versionList = arr
          }
        }, JSON.stringify(params))
      },
      // 修改版本的显示
      platformName(platformType){
        let platformName = "";
        switch (platformType){
          case 0:
            platformName="微信";
          break;
          case 1:
            platformName="QQ";
          break;
          case 2:
            platformName="字节跳动";
          break;
          case 3:
            platformName="OPPO";
          break;
        }
        return platformName;
      },
      // 版本select@change事件
      handleChange(val) {
        let arr = []
        if (val.length) {
          val.forEach((item) => {
            this.versionList.find(function(item1){
              if (item1.id === item) {
                arr.push(item1)
              }
            })
          })
        }
        this.showVersion = arr.sort(function(a, b){
          return a.id - b.id
        })
        console.log(this.showVersion)
        this.columnName = arr.concat(arr).sort(function(a, b){
          return a.id - b.id
        })
      },

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
    margin: 35px 0;
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
