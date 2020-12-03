<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属平台:">
        <el-select @change="paramsChange" v-model="queryParams.platformType" filterable placeholder="所属平台">
          <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
            :value="item.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="产品名称:">
        <el-select v-model="queryParams.productId" filterable placeholder="请选择">
          <el-option v-for="item in advertList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
            :value="item.targetIdColumnInputSelect"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="查询日期:">
        <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd" type="daterange"
          range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="qpgame">
      <el-row :gutter="10" type="flex" class="mb8 qphead">
        <el-col :span="1.5">
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="showDialogClick">新增</el-button>
        </el-col>
      </el-row>
      <el-table v-loading="loading" :data="exportTradeList" show-summary :summary-method="getSummaries" border :col-class-name="tableColClassName">
        <!-- <el-table-column label="平台" prop="parameter2" /> -->
        <el-table-column label="日期" prop="dataTime" align="center" />
        <el-table-column label="游戏" width="150px" align="center">
            <template slot-scope="scope">
              <span>{{scope.row["product_id.ref"].game_name}}</span>
            </template>
        </el-table-column>
        <el-table-column label="微信日活" prop="wechatActive" align="center" />
        <el-table-column label="注册次留" class-name="timeToLeave" align="center" >
          <template slot-scope="scope">
            <span>{{scope.row["registOneRetention"]}}</span>
          </template>
        </el-table-column>
         <el-table-column label="微信导出率(活跃)"  align="center" >
         <template slot-scope="scope">
             <span>{{scope.row["wechatExportRate"]}}</span>
           </template>
         </el-table-column>
        <el-table-column label="流量主Ap值"  prop="mainFlowAp" align="center">
          <template slot-scope="scope">
            <span>{{scope.row["mainFlowAp"]}}</span>
          </template>
        </el-table-column>
        <el-table-column label="卖量cpa" prop="sellCpa" align="center">
          <template slot-scope="scope">
              <span>{{scope.row["sellCpa"]}}</span>
            </template>
        </el-table-column>
        <el-table-column label="买量cpa" class-name="timeToLeave" align="center">
          <template slot-scope="scope">
             <span>{{scope.row["buyCpa"]}}</span>
          </template>
        </el-table-column>
        <el-table-column label="次日LTV" class-name="timeToLeave"  align="center" >
        <template slot-scope="scope">
             <span>{{scope.row["oneDayLtv"]}}</span>
          </template>
        </el-table-column>
        <el-table-column label="3日LTV" class-name="timeToLeave"  align="center" >
        <template slot-scope="scope">
             <span>{{scope.row["threeDayLtv"]}}</span>
          </template>
        </el-table-column>
        <el-table-column label="7日LTV" class-name="timeToLeave"  align="center" >
        <template slot-scope="scope">
             <span>{{scope.row["sevenDayLtv"]}}</span>
          </template>
        </el-table-column>
        <el-table-column label="盈亏" prop="dayProfit" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row['dayProfit']> 0?'danger' : 'success'" disable-transitions> {{scope.row["dayProfit"]}} </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="利润" prop="dayIncome"  align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row['dayIncome']> 0?'danger' : 'success'" disable-transitions> {{scope.row["dayIncome"]}} </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="AP" align="center">
          <template slot-scope="scope">
            <span>{{scope.row.ap}}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button @click="showDialogClick(scope.row)" type="text" size="small">详细数据</el-button>
            <el-button type="text" size="small" @click="deleteDayDataById(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>
    <!-- 弹窗 -->
    <el-dialog customClass="dataStatisPopup" :title="dialogTitles" :visible.sync="dialogTableVisible">
      <!-- 弹窗顶部展示区 -->
      <div class="dialogTop">
        <el-row>
          <el-col :span="3" class="title-grid">
            <span>平台</span>
          </el-col>
          <el-col :span="4" class="title-grid">
            <span>游戏</span>
          </el-col>
          <el-col :span="4" class="title-grid">
            <span>时间</span>
          </el-col>
          <el-col :span="4" class="title-grid">
            <span>微信日活</span>
          </el-col>
          <el-col :span="4" class="title-grid">
            <span>注册次留</span>
          </el-col>
          <el-col :span="3" class="title-grid">
            <span>流量主Ap值</span>
          </el-col>
          <el-col :span="2" class="title-grid">
            <span>卖量cpa</span>
          </el-col>
        </el-row>
        <el-row>
          <div v-if="dialogIsType">
              <el-col :span="3" class="content-grid">
                <el-select @change="paramsChange" v-model="queryParamsDialog.platformType" placeholder="所属平台">
                  <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
                    :value="item.dictValue" />
                </el-select>
              </el-col>
              <el-col :span="4" class="content-grid">
                <el-select v-model="queryParamsDialog.productId" placeholder="请选择">
                  <el-option v-for="item in advertList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
                    :value="item.targetIdColumnInputSelect"></el-option>
                </el-select>
              </el-col>
              <el-col :span="4" class="content-grid">
                <el-row>
                  <el-col :span="24">
                    <el-date-picker
                      v-model="queryParamsDialog.dataTime"
                      @change="dataTimeChange"
                      type="date"
                      placeholder="选择日期">
                    </el-date-picker>
                  </el-col>
                </el-row>
              </el-col>
          </div>
          <div v-else>
              <el-col :span="3" class="content-grid">
                 <span>{{dayDataView.platformName}}</span>
              </el-col>
              <el-col :span="4" class="content-grid">
                <span>{{dayDataView.gameName}}</span>
              </el-col>
              <el-col :span="4" class="content-grid">
                <el-row>
                  <el-col :span="24">
                     <span>{{dayDataView.dataTime}}</span>
                  </el-col>
                </el-row>
              </el-col>
          </div>
          <el-col :span="4" class="content-grid">
            <el-input-number type="text" size="mini" v-if="dialogIsType" :min="0" :max="9999999" v-model="queryParamsDialog.wechatActive" @change="wechatActiveChange"></el-input-number>
            <span v-else>{{dayDataView.wechatActive}}</span>
          </el-col>
          <el-col :span="4" class="content-grid">
            <el-input-number type="text" size="mini" v-if="dialogIsType" v-model="queryParamsDialog.registOneRetention"></el-input-number>
            <span>{{dayDataView.registOneRetention}}</span>
          </el-col>
          <el-col :span="3" class="content-grid">
            <span>{{dayDataView.mainFlowAp}}</span>
          </el-col>
          <el-col :span="2" class="content-grid">
            <span>{{dayDataView.sellCpa}}</span>
          </el-col>
        </el-row>
      </div>

      <div class="dialogBottom">
        <!-- 第一展示 -->
        <div class="dialogContainer">
          <!-- 标题 -->
          <el-row>
            <el-col :span="4" class="title-grid content-grid">
              <span>买量cpa</span>
            </el-col>
            <el-col :span="4" class="title-grid content-grid">
              <span>次日LTV</span>
            </el-col>
            <el-col :span="4" class="title-grid content-grid">
              <span>3日LTV</span>
            </el-col>
            <el-col :span="4" class="title-grid content-grid">
              <span>7日LTV</span>
            </el-col>
            <el-col :span="4" class="title-grid content-grid">
              <span>盈亏</span>
            </el-col>
            <el-col :span="4" class="title-grid content-grid">
              <span>利润</span>
            </el-col>
          </el-row>
          <!-- 结果 -->
          <el-row>
            <el-col :span="4" class="content-grid">
              <span>{{dayDataView.buyCpa}}</span>
            </el-col>
            <el-col :span="4" class="content-grid">
              <span>{{dayDataView.oneDayLtv}}</span>
            </el-col>
            <el-col :span="4" class="content-grid">
              <span>{{dayDataView.threeDayLtv}}</span>
            </el-col>
            <el-col :span="4" class="content-grid">
              <span>{{dayDataView.sevenDayLtv}}</span>
            </el-col>
            <el-col :span="4" class="content-grid">
              <span>{{dayDataView.dayProfit}}</span>
            </el-col>
            <el-col :span="4" class="content-grid">
              <span>{{dayDataView.dayIncome}}</span>
            </el-col>
          </el-row>
        </div>
       </div>
      <!-- 弹窗底部展示区 -->
      <div class="dialogBottom">
        <!-- 第一展示 -->
        <div class="dialogContainer">
          <!-- 标题 -->
          <el-row>
            <el-col :span="6" class="title-grid content-grid">
              <span>微信导出率(活跃)</span>
            </el-col>
            <el-col :span="6" class="title-grid content-grid">
              <span>流量主收入</span>
            </el-col>
            <el-col :span="6" class="title-grid content-grid">
              <span>分成支出</span>
            </el-col>
            <el-col :span="6" class="title-grid content-grid">
              <span>总导出量</span>
            </el-col>
          </el-row>
          <!-- 结果 -->
          <el-row>
            <el-col :span="6" class="content-grid">
              <span>{{dayDataView.wechatExportRate}}</span>
            </el-col>
            <el-col :span="6" class="content-grid">
              <span>{{dayDataView.mainFlowIncome}}</span>
            </el-col>
            <el-col :span="6" class="content-grid">
              <div v-if="dialogIsType">
                <el-row>
                  <el-col :span="12">
                    <el-input-number :min="0" :max="999999" :step="0.1" v-model="queryParamsDialog.dividedIncome" @change="dividedChange"></el-input-number>
                  </el-col>
                </el-row>
              </div>
              <div v-else>
                <span>{{dayDataView.dividedIncome}}</span>
              </div>
            </el-col>
            <el-col :span="6" class="content-grid">
              <span>{{dayDataView.totalExport}}</span>
            </el-col>
          </el-row>
        </div>
        <!-- 第二展示 -->
        <div class="dialogContainer">
          <!-- 标题 -->
          <el-row>
            <el-col :span="6" class="title-grid content-grid">
              <span>导出总收入</span>
            </el-col>
            <el-col :span="6" class="title-grid content-grid">
              <span>自家导出</span>
            </el-col>
            <el-col :span="6" class="title-grid content-grid">
              <span>自家导出收入</span>
            </el-col>
            <el-col :span="6" class="title-grid content-grid">
              <span>外部导出</span>
            </el-col>
          </el-row>
          <!-- 结果 -->
          <el-row>
            <el-col :span="6" class="content-grid">
              <span>{{dayDataView.totalExportIncome}}</span>
            </el-col>
            <el-col :span="6" class="content-grid">
              <span>{{dayDataView.backstageExportUser}}</span>
            </el-col>
            <el-col :span="6" class="content-grid">
              <span>{{dayDataView.backstageExportIncome}}</span>
            </el-col>
            <el-col :span="6" class="content-grid">
              <span>{{dayDataView.exportUser}}</span>
            </el-col>
          </el-row>
        </div>
        <!-- 第三展示 -->
        <div class="dialogContainer">
          <!-- 标题 -->
          <el-row>
            <el-col :span="6" class="title-grid content-grid">
              <span>外部导出收入</span>
            </el-col>
            <el-col :span="6" class="title-grid content-grid">
              <span>总买入量</span>
            </el-col>
            <el-col :span="6" class="title-grid content-grid">
              <span>总成本</span>
            </el-col>
            <el-col :span="6" class="title-grid content-grid">
              <span>自家导入</span>
            </el-col>
          </el-row>
          <!-- 结果 -->
          <el-row>
            <el-col :span="6" class="content-grid">
              <span>{{dayDataView.exportIncome}}</span>
            </el-col>
            <el-col :span="6" class="content-grid">
              <span>{{dayDataView.totalBuyUser}}</span>
            </el-col>
            <el-col :span="6" class="content-grid">
              <span>{{dayDataView.totalCost}}</span>
            </el-col>
            <el-col :span="6" class="content-grid">
              <span>{{dayDataView.backstageImportUser}}</span>
            </el-col>
          </el-row>
        </div>
        <!-- 第四展示 -->
        <div class="dialogContainer">
          <!-- 标题 -->
          <el-row>
            <el-col :span="6" class="title-grid content-grid">
              <span>自家导入成本</span>
            </el-col>
            <el-col :span="6" class="title-grid content-grid">
              <span>外部买入量</span>
            </el-col>
            <el-col :span="6" class="title-grid content-grid">
              <span>外部买入成本</span>
            </el-col>
            <el-col :span="6" class="title-grid content-grid">
              <span>AP</span>
            </el-col>
          </el-row>
          <!-- 结果 -->
          <el-row>
            <el-col :span="6" class="content-grid">
              <span>{{dayDataView.backstageImportCost}}</span>
            </el-col>
            <el-col :span="6" class="content-grid">
              <span>{{dayDataView.buyUser}}</span>
            </el-col>
            <el-col :span="6" class="content-grid">
              <span>{{dayDataView.buyCost}}</span>
            </el-col>
            <el-col :span="6" class="content-grid">
              <span>{{dayDataView.ap}}</span>
            </el-col>
          </el-row>
        </div>
      </div>
      <span slot="footer" class="dialog-footer" v-if="dialogIsType">
        <el-button @click="dialogTableVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveDayDataSum">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import * as qpShop from '@/api/global-cache'
  import {
    downLoadZip
  } from "@/utils/zipdownload"
  import request from '@/utils/request'
  import * as qpTool from '@/utils/shuxin-tool'
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
        dialogTitles:"",
        dialogIsType:false,
        // 总条数
        total: 0,
        // 每日数据列表
        exportTradeList: [
        ],
        // 乘放游戏平台默认值
        defaultPlatformType: '',
        dateRange: [],
        queryParams: {
          platformType: '',
          gameGroup: [],
          productId: '',
          pageNum: 1,
          pageSize: 10
        },
        dictCache: qpShop.globalCache.shopCache.dictCache,
        // 弹窗参数
        dialogTableVisible: false,
        dateRangeDialog: [],
        queryParamsDialog: {
          platformType: '',  //平台
          productId: '',     //产品
          dataTime: '',       //事件
          dividedIncome: 0.00 ,//分成支出
          wechatActive: 0   ,//微信活跃
          registOneRetention: 0.00, //注册刺溜
        },
        actualNums: '',
        unitPrice: '',
        timeValue: '',
        dayDataView:{}
      };
    },
    created() {
      //this.groupInputSelect()
      this.dateRange = setDefaultTime() //设置默认时间(7天)
      this._defaultPlatform() //设置默认平台，会触发paramsChange()函数
    },
    methods: {
      /** 查询卖量数据 */
      getList() {
        this.loading = true;
        request({
          url: '/dayDataSum/list',
          method: 'post',
          data: JSON.stringify(this.getQueryData())
        }).then(response => {
          // console.log(response.rows)
          if (!response.rows) {
            this.total = 0;
            this.exportTradeList = []
          } else {
            this.total = response.total
            this.exportTradeList = response.rows
          }
          this.loading = false
        })
      },
      /** 搜索按钮操作 */
      handleQuery() {
        // 没选产品不能请求
        // if (this.queryParams.productId !== '') {

        // } else {
        //   this.$message.error('游戏产品是必选的参数哦~');
        // }
        this.getList()
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
      getQueryData() {
        let filter = {
          "tableName":"wechat_day_data_sum",
          paging: {
              pageSize: this.queryParams.pageSize,
              pageNumber: this.queryParams.pageNum
          },
          "filters":{
            "dataTime":{
              "type":"between",
              "from":this.dateRange[0],
              "to":this.dateRange[1]
            }
          },
          "orders":[{
            column:"data_time",
            type:"desc"
          }]
        }
        if (this.queryParams.productId) {
          filter.filters.productId = {
            "type":"eq",
            "value":this.queryParams["productId"]
          }
        }
        return filter
      },
      //平台、分组change事件
      paramsChange() {
        return new Promise((resolve, reject) => {
          let groupByIds = this.queryParams["gameGroup"]; //是个数组
          let platformType = this.queryParams["platformType"];
          let groupByIdsStr = "";
          if (groupByIds.length > 0) {
            for (let i = 0; i < groupByIds.length; i++) {
              groupByIdsStr += "'" + groupByIds[i] + "',"
            }
            groupByIdsStr = groupByIdsStr.substring(0, groupByIdsStr.length - 1);
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
            //that.queryParams.productId = data[0].targetIdColumnInputSelect
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
      tableRowClassName({row, rowIndex}) {
        if (rowIndex === 0) {
          return 'success-row';
        }
        return '';
      },
      tableColClassName({col, colIndex}) {
        if (colIndex === 11) {
          return 'success-row';
        }
        return '';
      },
      //显示新增或者详情窗口
      showDialogClick(data){
        if(undefined == data["id"]){
          this.dialogTitles = "新增每日数据";
          this.dialogIsType = true;
          this.dayDataView = {};
          this.queryParamsDialog = {
            platformType : this.queryParams.platformType,
            productId:this.queryParams.productId,
            dividedIncome:0.00,
            wechatActive:0,
            registOneRetention:0.00,
            dataTime:''
          }
        }else{
          this.dialogTitles = " ";
          this.dialogIsType = false;
          this.dayDataView = data;
          //获取下拉字段名
          this.dayDataView["platformName"] = this.getSelectedName(this.dictCache.platform_type.details,this.queryParams.platformType);
          this.dayDataView["gameName"] = data["productId_name_column_qp"];
        }
        this.dialogTableVisible = true;
      },
      //获取选中下拉列表中的名字
      getSelectedName(listSource,value){
          let that = this;
          let obj = listSource.find((item)=>{//这里的oneData就是上面遍历的数据源
              if(undefined == item.targetIdColumnInputSelect){
                return item.dictValue === value;
              }
              return item.targetIdColumnInputSelect === value;//筛选出匹配数据
          });
          return undefined == obj.targetNameColumnInputSelect?obj.dictLabel:obj.targetNameColumnInputSelect;
      },
      //当分成比例改变时的事件
      dividedChange(data){
        if(undefined == this.dayDataView["dayProfit"]) return;
        this.dayDataView["dayProfit"] = this.dayDataView["dayProfitBack"] - data;
        this.dayDataView["dayIncome"] = this.dayDataView["dayIncomeBack"] - data;
        this.dayDataView["ap"] =  Math.round(this.dayDataView["dayProfit"] / this.dayDataView["wechatActive"] * 1000) /1000;
      },
      //保存每日汇总数据
      saveDayDataSum(data){
        let dateTime = qpTool.parseTime(this.queryParamsDialog.dataTime,'{y}-{m}-{d}');
        if(qpTool.isEmpty(this.queryParamsDialog.productId) || qpTool.isEmpty(dateTime) || qpTool.isEmpty(this.queryParamsDialog.dividedIncome)
          ||qpTool.isEmpty(this.queryParamsDialog.registOneRetention) || qpTool.isEmpty(this.queryParamsDialog.wechatActive)){
           this.$message({ message: '参数缺失,请完整的输入产品信息、数据日期、微信日活、注册次留、分成支出',  type: 'warning'});
           return;
         }
         if(this.queryParamsDialog.wechatActive <= 0){
          this.$message({ message: '微信日活必须大于0',  type: 'warning'});
           return;
         }
         this.dayDataView["productId"] = this.queryParamsDialog.productId;
         this.dayDataView["dataTime"] = dateTime;
         this.dayDataView["registOneRetention"] = this.queryParamsDialog.registOneRetention;
         this.dayDataView["wechatActive"] = this.queryParamsDialog.wechatActive;
         this.dayDataView["dividedIncome"] = this.queryParamsDialog.dividedIncome;
         request({
            url: '/dayDataSum/add',
            method: 'post',
            data:JSON.stringify({
              tableName:"wechat_day_data_sum",
              data:this.dayDataView
            })
         }).then(response => {
            if(response.code != 200){
              that.dayDataView = {};
              this.$message.error(response.message);
              return;
            }
            this.dialogTableVisible = false;
            this.getList();
         });
      },
      //时间改变，需要重新抽取买卖量数据
      dataTimeChange(data){
        var dataTime = qpTool.parseTime(data,'{y}-{m}-{d}');
        if(qpTool.isEmpty(dataTime)) return;
        //获取买卖量数据
        var that = this;
        request({
          url: '/dayDataSum/getDaySalesAndBuyData?productId=' + this.queryParamsDialog.productId + "&currDate=" + dataTime,
          method: 'post'
        }).then(response => {
          if(response.code != 200){
            that.dayDataView = {};
            this.$message.error(response.message);
            return;
          }
          var salesVolumeData = response.data["salesVolumeData"];
          var buyDataList = response.data["buyData"];
          var myBuyData = null;
          var externalBuyData = null;
          for(let i = 0 ;i < buyDataList.length; i ++){
            if(buyDataList[i]["externalFlag"] == 0){
              myBuyData = buyDataList[i];
            }else{
              externalBuyData = buyDataList[i];
            }
          }
          var weeksLtvData = response.data["weeksLtvData"];
          that.queryParamsDialog.wechatActive = salesVolumeData["wechat_active"];
          //重新组装显示数据
          that.dayDataView = {
              wechatActive: salesVolumeData["wechat_active"],
              mainFlowAp: salesVolumeData["main_flow_ap"],
              oneDayLtv: weeksLtvData["one_day_ltv"],
              threeDayLtv: weeksLtvData["three_day_ltv"],
              sevenDayLtv: weeksLtvData["seven_day_ltv"],
              wechatExportRate: salesVolumeData["wechat_export_rate"],
              mainFlowIncome: salesVolumeData["main_flow_income"],
              totalExport: salesVolumeData["backstage_export_user"] + salesVolumeData["external_export_user"],
              totalExportIncome: salesVolumeData["backstage_export_income"] + salesVolumeData["external_export_income"],
              backstageExportUser: salesVolumeData["backstage_export_user"],
              backstageExportIncome: salesVolumeData["backstage_export_income"],
              exportUser: salesVolumeData["external_export_user"],
              exportIncome: salesVolumeData["external_export_income"],
              backstageImportUser: null != myBuyData?myBuyData["buyActive"]:0,
              backstageImportCost: null != myBuyData?myBuyData["buyPay"]:0,
              buyUser: null != externalBuyData?externalBuyData["buyActive"]:0,
              buyCost: null != externalBuyData?externalBuyData["buyPay"]:0
          };
          let dividedIncome = qpTool.isEmpty(that.queryParamsDialog.dividedIncome)?0:that.queryParamsDialog.dividedIncome;
          let sellCapV = 0;
          if(that.dayDataView["totalExportIncome"] > 0 && that.dayDataView["totalExport"] > 0){
            sellCapV =  that.dayDataView["totalExportIncome"] / that.dayDataView["totalExport"]
          }
          that.dayDataView["sellCpa"] =  Math.round(sellCapV * 1000)/1000;
          that.dayDataView["totalBuyUser"] =  that.dayDataView["backstageImportUser"] + that.dayDataView["buyUser"];
          that.dayDataView["totalCost"] =  Math.round((that.dayDataView["backstageImportCost"] + that.dayDataView["buyCost"])*100)/100;
          let buyCpa = 0;
          if(that.dayDataView["totalCost"] > 0 && that.dayDataView["totalBuyUser"] > 0){
            buyCpa = that.dayDataView["totalCost"] / that.dayDataView["totalBuyUser"];
          }
          that.dayDataView["buyCpa"] =  Math.round(buyCpa * 1000) /1000;
          that.dayDataView["dayProfit"] = Math.round((that.dayDataView["mainFlowIncome"] + that.dayDataView["totalExportIncome"] - that.dayDataView["totalCost"] - dividedIncome)*100)/100;
          that.dayDataView["dayIncome"] = Math.round((that.dayDataView["mainFlowIncome"] + salesVolumeData["external_export_income"] - that.dayDataView["buyCost"] - dividedIncome)*100)/100;
          that.dayDataView["dayProfitBack"] = that.dayDataView["mainFlowIncome"] + that.dayDataView["totalExportIncome"] - that.dayDataView["totalCost"];
          that.dayDataView["dayIncomeBack"] = that.dayDataView["mainFlowIncome"] + salesVolumeData["external_export_income"] - that.dayDataView["buyCost"];
          let ap = 0;
          if(that.dayDataView["dayProfit"] > 0 && that.dayDataView["wechatActive"] > 0){
            ap = that.dayDataView["dayProfit"] / that.dayDataView["wechatActive"];
          }
          that.dayDataView["ap"] =  Math.round(ap * 1000) /1000;
          that.loading = false;
        })
      },
      //微信日活改变事件
      wechatActiveChange(data){
        this.dayDataView["wechatActive"] = data;
        let ap = 0;
        if(that.dayDataView["dayProfit"] > 0 && that.dayDataView["wechatActive"] > 0){
          ap = that.dayDataView["dayProfit"] / that.dayDataView["wechatActive"];
        }
        this.dayDataView["ap"] =  Math.round(ap * 1000) /1000;
      },
      //删除统计记录
      deleteDayDataById(dayDataId){
        var that = this;
        this.$confirm('您确定要删除本条每日汇总数据?', "警告", {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消",
                  type: "warning"
            }).then(function() {
                request({
                  url: '/dayDataSum/remove',
                  method: 'post',
                  data:JSON.stringify({
                    tableName:"wechat_day_data_sum",
                    ids:[{id:dayDataId}]
                  })
                }).then(response => {
                  if(response.code != 200){
                    that.$message.error(response.message);
                    return;
                  }
                  that.getList();
                });
            }).catch(function() {});

      },
      // 自定义求和公式
      getSummaries(param) {
        const { columns, data } = param;
        const sums = [];
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = '合计';
            return;
          }
          const values = data.map(item => Number(item[column.property]));
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return prev + curr;
              } else {
                return prev;
              }
            }, 0);
            if (index === 2) {
              sums[index] = sums[index]
            } else if (index === 11 || index === 12) {
              sums[index] = sums[index].toFixed(2)
            } else {
              sums[index] = sums[index].toFixed(3)
            }
          } else {
            sums[index] = '';
          }
        });
        // console.log(sums)
        // 计算平均AP
        if (Number(sums[2])) {
          sums[13] = (Number(sums[11]) / Number(sums[2])).toFixed(3)
        } else {
          sums[13] = 0
        }
        // 计算平均流量主AP值
        if (data.length) {
          sums[5] = (Number(sums[5]) / data.length).toFixed(3)
        } else {
          sums[5] = 0
        }
        // 计算平均卖量cpa
        if (data.length) {
          sums[6] = (Number(sums[6]) / data.length).toFixed(3)
        } else {
          sums[6] = 0
        }
        return sums;
      }
    }
  }
</script>
<style scoped>
  .qpgame {
    margin-bottom: 35px;
  }
  .second-row {
    margin-bottom: 50px;
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
  .dialogTop {
    margin-bottom: 30px;
    border: 1px solid #E6EBF5;
  }
  .dialogBottom {
    margin-top: 30px
  }
  .title-grid {
    border: 1px solid #E6EBF5;
    text-align: center;
    background-color: #F9F9F9;
    height: 40px;
    line-height: 40px;
  }
  .el-table .success-row {
    background: #f0f9eb;
  }
  .table {
    margin-top: 20px;
  }
  .profit_loss {
    background-color: #00CC33;
  }
  .profit {
    background-color: #FF0000;
  }
  .dialogContainer {
    border: 1px solid #E6EBF5;
    margin-bottom: 20px;
  }
  .content-grid {
    border: 1px solid #E6EBF5;
    height: 40px;
    line-height: 40px;
    text-align: center;
  }
  .el-date-editor.el-input {
    width: 100% !important;
  }
  .el-table__footer-wrapper tbody .timeToLeave .cell {
    display: none !important;
  }
</style>
