<template>
  <div class="app-container">
    <!-- 顶部select项 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属平台:">
        <el-select v-model="queryParams.platformType" placeholder="所属平台">
          <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
            :value="item.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="游戏产品:">
         <el-select v-model="queryParams.productId" multiple placeholder="请选择">
          <el-option v-for="item in advertList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
            :value="item.targetIdColumnInputSelect"></el-option>
         </el-select>
      </el-form-item>
      <el-form-item label="事件名称:">
        <el-input v-model="queryParams.eventName" placeholder="请输入事件名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 删除按钮 -->
    <div class="deleteBtn">
      <el-row>
        <el-col :span="1.5">
          <el-button type="danger" :disabled="multiple" icon="el-icon-delete" size="small" @click="handleDelete">删除</el-button>
        </el-col>
      </el-row>
    </div>
    <!-- tabs -->
    <div class="containerDiv">
      <el-tabs type="border-card">
        <el-tab-pane label="事件列表">
          <el-table :data="eventTableData" @selection-change="handleSelectionChange">
            <el-table-column type="selection"></el-table-column>

            <el-table-column label="事件名称">
              <template slot-scope="scope">
                <div>{{ scope.row.name }}</div>
              </template>
            </el-table-column>

            <el-table-column label="事件ID">
              <template slot-scope="scope">
                <div>{{ scope.row.id }}</div>
              </template>
            </el-table-column>

            <el-table-column label="操作" align="right">
              <template slot-scope="scope">
                <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
                <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="删除列表">
          <el-table>

          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 分页 -->
    <div>
      <el-pagination
       @size-change="handleSizeChange"
       @current-change="handleCurrentChange"
       :current-page="currentPage"
       :page-sizes='[20,30,50,80]'
       :page-size="20"
       layout="total, sizes, prev, pager, next, jumper"
       :total="100" background></el-pagination>
    </div>
    <!-- 事件修改弹出框 -->
    <el-dialog :title="popBoxTitle" :visible.sync="isOpen" width="680px">
      <el-form :model="form" ref="form" label-width="80px" :rules="rulesForm">
        <el-form-item label="事件名称" prop="eventName">
          <el-input v-model="form.eventName"></el-input>
        </el-form-item>
        <el-form-item label="事件ID" prop="eventId">
          <el-input v-model="form.eventId"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import * as qpShop from '@/api/global-cache'
  import { downLoadZip } from '@/utils/zipdownload'
  //import LineChart from '../../dashboard/LineChart.vue' //引进了Echarts封装好的组件
  import request from '@/utils/request'
  export default {
    name: "eventsManagement",
    // components: {
    //   LineChart
    // },
    data() {
      return {
        // 图表对比tab项index
        activeIndex: 0,
        // 游戏产品数组
        advertList:[],
        // 游戏分组数组
        groupList:[],
        // x时间轴
        xData: [],
        // y value值轴
        yData: [],
        // 遮罩层
        loading: true,
        // 模拟事件列表数据
        eventTableData: [{
          name: 'event1',
          id: '1'
        }, {
          name: 'event2',
          id: '2'
        }, {
          name: 'event3',
          id: '3'
        }, {
          name: 'event4',
          id: '4'
        }, {
          name: 'event5',
          id: '5'
        }, {
          name: 'event6',
          id: '6'
        }, {
          name: 'event7',
          id: '7'
        }],
        //乘放游戏平台/分组/产品筛选条件的数组
        queryParams: {
            platformType: undefined,
            gameGroup: [],
            productId: [],
            eventName: ''
        },
        //用于获取游戏属于平台数据
        dictCache: qpShop.globalCache.shopCache.dictCache,
        //修改埋点事件弹出框
        // 弹出层标题
        popBoxTitle: "事件修改",
        // 是否显示弹出框
        isOpen: false,
        // 弹出框表单参数
        form: {
          eventName: '',
          eventId: ''
        },
        // 控制disabled
        multiple: true,
        // 指定当前页
        currentPage: 1,
        // 乘放tab选中项ID的数组
        ids: [],
        rulesForm: {
          eventName: [
            { required: true, message: '请输入事件名称', trigger: 'blur' }
          ],
          eventId: [
            { required: true, message: '请输入事件的Id', trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      this.getList();
      this.advertInputSelect();
      this.groupInputSelect();
      // console.log(this.dictCache);
    },

    methods: {
      /** 查询角色列表 */
      getList() {
        this.loading = true;
        request({
          url: '/reportGameQuery/querySyntheticalData',
          method: 'post',
          data: JSON.stringify(this.getQueryData())
        }).then(res => {
            console.log(res.data)
            //this.exportNoTradeList = res.data.summaryList || []
            // console.log(this.exportNoTradeList)
            // 不管是刚进页面还是搜索或者重置,都需要清空xData,yData
            // this.tabs.forEach((tab, index) => {
            //   tab.xData = []
            //   tab.yData = []
            //   this.exportNoTradeList.forEach(item => {
            //     tab.xData.push(item.levelNumber)
            //     tab.yData.push(item[tab.key])
            //   })
            // })
            // console.log(this.tabs[this.activeIndex].xData)
            this.loading = false
          })
      },
      // tab项被选中时触发
      tabHandleClick(tab, event) {
        // 此事件默认会切换tab,因此改变的参数需要在display变为block后进行,所以用了$nextTick方法
        this.activeIndex = Number(tab.index)
        console.log(this.tabs[this.activeIndex].yData)
      },
      // 请求参数对象
      getQueryData(){
        return {
          "productIds": this.queryParams["productId"],
          "groupByIds": this.queryParams["gameGroup"],
          "platformType": this.queryParams["platformType"],
        }
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.getList();
        this.advertInputSelect();
        this.groupInputSelect();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.queryParams = {
          platformType: '',
          gameGroup: [],
          productId: []
        };
        this.resetForm("queryForm");
        this.handleQuery();
      },
      reset() {
        this.form = {
          eventName: '',
          eventId: ''
        }
        this.resetForm("form")
      },
      // 点击事件列表"修改"按钮
      handleUpdate(row) {
        // 先清空所有el-form-item子项内容
        this.reset()
        console.log(this.form)
        // 把点击项的事件名称与事件Id赋值给
        this.form.eventName = row.name
        this.form.eventId = row.id
        this.isOpen = true
        console.log(this.form)
      },
      // tab中的子项被选中
      handleSelectionChange(val) {
        // console.log(val)
        this.ids = val.map(item => item.id)
        this.multiple = !val.length
      },
      // 弹出框"确认"
      submitForm() {
        this.$refs['form'].validate(vaild => {
          if(vaild) {
            this.msgSuccess("修改成功")
            this.isOpen = false
          } else {
            return false;
          }
        })
      },
      // 弹出框"取消"
      cancel() {
        this.isOpen = false
        this.reset()
        // console.log(this.form)
      },
      //点击"删除"按钮
      handleDelete(row) {
        let ids = []
        row.id ? ids.push(row.id) : ids = this.ids
        this.$confirm(`确定删除${ids}事件吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        }).catch(() => {})
      },
      // 选择每页显示条目数
      handleSizeChange(val) {
        console.log(`每页 ${val} 条`);
      },
      // 切换当前页
      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
      },

      advertInputSelect(query, params) {
        var that = this;
        if(undefined == params) {
          params = {
            platformType: '',
            groupByIds: ''
          }
        }
        this.inputSelectList("t_filter", "product_id", query, function(data) {
          that.advertList = data;
        }, JSON.stringify(params));
      },
      // 下拉数据
      groupInputSelect(query) {
        var that = this;
        this.inputSelectList("t_filter", "group_id", query, function(data) {
          that.groupList = data;
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
  .deleteBtn {
    margin: 20px 0 10px 0;
  }
</style>
