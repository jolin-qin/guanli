<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <!-- <el-form-item label="所属平台:">
        <el-select @change="paramsChange" v-model="queryParams.platformType" placeholder="所属平台">
          <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
            :value="item.dictValue" />
        </el-select>
      </el-form-item> -->
      <el-form-item label="买量游戏名称:">
        <el-select v-model="queryParams.productId" filterable placeholder="请选择">
          <el-option v-for="item in advertList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
            :value="item.targetIdColumnInputSelect"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="卖量游戏产品:">
        <el-select v-model="queryParams.buyProductId" filterable placeholder="广告名称">
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
        <el-table-column label="计算数据" prop="outputData" align="center" />
        <el-table-column label="总收益" prop="buyPay" align="center" />
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
  import * as storexx from '@/store/index'
  import {mapActions} from 'vuex'
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
        queryParams: {
          buyProductId: '',
          productId: '',
          dataTime:[],
          pageNum: 1,
          pageSize: 10
        },
        dictCache: qpShop.globalCache.shopCache.dictCache,

      };
    },
    created() {
      this.queryParams.dataTime = setDefaultTime() //设置默认时间(7天)
      this.advertInputSelect();
      this.getList()
    },
    methods: {
      getList() {
        this.loading = true;
        let filtersObj = qpApi.buildFilter('wechat_buy_data_info', this.queryParams);
        filtersObj["outputStatus"]={
          type:"eq",
          value:1
        }
        request({
          url: '/buyDataInfo/list',
          method: 'post',
          data: JSON.stringify({
              tableName:"wechat_buy_data_info",
              paging:{
                pageSize:this.queryParams.pageSize,
                pageNumber:this.queryParams.pageNum
              },
              filters: filtersObj,
              orders:[{column:"dataTime",type:"desc"}]
            })
        }).then(response => {
          console.log(response.rows)
          if(response.code !== 200){
              this.total = 0;
              this.exportTradeList = []
              return;
          }
          this.total = response.total;
          this.exportTradeList = response.rows
          this.loading = false
        })
      },
      /** 搜索按钮操作 */
      handleQuery() {
        // 没选产品不能请求
        // if (this.queryParams.productId !== '' && this.queryParams.buyProductId !== '') {
        //   this.getList()
        // } else {
        //   this.$message.error('卖量产品和卖量游戏产品是必选的参数哦~');
        // }
        this.getList()
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.queryParams.dataTime = setDefaultTime()
        this.queryParams.productId = '';
        this.queryParams.buyProductId = '';
        //此处为什么不修改productId的值，是因为设置了平台，会联动到产品
        this.resetForm("queryForm")
        this.asyncCall()
      },
      ...mapActions({
        getUserInfo: 'GetInfo'
      }),
      // 获取游戏产品option项函数
      advertInputSelect(query, params, resolve) {
        this.advertList = [] //options需要清空
        this.queryParams.productId = '';
        var that = this;
        this.getUserInfo().then((userInfo)=>{
          if (params == undefined) {
            params = {
              loginAccount: userInfo.user.userName
            }
          }
          that.inputSelectList("t_filter", "account_product_id", query, function(data) {
            if (data.length > 0) {
              that.advertNameList = data;
              that.queryParams.buyProductId = data[0].targetIdColumnInputSelect;
            }else {
              that.advertNameList = [];
              that.queryParams.buyProductId = '';
            }
            resolve && resolve()
          }, JSON.stringify(params));
          that.inputSelectList("t_filter","buy_account_product_id",query,function(data){
            if (data.length > 0) {
              that.advertList = data;
              that.queryParams.productId = data[0].targetIdColumnInputSelect;
            } else {
              that.advertList = [];
              that.queryParams.productId = '';
            }
             resolve && resolve()
          },JSON.stringify(params));
        });
      },
      // 异步函数同步化执行
      async asyncCall() {
       //获取公司下拉数据
        var that = this;
        this.getList()
      }
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
