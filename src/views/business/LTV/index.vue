<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属平台:">
        <el-select @change="paramsChange" filterable v-model="queryParams.platformType" placeholder="所属平台">
          <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
            :value="item.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="产品名称:">
        <el-select v-model="queryParams.productId" filterable placeholder="请选择">
          <el-option v-for="item in productList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
            :value="item.targetIdColumnInputSelect"></el-option>
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
      <el-row :gutter="10" type="flex" class="mb8 qphead">
        <el-col :span="1.5">
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" >新增</el-button>
        </el-col>
      </el-row>
      <el-table v-loading="loading" :data="wechatWeeklyLtvList">
        <el-table-column label="平台" align="center" prop="platformName" />
        <el-table-column label="游戏" align="center"  prop="productName" />
        <el-table-column label="日期" align="center"   prop="dataTime" />
        <el-table-column label="次留" align="center"  prop="oneRetention" />
        <el-table-column label="3留" align="center"  prop="threeRetention" />
        <el-table-column label="7留" align="center"  prop="sevenRetention" />
        <el-table-column label="次日LTV" align="center"  prop="oneDayLtv" />
        <el-table-column label="三日LTV" align="center"  prop="threeDayLtv" />
        <el-table-column label="七日LTV" align="center"  prop="sevenDayLtv" />
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button @click="handleUpdate(scope.row)" type="text" size="small">详细数据</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
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
    <el-dialog customClass="dataStatisPopup" :title="title" :visible.sync="dialogTableVisible">
      <el-form :model="form" :rules="rules" ref="form">
      <!-- 弹窗底部展示区 -->
        <div class="dialogBottom">
          <!-- 弹窗顶部展示区 -->
          <el-table :data="productData" border  :row-class-name="tableRowClassName" class="table">
            <el-table-column  property="platformType" align="center" label="所属平台" width="130">
               <template  slot-scope="scope">
                  <el-select v-if="scope.row.id==null"   @change="rowsParamsChange" v-model="scope.row.platformType" placeholder="所属平台">
                    <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
                      :value="item.dictValue" />
                  </el-select>
                  <span v-else >{{scope.row.platformName}}</span>
               </template>
            </el-table-column>
            <el-table-column property="threeRetention" align="center" label="产品名称" width="180">
                <template slot-scope="scope">
              <el-select v-if="scope.row.id==null"  v-model="scope.row.productId" placeholder="请选择" @change="productOrDateChange">
                <el-option v-for="item in rowsProductList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
                  :value="item.targetIdColumnInputSelect"></el-option>
              </el-select>
               <span v-else >{{scope.row.productName}}</span>
                </template>
            </el-table-column>
            <el-table-column property="dataTime" align="center" label="时间" width="180">
               <template slot-scope="scope">
                 <el-date-picker v-if="scope.row.id==null" clearable size="small" style="width: 100%"
                   v-model="scope.row.dataTime"
                   type="date"
                   value-format="yyyy-MM-dd"
                   placeholder="选择时间"
                   @change="productOrDateChange">
                 </el-date-picker>
                 <span v-else >{{scope.row.dataTime}}</span>
               </template>
            </el-table-column>
            <el-table-column property="dau" align="center" label="DAU"></el-table-column>
            <el-table-column property="oneDayLtv" align="center" label="次日LTV"></el-table-column>
            <el-table-column property="threeDayLtv" align="center"  label="三日LTV"></el-table-column>
            <el-table-column property="sevenDayLtv" align="center" label="七日LTV"></el-table-column>
          </el-table>
          <!-- 弹窗中部展示区 -->
          <el-table :data="gridData" border  :row-class-name="tableRowClassName" class="table">
            <el-table-column property="oneRetention" align="center" label="次留">
              <template slot-scope="scope">
                <el-col>
                  <el-input v-if="scope.row.id==null" v-model="scope.row.oneRetention" @change="oneRetentionChange" oninput="if(isNaN(value)) { value = null } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"   placeholder="请输入次日留存" class="group-inp"></el-input>
                  <span v-else >{{scope.row.oneRetention}}</span>
                </el-col>
              </template>
            </el-table-column>
            <el-table-column property="threeRetention" align="center" label="3留">
              <template slot-scope="scope">
                <el-col>
                  <el-input v-if="scope.row.id==null" v-model="scope.row.threeRetention" oninput="if(isNaN(value)) { value = null } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" placeholder="请输入三日留存" class="group-inp"
                    @change="threeRetentionChange"
                  ></el-input>
                  <span v-else >{{scope.row.threeRetention}}</span>
                </el-col>
              </template>
            </el-table-column>
            <el-table-column property="fourRetention" align="center" label="4留"></el-table-column>
            <el-table-column property="fiveRetention" align="center" label="5留"></el-table-column>
            <el-table-column property="sixRetention" align="center"  label="6留"></el-table-column>
            <el-table-column property="sevenRetention" align="center" label="7留">
              <template slot-scope="scope">
                <el-col>
                  <el-input v-if="scope.row.id==null" v-model="scope.row.sevenRetention" oninput="if(isNaN(value)) { value = null } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" placeholder="请输入七日留存" class="group-inp"
                  @change="senvenRetentionChange"></el-input>
                  <span v-else >{{scope.row.sevenRetention}}</span>
                </el-col>
              </template>
            </el-table-column>
          </el-table>
          <el-table border :data="weekData" :row-class-name="tableRowClassName" class="table">
            <el-table-column property="weekDau" align="center" label="周DAU"></el-table-column>
            <el-table-column property="weekExportRate"  align="center" label="导出率"></el-table-column>
            <el-table-column property="weekExportRevenue"  align="center" label="导出收入"></el-table-column>
            <el-table-column property="weekSalesCpa"  align="center" label="卖量cpa"></el-table-column>
            <el-table-column property="weekMainFlowIncome"  align="center" label="流量主收入"></el-table-column>
            <el-table-column property="weekMainFlowAp"  align="center" label="流量主ap"></el-table-column>
          </el-table>
          <el-table border :data="threeData" :row-class-name="tableRowClassName" class="table">
            <el-table-column property="threeDau"  align="center" label="3日DAU"></el-table-column>
            <el-table-column property="threeExportRate"  align="center" label="导出率"></el-table-column>
            <el-table-column property="threeExportRevenue"  align="center" label="导出收入"></el-table-column>
            <el-table-column property="threeSalesCpa"  align="center"  label="卖量cpa"></el-table-column>
            <el-table-column property="threeMainFlowIncome"  align="center" label="流量主收入"></el-table-column>
            <el-table-column property="threeMainFlowAp"  align="center"label="流量主ap"></el-table-column>
          </el-table>
          <el-table border :data="secondData" :row-class-name="tableRowClassName" class="table">
            <el-table-column property="oneDau"  align="center" label="次日DAU"></el-table-column>
            <el-table-column property="oneExportRate"  align="center" label="导出率"></el-table-column>
            <el-table-column property="oneExportRevenue"  align="center" label="导出收入"></el-table-column>
            <el-table-column property="oneSalesCpa"  align="center" label="卖量cpa"></el-table-column>
            <el-table-column property="oneMainFlowIncome"  align="center" label="流量主收入"></el-table-column>
            <el-table-column property="oneMainFlowAp"  align="center" label="流量主ap"></el-table-column>
          </el-table>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelDialogVisible">取 消</el-button>
        <el-button v-if="form.id==null" type="primary" @click="submitDialogVisible">确 定</el-button>
      </span>

    </el-dialog>
  </div>

</template>

<script>
  import {
    listLtv,
    getLtv,
    addLtv,
    updateLtv,
    delLtv
  } from "@/api/business/ltv/ltv";
  import * as qpShop from '@/api/global-cache'
  import {downLoadZip} from "@/utils/zipdownload"
  import request from '@/utils/request'
  import * as qpTool from '@/utils/shuxin-tool'
  import {setDefaultTime} from '@/api/shuxin'
  export default {
    name: "tardeProductReport",
    data() {
      return {
        title:'',
        productList: [],
        rowsProductList:[],
        wechatWeeklyLtvList:[],
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
        //是否已获取数据
        isData:false,
        // 类目监控表格
        exportTradeList: [],
        // 乘放游戏平台默认值
        defaultPlatformType: '',
        dateRange: [],
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          platformType: '',
          dataTime: [],
          gameGroup:[],
          productId: '',
        },
        dictCache: qpShop.globalCache.shopCache.dictCache,
        // 弹窗参数
        dialogTableVisible: false,
        dateRangeDialog: [],
        form: {},
        actualNums: '',
        unitPrice: '',
        //产品
        productData: [{
              platformType:undefined,
              productId:undefined,
              dataTime:undefined,
              dau:10000,
              oneDayLtv:undefined,
              threeDayLtv:undefined,
              sevenDayLtv:undefined,
         }],
        //留存
        gridData: [
          {
            oneRetention: '',
            threeRetention: '',
            fourRetention: '',
            fiveRetention: '',
            sixRetention: '',
            sevenRetention: ''
          }
        ],
        //周数据
        weekData: [{
          weekDau:undefined,
          weekExportRate:undefined,
          weekExportRevenue:undefined,
          weekSalesCpa:undefined,
          weekMainFlowIncome:undefined,
          weekMainFlowAp:undefined
        }],
        //三日数据
        threeData: [{
           threeDau:undefined,
           threeExportRate:undefined,
           threeExportRevenue:undefined,
           threeSalesCpa:undefined,
           threeMainFlowIncome:undefined,
           threeMainFlowAp:undefined,
        }],
        //次日数据
        secondData: [{
          oneDau:undefined,
          oneExportRate:undefined,
          oneExportRevenue:undefined,
          oneSalesCpa:undefined,
          oneMainFlowIncome:undefined,
          oneMainFlowAp:undefined
        }],

        rules: {
          platformType: [{
            required: true,
            message: "平台不能为空",
            trigger: "blur"
          }],
          oneRetention: [{
            required: true,
            message: "次日留存不能为空",
            trigger: "blur"
          }]
        },

      };
    },
    created() {
      this.groupInputSelect()
      this.queryParams.dataTime = setDefaultTime() //设置默认时间(7天)
      this._defaultPlatform() //设置默认平台，会触发paramsChange()函数
    },
    methods: {
      /** 查询数据 */
      getList() {
        console.log("请求")
        this.loading = true;
        listLtv(this.queryParams).then(response => {
          if (response.code === 200) {
            this.wechatWeeklyLtvList = response.rows
            this.total = response.total
          } else {
            this.$message.error(''+response.msg)
          }
          this.loading = false;
        });
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.getList()
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.queryParams.dataTime = setDefaultTime()
        this.queryParams.platformType = this.defaultPlatformType
        this.queryParams.gameGroup = []
        // this.queryParams.dataTime = []
        //此处为什么不修改productId的值，是因为设置了平台，会联动到产品
        this.resetForm("queryForm")
        this.asyncCall()
      },
      // getQueryData() {
      //   return {
      //     "beginTime": this.dateRange[0],
      //     "endTime": this.dateRange[1],
      //     "productIds": this.queryParams["productId"],
      //     "groupByIds": this.queryParams["gameGroup"],
      //     "platformType": this.queryParams["platformType"]
      //   }
      // },
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
      //平台、分组change事件
      rowsParamsChange() {
        return new Promise((resolve, reject) => {
          let groupByIds = this.queryParams["gameGroup"]; //是个数组
          let platformType = this.productData[0].platformType;
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
          this.rowProductInputSelect(null, params, resolve)
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
            that.productList = data
            // that.queryParams.productId.push(data[0].targetIdColumnInputSelect)
            //that.queryParams.productId = data[0].targetIdColumnInputSelect
          } else {
            // that.queryParams.productId = []
           // that.queryParams.productId = ''
          }
          resolve && resolve()
        }, JSON.stringify(params));
      },
      // 获取游戏产品option项函数
      rowProductInputSelect(query, params, resolve) {
        this.rowsProductList = [] //options需要清空
        //this.queryParams.productId = [] 产品显示也需要清空
        var that = this;
        // console.log(params)
        this.inputSelectList("t_filter", "product_id", query, function(data) {
          if (data.length > 0) {
            that.rowsProductList = data
            // that.queryParams.productId.push(data[0].targetIdColumnInputSelect)
            that.productData[0].productId = data[0].targetIdColumnInputSelect
          } else {
            // that.queryParams.productId = []
            that.productData[0].productId = ''
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
        this.productData[0].platformType = value
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
      /**
          修改产品和日期时，获取卖量信息数据
       */
      productOrDateChange(){
        // console.log(this.productData[0].productId,this.productData[0].dataTime);
        if(qpTool.isEmpty(this.productData[0].productId)||qpTool.isEmpty(this.productData[0].dataTime)){
          return;
        }
        var params={
          productId:this.productData[0].productId,
          currDate:this.productData[0].dataTime
        }
        this.getData(params);
      },
      /**
       * 获取指定日期的卖量数据汇总
       */
       getData(params){
         request({
           url: '/weeklyLtv/getSalesVolumeByProductId?productId='+params.productId+'&currDate='+params.currDate,
           method: 'post',
           data:params
         }).then(res => {
              if(qpTool.isEmpty(res.data.external_export_income)){
                return;
              }
              var cpa=0;
              if(res.data.backstage_export_user + res.data.external_export_user>0){
                 cpa=((res.data.backstage_export_income + res.data.external_export_income)/(res.data.backstage_export_user + res.data.external_export_user)).toFixed(2);
              }
              this.isData=true;
              this.weekData[0].weekExportRate=res.data.wechat_export_rate;
              this.weekData[0].weekSalesCpa=cpa;
              this.weekData[0].weekMainFlowAp=res.data.main_flow_ap;
              this.threeData[0].threeExportRate=res.data.wechat_export_rate;
              this.threeData[0].threeSalesCpa=cpa;
              this.threeData[0].threeMainFlowAp=res.data.main_flow_ap;
              this.secondData[0].oneExportRate=res.data.wechat_export_rate;
              this.secondData[0].oneSalesCpa=cpa;
              this.secondData[0].oneMainFlowAp=res.data.main_flow_ap;
              this.oneRetentionDataChange();
              this.threeRetentionDataChange();
              this.senvenRetentionDataChange();
          })
       },
      /**
       * 次日留存修改计算
       */
      oneRetentionChange(){
        //修改次日DAU 引起
        var oneDau=(this.productData[0].dau+this.productData[0].dau*this.gridData[0].oneRetention/100);
        this.secondData[0].oneDau=oneDau
        //三日留存改变
        if(!qpTool.isEmpty(this.gridData[0].threeRetention)){
              this.threeRetentionChange();
            //七日留存改变
            if(!qpTool.isEmpty(this.gridData[0].sevenRetention)){
               this.senvenRetentionChange();
            }
        }
        //次日数据改变
        if(this.isData){
            this.oneRetentionDataChange();
        }
      },

      /**
       * 改变次日数据
       */
      oneRetentionDataChange(){
        if(qpTool.isEmpty(this.gridData[0].oneRetention)){
          return;
        }
        this.secondData[0].oneExportRevenue=this.saveTwoFixed(this.secondData[0].oneDau*this.secondData[0].oneExportRate*this.secondData[0].oneSalesCpa);
        this.secondData[0].oneMainFlowIncome=this.saveTwoFixed(this.secondData[0].oneDau*this.secondData[0].oneMainFlowAp);
        //LTV
        this.productData[0].oneDayLtv=this.saveTwoFixed((Number(this.secondData[0].oneExportRevenue)+Number(this.secondData[0].oneMainFlowIncome))/this.productData[0].dau)
      },
      /**
       * 三日改变留存计算
       *  fourRetention: '',
            fiveRetention: '',
            sixRetention: '',
       */
      threeRetentionChange(){
        var baseRetention=1.25;
        var threeRetention=this.gridData[0].threeRetention;
        this.gridData[0].fourRetention=Number(threeRetention)-baseRetention>0?(Number(threeRetention)-baseRetention).toFixed(2):0;
        this.gridData[0].fiveRetention=Number(threeRetention)-baseRetention*2>0?(Number(threeRetention)-baseRetention*2).toFixed(2):0;
        this.gridData[0].sixRetention=Number(threeRetention)-baseRetention*3>0?(Number(threeRetention)-baseRetention*3).toFixed(2):0;
        if(!qpTool.isEmpty(this.gridData[0].oneRetention)){
            var threeDau=this.secondData[0].oneDau+(this.productData[0].dau*this.gridData[0].threeRetention/100);
            this.threeData[0].threeDau=threeDau;
            //次日数据改变
            if(this.isData){
                this.threeRetentionDataChange();
            }
            //七日留存改变
            if(!qpTool.isEmpty(this.gridData[0].sevenRetention)){
               this.senvenRetentionChange();
            }
        }
      },
      /**
       * 改变三日数据
       */
      threeRetentionDataChange(){
        if(qpTool.isEmpty(this.gridData[0].threeRetention)){
          return;
        }
       this.threeData[0].threeExportRevenue=this.saveTwoFixed(this.threeData[0].threeDau*this.threeData[0].threeExportRate*this.threeData[0].threeSalesCpa);
       this.threeData[0].threeMainFlowIncome=this.saveTwoFixed(this.threeData[0].threeDau*this.threeData[0].threeMainFlowAp);
       //LTV
       this.productData[0].threeDayLtv=this.saveTwoFixed((Number(this.threeData[0].threeExportRevenue)+Number(this.threeData[0].threeExportRevenue))/this.productData[0].dau);
      },
      /**
       * 七日留存修改计算
       */
      senvenRetentionChange(){
         if(qpTool.isEmpty(this.gridData[0].oneRetention)||qpTool.isEmpty(this.gridData[0].threeRetention)){
           return;
         }
        var fourRetention= this.threeData[0].threeDau+(this.productData[0].dau*this.gridData[0].fourRetention/100);
        var fiveRetention=fourRetention+(this.productData[0].dau*this.gridData[0].fiveRetention/100);
        var sixRetention=fiveRetention+(this.productData[0].dau*this.gridData[0].sixRetention/100);
        var weekDau=sixRetention+(this.productData[0].dau*this.gridData[0].sevenRetention/100);
        this.weekData[0].weekDau=weekDau;
        //次日数据改变
        if(this.isData){
             this.senvenRetentionDataChange();
        }
      },

      /**
       * 改变七日数据
       */
      senvenRetentionDataChange(){
        if(qpTool.isEmpty(this.gridData[0].sevenRetention)){
          return;
        }
        this.weekData[0].weekExportRevenue=this.saveTwoFixed(this.weekData[0].weekDau*this.weekData[0].weekExportRate*this.weekData[0].weekSalesCpa);
        this.weekData[0].weekMainFlowIncome=this.saveTwoFixed(this.weekData[0].weekDau*this.weekData[0].weekMainFlowAp);
        //LTV
        this.productData[0].sevenDayLtv=this.saveTwoFixed(((Number(this.weekData[0].weekExportRevenue)+Number(this.weekData[0].weekMainFlowIncome)))/this.productData[0].dau)
      },

      /**
       * 保存两位小数
       */
      saveTwoFixed(value){
        return  value.toFixed(2);
      },
      // 表单重置
      cancelDialogReset() {
        //产品
        this.productData=[{
              platformType:undefined,
              productId:undefined,
              dataTime:undefined,
              dau:10000,
              oneDayLtv:undefined,
              threeDayLtv:undefined,
              sevenDayLtv:undefined,
         }],

         //留存
        this.gridData= [
          {
            oneRetention: '',
            threeRetention: '',
            fourRetention: '',
            fiveRetention: '',
            sixRetention: '',
            sevenRetention: ''
          }
        ],
        //周数据
        this.weekData=[{
          weekDau:undefined,
          weekExportRate:undefined,
          weekExportRevenue:undefined,
          weekSalesCpa:undefined,
          weekMainFlowIncome:undefined,
          weekMainFlowAp:undefined
        }],
        //三日数据
        this.threeData=[{
           threeDau:undefined,
           threeExportRate:undefined,
           threeExportRevenue:undefined,
           threeSalesCpa:undefined,
           threeMainFlowIncome:undefined,
           threeMainFlowAp:undefined,
        }],
        //次日数据
        this.secondData=[{
          oneDau:undefined,
          oneExportRate:undefined,
          oneExportRevenue:undefined,
          oneSalesCpa:undefined,
          oneMainFlowIncome:undefined,
          oneMainFlowAp:undefined
        }]
      },
     // 取消按钮
      cancelDialogVisible() {
        this.dialogTableVisible = false;
        this.cancelDialogReset();
      },
     //合并数据
     addForm(){
       this.form=this.extend(this.form,this.productData[0]);
       this.form=this.extend(this.form,this.gridData[0]);
       this.form=this.extend(this.form,this.weekData[0]);
       this.form=this.extend(this.form,this.threeData[0]);
       this.form=this.extend(this.form,this.secondData[0]);
       console.log(this.form);
     },
      /**
       * @param {Object} target
       * @param {Object} source
       * 合并数据
       */
     extend(target, source) {
       for (var obj in source) {
           target[obj] = source[obj];
       }
       return target;
     },
    handleAdd(){
         this.cancelDialogReset();
         this.form={};
         this.dialogTableVisible = true;
         this.title = "新增详细数据";
    },
     /** 修改按钮操作 */
     handleUpdate(row) {
       this.cancelDialogReset();
       const id = row.id || this.ids
       getLtv(id).then(response => {
         this.form = response.data;
         this.productData[0]=this.form
         this.gridData[0]=this.form
         this.weekData[0]=this.form
         this.threeData[0]=this.form
         this.secondData[0]=this.form
         this.dialogTableVisible = true;
         console.log(this.productData[0])
         this.title = "详细数据";
       });
     },
      /** 删除按钮操作 */
      handleDelete(row) {
        this.$confirm('是否确认删除广告编号为"' + row.id + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delLtv(row.id);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
      },
     /**
      * 验证参数不能为空
      */
     checkForm(){
       if(qpTool.isEmpty(this.form.productId)){
          this.msgError("产品名称不能为空!");
          return false;
       }
       if(qpTool.isEmpty(this.form.dataTime)){
          this.msgError("时间不能为空!");
          return false;
       }
       if(!this.isData){
          this.msgError("没有导入卖量数据!");
          return false;
       }
       if(qpTool.isEmpty(this.form.oneRetention)){
          this.msgError("次日留存不能为空!");
          return false;
       }
       if(qpTool.isEmpty(this.form.threeRetention)){
          this.msgError("三日留存不能为空!");
          return false;
       }
       if(qpTool.isEmpty(this.form.sevenRetention)){
          this.msgError("七日留存不能为空!");
          return false;
       }
       return true;
     },

    submitDialogVisible: function() {
      this.addForm();
      if(!this.checkForm()){
        return;
      }
      if(this.isSubmit){
        return ;
      }
      this.isSubmit=true;
      addLtv(this.form).then(response => {
        if (response.code === 200) {
          this.msgSuccess("新增成功");
          this.dialogTableVisible = false;
          this.getList();
        } else {
           this.isSubmit=false;
          this.msgError(response.msg);
        }
      });
    },

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
  /* .dataStatisPopup {
    width: 78% !important;
  } */
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
  }
  .dialogBottom {
    margin-top: 30px
  }
  .title-grid {
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
</style>
