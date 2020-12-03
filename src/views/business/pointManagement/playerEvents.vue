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
      <el-form-item label="新老用户:">
         <el-select v-model="queryParams.newRegister" placeholder="请选择">
          <el-option v-for="item in newRegisterList" :key="item.id" :label="item.name" :value="item.value"></el-option>
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
      <el-table-column label="新老用户" prop="newRegister"/>
      <el-table-column label="事件ID" prop="eventCode"/>
      <el-table-column label="事件名称" prop="eventName"/>
      <el-table-column label="触发用户数" prop="triggerPeopleCount"/>
      <el-table-column label="触发次数" prop="triggerCount"/>
      <el-table-column label="人均次数" prop="peopleAvgCount"/>
    </el-table>
  </div>
</template>
<script>
  import * as qpShop from '@/api/global-cache'
  import { downLoadZip } from '@/utils/zipdownload'
  import * as qpTool from '@/utils/shuxin-tool'
  //import LineChart from '../../dashboard/LineChart.vue' //引进了Echarts封装好的组件
  import request from '@/utils/request'
  import { setDefaultTime } from '@/api/shuxin'
  export default {
    name: "playerEvents",
    data() {
      return {
        // 游戏产品数组
        advertList:[],
        newRegisterList:[{id:0,name:"新用户",value:0},{id:1,name:"老用户",value:1},{id:999,name:"合并显示",value:999}],
        // 遮罩层
        loading: true,
        exportNoTradeList: [],
        defaultPlatformType: '',// 乘放游戏平台默认值
        // 乘放筛选时间数组
        dateRange: [],
        //乘放游戏平台/分组/产品筛选条件的数组
        queryParams: {
          platformType: '',
          productId: '',
          eventName: ''
        },
        //用于获取游戏属于平台数据
        dictCache: qpShop.globalCache.shopCache.dictCache,
      }
    },
    created() {
      this.dateRange = setDefaultTime()//设置默认时间
      this._defaultPlatform() //设置默认平台
    },
    methods: {
      /** 查询角色列表 */
      getList() {
        this.loading = true;
        var that = this;
        request({
          url: '/eventReport/queryEventDataList',
          method: 'post',
          data: JSON.stringify(this.getQueryData())
        }).then(res => {
          debugger;
            that.exportNoTradeList = [];
            let eventMaps = {};
            let eventReport = null;
            let eventCodeJson = null;
            for(let i = 0;i<res.data.length;i++){
              // debugger;
              // res.data[i]["peopleAvgCount"] = parseFloat(res.data[i]["peopleAvgCount"]).toFixed(2);
              // res.data[i]["newRegister"]    =  res.data[i]["newRegister"] == 1?"老用户":"新用户";
              // debugger;
              res.data[i]["peopleAvgCount"] = parseFloat(res.data[i]["peopleAvgCount"]).toFixed(2);
              res.data[i]["newRegister"]    =  res.data[i]["newRegister"] == 1?"老用户":"新用户";
              eventReport = res.data[i];
              if(that.queryParams["newRegister"] == 999){
                eventCodeJson = eventMaps[eventReport["eventCode"]];
                if(null == eventCodeJson){
                  eventCodeJson = eventReport;
                }else{
                  eventCodeJson["triggerPeopleCount"] += eventReport["triggerPeopleCount"];
                  eventCodeJson["triggerCount"] += eventReport["triggerCount"];
                }
                eventMaps[eventReport["eventCode"]] = eventCodeJson;
              }else{
                eventReport["peopleAvgCount"] = parseFloat(eventReport["peopleAvgCount"]).toFixed(2);
                eventReport["newRegister"]    =  eventReport["newRegister"] == 1?"老用户":"新用户";
              }
            }
            if(that.queryParams["newRegister"] == 999){
               for(let field in eventMaps){
                  eventMaps[field]["newRegister"] = "合并显示";
                  eventMaps[field]["peopleAvgCount"] = parseFloat(eventMaps[field]["triggerCount"]/eventMaps[field]["triggerPeopleCount"]).toFixed(2);
                  that.exportNoTradeList.push(eventMaps[field]);
               }
            }else{
               that.exportNoTradeList = res.data
            }
            that.loading = false
          })
      },
      // 请求参数对象
      getQueryData(){
        var queryJson =  {
          beginTime: this.dateRange[0],
          endTime: this.dateRange[1],
          productIds: ''+this.queryParams["productId"],
          eventName: this.queryParams["eventName"],
          platformType: this.queryParams["platformType"],
          newRegister: 999 == this.queryParams["newRegister"]?'':this.queryParams["newRegister"]
        };
        if(queryJson["newRegister"] == null){
          delete queryJson["newRegister"];
        }
        return queryJson;
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.getList()
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.dateRange = setDefaultTime()
        this.resetForm("queryForm")
        this.queryParams.eventName = ''
        this.queryParams.platformType = this.defaultPlatformType
        this.queryParams.newRegister = null
        //此处为什么不修改productId的值，是因为设置了平台，会联动到产品
        this.asyncCall()
      },

      //平台change事件
      paramsChange(value) {
        return new Promise((res, rej) => {
          let platformType = this.queryParams["platformType"];
          let params = {
            platformType: qpTool.isEmpty(platformType) ? '' : platformType,
            groupByIds: ''
          };
          this.advertInputSelect(null, params, res);
        })
      },
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
      /**  导出事件  */
      exportNoTarde(){
          var filterJsonStr = JSON.stringify(this.getQueryData());
          downLoadZip(encodeURI("/eventReport/exportEventDataList?filterJson=" + filterJsonStr), "exportEvents",true)
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
