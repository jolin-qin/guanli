<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      </el-form-item>
      <el-form-item label="游戏产品:" prop="gameName">
         <el-select @change="paramsChange" v-model="queryParams.gameName" placeholder="请选择">
          <el-option v-for="item in productNameList" :key="item.id" :label="item.value"
            :value="item.id"></el-option>
         </el-select>
      </el-form-item>
      <el-form-item label="所属平台:" prop="platformType">
        <el-select @change="paramsChange" multiple v-model="queryParams.platformType" placeholder="所属平台">
          <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
            :value="item.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="版本:" prop="version">
        <el-select   multiple v-model="queryParams.version" placeholder="版本">
          <el-option v-for="item in versionList" :key="item.id" :label="item.version"
            :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 汇总表格 -->
    <el-table v-loading="loading" :data="versionDataList" >
      <el-table-column label="版本" align="center" prop="version"  />
      <el-table-column label="更新时间" align="center" prop="onlineTime"  >
        <template slot-scope="scope">
            <span>{{ parseTime(scope.row.onlineTime,'{y}-{m}-{d}') }}</span>
          </template>
      </el-table-column>
      <el-table-column label="活跃时长" align="center" prop="activeTime"  />
      <el-table-column label="次日留存" align="center" prop="activeRetention"  />
      <el-table-column label="买量成本" align="center" prop="purchaseCost"  />
      <el-table-column label="活跃arpu" align="center" prop="activeArpu"  />
      <el-table-column label="时长贡献" align="center" prop="contributionTime"  />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text"   @click="show(scope.row)" >更新内容</el-button>
        </template>
      </el-table-column>
    </el-table>

      <el-dialog
        :title="showTitle"
        :visible.sync="dialogVisible"
        width="40%">
        <span>{{versionContent}}</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
        </span>
      </el-dialog>


    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

 <!-- 对比图表 -->
    <div class="qpgame" ref="qpgame" >
      <el-row :gutter="10" type="flex" justify="space-around" class="mb8 qphead">
        <el-col  :span="24">
          <h2>对比图表</h2>
        </el-col>
      </el-row>
      <el-tabs type="border-card" @tab-click="tabHandleClick" >
        <el-tab-pane v-for="(item, index) in tabs" :key="item.key" :label="item.title">
        </el-tab-pane>
        <line-chart v-if="tabs.length>0"  :ys="tabs[activeIndex].ysData" :yNames="tabs[activeIndex].legend" :x="tabs[activeIndex].xAxis"/>
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

export default {
  name: "Version",
  components: {
    LineChart
  },
  data() {
    return {
      showTitle:'',
      versionContent:'',
      dialogVisible: false,
      activeIndex: 0,
      versionDataList:[],
      productNameList:[],
      productList:[],// 游戏产品数组
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
      // 产品版本管理表格数据
      versionList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      dictCache: qpShop.globalCache.shopCache.dictCache,//用于获取游戏属于平台数据
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

      // 对比图表切换tabs
      tabs: [],

      // 表单校验
      rules: {
        platformType: [{
          required: true,
          message: "所属平台不能为空",
          trigger: "change"
        }],
        productId: [{
          required: true,
          message: "游戏不能为空",
          trigger: "change"
        }],
        version: [{
          required: true,
          message: "版本不能为空",
          trigger: "change"
        }],
        versionContent: [{
          required: true,
          message: "更新内容不能为空",
          trigger: "change"
        }],
        completeTime: [{
          required: true,
          message: "完成时间不能为空",
          trigger: "change"
        }],
      }
    };
  },
  created() {
    this._defaultProcuctNameList() //设置默认平台
    this.loading = false;
    //this.getList()
  },

  methods: {
    /** 查询产品版本管理列表 */
    getList(params) {
      this.loading = true;
      request({
        url: '/business/version/versionDataList',
        method: 'post',
        data:params
      }).then(res => {
          console.log("res.data.versionDataList",res.data.versionDataList);
         this.versionDataList=res.data.versionDataList;
         console.log("res.data.versionEChartsList",res.data.versionEChartsList);
         this.tabs=res.data.versionEChartsList;
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
      //检测是否选择版本
      console.log("this.versionList.length",this.versionList.length);

      if(qpTool.isEmpty(this.queryParams.gameName)||qpTool.isEmpty(this.queryParams.platformType)){
        this.msgError("请选择游戏和平台");
        return;
      }
      if(this.versionList.length==0){
         this.msgError("没有版本数据");
         return;
      }
      let params={
        versionIdList:this.queryParams.version
      }
      if(this.queryParams.version.length==0){
        let version=[];
        for(var i=0;i<this.versionList.length;i++){
          version.push(this.versionList[i].id)
        }
        params={
          versionIdList:version
        }
      }
      this.getList(params);
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.versionList=[];
      this.versionDataList=[];
      this.tabs=[];
      //this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!=1
      this.multiple = !selection.length
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


    //设置默认平台
    _defaultProcuctNameList() {
       request({
         url: '/business/product/productNameList',
         method: 'post',
         data: {},
       }).then(res => {
          this.productNameList=res.data.productNameList
         })
    },


    //平台change事件
    paramsChange() {
      return new Promise((res, rej) => {
        let platformType = this.queryParams.platformType;
        let gameName = this.queryParams.gameName;
        console.log(this.queryParams.platformType)
        if(!qpTool.isEmpty(platformType)&& !qpTool.isEmpty(gameName)){
          let params = {
            platformType: platformType,
            gameName: gameName,
          };
          this.productInputSelect(null, params, res);
        }
      })
    },


    // tab项被选中时触发
    tabHandleClick(tab, event) {
      // 此事件默认会切换tab,因此改变的参数需要在display变为block后进行,所以用了$nextTick方法
      this.activeIndex = Number(tab.index)
      console.log("this.activeIndex",this.activeIndex);
       console.log(this.tabs[this.activeIndex].ysData)
    },



    // 获取版本options
    productInputSelect(query, params, res) {
      request({
        url: '/business/product/productIdList',
        method: 'post',
        data: params,
      }).then(res => {
        console.log(res)
        let productIdStr='';
        let productIdList=res.data.productIdList;
        if(productIdList.length > 0) {
          for(let i = 0;i < productIdList.length;i++) {
            productIdStr += productIdList[i] +","
          }
          productIdStr = productIdStr.substring(0,productIdStr.length - 1);
        }
        params={
          productId:productIdStr
        }
        var that=this;
        this.inputSelectList("t_filter", "version_id", query, function(data) {
          if(data.length > 0) {
             that.versionList=data;
             if(that.versionList!=null&&that.versionList.length>0){
               for(var i=0;i<that.versionList.length;i++){
                 that.versionList[i].version= that.platformName(that.versionList[i].platform_type)+ "_"+that.versionList[i].version;
               }
             }
          }else{
             that.versionList=[];
          }
          that.queryParams.version="";
          console.log("that.versionList",that.versionList);
        }, JSON.stringify(params))
      })
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

    show(row){
        this.showTitle=row.version+"更新内容";
        this.versionContent=row.versionContent;
        this.dialogVisible=true;
    }

  }
};
</script>
