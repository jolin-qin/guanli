<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <!-- <el-form-item label="所属平台:">
        <el-select @change="paramsChange" v-model="queryParams.platformType" placeholder="所属平台">
          <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
            :value="item.dictValue" />
        </el-select>
      </el-form-item> -->
      <el-form-item label="产品名称:">
        <el-select v-model="queryParams.productId" filterable placeholder="请选择">
          <el-option v-for="item in advertList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
            :value="item.targetIdColumnInputSelect"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="买量公司:">
        <el-select v-model="queryParams.companyId" filterable placeholder="广告公司名称" @change="getadvertProductList">
          <el-option v-for="(item, index) in advertCompanyNameList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
            :value="item.targetIdColumnInputSelect" />
        </el-select>
      </el-form-item>
      <el-form-item label="买量广告:">
        <el-select v-model="queryParams.advertId" filterable placeholder="广告名称">
          <el-option v-for="(item, index) in advertNameList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
            :value="item.targetIdColumnInputSelect" />
        </el-select>
      </el-form-item>
      <el-form-item label="查询日期:">
        <el-date-picker v-model="queryParams.dataTime" size="small" style="width: 240px" value-format="yyyy-MM-dd" type="daterange"
          range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="qpgame">
      <el-table v-loading="loading" :data="exportTradeList" show-summary>
        <el-table-column label="日期" prop="dataTime" align="center" />
        <el-table-column label="产品名称" prop="productName" align="center" />
        <el-table-column label="广告公司名称" align="center">
          <template slot-scope="scope">
            <span>{{scope.row["company_id.ref"].company_name}}</span>
          </template>
        </el-table-column>
        <el-table-column label="广告名称" align="center">
          <template slot-scope="scope">
            <span>{{scope.row["advert_id.ref"].game_name}}</span>
          </template>
        </el-table-column>
        <el-table-column label="广告主实际数据" prop="advertExportUser" align="center" />
        <el-table-column label="收入" prop="income" align="center" />
      </el-table>
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>

  </div>
</template>

<script>
  import * as qpShop from '@/api/global-cache'
  import {
    downLoadZip
  } from "@/utils/zipdownload"
  import request from '@/utils/request'
  import * as qpTool from '@/utils/shuxin-tool'
  import * as qpApi from '@/api/shuxin'
  import {
    setDefaultTime
  } from '@/api/shuxin'
  export default {
    name: "tardeProductReport",
    data() {
      return {
        advertList: [],
        groupList: [],
        // 遮罩层
        loading: false,
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
        // 广告名称数组
        advertNameList: [],
        // 广告公司名称数组
        advertCompanyNameList: [],
        // 乘放游戏平台默认值
        defaultPlatformType: '',
        dataTime: [],
        queryParams: {
          platformType: '',
          productId: '',
          advertId: '',
          companyId: '',
          pageNum: 1,
          pageSize: 10
        },
        dictCache: qpShop.globalCache.shopCache.dictCache,

      };
    },
    created() {
      this.queryParams.dataTime = setDefaultTime() //设置默认时间(7天)
      this._defaultPlatform() //设置默认平台，会触发paramsChange()函数
    },
    methods: {
      /** 查询卖量数据 */
      getList() {
        this.loading = true;
        request({
          url: '/salesVolume/list',
          method: 'post',
          data: JSON.stringify({
              tableName:"wechat_sales_data_detail_info",
              paging:{
                pageSize: this.queryParams.pageSize,
                pageNumber: this.queryParams.pageNum
              },
              filters: qpApi.buildFilter('wechat_sales_data_detail_info', this.queryParams),
              orders:[{column:"dataTime",type:"desc"}]
            })
        }).then(
          response => {
            console.log(response.rows)
            if(response.code != 200){
                this.total = 0;
                this.exportTradeList = []
                return;
            }
            this.total = response.total;
            this.exportTradeList = response.rows
            for(let i = 0; i < this.exportTradeList.length; i ++){
                if(!this.exportTradeList[i]["company_id.ref"]){
                   this.exportTradeList[i]["company_id.ref"] = {
                      "company_name":""
                   };
                }
            }
            this.loading = false
          }
        )
      },
      /** 搜索按钮操作 */
      handleQuery() {
        // 没选产品不能请求
        if (this.queryParams.productId !== '') {
          this.getList()
        } else {
          this.$message.error('游戏产品是必选的参数哦~');
        }
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.dataTime = setDefaultTime()
        this.queryParams.platformType = this.defaultPlatformType
        this.queryParams.companyId = '';
        this.queryParams.advertId = '';
        //此处为什么不修改productId的值，是因为设置了平台，会联动到产品
        this.resetForm("queryForm")
        this.asyncCall()
      },
      //平台、分组change事件
      paramsChange() {
        return new Promise((resolve, reject) => {
          let platformType = this.queryParams["platformType"];
          let groupByIdsStr = "";
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
        //this.queryParams.productId = [] 产品显示也需要清空
        this.queryParams.productId = ''
        var that = this;
        if (params == undefined) {
          params = {
            platformType: '',
            groupByIds: ''
          }
        }
        // console.log(params)
        this.inputSelectList("t_filter", "product_id", query, function(data) {
          if (data.length > 0) {
            that.advertList = data
            // that.queryParams.productId.push(data[0].targetIdColumnInputSelect)
            that.queryParams.productId = data[0].targetIdColumnInputSelect
          } else {
            // that.queryParams.productId = []
            that.queryParams.productId = ''
          }
          resolve && resolve()
        }, JSON.stringify(params));
      },
      // 异步函数同步话执行
      async asyncCall() {
        await this.paramsChange() //等此函数执行完再执行getList()
       //获取公司下拉数据
       var that = this;
       var params = {
         companyType: 2
       }
       this.inputSelectList("t_filter", "company_id", null, function(data) {
         that.advertCompanyNameList = data;
       }, JSON.stringify(params));
       this.getadvertProductList();
        this.getList()
      },
      getadvertProductList(){
        var params = {
          companyId:this.queryParams.companyId
        }
        var that = this;
        this.inputSelectList("t_filter", "advert_id_company_id", null, function(data) {
          that.advertNameList = data;
          that.queryParams.advertId='';
        }, JSON.stringify(params));
      },
      // 设置默认平台函数
      _defaultPlatform() {
        let arr = this.dictCache.platform_type.details
        let value = arr[0].dictValue
        this.queryParams.platformType = value
        this.defaultPlatformType = value
        this.asyncCall()
      },
      getActualNums(value) {
        this.actualNums = value
      },
      getUnitPrice(value) {
        this.unitPrice = value
      },
      // arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      //   if (rowIndex % 2 === 0) {
      //     if (columnIndex === 0) {
      //       return [1, 2];
      //     } else if (columnIndex === 1) {
      //       return [0, 0];
      //     }
      //   }
      // },
    }
  }
</script>
<style scoped>
  .qphead h2 {
    font-size: 1.1rem;
    margin-top: -1px;
    padding-top: 10px;
  }

  .qphead h2 span {
    margin: 0 15px;
    color: #ccc;
    font-size: 0.9rem;
  }

  .qpgame {
    margin-bottom: 35px;
  }
  .second-row {
    margin-bottom: 50px;
  }
  .dataStatisPopup {
    width: 78% !important;
  }
  .statisticalItem {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  .statisticalItem .title {
    width: 100px;
    /* margin-right: 20px; */
  }
  .statisticalItem .number {
    width: 90px;
    height: 28px;
    line-height: 28px;
    text-align: center;
    background-color: #EBEBEB;
    border-radius: 2px;
  }
</style>
