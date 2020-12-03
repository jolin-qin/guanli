<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <!-- <el-form-item label="所属平台:">
        <el-select @change="paramsChange" v-model="queryParams.platformType" placeholder="所属平台">
          <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
            :value="item.dictValue" />
        </el-select>
      </el-form-item> -->
      <el-form-item label="游戏名称:">
        <el-select v-model="queryParams.productId" filterable  placeholder="请选择">
          <el-option v-for="(item, index) in advertList" :key="index" :label="item.targetNameColumnInputSelect"
            :value="item.targetIdColumnInputSelect"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="渠道公司名称:">
        <el-select v-model="queryParams.buyCompanyId"  filterable placeholder="请选择渠道公司" @change="companySelectChange()">
          <el-option v-for="(item, index) in companyList" :key="index" :label="item.targetNameColumnInputSelect"
            :value="item.targetIdColumnInputSelect"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="渠道广告名称:">
        <el-select v-model="queryParams.advertId" filterable placeholder="广告名称">
          <el-option v-for="(item, index) in companySelectProductList" :key="index" :label="item.targetNameColumnInputSelect"
            :value="item.targetIdColumnInputSelect" />
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
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="addBuyQuantity()">新增</el-button>
        </el-col>
        <el-col :span="1.5">
           <el-upload  ref="picUpload" action="#" accept=".xls,.xlsx,.csv"
           :http-request="requestUpload"   :on-success="(value)=> handleAvatarSuccess(value)" :before-upload="beforeUpload" >
              <el-button type="danger" icon="el-icon-download" size="mini">导入</el-button>
           </el-upload>
        </el-col>
        <el-col :span="2">
          <el-button type="warning" icon="el-icon-download" size="mini" @click="exportTarde()">导出</el-button>
        </el-col>
      </el-row>
      <el-table v-loading="loading" :data="exportTradeList" show-summary :summary-method="getSummaries">
        <el-table-column label="日期" prop="dataTime" align="center" />
        <el-table-column label="游戏名" prop="productName" align="center">
          <template slot-scope="scope">
            <span>{{scope.row['product_id.ref'].game_name}}</span>
          </template>
        </el-table-column>
        <el-table-column label="推广渠道" prop="company_name" align="center">
          <template slot-scope="scope">
            <span>{{scope.row['buy_company_id.ref'].company_name}}</span>
          </template>
        </el-table-column>
        <el-table-column label="推广广告" prop="avartName" align="center">
          <template slot-scope="scope">
            <span>{{scope.row['buy_product_id.ref'].product_name}}</span>
          </template>
        </el-table-column>
        <el-table-column label="买量日活(微信)" align="center">
          <template slot-scope="scope">
            <span>{{scope.row.wechatActive}}</span>
          </template>
        </el-table-column>
        <el-table-column property="buyActive" label="买量日活(微信)" width="100" align="center">
          <template slot-scope="scope">
            <el-col :span="24">
              <el-input
                v-model="scope.row.buyActive"
                @input="getBuyDayLive(scope.row)"
                :disabled="scope.row.outputStatus === 1"
                placeholder="请输入内容"
                maxlength="6"></el-input>
            </el-col>
          </template>
        </el-table-column>
        <el-table-column label="单价" align="center">
          <template slot-scope="scope">
            <el-col :span="24">
              <el-input v-model="scope.row.unitPrice" @input="getUnitPrice(scope.row)" :disabled="scope.row.outputStatus === 1" placeholder="请输入内容" maxlength="4"></el-input>
            </el-col>
          </template>
        </el-table-column>
        <el-table-column property="activeUnitPrice" label="活跃单价" align="center">
          <template slot-scope="scope">
            <el-col :span="24">
              <el-input v-model="scope.row.activeUnitPrice" @input="getActiveUnitPrice(scope.row)" :disabled="scope.row.outputStatus === 1" placeholder="请输入内容" maxlength="4"></el-input>
            </el-col>
          </template>
        </el-table-column>
        <el-table-column label="买量支出" prop="buyPay" align="center" />
        <!-- <el-table-column label="输出数据" prop="outputData" align="center" :formatter="_outputData" /> -->
        <el-table-column label="输出数据" align="center">
          <template slot-scope="scope">
            <span>{{_outputData(scope.row.outputData)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="买量新增" align="center">
          <template slot-scope="scope">
            <span>{{scope.row.buyAddUser}}</span>
          </template>
        </el-table-column>
        <el-table-column label="转化单价" align="center">
          <template slot-scope="scope">
            <span>{{scope.row.changeUnitPrice}}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.outputStatus === 0" class="red">未输出</span>
            <span v-else>已输出</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button v-if="scope.row.outputStatus === 0" @click="updateClick(scope.row)" type="text" size="small">保存</el-button>
            <el-button v-if="scope.row.outputStatus === 0" @click="handleClick(scope.row)" type="text" size="small">输出</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList" /> -->
    </div>
    <!-- 弹窗 -->
    <el-dialog customClass="dataStatisPopup" title="新增数据" :visible.sync="centerDialogVisible" :before-close="handleClose">
      <el-form :model="queryParamsDialog" label-position="left" :rules="rules" ref="queryFormDialog" label-width="120px">
        <el-form-item label="日期" prop="dateRangeDialog">
          <el-col :span="8">
            <el-date-picker v-model="queryParamsDialog.dateRangeDialog" size="small" style="width: 240px" value-format="yyyy-MM-dd" type="date"></el-date-picker>
          </el-col>
        </el-form-item>
        <el-form-item label="游戏名称" prop="productId">
          <el-select v-model="queryParamsDialog.productId" placeholder="请选择" class="lengths">
            <el-option v-for="item in advertList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
              :value="item.targetIdColumnInputSelect"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="推广渠道名称" prop="buyCompanyId">
          <el-select v-model="queryParamsDialog.buyCompanyId" placeholder="请选择推广渠道" @change="dialogCompanySelectChange()" class="lengths">
            <el-option v-for="(item, index) in companyList" :key="index" :label="item.targetNameColumnInputSelect"
              :value="item.targetIdColumnInputSelect"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="推广广告名称" prop="advertId">
          <el-select v-model="queryParamsDialog.advertId" placeholder="请选择" class="lengths">
              <el-option v-for="(item, index) in companySelectProductList" :key="index" :label="item.targetNameColumnInputSelect"
                :value="item.targetIdColumnInputSelect"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="买量日活(微信)" prop="dayLive">
          <el-col :span="11">
            <el-input v-model="queryParamsDialog.dayLive" type="number"></el-input>
          </el-col>
        </el-form-item>

        <el-form-item label="单价" prop="unitPrice">
          <el-col :span="11">
            <el-input v-model="queryParamsDialog.unitPrice" type="number"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="活跃单价" prop="activeUnitPrice">
          <el-col :span="11">
            <el-input v-model="queryParamsDialog.activeUnitPrice" type="number"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="买量支出" prop="buySpending">
          <el-col :span="11">
            <el-input v-model="queryParamsDialog.buySpending" type="number"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="输出数据" prop="outputData">
          <el-col :span="11">
            <el-input v-model="queryParamsDialog.outputData" type="number"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="买量新增" prop="buyNew">
          <el-col :span="11">
            <el-input v-model="queryParamsDialog.buyNew" type="number"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="转化单价" prop="changePrice">
          <el-col :span="11">
            <el-input v-model="queryParamsDialog.changePrice" type="number"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="是否输出" prop="radioValue">
          <el-radio-group v-model="queryParamsDialog.radioValue">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item class="buyDialogFooter">
          <el-button type="primary" @click="submitForm('queryFormDialog')">确定</el-button>
          <el-button @click="resetDialogForm('queryFormDialog')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
  import * as qpShop from '@/api/global-cache'
  import {downLoadZip} from '@/utils/zipdownload'
  import request from '@/utils/request'
  import * as qpTool from '@/utils/shuxin-tool'
  import {setDefaultTime} from '@/api/shuxin'
  export default {
    name: "tardeProductReport",
    data() {
      return {
        advertList: [],
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
        // 渠道公司名称数组
        companyList: [],
        // 渠道广告名称数组
        companySelectProductList: [],
        // 乘放游戏平台默认值
        defaultPlatformType: '',
        dateRange: [],
        queryParams: {
          platformType: '',
          gameGroup: [],
          productId: '', //游戏产品
          buyCompanyId: '', //渠道公司
          advertId: '', //广告名称
          pageNum: 1,
          pageSize: 10
        },
        dictCache: qpShop.globalCache.shopCache.dictCache,
        buyDayLive: '', //买量日活
        unitPrice: '',//单价
        activeUnitPrice: '',//活跃单价
        // 弹窗参数
        centerDialogVisible: false,
        queryParamsDialog: {
          dateRangeDialog: '',
          productId: '',
          buyCompanyId: '',
          advertId: '',
          dayLive: '',
          unitPrice: '',
          activeUnitPrice: '',
          buySpending: '',
          outputData: '',
          buyNew: '',
          changePrice: '',
          radioValue: 1
        },
        rules: {
          dateRangeDialog: [
            { required: true, message: '请选择日期', trigger: 'change' }
          ],
          productId: [
            { required: true, message: '请选择游戏名称', trigger: 'change' }
          ],
          buyCompanyId: [
            { required: true, message: '请选择推广渠道', trigger: 'change' }
          ],
          advertId: [
            { required: true, message: '请选择推广广告', trigger: 'change' }
          ],
          dayLive: [
            { required: true, message: '请填写日活', trigger: 'blur' }
          ],
          unitPrice: [
            { required: true, message: '请填写单价', trigger: 'blur' }
          ],
          activeUnitPrice: [
            { required: true, message: '请填写活跃单价', trigger: 'blur' }
          ],
          buySpending: [
            { required: true, message: '请填写买量支出', trigger: 'blur' }
          ],
          outputData: [
            { required: true, message: '请填写输出数据', trigger: 'blur' }
          ],
          buyNew: [
            { required: true, message: '请填写买量新增', trigger: 'blur' }
          ],
          changePrice: [
            { required: true, message: '请填写转化单价', trigger: 'blur' }
          ],
          radioValue: [
            { required: true, message: '请选择是否输出', trigger: 'change' }
          ]
        }
      }
    },
    created() {
      //this.groupInputSelect()
      this.dateRange = setDefaultTime() //设置默认时间(7天)
      this._defaultPlatform() //设置默认平台，会触发paramsChange()函数

      // this.getList();
    },
    mounted() {

    },
    methods: {
      getList() {
          this.loading = true
          request({
            url: '/buyDataInfo/list',
            method: 'post',
            data: JSON.stringify(this.getQueryData(this.queryParams))
          }).then(response => {
            console.log(response)
            if (response.code === 200) {
              this.exportTradeList = response.rows
              this.total = response.total
            } else {
              this.$notify.error({
                title: '错误',
                message: ''+response.msg
              })
            }
            this.loading = false
          })
      },
     // 获取渠道公司名称options(一进页面默认执行的函数，为的就是获取到所有的渠道公司options)
      companyInputSelect() {
        return new Promise((resolve, reject) => {
          let that = this;
          this.companyList = [] //options需要清空
          this.queryParams.buyCompanyId = ''
          // companyType=1代表是买量公司
          let params = {
            companyType: '1'
          }
          this.inputSelectList("t_filter", "company_id", null, function(data) {
            if (data.length > 0) {
              that.companyList = data;
              //that.queryParams.buyCompanyId = data[0].targetIdColumnInputSelect
              // 渠道公司名称确定了马上设置它下面的渠道广告名称
              that.companySelectChange()
            } else {
              that.queryParams.buyCompanyId = ''
            }
          }, JSON.stringify(params))
        })
      },
      // 获取渠道广告名称options(页面用)
      companySelectChange() {
          let that = this
          this.companySelectProductList = []
          this.queryParams.advertId = ''
          let advertParams = {
            companyId: this.queryParams.buyCompanyId
          }
          this.inputSelectList("t_filter", "buy_select_product_id", null, function(data) {
            if (data.length) {
              that.companySelectProductList = data
              //that.queryParams.advertId = data[0].targetIdColumnInputSelect
            } else {
              that.queryParams.advertId = ''
            }
          }, JSON.stringify(advertParams))
      },
      // 获取渠道广告名称options(弹窗用，没法通过传参与上面函数通用)
      dialogCompanySelectChange() {
          let that = this
          this.companySelectProductList = []
          this.queryParamsDialog.advertId = ''
          let advertParams = {
            companyId: this.queryParamsDialog.buyCompanyId
          }
          this.inputSelectList("t_filter", "buy_select_product_id", null, function(data) {
            if (data.length) {
              that.companySelectProductList = data
              that.queryParamsDialog.advertId = data[0].targetIdColumnInputSelect
            } else {
              that.queryParamsDialog.advertId = ''
            }
          }, JSON.stringify(advertParams))
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
          this.dateRange = setDefaultTime()
          this.queryParams.platformType = this.defaultPlatformType
          this.queryParams.gameGroup = []
          //此处为什么不修改productId的值，是因为设置了平台，会联动到产品
          this.resetForm("queryForm")
          // this.queryParams.productId = this.advertList[0].id;
          this.queryParams.productId = '',
          this.queryParams.buyCompanyId='';
          this.queryParams.advertId='';
          this.getList()
          //this.asyncCall()
          //this.getList()
      },
      // 请求参数函数
      getQueryData(query) {
          // var filters = {
          //     productId: {
          //     type: 'eq',
          //     value: query['productId']
          //   }
          // }
          let filters = {}
          if (!qpTool.isEmpty(query['productId'])) {
            filters.productId = {
              type: 'eq',
              value: query['productId']
            }
          }
          if(!qpTool.isEmpty(query['buyCompanyId'])) {
            filters.buyCompanyId = {
              type: 'eq',
              value: query['buyCompanyId']
            }
          }
          if(!qpTool.isEmpty(query['advertId'])) {
            filters.advertId = {
              type: 'eq',
              value: query['advertId']
            }
          }
          if(this.dateRange.length) {
            filters.dataTime = {
              type: 'between',
              from: this.dateRange[0],
              to: this.dateRange[1]
            }
          }
          return {
            tableName: 'wechat_buy_data_info',
            paging:{
              pageSize: 999,
              pageNumber: 1
            },
            filters: filters,
            orders:[{"column":"data_time","type":"desc"},{"column":"wechat_active","type":"desc"}]
          }
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
              platformType: qpTool.isEmpty(platformType) ? '0' : platformType,
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
              platformType: '0',
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
          // await this.companyInputSelect()
          this.getList()
      },
      // 设置默认平台函数
      _defaultPlatform() {
          let arr = this.dictCache.platform_type.details
          let value = arr[0].dictValue
          this.companyInputSelect()
          this.paramsChange()
          this.queryParams.platformType = value
          this.defaultPlatformType = value
          this.asyncCall()
      },
      // 新增
      addBuyQuantity() {
          this.centerDialogVisible = true
      },
      handleClose(done) {
          this.resetDialogForm()
          done()
      },
      // 提交新增数据表单
      submitForm(formName) {
        this.$refs.queryFormDialog.validate((valid) => {
          if (valid) {
            // alert('submit!');
            console.log('submit!')
            request({
              url: '/buyDataInfo/add',
              method: 'post',
              data: JSON.stringify({
                tableName: 'wechat_buy_data_info',
                data: {
                  dataTime: this.queryParamsDialog.dateRangeDialog,
                  productId: this.queryParamsDialog.productId,
                  buyCompanyId: this.queryParamsDialog.buyCompanyId,
                  buyProductId: this.queryParamsDialog.advertId,
                  wechatActive: this.queryParamsDialog.dayLive,
                  buyActive: this.queryParamsDialog.dayLive,
                  unitPrice: this.queryParamsDialog.unitPrice,
                  activeUnitPrice: this.queryParamsDialog.activeUnitPrice,
                  buyPay: this.queryParamsDialog.buySpending,
                  outputData: this.queryParamsDialog.outputData,
                  buyAddUser: this.queryParamsDialog.buyNew,
                  changeUnitPrice: this.queryParamsDialog.changePrice,
                  outputStatus: this.queryParamsDialog.radioValue
                }
              })
            }).then(response => {
              console.log(response)
              if (response.code === 200) {
                this.resetDialogForm() //重置表单
                this.centerDialogVisible = false //关闭弹窗
                this.msgSuccess("添加成功")
                this.getList()
              } else {
                this.$notify.error({
                  title: '错误',
                  message: ''+response.msg
                })
              }
            })
          } else {
            console.log('error submit!!');
            return false;
          }
        })
      },
      // 输出
      handleClick(row) {
        console.log(row)
        if (row.buyActive === '' || row.unitPrice === '' || row.activeUnitPrice === '') {
          this.$message({
            message: '请把数据填写完整',
            type: 'warning'
          })
          return false
        } else {
          this.$confirm(`确定提交输出吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            request({
              url: '/buyDataInfo/edit',
              method: 'post',
              data: JSON.stringify({
                tableName: 'wechat_buy_data_info',
                data: {
                  id: row.id,
                  buyActive: row.buyActive,
                  unitPrice: row.unitPrice,
                  activeUnitPrice: row.activeUnitPrice,
                  buyPay: row.buyPay,
                  outputData: row.outputData,
                  buyAddUser: row.buyAddUser,
                  changeUnitPrice: row.changeUnitPrice,
                  outputStatus: '1'
                }
              })
            }).then((res) => {
              console.log(res)
              if (res.code === 200) {
                this.msgSuccess("提交成功");
                this.getList();
              } else {
                this.$notify.error({
                  title: '错误',
                  message: '' + res.msg
                })
              }
            })
          })
        }
      },
      // 输出
      updateClick(row) {
        console.log(row)
        if (row.buyActive === '' || row.unitPrice === '' || row.activeUnitPrice === '') {
          this.$message({
            message: '请把数据填写完整',
            type: 'warning'
          })
          return false
        } else {
          request({
            url: '/buyDataInfo/edit',
            method: 'post',
            data: JSON.stringify({
              tableName: 'wechat_buy_data_info',
              data: {
                id: row.id,
                buyActive: row.buyActive,
                unitPrice: row.unitPrice,
                activeUnitPrice: row.activeUnitPrice,
                buyPay: row.buyPay,
                outputData: row.outputData,
                buyAddUser: row.buyAddUser,
                changeUnitPrice: row.changeUnitPrice,
                outputStatus: '0'
              }
            })
          }).then((res) => {
            console.log(res)
            if (res.code === 200) {
              this.msgSuccess("保存成功");
              this.getList();
            } else {
              this.$notify.error({
                title: '错误',
                message: '' + res.msg
              })
            }
          })
        }
      },
      // 重置弹窗表单
      resetDialogForm() {
        this.$refs.queryFormDialog.resetFields();
      },
      /**  导出详细数据  */
      exportTarde() {
        var filterJsonStr = JSON.stringify({
          beginTime: this.dateRange[0],
          endTime: this.dateRange[1],
          productId: this.queryParams.productId!=null?this.queryParams.productId:"",
          buyCompanyId: this.queryParams.buyCompanyId!=null?this.queryParams.buyCompanyId:"",
          advertId: this.queryParams.advertId!=null?this.queryParams.advertId:"",
        });
        downLoadZip(encodeURI("export/exportData?id=buyDataReport&param=" + filterJsonStr), "exportTrade", true);
      },
      //买量日活input事件
      getBuyDayLive(item) {
        // this.buyDayLive = value
        if(Number(item.buyActive)) {
          if(item.activeUnitPrice) {
            item.buyPay = (Number(item.buyActive) * Number(item.activeUnitPrice)).toFixed(2) //买量支出
            //输出数据
            if (item.unitPrice) {
              item.outputData = Number(item.buyPay) / Number(item.unitPrice)
            } else {
              item.outputData = 0
            }
          } else {
            item.outputData = 0
          }
          // 计算转化单价
          if (item.unitPrice) {
            item.changeUnitPrice = (Number(item.buyAddUser) * Number(item.unitPrice) / Number(item.buyActive)).toFixed(2)
          } else {
            item.changeUnitPrice = 0
          }
        } else {
          item.buyPay = 0
          item.changeUnitPrice = 0
          item.outputData = 0
        }
      },
      //单价input事件
      getUnitPrice(item) {
        if (Number(item.unitPrice)) {
          // 计算输出数据
          if (item.buyPay) {
            item.outputData = Number(item.buyPay)  / Number(item.unitPrice)
          } else {
            item.outputData = 0
          }
          // 计算转化单价
          if (Number(item.buyActive)) {
            item.changeUnitPrice = (Number(item.buyAddUser) * Number(item.unitPrice) / Number(item.buyActive)).toFixed(2)
          } else {
            item.changeUnitPrice = 0
          }
        } else {
          // 跟单价有关的都为''
          item.outputData = 0
          item.changeUnitPrice = 0
        }
      },
      // 活跃单价input事件
      getActiveUnitPrice(item) {
        if (item.activeUnitPrice) {
          // 计算买量支出
          if (item.buyActive) {
            item.buyPay = (Number(item.buyActive) * Number(item.activeUnitPrice)).toFixed(2)
            // 如果此时单价是有的
            if (Number(item.unitPrice)) {
              item.outputData = Number(item.buyPay) / Number(item.unitPrice)
            } else {
              item.outputData = 0
            }
          } else {
            item.buyPay = 0
          }
        } else {
          item.buyPay = 0
          item.outputData = 0
        }
      },
      // 上传预处理
      beforeUpload(file) {
        if (file.type.indexOf("excel") == -1) {
          this.msgError("文件格式错误，请上传excel文件。");
        }
      },

      // 覆盖默认的上传行为
      requestUpload(option) {
        var formData = new FormData();
        formData.append("file",option.file);
        request({
          url: '/buyDataInfo/exportExcel',
          method: 'post',
          data: formData,
          dataType: "json",
          async: false,
        }).then((res) => {
          this.$refs['picUpload'].clearFiles();
          if(!qpTool.isEmpty(res.data.errorMessage)){
              this.msgError(res.data.errorMessage);
          }
          this.handleQuery();
        })
      },
      // 去掉输出数据小数点后面的数
      // _outputData(row, column) {
      //   let result = row.outputData.toString()
      //   return result.split(".")[0]
      // },
      _outputData(data) {
        let result = data.toString()
        return result.split(".")[0]
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
            if (index === 5) {
              sums[index] = sums[index]
            } else {
              sums[index] = sums[index].toFixed(2)
            }
          } else {
            sums[index] = '';
          }
        });
        // console.log(sums)
        if (Number(sums[5])) {
          sums[7] = (sums[8] / sums[5]).toFixed(2)
        } else {
          sums[7] = 0
        }
        return sums;
      }
    }
  }
</script>
<style scoped>
  .qphead {
    margin-bottom: 20px;
  }
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
  /deep/ .dataStatisPopup {
    width: 700px !important;
  }
  .red {
    color: red !important;
  }
  .buyDialogFooter {
    margin-top: 30px;
  }
 .buyDialogFooter .el-form-item__content {
   display: flex;
   justify-content: flex-end;
   align-items: center;
 }
 .lengths {
   width: 247px;
 }
</style>
