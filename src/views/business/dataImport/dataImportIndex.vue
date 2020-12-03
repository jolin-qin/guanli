<template>
<div class="app-container">
    <!-- 顶部select项 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="游戏产品:">
         <el-select v-model="queryParams.productId" placeholder="请选择">
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
      </el-form-item>
    </el-form>

    <!-- 微信详细数据 -->
    <el-row :gutter="10" class="mb8 qphead">
      <el-col :span="1.5">
        <h3>微信详细数据</h3>
      </el-col>
      <el-col :span="1.5" style="float: right;">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click.native="exportData(0)"
          v-hasPermi="['system:config:export']"
        >导出详细数据</el-button>
      </el-col>
      <el-col :span="1.5" style="float: right;">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          @click.native="openWindow(0)"
          v-hasPermi="['system:config:export']"
        >录入数据</el-button>
      </el-col>
    </el-row>
    <!-- 汇总表格 -->
    <el-table v-loading="loading" :data="wechatDataList" >
      <el-table-column label="版本" prop="versionName"/>
      <el-table-column label="时间" prop="dataTime"/>
      <el-table-column label="新增" prop="addUserCount"/>
      <el-table-column label="活跃" prop="activeCount"/>
      <el-table-column label="活跃次留(%)" prop="activeRetention"/>
      <el-table-column label="活跃arpu" prop="activeArpu"/>
      <el-table-column label="在线时长(s)" prop="onlineTime"/>
      <el-table-column label="投放成本" prop="inputCost"/>
      <el-table-column label="利润" prop="profit"/>
      <el-table-column label="广告收入" prop="advertProfit"/>
      <el-table-column label="买量成本" prop="purchaseCost"/>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <br>
    <!-- QQ详细数据 -->
    <el-row :gutter="10" class="mb8 qphead">
      <el-col :span="1.5">
        <h3>QQ详细数据</h3>
      </el-col>
      <el-col :span="1.5" style="float: right;">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click.native="exportData(1)"
        >导出详细数据</el-button>
      </el-col>
      <el-col :span="1.5" style="float: right;">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          @click.native="openWindow(1)"
        >录入数据</el-button>
      </el-col>
    </el-row>
    <!-- 汇总表格 -->
    <el-table v-loading="loading" :data="qqDataList" >
      <el-table-column label="版本" prop="versionName"/>
      <el-table-column label="时间" prop="dataTime"/>
      <el-table-column label="新增" prop="addUserCount"/>
      <el-table-column label="活跃" prop="activeCount"/>
      <el-table-column label="活跃次留(%)" prop="activeRetention"/>
      <el-table-column label="活跃arpu" prop="activeArpu"/>
      <el-table-column label="在线时长(s)" prop="onlineTime"/>
      <el-table-column label="投放成本" prop="inputCost"/>
      <el-table-column label="利润" prop="profit"/>
      <el-table-column label="广告收入" prop="advertProfit"/>
      <el-table-column label="买量成本" prop="purchaseCost"/>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <br>
    <!-- 抖音详细数据 -->
    <el-row :gutter="10" class="mb8 qphead">
      <el-col :span="1.5">
        <h3>抖音详细数据</h3>
      </el-col>
      <el-col :span="1.5" style="float: right;">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click.native="exportData(2)"
          v-hasPermi="['system:config:export']"
        >导出详细数据</el-button>
      </el-col>
      <el-col :span="1.5" style="float: right;">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          @click.native="openWindow(2)"
          v-hasPermi="['system:config:export']"
        >录入数据</el-button>
      </el-col>
    </el-row>
    <!-- 汇总表格 -->
    <el-table v-loading="loading" :data="ttDataList" >
      <el-table-column label="版本" prop="versionName"/>
      <el-table-column label="时间" prop="dataTime"/>
      <el-table-column label="新增" prop="addUserCount"/>
      <el-table-column label="活跃" prop="activeCount"/>
      <el-table-column label="活跃次留(%)" prop="activeRetention"/>
      <el-table-column label="活跃arpu" prop="activeArpu"/>
      <el-table-column label="在线时长(s)" prop="onlineTime"/>
      <el-table-column label="投放成本" prop="inputCost"/>
      <el-table-column label="利润" prop="profit"/>
      <el-table-column label="广告收入" prop="advertProfit"/>
      <el-table-column label="买量成本" prop="purchaseCost"/>
      <el-table-column label="录屏率" prop="screencapRate"/>
      <el-table-column label="平均下载耗时" prop="avgDowmTime"/>
      <el-table-column label="平均加载耗时" prop="avgLoadingTime"/>
      <el-table-column label="取消率" prop="cancelRate"/>
      <el-table-column label="操作" width="120px">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <br>
    <!-- OPPO详细数据 -->
    <el-row :gutter="10" class="mb8 qphead">
      <el-col :span="1.5">
        <h3>OPPO详细数据</h3>
      </el-col>
      <el-col :span="1.5" style="float: right;">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click.native="exportData(3)"
        >导出详细数据</el-button>
      </el-col>
      <el-col :span="1.5" style="float: right;">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          @click.native="openWindow(3)"
        >录入数据</el-button>
      </el-col>
    </el-row>
    <!-- 汇总表格 -->
    <el-table v-loading="loading" :data="oppoDataList" >
      <el-table-column label="版本" prop="versionName"/>
      <el-table-column label="时间" prop="dataTime"/>
      <el-table-column label="新增" prop="addUserCount"/>
      <el-table-column label="活跃" prop="activeCount"/>
      <el-table-column label="活跃次留(%)" prop="activeRetention"/>
      <el-table-column label="活跃arpu" prop="activeArpu"/>
      <el-table-column label="在线时长(s)" prop="onlineTime"/>
      <el-table-column label="投放成本" prop="inputCost"/>
      <el-table-column label="利润" prop="profit"/>
      <el-table-column label="广告收入" prop="advertProfit"/>
      <el-table-column label="买量成本" prop="purchaseCost"/>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>





    <!-- 添加或修改产品对话框 -->
    <el-dialog :title="attributeTitle" :visible.sync="attributeOpen" width="800px">
      <el-form ref="attributeForm" :inline="true"  :model="attributeForm" :rules="attributeRules" label-width="120px">
          <el-form-item label="产品名称" prop="productName">
            <el-input v-model="attributeForm.productName"  disabled="disabled" />
          </el-form-item>
          <el-form-item label="版本号" prop="versionId">
            <el-select v-model="attributeForm.versionId" placeholder="请选择">
             <el-option v-for="item in versionList" :key="item.id" :label="item.version"
               :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="数据时间:" prop="dataTime">
            <el-date-picker
              v-model="attributeForm.dataTime"
              size="small"
              style="width: 185px"
              value-format="yyyy-MM-dd"
              type="date"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="新增用户" prop="addUserCount">
            <el-input v-model="attributeForm.addUserCount" style="width: 185px;"  min="0" max="9999999" step="1" required type="number" />
          </el-form-item>
          <el-form-item label="活跃人数" prop="activeCount">
            <el-input v-model="attributeForm.activeCount" style="width: 185px;"  min="0" max="9999999" step="1" required type="number" />
          </el-form-item>
          <el-form-item label="活跃次留" prop="activeRetention">
            <el-input v-model="attributeForm.activeRetention" style="width: 185px;"  min="0" max="100" step="0.01" required type="number" />
          </el-form-item>
          <el-form-item label="活跃arpu" prop="activeArpu">
            <el-input v-model="attributeForm.activeArpu" style="width: 185px;"  min="0" max="100" step="0.01" required type="number" />
          </el-form-item>
          <el-form-item label="在线时长" prop="onlineTime">
            <el-input v-model="attributeForm.onlineTime" style="width: 185px;"  min="0" max="100000" step="1" required type="number" />
          </el-form-item>
          <el-form-item label="投入成本" prop="inputCost">
            <el-input v-model="attributeForm.inputCost" style="width: 185px;"  min="0" max="10000000" step="0.01" required type="number" />
          </el-form-item>
          <el-form-item label="利润" prop="profit">
            <el-input v-model="attributeForm.profit" style="width: 185px;"  min="0" max="10000000" step="0.01" required type="number" />
          </el-form-item>
          <el-form-item label="广告利润" prop="advertProfit">
            <el-input v-model="attributeForm.advertProfit" style="width: 185px;"  min="0" max="10000000" step="0.01" required type="number" />
          </el-form-item>
          <el-form-item label="买量成本" prop="purchaseCost">
            <el-input v-model="attributeForm.purchaseCost" style="width: 185px;"  min="0" max="10000000" step="0.01" required type="number" />
          </el-form-item>
          <div v-if="show">
            <el-form-item label="录屏率" prop="screencapRate">
              <el-input v-model="attributeForm.screencapRate" style="width: 185px;"  min="0" max="100" step="0.01" required type="number" />
            </el-form-item>
            <el-form-item label="平均下载耗时" prop="avgDowmTime">
              <el-input v-model="attributeForm.avgDowmTime" style="width: 185px;"  min="0" max="100000" step="1" required type="number" />
            </el-form-item>
            <el-form-item label="平均加载耗时" prop="avgLoadingTime">
              <el-input v-model="attributeForm.avgLoadingTime" style="width: 185px;"  min="0" max="100000" step="1" required type="number" />
            </el-form-item>
            <el-form-item label="取消率" prop="cancelRate">
              <el-input v-model="attributeForm.cancelRate" style="width: 185px;"  min="0" max="100" step="0.01" required type="number" />
            </el-form-item>
          </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
         <el-button type="primary" @click="submitAttributeForm">确 定</el-button>
        <el-button @click="cancelAttribute">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import * as qpShop from '@/api/global-cache'
  import { downLoadZip } from '@/utils/zipdownload'
  import * as qpTool from '@/utils/shuxin-tool'
  //import LineChart from '../../dashboard/LineChart.vue' //引进了Echarts封装好的组件
  import request from '@/utils/request'
  import { setDefaultTime } from '@/api/shuxin'

  export default {
    name: "playerEvents",
    data() {
      return {
        // 游戏产品数组
        advertList:[],
        // 遮罩层
        loading: true,
        attributeTitle:"",
        attributeForm:{},
        // 是否显示属性弹出层
        attributeOpen:false,
        wechatDataList:[],
        qqDataList:[],
        ttDataList:[],
        oppoDataList:[],
        versionList:[],
        // 乘放筛选时间数组
        dateRange: [],
        //乘放游戏平台/分组/产品筛选条件的数组
        queryParams: {
          productId: ''
        },
        //用于获取游戏属于平台数据
        dictCache: qpShop.globalCache.shopCache.dictCache,
        // 表单校验
        attributeRules: {
          versionId: [{
            required: true,
            message: "请选择版本号",
            trigger: "blur"
          }],
          addUserCount: [{
            required: true,
            message: "请录入新增用户",
            trigger: "blur"
          }],
          activeCount: [{
            required: true,
            message: "请录入活跃人数",
            trigger: "blur"
          }],
          activeRetention: [{
            required: true,
            message: "请录入活跃次留",
            trigger: "blur"
          }],
          activeArpu: [{
            required: true,
            message: "请录入活跃arpu",
            trigger: "blur"
          }],
          dataTime: [{
            required: true,
            message: "请录入新增用户",
            trigger: "blur"
          }],
          onlineTime: [{
            required: true,
            message: "请录入在线时长",
            trigger: "blur"
          }],
          inputCost: [{
            required: true,
            message: "请录入投入成本",
            trigger: "blur"
          }],
          profit: [{
            required: true,
            message: "请录入利润",
            trigger: "blur"
          }],
          advertProfit: [{
            required: true,
            message: "请录入广告利润",
            trigger: "blur"
          }],
          purchaseCost: [{
            required: true,
            message: "请录入买量成本",
            trigger: "blur"
          }],
          screencapRate: [{
            required: true,
            message: "请录入录屏率",
            trigger: "blur"
          }],
          cancelRate: [{
            required: true,
            message: "请录入取消率",
            trigger: "blur"
          }],
          avgDowmTime: [{
            required: true,
            message: "请录入平均下载耗时",
            trigger: "blur"
          }],
          avgLoadingTime: [{
            required: true,
            message: "请录入平均加载耗时",
            trigger: "blur"
          }]
        },
        show:false,
      }
    },
    created() {
      this.dateRange = setDefaultTime()//设置默认时间
      this.advertInputSelect();
    },
    methods: {
      /** 查询角色列表 */
      getList() {
        this.wechatDataList = [];
        this.qqDataList = [];
        this.ttDataList = [];
        this.oppoDataList = [];
        this.loading = true;
        request({
          url: '/dataImport/list',
          method: 'post',
          data: JSON.stringify(this.getQueryData())
        }).then(res => {
            let dataList = res.rows;
            for(let i = 0; i < dataList.length; i++){
                switch(dataList[i]["platformId"]){
                  case 0:
                    this.wechatDataList.push(dataList[i]);
                    break;
                  case 1:
                    this.qqDataList.push(dataList[i]);
                    break;
                  case 2:
                    this.ttDataList.push(dataList[i]);
                    break;
                  case 3:
                    this.oppoDataList.push(dataList[i]);
                    break;
                }
            }
            console.log(res.data)
            this.loading = false
        })
      },
      openWindow(platformType){
        this.resetForm("attributeForm");
        switch(platformType){
           case 0:
              this.attributeTitle = "添加微信详细数据";
              break;
           case 1:
              this.attributeTitle = "添加QQ详细数据";
              break;
           case 2:
              this.attributeTitle = "添加抖音详细数据";
              break;
           case 3:
              this.attributeTitle = "添加OPPO详细数据";
              break;
        }
        this.show = platformType == 2;
        this.platformType = platformType;
        this.attributeForm = {
          productName:this.getProductName()
        };
        let productData = this.productJson[this.attributeForm.productName + "_" + platformType ];
        if(undefined == productData || null == productData){
          this.$message({message: '当前产品未在该平台发布,无法录入数据',type: 'warning'});
          return;
        }
        let params={productId:productData["id"]};
        var that=this;
        this.inputSelectList("t_filter", "version_id", null, function(data) {
          if(data.length > 0) {
             that.versionList=data;
          }
        }, JSON.stringify(params));
        this.attributeOpen = true;
      },
      // 请求参数对象
      getQueryData(){
        let productName = this.getProductName();
        let productIds = [];
        debugger;
        for(let field in this.productJson){
          if(field.indexOf(productName) >= 0){
              productIds.push(this.productJson[field]["id"]);
          }
        }
        debugger;
        return {
          tableName:"basic_data_import",
          filters:{
            dataTime:{
              type:'between',
              from: this.dateRange[0],
              to: this.dateRange[1]
            },
            productId: {
              type:'in',
              value:productIds
            },
          },
          paging: {pageSize: 1000, pageNumber: 1},
          orders: [{column: 'dataTime', type: 'desc'}]
        };
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.getList()
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.dateRange = setDefaultTime()
        this.resetForm("queryForm")
        //此处为什么不修改productId的值，是因为设置了平台，会联动到产品
        this.asyncCall()
      },

      advertInputSelect() {
        this.advertList = [] //options需要清空
        let that = this;
        var gameNameStr = "";
        //存起来
        this.productJson = {};
        this.inputSelectList("t_filter", "product_id", null, function(data) {
          if(data.length > 0) {
            for(let i = 0; i < data.length;i++){
               that.productJson[data[i]["game_name"] +"_" +data[i]["platform_type"]] = data[i];
               if(gameNameStr.indexOf(data[i]["game_name"]) < 0){
                 that.advertList.push(data[i]);
                 gameNameStr += "," + data[i]["game_name"];
               }
            }
            // that.advertList = data
            that.queryParams.productId = data[0]["id"];
          }
          that.getList();
        });
      },
      // 异步函数同步话执行
      async asyncCall() {
        this.getList()
      },
      /**  导出事件  */
      exportNoTarde(){
          var filterJsonStr = JSON.stringify(this.getQueryData());
          downLoadZip(encodeURI("/eventReport/exportEventDataList?filterJson=" + filterJsonStr), "exportEvents",true)
      },

      // 取消按钮
      cancelAttribute() {
        this.attributeOpen = false;
        this.resetForm("attributeForm");
      },
      /** 提交按钮 */
      submitAttributeForm(){
        var that = this;
        this.$refs["attributeForm"].validate(valid => {
          if (valid) {
            that.attributeForm["platformId"] = that.platformType;
            that.attributeForm["productId"] = that.queryParams.productId;
            delete that.attributeForm["productName"];
            let saveJson = {
              "tableName":"basic_data_import",
              "data":that.attributeForm
            }
            let urlPath =  that.attributeForm.id == undefined ? '/dataImport/add':'/dataImport/edit';
            request({
              url: urlPath,
              method: 'post',
              data: JSON.stringify(saveJson)
            }).then(res => {
                if(res.code == 200){
                  that.$message({  message: res.msg,  type: 'success' });
                  that.attributeOpen = false;
                  that.getList();
                }else{
                  that.$message.error(res.msg);
                }
            })
          }
        });
      },
      //获取产品名称
      getProductName(){
          let that = this;
          let obj = this.advertList.find((item)=>{//这里的oneData就是上面遍历的数据源
              return item.targetIdColumnInputSelect === that.queryParams.productId;//筛选出匹配数据
          });
          return obj.targetNameColumnInputSelect;
      },
      handleDelete:function(data){
         this.$confirm('此操作将永久删除该录入数据, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
              request({
                url: '/dataImport/remove',
                method: 'post',
                data: JSON.stringify({
                  tableName:"basic_data_import",
                  ids:[{id:data.id}]
                })
              }).then(res => {
                  if(res.code == 200){
                    this.$message({  message: res.msg,  type: 'success' });
                    this.getList();
                  }else{
                    this.$message.error(res.msg);
                  }
              })
          })
      },
      handleUpdate:function(data){
          this.resetForm("attributeForm");
          switch(data["platformId"]){
             case 0:
                this.attributeTitle = "编辑微信详细数据";
                break;
             case 1:
                this.attributeTitle = "编辑QQ详细数据";
                break;
             case 2:
                this.attributeTitle = "编辑抖音详细数据";
                break;
             case 3:
                this.attributeTitle = "编辑OPPO详细数据";
                break;
          }
          this.attributeForm = JSON.parse(JSON.stringify(data));
          this.platformType = data["platformId"];
          this.show = this.platformType == 2;
          this.attributeForm.productName = this.getProductName();
          let params={
                    productId:this.productJson[this.attributeForm.productName + "_" + data["platformId"] ]["id"]
          }
          var that=this;
          this.inputSelectList("t_filter", "version_id", null, function(data) {
            if(data.length > 0) {
               that.versionList=data;
            }
          }, JSON.stringify(params));
          this.attributeOpen = true;
      }
    }

  }
</script>

<style>
</style>
