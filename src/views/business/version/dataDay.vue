<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
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

    <el-row :gutter="10" class="mb8 qphead">
      <el-col :span="1.5">
        <h2>汇总统计</h2>
      </el-col>
       <el-col :span="1.5" style="float: right;">
         <el-button
           type="warning"
           icon="el-icon-download"
           size="mini"
           @click="exportVersionDataList"
           v-hasPermi="['system:config:export']"
         >导出详细数据</el-button>
       </el-col>
     </el-row>


    <el-table v-loading="loading" :data="dataDayList" >
      <el-table-column label="平台" align="center" prop="platformName"  />
      <el-table-column label="投放成本" align="center" prop="inputCost"  />
      <el-table-column label="活跃" align="center" prop="activeCount"  />
      <el-table-column label="收入" align="center" prop="advertProfit"  />
      <el-table-column label="利润" align="center" prop="profit"  />
    </el-table>


    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

 <!-- 对比图表 -->
      <div class="qpgame" ref="qpgame"  style="margin-top: 40px;">
        <el-row :gutter="10" type="flex" justify="space-around" class="mb8 qphead">
          <el-col  :span="24">
            <h2>详细数据</h2>
          </el-col>
          <el-col :span="1.5" style="float: right;">
            <el-button
              type="warning"
              icon="el-icon-download"
              size="mini"
              @click="exportDataDayPlatformList"
              v-hasPermi="['system:config:export']"
            >导出详细数据</el-button>
          </el-col>
        </el-row>
        <el-tabs type="border-card" @tab-click="tabHandleClick" >
          <el-tab-pane v-for="(item, index) in titleName" :key="item.key" :label="titleName[index]">
          </el-tab-pane>
           <el-table v-if="tabs.length>0"  v-loading="loading" :data="tabs[activeIndex]" >
             <el-table-column label="时间" align="center" prop="dataTime"  />
            <el-table-column label="投放成本" align="center" prop="inputCost"  />
            <el-table-column label="活跃" align="center" prop="activeCount"  />
            <el-table-column label="收入" align="center" prop="advertProfit"  />
            <el-table-column label="利润" align="center" prop="profit"  />
           </el-table>
        </el-tabs>
      </div>

  </div>
</template>
<script>
import * as qpShop from '@/api/global-cache'
import { listVersion, getVersion, delVersion, addVersion, updateVersion, exportVersion } from "@/api/business/matrix_product_version";
import request from '@/utils/request'
import LineChart from '../../dashboard/LineChart.vue' //引进了Echarts封装好的组件
import * as qpTool from '@/utils/shuxin-tool'
import { setDefaultTime } from '@/api/shuxin'
import { downLoadZip } from "@/utils/zipdownload";

export default {
  name: "Version",
  components: {
    LineChart
  },
  data() {
    return {
      dateRange:[],
      dialogVisible: false,
      activeIndex: 0,
      dataDayList:[],
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
      // 查询参数
      queryParams: {
        pageNum: 1,
        onlineStatus:0,
        pageSize: 10,
        productId: undefined,
        platformType: undefined,
      },
      // 表单参数
      form: {},

      titleName:[
        "微信","QQ","头条","OPPO"
      ],
      // 对比图表切换tabs
      tabs: [[],[],[],[]],

      // 表单校验
      rules: {
        completeTime: [{
          required: true,
          message: "完成时间不能为空",
          trigger: "change"
        }],
      }
    };
  },
  created() {
    this.dateRange = setDefaultTime() //设置默认时间(7天)
    this.getList()
  },

  methods: {
    /** 查询产品版本管理列表 */
    getList() {
      this.loading = true;
      var params={
        "startTime": this.dateRange[0],
        "endTime": this.dateRange[1]
      }
      request({
        url: '/business/version/dataDayList',
        method: 'post',
        data:params
      }).then(res => {
         this.dataDayList=res.data.dataDayAllList;
         if(this.dataDayList.length>0){
           for(var i=0;i<this.dataDayList.length;i++){
             this.dataDayList[i].platformName=this.platformName(this.dataDayList[i].platformId);
           }
         }
         console.log("res.data.dataDayPlatformList",res.data.dataDayPlatformList);
         this.tabs=res.data.dataDayPlatformList;
         this.loading = false;
      })
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        productId: undefined,
        version: undefined,
        versionContent: undefined,
        completeTime: undefined,
        isOnline: undefined,
        platformType: undefined,
        onlineTime: undefined,
        createBy: undefined,
        createTime: undefined,
        updateBy: undefined,
        updateTime: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
       this.dateRange = setDefaultTime() //设置默认时间(7天)
      //this.handleQuery();
    },


    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有产品版本管理数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportVersion(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    },




    // tab项被选中时触发
    tabHandleClick(tab, event) {
      // 此事件默认会切换tab,因此改变的参数需要在display变为block后进行,所以用了$nextTick方法
      this.activeIndex = Number(tab.index)
    },



    platformName(platformType){
      let platformName="";
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

    /**  导出详细数据  */
    exportVersionDataList(){
        var params={
          "startTime": this.dateRange[0],
          "endTime": this.dateRange[1]
        }
        var filterJsonStr = JSON.stringify(params);
        downLoadZip(encodeURI("/business/version/exportVersionDataList?filterJson=" + filterJsonStr), "exportShare",true);
    },
    /**  导出详细数据  */
    exportDataDayPlatformList(){
        var params={
          "startTime": this.dateRange[0],
          "endTime": this.dateRange[1]
        }
        var filterJsonStr = JSON.stringify(params);
        downLoadZip(encodeURI("/business/version/exportDataDayPlatformList?filterJson=" + filterJsonStr), "exportShare",true);
    }

  }
};
</script>
