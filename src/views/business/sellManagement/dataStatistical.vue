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
      <el-row :gutter="10" type="flex" class="qphead">
        <el-col :span="1.5">
          <el-button type="primary" class="addNewBtn" icon="el-icon-plus" size="mini" @click="openDialog">新增</el-button>
        </el-col>
      </el-row>
      <el-table v-loading="loading" :data="exportTradeList">
        <el-table-column label="日期" prop="dataTime" align="center" />
        <el-table-column label="产品" prop="productId_name_column_qp" align="center" />
        <el-table-column label="微信日活" prop="wechatActive" align="center" />
        <el-table-column label="微信导出率" prop="wechatExportRate" align="center" />
        <el-table-column label="流量主收入" prop="mainFlowIncome" align="center" />
        <!-- <el-table-column label="操作" prop="exportIncome" /> -->
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row)" type="text" size="small">详细数据</el-button>
            <el-button @click="editData(scope.row)" type="text" size="small">编辑</el-button>
            <el-button @click="deleteData(scope.row)" type="text" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>
    <!-- 弹窗 -->
    <el-dialog customClass="dataStatisPopup" :title="dialogTitle" :visible.sync="dialogTableVisible" :before-close="handleCloseDialog">
      <el-form :model="queryParamsDialog" ref="queryForm" :inline="true">
        <el-form-item label="日期:">
          <el-date-picker v-model="queryParamsDialog.dateRangeDialog" :disabled="isDisabled" size="small" style="width: 240px" @change="changeStatus()" value-format="yyyy-MM-dd" type="date"></el-date-picker>
        </el-form-item>
        <el-form-item label="游戏名称:">
          <el-select v-model="queryParamsDialog.productId" :disabled="isDisabled" placeholder="请选择" @change="changeStatus()">
            <el-option v-for="(item, index) in advertList" :key="index" :label="item.targetNameColumnInputSelect"
              :value="item.targetIdColumnInputSelect"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-row>
        <el-col :span="6">
          <el-row class="statisticalItem">
            <el-col :span="6" style="width: 100px">微信日活</el-col>
            <el-col :span="12">
              <el-input class="dialog-input" v-model="dialogWechatActive" :disabled="isEdit" @input="countWechatActive" placeholder="请输入日活" maxlength="7"></el-input>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <div class="statisticalItem">
            <span style="width: 100px">微信导出率</span>
            <p class="number">{{dialogWechatExportRate}}</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statisticalItem">
            <span style="width: 100px">后台日活</span>
            <p class="number">{{backstageActive}}</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statisticalItem">
            <span style="width: 100px">后台导出率</span>
            <p class="number">{{backgroundExportRate}}</p>
          </div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-row class="statisticalItem">
            <el-col :span="6" style="width: 100px">流量主收入</el-col>
            <el-col :span="12">
              <el-input class="dialog-input" v-model="dialogMainIncome" :disabled="isEdit" @input="countMainIncome" placeholder="请输入内容" maxlength="9"></el-input>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <div class="statisticalItem">
            <span style="width: 100px">自家导出收入</span>
            <p class="number">{{insideExportIncome}}</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statisticalItem">
            <span style="width: 100px">外部导出收入</span>
            <p class="number">{{outsideExportIncome}}</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statisticalItem">
            <span style="width: 100px">广告ap</span>
            <p class="number">{{advertAP}}</p>
          </div>
        </el-col>
      </el-row>
      <el-row class="second-row">
        <el-col :span="6">
          <div class="statisticalItem">
            <span style="width: 100px">流量主ap</span>
            <p class="number">{{trafficAP}}</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statisticalItem">
            <span style="width: 100px">总ap</span>
            <p class="number">{{totalAP}}</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statisticalItem">
            <span style="width: 100px">自家导出用户</span>
            <p class="number">{{insideExportUser}}</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="statisticalItem">
            <span style="width: 100px">外部导出用户</span>
            <p class="number">{{outsideExportUser}}</p>
          </div>
        </el-col>
      </el-row>
      <!-- 用div自己写的表格 -->
      <div class="selfTable">
        <el-row>
          <el-col :span="3" class="dialog-table-title"><span>广告名称</span></el-col>
          <el-col :span="3" class="dialog-table-title"><span>广告公司名称</span></el-col>
          <el-col :span="2" class="dialog-table-title"><span>占比(%)</span></el-col>
          <el-col :span="2" class="dialog-table-title"><span>导出用户</span></el-col>
          <el-col :span="2" class="dialog-table-title"><span>广告主实际数据</span></el-col>
          <el-col :span="2" class="dialog-table-title"><span>单价</span></el-col>
          <el-col :span="2" class="dialog-table-title"><span>收入</span></el-col>
          <el-col :span="2" class="dialog-table-title"><span>转化(%)</span></el-col>
          <el-col :span="2" class="dialog-table-title"><span>价值</span></el-col>
          <el-col :span="2" class="dialog-table-title"><span>实时导出用户</span></el-col>
          <el-col :span="2" class="dialog-table-title"><span>实时收入</span></el-col>
          <!-- <el-col :span="3" class="dialog-table-title"><span>备注</span></el-col> -->
        </el-row>
        <el-row v-for="(item, index) in gridData" :key="index">
          <!-- 1 -->
          <template>
            <el-col :span="3" class="dialog-table-cell elseStyle" v-if="!isDisabled">{{item.gameName}}</el-col>
            <el-col :span="3" class="dialog-table-cell elseStyle" v-else>{{item['advert_id.ref'].game_name}}</el-col>
          </template>
          <!-- 2 -->
          <template>
            <el-col :span="3" class="dialog-table-cell elseStyle" v-if="!isDisabled">{{item.companyName}}</el-col>
            <el-col :span="3" class="dialog-table-cell elseStyle" v-else>{{item['company_id.ref'].company_name}}</el-col>
          </template>
          <!-- 3 -->
          <el-col :span="2" class="dialog-table-cell elseStyle">{{item.proportion}}</el-col>
          <!-- 4 -->
          <el-col :span="2" class="dialog-table-cell elseStyle">{{item.backstageExportUser}}</el-col>
          <!-- 5 -->
          <el-col :span="2" class="dialog-table-cell elseStyle">
            <el-input v-model="item.advertExportUser" type="number" @input="getActualNums(item, index)" placeholder="请输入数据" maxlength="6"></el-input>
          </el-col>
          <!-- 6 -->
          <el-col :span="2" class="dialog-table-cell elseStyle">
            <el-input v-model="item.unitPrice" type="number" @input="getUnitPrice(item, index)" placeholder="请输入数据" maxlength="4"></el-input>
          </el-col>
          <!-- 7 -->
          <el-col :span="2" class="dialog-table-cell elseStyle background-cell-div">
            <span class="up-div">{{item.income}}</span>
            <div class="background-cell-son" :ref="forRef(index)"></div>
          </el-col>
          <!-- 8 -->
          <el-col :span="2" class="dialog-table-cell elseStyle">{{item.conversion}}</el-col>
          <!-- 9 -->
          <el-col :span="2" class="dialog-table-cell elseStyle">{{item.userCost}}</el-col>
          <!-- 10 -->
          <el-col :span="2" class="dialog-table-cell elseStyle">{{item.realTimeExport}}</el-col>
          <!-- 11 -->
          <el-col :span="2" class="dialog-table-cell elseStyle background-cell-div">
            <span class="up-div">{{item.realTimeIncome}}</span>
            <div class="background-cell-son" :ref="forSecondRef(index)"></div>
          </el-col>
        </el-row>
        <el-row class="totalRow">
          <el-col :span="3" class="totalRow-table-title">合计</el-col>
          <el-col :span="3" class="totalRow-table-title"></el-col>
          <el-col :span="2" class="totalRow-table-title"></el-col>
          <el-col :span="2" class="totalRow-table-title">{{totalExportUser}}</el-col>
          <el-col :span="2" class="totalRow-table-title"></el-col>
          <el-col :span="2" class="totalRow-table-title"></el-col>
          <el-col :span="2" class="totalRow-table-title">{{totalIncome}}</el-col>
          <el-col :span="2" class="totalRow-table-title"></el-col>
          <el-col :span="2" class="totalRow-table-title">{{totalWorth}}</el-col>
          <el-col :span="2" class="totalRow-table-title"></el-col>
          <el-col :span="2" class="totalRow-table-title">{{totalRealIncome}}</el-col>
          <!-- <el-col :span="3" class="totalRow-table-title"></el-col> -->
        </el-row>
      </div>
      <template v-if="isDisabled">
        <span slot="footer" class="dialog-footer" v-if="!isEdit">
          <el-button @click="handleCloseDialog">取 消</el-button>
          <el-button type="primary" @click="editDialog" class="edit">确 定</el-button>
        </span>
      </template>
      <!-- 如果是编辑打开的弹出框 -->
      <span slot="footer" class="dialog-footer"  v-if="!isDisabled">
        <el-button @click="handleCloseDialog">取 消</el-button>
        <el-button type="primary" @click="closeAddDialog" class="add">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import * as qpShop from '@/api/global-cache'
  import {downLoadZip} from "@/utils/zipdownload"
  import request from '@/utils/request'
  import * as qpTool from '@/utils/shuxin-tool'
  import {setDefaultTime} from '@/api/shuxin'
  // import {composeNewStr} from '@/api/tool'
  export default {
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
        //新增弹窗参数
        dialogTableVisible: false,
        dialogTitle: '新增数据',
        gridData: [],
        copyGirdData: [],//点击新增卖量确认按钮，获得参数数组
        queryParamsDialog: {
          dateRangeDialog: '',
          productId: ''
        },
        dialogWechatActive: '',//微信日活
        dialogWechatExportRate: '',//微信导出率
        backstageActive: '',//后台日活
        backgroundExportRate: '',//后台导出率
        dialogMainIncome: '',//流量主收入
        insideExportIncome: '',//自家导出收入
        outsideExportIncome: '',//外部导出收入
        advertAP: '',//广告AP
        trafficAP: '',//流量主ap
        totalAP: '',//总AP
        insideExportUser: '',//自家导出用户
        outsideExportUser: '',//外部导出用户
        totalExportUser: '', //总导出用户
        totalIncome: '', //总收入
        totalWorth: '', //总价值
        totalRealIncome: '',//总实时收入
        identifier: false, //新增弹框“确定”按钮提交标识符
        editIdentifier: false, //编辑弹框“确定”按钮提交标识符
        isDisabled: false, //区分是新增编辑  还是 详情打开的弹窗
        isEdit: true ,//细分是新增  还是  编辑
        editAdvertId: ''
      };
    },
    created() {
      this.groupInputSelect()
      this.dateRange = setDefaultTime() //设置默认时间(7天)
      this._defaultPlatform() //设置默认平台，会触发paramsChange()函数
    },
    // mounted() {

    //   console.log(310 / 100)
    //   console.log(314 / 100)
    // },
    methods: {
      // 一选择产品就发起请求
      changeStatus() {
        if (this.queryParamsDialog.dateRangeDialog && this.queryParamsDialog.productId) {
          this.resetDialogData()
          request({
            url: '/salesVolume/queryAdvertTotalData?productId='+this.queryParamsDialog.productId+'&currDate='+this.queryParamsDialog.dateRangeDialog,
            method: 'post'
          }).then(response => {
            console.log(response)
            if (response.code === 200) {
              if(response.data.length) {
                let resultArr = response.data
                this.gridData = resultArr
                this.backstageActive = resultArr[0].activeCount
                // 循环计算总导出用户与挑选出内部广告
                resultArr.forEach((item) => {
                  this.totalExportUser = Number(this.totalExportUser) + Number(item.backstageExportUser)
                  // 计算自家导出用户
                  if (item.inside === '0') {
                    this.insideExportUser = Number(this.insideExportUser) + Number(item.backstageExportUser)
                  }
                  // 把每项数据对象的'导出用户'赋值给'广告主实际实际数据'
                  item.advertExportUser = item.backstageExportUser
                  // 计算占比
                  if (this.backstageActive) {
                    item.proportion = Number(item.backstageExportUser / this.backstageActive * 100).toFixed(2)// 占比
                  } else {
                    item.proportion = 0
                  }
                })
                // 计算外部导出用户
                this.outsideExportUser = this.totalExportUser - this.insideExportUser
                // 计算后台导出率
                if (this.backstageActive) {
                  this.backgroundExportRate = Number(this.totalExportUser / this.backstageActive * 100).toFixed(2) + '%'
                } else {
                  this.backgroundExportRate = 0
                }
              }
            } else {
              this.$notify.error({
                title: '错误',
                message: ''+response.msg
              })
            }
          })
        }
      },
      /** 查询卖量数据 */
      getList() {
        this.loading = true;
        request({
          url: '/salesVolume/list',
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
        this.asyncCall()
      },

      // 重置弹窗所有的数据
      resetDialogData() {
        this.gridData = []
        this.dialogWechatActive = ''
        this.dialogWechatExportRate = ''
        this.backstageActive = ''
        this.backgroundExportRate = ''
        this.dialogMainIncome = ''
        this.insideExportIncome = ''
        this.outsideExportIncome = ''
        this.advertAP = ''
        this.trafficAP = ''
        this.totalAP = ''
        this.insideExportUser = ''
        this.outsideExportUser = ''
        this.totalExportUser = ''
        this.totalIncome = ''
        this.totalWorth = ''
        this.totalRealIncome = ''
      },
      // getList请求参数
      getQueryData(query) {
        return {
          tableName: "wechat_sales_data_info",
          paging:{
            pageSize: query.pageSize,
            pageNumber: query.pageNum
          },
          filters: {
            productId: {
              type: 'eq',
              value: query["productId"]
            },
            dataTime: {
              type: 'between',
              from: this.dateRange[0],
              to: this.dateRange[1]
            }
          },
          orders:[{column:"dataTime",type:"desc"}]
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
      // "新增"按钮
      openDialog() {
        this.dialogTableVisible = true
        this.isDisabled = false
        this.isEdit = false
        this.dialogTitle = '新增数据'
      },

      // 点击了新增弹窗的"确定"按钮
      closeAddDialog() {
        if (this.gridData.length) {
          //判断日活与流量主收入填写没
          if (!this.dialogWechatActive || !this.dialogMainIncome) {
            this.$message({
              message: '请把数据填写完整',
              type: 'warning'
            })
            this.identifier = false
            return false
          } else {
            this.identifier = true
          }
          this.copyGirdData = this.gridData
          // 遍历每条广告的input都输入值没有,没有给提示
          for(let i=0;i<this.copyGirdData.length;i++) {
            if (!this.copyGirdData[i].advertExportUser || !this.copyGirdData[i].unitPrice) {
              this.$notify({
                title: '警告',
                message: '请填写完需要输入的值',
                type: 'warning'
              })
              this.identifier = false
              break;
            } else {
              this.identifier = true
            }
          }
          // 请求接口提交
          if (this.identifier) {
            this.copyGirdData.forEach((item) => {
              // 删掉每个对象中多余的属性
              delete item.activeCount
              delete item.inside
              delete item.companyName
              delete item.gameName
              delete item.productId
              delete item.productName
              // delete item.realTimeExport
              // 把属性值带的%去掉
              if (item.proportion) {
                item.proportion = item.proportion
              } else {
                item.proportion = 0
              }

              if (item.conversion) {
                // item.conversion = item.conversion.split('%')[0]
                item.conversion = item.conversion
              } else {
                item.conversion = 0
              }
            })
            // 去掉后台导出率%
            let newBackgroundExportRate,newDialogWechatExportRate
            if (this.backgroundExportRate) {
              newBackgroundExportRate = this.backgroundExportRate.split('%')[0]
            } else {
              newBackgroundExportRate = 0
            }

            if (this.dialogWechatExportRate) {
              newDialogWechatExportRate = this.dialogWechatExportRate.split('%')[0]
            } else {
              newDialogWechatExportRate = 0
            }
            // console.log(newBackgroundExportRate)
            request({
              url: '/salesVolume/addSalesVolumeData',
              method: 'post',
              data: JSON.stringify({
                dataTime: this.queryParamsDialog.dateRangeDialog,
                productId: this.queryParamsDialog.productId,
                wechatActive: this.dialogWechatActive,
                wechatExportRate: newDialogWechatExportRate,
                backstageActive: this.backstageActive,
                backstageExportRate: newBackgroundExportRate,
                mainFlowIncome: this.dialogMainIncome,
                backstageExportIncome: this.insideExportIncome,
                externalExportIncome: this.outsideExportIncome,
                advertAp: this.advertAP,
                mainFlowAp: this.trafficAP,
                totalAp: this.totalAP,
                backstageExportUser: this.insideExportUser,
                externalExportUser: this.outsideExportUser,
                salesVolumeDeatil: this.copyGirdData
              })
            }).then(response => {
              console.log(response)
              if (response.code === 200) {
                this.$notify({
                  title: '成功',
                  message: '数据新增成功',
                  type: 'success'
                })
                this.resetDialogData()
                this.queryParamsDialog.dateRangeDialog = ''
                this.queryParamsDialog.productId = ''
                this.dialogTableVisible = false
                this.getList()
              } else {
                this.$notify.error({
                  title: '错误',
                  message: ''+response.msg
                })
              }
            })
          }
        } else {
          this.$message({
            message: '确少可用的参数，无法提交',
            type: 'warning'
          })
        }
      },

      // 点击了编辑弹窗的"确定"按钮
      editDialog() {
        if (this.gridData.length) {
          // 判断日活与流量主收入填写没
          if (!this.dialogWechatActive || !this.dialogMainIncome) {
            this.$message({
              message: '请把数据填写完整',
              type: 'warning'
            })
            this.editIdentifier = false
            return false
          } else {
            this.editIdentifier = true
          }
          // 请求接口提交
          if (this.editIdentifier) {
            // 去掉后台导出率%
            let newBackgroundExportRate,newDialogWechatExportRate
            if (this.backgroundExportRate) {
              newBackgroundExportRate = this.backgroundExportRate.split('%')[0]
            } else {
              newBackgroundExportRate = 0
            }

            if (this.dialogWechatExportRate) {
              newDialogWechatExportRate = this.dialogWechatExportRate.split('%')[0]
            } else {
              newDialogWechatExportRate = 0
            }

            console.log(newBackgroundExportRate)
            request({
              url: '/salesVolume/updateSalesVolumeData',
              method: 'post',
              data: JSON.stringify({
                id: this.editAdvertId,
                dataTime: this.queryParamsDialog.dateRangeDialog,
                productId: this.queryParamsDialog.productId,
                wechatActive: this.dialogWechatActive,
                wechatExportRate: newDialogWechatExportRate,
                backstageActive: this.backstageActive,
                backstageExportRate: newBackgroundExportRate,
                mainFlowIncome: this.dialogMainIncome,
                backstageExportIncome: this.insideExportIncome,
                externalExportIncome: this.outsideExportIncome,
                advertAp: this.advertAP,
                mainFlowAp: this.trafficAP,
                totalAp: this.totalAP,
                backstageExportUser: this.insideExportUser,
                externalExportUser: this.outsideExportUser,
                salesVolumeDeatil: this.gridData
              })
            }).then(response => {
              console.log(response)
              if (response.code === 200) {
                this.$notify({
                  title: '成功',
                  message: '数据修改成功',
                  type: 'success'
                })
                this.resetDialogData()
                this.queryParamsDialog.dateRangeDialog = ''
                this.queryParamsDialog.productId = ''
                this.dialogTableVisible = false
                this.getList()
              } else {
                this.$notify.error({
                  title: '错误',
                  message: ''+response.msg
                })
              }
              this.editIdentifier = true
            })
          }
        } else {
          this.$message({
            message: '确少可用的参数，无法提交',
            type: 'warning'
          })
        }
      },
      // 请求查询卖量数据详情
      queryInfo(id) {
        this.dialogTableVisible = true
        this.isDisabled = true
        request({
          url: '/salesVolume/info',
          method: 'post',
          data: JSON.stringify({
            tableName: "wechat_sales_data_info",
            columns: {
              id: id
            }
          })
        }).then(response => {
          console.log(response)
          if (response.code === 200) {
            let result = response.data
            this.queryParamsDialog.dateRangeDialog = result.dataTime
            this.queryParamsDialog.productId = result.productId
            this.gridData = result.subTab
            this.dialogWechatActive = result.wechatActive
            this.dialogWechatExportRate = result.wechatExportRate + '%'
            this.backstageActive = result.backstageActive
            this.backgroundExportRate = result.backstageExportRate + '%'
            this.dialogMainIncome = result.mainFlowIncome
            this.insideExportIncome = result.backstageExportIncome
            this.outsideExportIncome = result.externalExportIncome
            this.advertAP = result.advertAp
            this.trafficAP = result.mainFlowAp
            this.totalAP = result.totalAp
            this.insideExportUser = result.backstageExportUser
            this.outsideExportUser = result.externalExportUser
            // 遍历得到的数组,求和总导出/总收入/总实时收入
            result.subTab.forEach((item) => {
              this.totalExportUser = Number(this.totalExportUser) + Number(item.backstageExportUser)
              this.totalIncome = (Number(this.totalIncome) + Number(item.income)).toFixed(2)
              // this.totalWorth = Number(this.totalWorth) + Number(item.user_cost)
              this.totalRealIncome = (Number(this.totalRealIncome) + Number(item.realTimeIncome)).toFixed(2)
            })
            // 有了总收入与总导出,求总价值
            if (Number(this.totalExportUser)) {
              this.totalWorth = (this.totalIncome / this.totalExportUser).toFixed(3)
            } else {
              this.totalWorth = 0
            }
            // 给收入列与实时收入列添加背景色
            this.$nextTick(() => {
              this.addBackground()
            })
          } else {
            this.$notify.error({
              title: '错误',
              message: ''+response.msg
            })
          }
        })
      },
      // 查看详细数据
      handleClick(row) {
        this.isEdit = true
        this.dialogTitle = '详细数据'
        this.queryInfo(row.id)
      },
      // "编辑"按钮
      editData(row) {
        this.isEdit = false
        this.dialogTitle = '编辑数据'
        this.editAdvertId = row.id
        this.queryInfo(row.id)
      },

      handleCloseDialog() {
        this.resetDialogData()
        this.queryParamsDialog.dateRangeDialog = ''
        this.queryParamsDialog.productId = ''
        this.dialogTableVisible = false
        // done()
      },

      // "删除"按钮
      deleteData(row) {
        let id = row.id
        console.log(row)
        this.$confirm(`确定删除吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          request({
            url: '/salesVolume/delSalesVolumeData?salesVolumeId=' + id,
            method: 'post'
          }).then((res) => {
            console.log(res)
            if (res.code === 200) {
              this.msgSuccess("删除成功");
              this.getList();
            } else {
              this.$notify.error({
                title: '错误',
                message: '' + res.msg
              })
            }
          })
        })
      },

      // 计算总收入/总价值/自家导出收入/外部导出收入
      totalRevenue() {
        this.totalIncome = 0
        this.totalWorth = 0
        this.totalRealIncome = 0
        this.insideExportIncome = 0
        this.outsideExportIncome = 0
        // this.insideExportUser = 0
        // this.outsideExportUser = 0
        this.gridData.forEach((son, i) => {
          if (Number(son.income)) {
            // 计算总收入
            this.totalIncome = (Number(this.totalIncome) + Number(son.income)).toFixed(2)

            // 计算总价值
            if (Number(this.totalExportUser)) {
              this.totalWorth = (Number(this.totalIncome) / Number(this.totalExportUser)).toFixed(3)
            } else {
              this.totalWorth = 0
            }
            // 计算自家导出收入与外部导出收入
            // 新增情况
            if (son.inside) {
              if (son.inside === '0') {
                this.insideExportIncome = (Number(this.insideExportIncome) + Number(son.income)).toFixed(2)
              } else {
                this.outsideExportIncome = (Number(this.outsideExportIncome) + Number(son.income)).toFixed(2)
              }
            } else {
              //编辑或者查看详细数据情况
              if (son['advert_id.ref'].is_inside === '0') {
                this.insideExportIncome = (Number(this.insideExportIncome) + Number(son.income)).toFixed(2)
              } else {
                this.outsideExportIncome = (Number(this.outsideExportIncome) + Number(son.income)).toFixed(2)
              }
            }
          } else {
            this.totalIncome = Number(this.totalIncome) + 0
          }
          // 计算总实时收入
          if (Number(son.realTimeIncome)) {
            this.totalRealIncome = (Number(this.totalRealIncome) + Number(son.realTimeIncome)).toFixed(2)
          } else {
            this.totalRealIncome = Number(this.totalRealIncome) + 0
          }
          // 计算自家导出用户与外部导出用户
          // if (son.inside) {
          //   if (son.inside === '0') {
          //     this.insideExportUser = Number(this.insideExportUser) + Number(son.advertExportUser)
          //   } else {
          //     this.outsideExportUser = Number(this.outsideExportUser) + Number(son.advertExportUser)
          //   }
          // } else {
          //   if (son['advert_id.ref'].is_inside === '0') {
          //     this.insideExportUser = Number(this.insideExportUser) + Number(son.advertExportUser)
          //   } else {
          //     this.outsideExportUser = Number(this.outsideExportUser) + Number(son.advertExportUser)
          //   }
          // }
        })
        // 总收入在变的时候,广告AP也需要改变
        if (Number(this.dialogWechatActive)) {
          this.advertAP = Number(this.totalIncome / this.dialogWechatActive).toFixed(3)
        } else {
          this.advertAP = 0
        }
        // 计算总AP
        this.totalAP = (Number(this.advertAP) + Number(this.trafficAP)).toFixed(3)
      },
      // 给收入列与实时收入列添加背景色
      addBackground() {
        this.gridData.forEach((ele, j) => {
          //收入列
          if (Number(ele.income) && Number(this.totalIncome)) {
            let zhanbi = ele.income / this.totalIncome * 100 + '%'
            this.$refs[`backdiv${j}`][0].style.width = zhanbi
          } else {
            this.$refs[`backdiv${j}`][0].style.width = 0
          }
          //实时收入列
          if (Number(ele.realTimeIncome) && Number(this.totalRealIncome)) {
            let zhanbi = ele.realTimeIncome / this.totalRealIncome * 100 + '%'
            this.$refs[`backdiv2${j}`][0].style.width = zhanbi
          } else {
            this.$refs[`backdiv2${j}`][0].style.width = 0
          }
        })
      },
      // (微信日活input事件)
      countWechatActive() {
        if (Number(this.dialogWechatActive)) {
          // 计算微信导出率
          this.dialogWechatExportRate = Number(this.totalExportUser / this.dialogWechatActive * 100).toFixed(2) + '%'
          //计算广告ap
          this.advertAP = Number(this.totalIncome / this.dialogWechatActive).toFixed(3)

          //计算流量主ap
          if (this.dialogMainIncome) {
            this.trafficAP = Number(this.dialogMainIncome / this.dialogWechatActive).toFixed(3)
          } else {
            this.trafficAP = 0
          }
          // 计算总AP
          this.totalAP = (Number(this.advertAP) + Number(this.trafficAP)).toFixed(3)
        } else {
          this.dialogWechatExportRate = 0
          this.advertAP = 0
          this.trafficAP = 0
          this.totalAP = 0
        }
      },
      // (流量主收入input事件)
      countMainIncome() {
        if (this.dialogMainIncome && this.dialogWechatActive) {
          // 计算流量主ap
          this.trafficAP = Number(this.dialogMainIncome / this.dialogWechatActive).toFixed(3)
          // 计算总AP
          this.totalAP = (Number(this.advertAP) + Number(this.trafficAP)).toFixed(3)
        } else {
          this.trafficAP = 0
          // 计算总AP
          this.totalAP = Number(this.advertAP)
        }
      },
      // 广告主实际数据input事件
      getActualNums(item, index) {
        if(item.advertExportUser) {
          if(item.unitPrice) {
            //价值
            if (item.backstageExportUser) {
              item.userCost = Number(item.advertExportUser * item.unitPrice / item.backstageExportUser).toFixed(3)
            } else {
              item.userCost = 0
            }
            item.realTimeIncome = (Number(item.userCost) * Number(item.realTimeExport)).toFixed(2) //实时收入
            item.income = Number(item.advertExportUser * item.unitPrice).toFixed(2) //收入
            // 计算总收入与总价值
            this.totalRevenue()
            // 总收入出来之后,计算当个的收入占总收入的百分比及其他项收入百分比
            this.addBackground()
          }
           // 转化
           if (item.backstageExportUser) {
             item.conversion = Number(item.advertExportUser / item.backstageExportUser * 100).toFixed(2)
           } else {
             item.conversion = 0
           }
        } else {
          item.advertExportUser = ''
          item.income = ''
          item.conversion = ''
          item.userCost = ''
          item.realTimeIncome = ''
          // 计算总收入与总价值
          this.totalRevenue()
          // 总收入出来之后,计算当个的收入占总收入的百分比及其他项收入百分比
          this.addBackground()
          this.$refs[`backdiv${index}`][0].style.width = 0
        }
      },
      // 单价input事件
      getUnitPrice(item, index) {
        if(item.unitPrice) {
          if (item.advertExportUser) {
            //价值
            if (item.backstageExportUser) {
              item.userCost = Number(item.advertExportUser * item.unitPrice / item.backstageExportUser).toFixed(3)
            } else {
              item.userCost = 0
            }
            item.realTimeIncome = (Number(item.userCost) * Number(item.realTimeExport)).toFixed(2) //实时收入
            item.income = Number(item.advertExportUser * item.unitPrice).toFixed(2) //收入
            // 计算总收入与总价值
            this.totalRevenue()
            // 总收入出来之后,计算当个的收入占总收入的百分比及其他项收入百分比
            this.addBackground()
          }
        } else {
          item.unitPrice = ''
          item.income = ''
          item.userCost = ''
          item.realTimeIncome = ''
          // 计算总收入与总价值
          this.totalRevenue()
          // 总收入出来之后,计算当个的收入占总收入的百分比及其他项收入百分比
          this.addBackground()
          this.$refs[`backdiv${index}`][0].style.width = 0
        }
      },
      // 循环动态绑定ref属性
      forRef(index) {
        return 'backdiv' + index
      },
      forSecondRef(index) {
        return 'backdiv2' + index
      }
    }
  }
</script>
<style scoped>
  .qpgame {
    margin-bottom: 35px;
  }
  .qpgame .addNewBtn {
    margin-bottom: 20px;
  }
  .background-cell-div {
    position: relative;
  }
  .up-div {
    position: relative;
    z-index: 2;
  }
  .background-cell-son {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    background: linear-gradient(to right, #FF555A, #FFB7B9);
  }
  .second-row {
    margin-bottom: 50px;
  }
  /deep/ .dataStatisPopup {
    width: 78% !important;
  }
  .statisticalItem {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  .statisticalItem .title {
    width: 100px;
  }
  .statisticalItem .number {
    width: 182px;
    height: 28px;
    line-height: 28px;
    text-align: center;
    background-color: #EBEBEB;
    border-radius: 2px;
  }
  .dialog-input {
    margin: 10px 0 !important;
  }
  .selfTable {
    border: 1px solid #DFE6EC;
  }
  .dialog-table-title {
    padding: 13px 0;
    text-align: center;
    border: 1px solid #DFE6EC;
    background-color: #F8F8F9;
  }
  .elseStyle {
    height: 44px;
    line-height: 44px;
    text-align: center;
    border: 1px solid #DFE6EC;
  }
  .totalRow-table-title {
    height: 44px;
    line-height: 42px;
    text-align: center;
    border: 1px solid #DFE6EC;
    background-color: #F8F8F9;
  }
  .pagination {
    margin-top: 30px;
    text-align: right;
  }
</style>
