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
        <el-button type="warning" icon="el-icon-download" @click="exportTarde">导出详细数据</el-button>
      </el-col>
    </el-row>
    <el-table v-loading="loading" :data="exportTradeList">
      <el-table-column label="日期" prop="createTime" />
      <el-table-column label="活跃人数" prop="activeCount" />
      <el-table-column label="商业点击次数" prop="tradeClickCount"  />
      <el-table-column label="商业导出人数" prop="tradeExportPeopleCount"  />
      <el-table-column label="商业导出次数" prop="tradeExportCount" />
      <el-table-column label="导出收入" prop="exportIncome"  />
      <el-table-column label="商业点击率" prop="clickRate"  />
      <el-table-column label="商业导出率" prop="exportRate"  />
      <el-table-column label="人均导出产品数" prop="avgPeopleExport"  />
    </el-table>
  </div>
  </div>
</template>

<script>
import * as qpShop from '@/api/global-cache'
import { downLoadZip } from "@/utils/zipdownload"
import request from '@/utils/request'
import * as qpTool from '@/utils/shuxin-tool'
import { setDefaultTime } from '@/api/shuxin'
export default {
  name: "tardeProductReport",
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
      exportTradeList: [],
      // 乘放游戏平台默认值
      defaultPlatformType: '',
      dateRange:[],
      queryParams:{
          platformType: '',
          gameGroup: [],
          productId: []
      },
      dictCache: qpShop.globalCache.shopCache.dictCache
    };
  },
  created() {
    this.groupInputSelect()
    this.dateRange = setDefaultTime() //设置默认时间(7天)
    this._defaultPlatform() //设置默认平台，会触发paramsChange()函数
  },
  methods: {
    /** 查询角色列表 */
    getList() {
      this.loading = true;
      request({
        url: '/reportGameQuery/queryExportTradeData',
        method: 'post',
        data:JSON.stringify(this.getQueryData())
      }).then(
        response => {
          if(!response.data) {
            this.exportTradeList = []
          } else {
            this.exportTradeList = response.data
          }
          this.loading = false
        }
      )
    },
    /** 搜索按钮操作 */
    handleQuery() {
      // 没选产品不能请求
      if(this.queryParams.productId.length > 0) {
        this.getList()
      } else {
        this.$message.error('游戏产品是必选的参数哦~');
      }
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = setDefaultTime()
      this.queryParams.platformType = this.defaultPlatformType
      this.queryParams.gameGroup = []
      //此处为什么不修改productId的值，是因为设置了平台，会联动到产品
      this.resetForm("queryForm")
      this.asyncCall()
    },
    getQueryData(){
      return {
          "beginTime": this.dateRange[0],
          "endTime": this.dateRange[1],
          "productIds": this.queryParams["productId"],
          "groupByIds": this.queryParams["gameGroup"],
          "platformType": this.queryParams["platformType"]
      };
    },
    //平台、分组change事件
    paramsChange() {
      return new Promise((resolve, reject) => {
        let groupByIds = this.queryParams["gameGroup"]; //是个数组
        let platformType = this.queryParams["platformType"];
        let groupByIdsStr = "";
        if(groupByIds.length > 0) {
          for(let i = 0;i < groupByIds.length;i++) {
            groupByIdsStr += "'" + groupByIds[i] +"',"
          }
          groupByIdsStr = groupByIdsStr.substring(0,groupByIdsStr.length - 1);
        }
        let params = {
          platformType: qpTool.isEmpty(platformType) ? '' : platformType,
          groupByIds: groupByIdsStr
        }
        this.advertInputSelect(null, params, resolve)
      })
    },
    // 获取游戏产品option项函数
    advertInputSelect(query, params, resolve) {
      this.advertList = [] //options需要清空
      this.queryParams.productId = [] //产品显示也需要清空
      var that = this;
      if(params == undefined) {
        params = {
          platformType: '',
          groupByIds: ''
        }
      }
      // console.log(params)
      this.inputSelectList("t_filter", "product_id", query, function(data) {
        if(data.length > 0) {
          that.advertList = data
          that.queryParams.productId.push(data[0].targetIdColumnInputSelect)
        } else {
          that.queryParams.productId = []
        }
        resolve && resolve()
      }, JSON.stringify(params));
    },
    // 异步函数同步话执行
    async asyncCall() {
      await this.paramsChange() //等此函数执行完再执行getList()
      this.getList()
    },
    // 设置默认平台函数
    _defaultPlatform() {
      let arr = this.dictCache.platform_type.details
      let value = arr[0].dictValue
      this.queryParams.platformType = value
      this.defaultPlatformType = value
      this.asyncCall()
    },
    // 分组下拉
    groupInputSelect(query) {
      var that = this;
      this.inputSelectList("t_filter", "group_id", query, function(data) {
        that.groupList = data;
      })
    },
    /**  导出详细数据  */
    exportTarde(){
        var filterJsonStr = JSON.stringify(this.getQueryData());
        downLoadZip(encodeURI("/reportGameExport/gameExportTrade?filterJson=" + filterJsonStr), "exportTrade",true);
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
</style>
