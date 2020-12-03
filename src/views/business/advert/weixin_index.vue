<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="70px">
      <el-form-item label="广告APPID" prop="appId" label-width="85px">
        <el-input v-model="queryParams.appId" placeholder="请输入广告APPID" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="所属平台" prop="platformType">
        <el-select v-model="queryParams.platformType" filterable placeholder="所属平台">
          <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
            :value="item.dictValue" />
        </el-select>
      </el-form-item>

      <el-form-item label="公司名称" prop="companyId">
       <el-select   v-model="queryParams.companyId"  filterable placeholder="公司名称">
           <el-option v-for="item in companyList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
             :value="item.targetIdColumnInputSelect"></el-option>
       </el-select>
      </el-form-item>

      <el-form-item label="广告名称" prop="gameName">
        <el-input v-model="queryParams.gameName" placeholder="请输入广告名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="查询日期" prop="dateRange">
        <el-date-picker v-model="queryParams.dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd" type="daterange"
          range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['business:advert:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['business:advert:remove']">删除</el-button>
      </el-col>

    </el-row>

    <el-table v-loading="loading" :data="advertList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="广告APPID" align="center" prop="appId" />
      <el-table-column label="公司名称" align="center" prop="companyId" />
      <el-table-column label="所属平台" align="center" prop="platformType">
        <template slot-scope="scope">
          <div v-html="scope.row.platformType"></div>
        </template>
      </el-table-column>
      <el-table-column label="广告名称" align="center" prop="gameName" />
      <el-table-column label="是否内部产品" align="center" prop="isInside">
        <template slot-scope="scope">
          <div v-html="scope.row.isInside"></div>
        </template>
      </el-table-column>
      <el-table-column label="上下架" align="center" prop="isUpperDown">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.isUpperDown"
            active-color="#13ce66"
            inactive-color="#adadad"
            active-value="0"
            inactive-value="1"
            @change="upperDownChange(scope.row)" >
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="时间" align="center" prop="time" :formatter="_getTime"/>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit"      @click="handleUpdate(scope.row)" v-hasPermi="['business:advert:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-edit"  @click="handlePrice(scope.row)" v-hasPermi="['business:advert:remove']">单价</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete"    @click="handleDelete(scope.row)" v-hasPermi="['business:advert:remove']">删除</el-button>
        </template>

      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改广告对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1200px">
      <el-form ref="form" :inline="true" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="广告APPID" prop="appId">
          <el-input v-model="form.appId" placeholder="请输入广告APPID" />
        </el-form-item>
        <el-form-item label="公司名称" prop="companyId">
          <el-select v-model="form.companyId" placeholder="公司名称">
              <el-option v-for="item in companyList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
                :value="item.targetIdColumnInputSelect"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属平台" prop="platformType">
          <el-select v-model="form.platformType" placeholder="所属平台"  @change="removeProductList">
            <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
              :value="item.dictValue" />
          </el-select>
        </el-form-item>
        <el-form-item label="广告名称" prop="gameName">
          <el-input v-model="form.gameName" placeholder="请输入广告名称" />
        </el-form-item>
        <el-form-item label="是否内部产品" prop="isInside">
          <el-select v-model="form.isInside" placeholder="是否是内部产品">
            <el-option v-for="item in dictCache.matrix_yes_no.details" :key="item.dictValue" :label="item.dictLabel"
              :value="item.dictValue" />
          </el-select>
        </el-form-item>
        </el-form-item>
        <el-form-item label="上下架" prop="isUpperDown">
          <el-select v-model="form.isUpperDown" placeholder="上下架">
            <el-option v-for="item in dictCache.is_upper_down.details" :key="item.dictValue" :label="item.dictLabel"
              :value="item.dictValue" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注信息" style="width:  850px;" />
        </el-form-item>
         <el-row>
           <!-- 上传ICON图片 -->
           <el-col>
             <el-form-item label="ICON" prop="iconFilletList">
               <el-upload class="avatar-uploader" :limit="6" action="#" multiple :file-list="imageFilletList"
                 list-type="picture-card" accept=".jpg, .png, .jpeg" :http-request="requestUpload" :on-success="handleFilletSuccess"
                 :on-remove="handleFilletRemove" :before-upload="beforeUpload">
                 <div class="img-upload-button">
                   <i class="el-icon-plus avatar-uploader-icon"></i>
                 </div>
               </el-upload>
             </el-form-item>
             <span style="height: 100px;line-height: 100px;color: red;">素材图片分辨率：150 x 150 (JPG，PNG) ，大小50KB以内；</span>
           </el-col>
           <!-- 上传大导出页图片 -->
           <el-col>
             <el-form-item label="大导出页" prop="screenList">
               <el-upload class="avatar-uploader" :limit="6" action="#" multiple :file-list="imageScreenList"
                 list-type="picture-card" accept=".jpg, .png, .jpeg" :http-request="requestUpload" :on-success="handleScreenSuccess"
                 :on-remove="handleScreenRemove" :before-upload="beforeUpload">
                 <div class="img-upload-button">
                   <i class="el-icon-plus avatar-uploader-icon"></i>
                 </div>
               </el-upload>
             </el-form-item>
             <span style="height: 100px;line-height: 100px;color: red;">素材图片分辨率：150 x 150 (JPG，PNG) ，大小50KB以内；</span>
           </el-col>
           <!-- 上传banner图片 -->
           <el-col>
             <el-form-item label="banner" prop="bannerList">
               <el-upload class="avatar-uploader" :limit="6" action="#" multiple :file-list="imageBannerList"
                 list-type="picture-card" accept=".jpg, .png, .jpeg" :http-request="requestUpload" :on-success="handleBannerSuccess"
                 :on-remove="handleBannerRemove" :before-upload="beforeUploadBanner">
                 <div class="img-upload-button">
                   <i class="el-icon-plus avatar-uploader-icon"></i>
                 </div>
               </el-upload>
             </el-form-item>
             <span style="height: 100px;line-height: 100px;color: red;">素材图片分辨率：960 x 334 (JPG，PNG) ，大小150KB以内；</span>
           </el-col>
           <!-- 上传动图图片 -->
           <el-col>
             <el-form-item label="动图图片" prop="gifList">
               <el-upload class="avatar-uploader" ref="picUpload" action="#" :multiple="true" :file-list="imageGifList"
                 list-type="picture-card" accept=".jpg, .png, .jpeg" :http-request="requestUpload" :on-success="handleGifSuccess"
                 :on-remove="handleGifRemove" :before-upload="beforeUpload">
                 <div class="img-upload-button">
                   <i class="el-icon-plus avatar-uploader-icon"></i>
                 </div>
               </el-upload>
             </el-form-item>
             <span style="height: 100px;line-height: 100px;color: red;">素材图片分辨率：150 x 150 (JPG，PNG) ，大小50KB以内；</span>
           </el-col>
         </el-row>
         <!-- 表格 -->
        <el-table :data="form.inProductList">
          <el-table-column label="产品名称" align="center" prop="productId">
            <template slot-scope="scope">
              <el-select v-model="scope.row.productId" placeholder="广告名称">
                <el-option v-for="(item, index) in productList" :key="index" :label="item.targetNameColumnInputSelect"
                  :value="item.targetIdColumnInputSelect"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="产品路径" align="center" prop="advertPath">
            <template slot-scope="scope">
              <el-input type="text" placeholder="请输入广告路径" v-model="scope.row.advertPath"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="ICON" align="center" prop="iconUrl">
            <template slot-scope="scope">
              <el-select v-model="scope.row.iconUrl" multiple placeholder="ICON">
                <el-option v-for="(item, index) in form.iconFilletList" :key="index" :label="item.name"
                  :value="item.url"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="大导出页" align="center" prop="screenUrl">
            <template slot-scope="scope">
              <el-select v-model="scope.row.screenUrl" multiple placeholder="大导出页">
                <el-option v-for="(item, index) in form.screenList" :key="index" :label="item.name"
                  :value="item.url"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="banner" align="center" prop="bannerUrl">
            <template slot-scope="scope">
              <el-select v-model="scope.row.bannerUrl" multiple placeholder="banner">
                <el-option v-for="(item, index) in form.bannerList" :key="index" :label="item.name"
                  :value="item.url"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="动图图片" align="center" prop="gifName">
            <template slot-scope="scope">
              <el-select v-model="scope.row.gifName" placeholder="动图图片">
                <!-- <el-option v-for="(item, index) in form.gifNameList" :key="index" :label="item" :value="item"></el-option> -->
                <el-option v-for="(item, index) in form.gifList" :key="index" :label="item.name" :value="item.url"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button size="mini" type="text" icon="el-icon-delete" @click="deleteGoodsBtn(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="right-float-top pt30">
          <el-button type="primary" icon="el-icon-plus" circle @click="addGoodsBtn"></el-button>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>


    <!-- 添加或修改产品单价对话框 -->
    <el-dialog :title="priceTitle" :visible.sync="priceOpen" width="1200px">
      <el-form  ref="priceForm" :inline="true"    :model="priceForm"  :rules="priceRules" label-width="120px">
        <el-table :data="priceForm.priceList">
          <el-table-column label="单价" align="center" prop="export_price">
            <template slot-scope="scope">
              <el-input  v-if="scope.row.isPut==0"   placeholder="请输入单价" v-model="scope.row.exportPrice"  oninput="if(isNaN(value)) { value = null } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"></el-input>
               <el-input v-else disabled=""  placeholder="请输入单价" v-model="scope.row.exportPrice"  oninput="if(isNaN(value)) { value = null } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="卖量类型" align="center" prop="export_price">
            <template slot-scope="scope">
                <el-select v-if="scope.row.isPut==0" v-model="scope.row.salesType" placeholder="买卖量类型">
                  <el-option v-for="item in salesTypeList"   :key="item.id" :label="item.name"
                    :value="item.id"></el-option>
                </el-select>
                <el-select v-else v-model="scope.row.salesType"  disabled="" placeholder="买卖量类型">
                  <el-option v-for="item in salesTypeList"   :key="item.id" :label="item.name"
                    :value="item.id"></el-option>
                </el-select>
            </template>
          </el-table-column>
          <el-table-column label="生效时间" align="center" prop="plan_start_time">
            <template   slot-scope="scope">
              <el-date-picker clearable size="small" style="width: 200px" v-if="scope.row.isPut==0"
                v-model="scope.row.planStartTime"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="选择生效时间"
                :picker-options="pickerOptions">
              </el-date-picker>
              <el-date-picker clearable size="small" style="width: 200px" v-else disabled=""
                v-model="scope.row.planStartTime"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="选择生效时间"
                :picker-options="pickerOptions">
              </el-date-picker>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template   slot-scope="scope">
              <el-button  v-if="scope.row.isPut==0" size="mini" type="text" icon="el-icon-delete"  @click="deletePrice(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="right-float-top pt30">
          <el-button type="primary" icon="el-icon-plus" circle @click="addPrice"></el-button>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
         <el-button type="primary" @click="submitPriceForm">确 定</el-button>
        <el-button @click="cancelPrice">取 消</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
  import {
    listAdvert,
    getAdvert,
    delAdvert,
    addAdvert,
    updateAdvert,
    exportAdvert,
    updatePricePlan
  } from "@/api/business/matrix_advert";
  import * as qpShop from '@/api/global-cache'
  import * as oss from '@/api/aliyunoss'
  import * as shuxinTool from '@/utils/shuxin-tool'
  import request from '@/utils/request'
  export default {
    name: "Advert",
    data() {
      return {
        fileName:'',
        advertId:0,
         isSubmit:false,
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
        // 广告表格数据
        advertList: [],
        salesTypeList:[{id:1,name:"活跃"},{id:2,name:"新增"}],
        //公司列表
        companyList:[],
        productList: [],
        // 弹出层标题
        title: "",
        priceTitle:"",
        // 是否显示弹出层
        open: false,
        priceOpen:false,
        // 上传图片时,:file-list只是可读的,不能写,因此声明变量做个转变
        imageFilletList: [],
        imageScreenList: [],
        imageBannerList: [],
        imageGifList: [],
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          appId: undefined,
          company: undefined,
          companyId: undefined,
          platformType: undefined,
          isDel: 0,
          dateRange: [],
          gameName: undefined,
          isInside: undefined,
          isUpperDown: undefined,
        },
        // 表单参数
        form: {
          iconFilletList: [],
          screenList: [],
          bannerList: [],
          gifList: []
        },
        priceForm:{},
        // 表单校验
        rules: {
          appId: [{
            required: true,
            message: "广告APPID不能为空",
            trigger: "blur"
          }],
          company: [{
            required: true,
            message: "公司名称不能为空",
            trigger: "blur"
          }],
          platformType: [{
            required: true,
            message: "所属平台不能为空",
            trigger: "change"
          }],
          gameName: [{
            required: true,
            message: "小游戏名称不能为空",
            trigger: "blur"
          }],
          isInside: [{
            required: true,
            message: "是否是内部产品不能为空",
            trigger: "change"
          }],
          isUpperDown: [{
            required: true,
            message: "上下架不能为空",
            trigger: "change"
          }]
        },
        pickerOptions: {
          disabledDate(v) {
            return v.getTime() < new Date().getTime()-1000*60*60*24;
          }
        },
        // 表单校验
        priceRules: {
          exportPrice: [{
            required: true,
            message: "单价不能为空",
            trigger: "blur"
          }],
          planStartTime: [{
            required: true,
            message: "生效时间不能为空",
            trigger: "blur"
          }]
        },
        dictCache: qpShop.globalCache.shopCache.dictCache,
      };
    },
    created() {
      this.getList();
      this.companyInputSelect();
    },
    methods: {
      // 上传预处理
      beforeUpload(file) {
        console.log(file)
        const isLtSize = file.size / 1024  < 50
        const isJpg = file.type == 'image/jpeg' || file.type == 'image/jpg' || file.type == 'image/png'
        if(!isJpg){
          this.$message.error('只能上传jpg, jpeg, png格式的图片！')
          return false
        }
        if (!isLtSize) {
          this.$message.error('上传图片大小不能超过 50KB!');
          return false
        }
      },
      // 上传预处理
      beforeUploadBanner(file) {
        const isLtSize = file.size / 1024  < 150
        const isJpg = file.type == 'image/jpeg' || file.type == 'image/jpg' || file.type == 'image/png'
        if(!isJpg){
          this.$message.error('只能上传jpg, jpeg, png格式的图片！')
          return false
        }
        if (!isLtSize) {
          this.$message.error('上传图片大小不能超过 150KB!');
          return false
        }
      },

      /** 查询广告列表 */
      getList() {
        this.loading = true;
        listAdvert(this.queryParams).then(response => {
          this.advertList = this.shuxinDataFormat("matrix_advert", response.rows);
          // console.log(this.advertList)
          if(this.advertList.length>0){
            for(var i=0;i<this.advertList.length;i++){
              this.advertList[i].isUpperDown=response.rows[i].isUpperDown
            }
          }
          this.total = response.total;
          this.loading = false;
        });
      },
      // 取消按钮
      cancel() {
        this.open = false
        this.imageFilletList = []
        this.imageScreenList = []
        this.imageBannerList = []
        this.imageGifList = []
        this.reset();
      },
      // 表单重置
      reset() {
        this.form = {
          id: undefined,
          remark: undefined,
          appId: undefined,
          company: undefined,
          platformType: undefined,
          isDel: undefined,
          gameName: undefined,
          isInside: undefined,
          isUpperDown: undefined,
          inProductList: [],
          iconFilletList: [],
          screenList: [],
          bannerList: [],
          gifList: [],
          gifNameList: ["删除"]
        };
        this.resetForm("form");
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.queryParams.pageNum = 1;
        this.getList();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm("queryForm");
        this.handleQuery();
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.id)
        this.single = selection.length != 1
        this.multiple = !selection.length
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.isSubmit=false;
        this.imageFilletList = []
        this.imageScreenList = []
        this.imageBannerList = []
        this.imageGifList = []
        this.reset();
        this.open = true;
        this.title = "添加广告";
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.isSubmit = false;
        this.imageFilletList = []
        this.imageScreenList = []
        this.imageBannerList = []
        this.imageGifList = []
        this.reset();
        const id = row.id || this.ids
        getAdvert(id).then(res => {
          console.log(res)
          this.form = res.data;
          this.imageGifList = res.data.gifList
          this.imageFilletList = res.data.iconFilletList
          this.imageBannerList = res.data.bannerList
          this.imageScreenList = res.data.screenList
          this.open = true;
          this.title = "修改广告";
          this.selectChanged();
        });
      },
      /** 提交按钮 */
      submitForm: function() {
        var that=this;
        this.$refs["form"].validate(valid => {
          if (valid) {
            if(that.isSubmit){
              return ;
            }
            that.isSubmit=true;

            if(that.companyList.length>0){
              for(var i=0;i<that.companyList.length;i++){
                if(that.companyList[i].id==that.form.companyId){
                   that.form.company=that.companyList[i].company_name;
                }
              }
            }
            if (that.form.id != undefined) {
              updateAdvert(that.form).then(response => {
                if (response.code === 200) {
                  that.msgSuccess("修改成功");
                  that.open = false;
                  that.getList();
                } else {
                  that.isSubmit=false;
                }
              });
            } else {
              addAdvert(that.form).then(response => {
                if (response.code === 200) {
                  that.msgSuccess("新增成功");
                  that.open = false;
                  that.getList();
                } else {
                  that.isSubmit=false;
                }
              });
            }
          }
        });
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        var ids = [];
        row.id ? ids.push(row.id) : ids = this.ids;
        this.$confirm('是否确认删除广告编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delAdvert(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
      },
      /** 导出按钮操作 */
      handleExport() {
        const queryParams = this.queryParams;
        this.$confirm('是否确认导出所有广告数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportAdvert(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
      },

      // 自定义的上传函数
      requestUpload(option) {
        oss.upload(option)
      },
      // ICON图片上传成功回调
      handleFilletSuccess(response, file, fileList) {
        const that = this
        if (shuxinTool.isEmpty(response)) {
          return;
        }
        // console.log(response)
        this.form.iconFilletList.push({
          url: response[0],
          name: file.name
        })
        this.imageFilletList = fileList
      },
      // 大导出页图片上传成功回调
      handleScreenSuccess(response, file, fileList) {
        const that = this
        if (shuxinTool.isEmpty(response)) {
          return;
        }
        // console.log(response)
        this.form.screenList.push({
          url: response[0],
          name: file.name
        })
        this.imageScreenList = fileList
        // console.log(this.form.screenList)
      },
      // banner图片上传成功回调
      handleBannerSuccess(response, file, fileList) {
        const that = this
        if (shuxinTool.isEmpty(response)) {
          return;
        }
        // 把代表图片随机生成的名字提取出来
        // let name = response[0].split("_")[1]
        this.form.bannerList.push({
          url: response[0],
          name: file.name
        })
        this.imageBannerList = fileList
        // console.log(this.form.bannerList)
      },
      //动图图片上传成功回调
      handleGifSuccess(response, file, fileList) {
        const that = this
        if (shuxinTool.isEmpty(response)) {
          return;
        }
        console.log(response)
        this.form.gifList.push({
          url: response[0],
          name: file.name
        })
        this.imageGifList = fileList
        // console.log(this.form.gifList)
      },


      // ICON图片删除回调
      handleFilletRemove(file, fileList) {
        //找到点击删除项的下标index
        let index = this.imageFilletList.findIndex(item => {
          return file.url === item.url
        })
        this.form.iconFilletList.splice(index, 1)
        this.imageFilletList = fileList
        // 还要遍历表格数据,每条数据对应的banner图集凡是都选中了删除了的图片的,都做相应处理
        this.form.inProductList.forEach((item1, index1) => {
          item1.iconUrl.forEach((item2, index2) => {
            if (item2 === file.url) {
              item1.iconUrl.splice(index2, 1)
            }
          })
        })
      },
      // 大导出页图片删除回调
      handleScreenRemove(file, fileList) {
        //找到点击删除项的下标index
        let index = this.imageScreenList.findIndex(item => {
          return file.url === item.url
        })
        this.form.screenList.splice(index, 1)
        this.imageScreenList = fileList
        // 还要遍历表格数据,每条数据对应的banner图集凡是都选中了删除了的图片的,都做相应处理
        this.form.inProductList.forEach((item1, index1) => {
          item1.screenUrl.forEach((item2, index2) => {
            if (item2 === file.url) {
              item1.screenUrl.splice(index2, 1)
            }
          })
        })
      },
      // banner图片删除回调
      handleBannerRemove(file, fileList) {
        //找到点击删除项的下标index
        let index = this.imageBannerList.findIndex(item => {
          return file.url === item.url
        })
        this.form.bannerList.splice(index, 1)
        this.imageBannerList = fileList
        // 还要遍历表格数据,每条数据对应的banner图集凡是都选中了删除了的图片的,都做相应处理
        this.form.inProductList.forEach((item1, index1) => {
          item1.bannerUrl.forEach((item2, index2) => {
            if (item2 === file.url) {
              item1.bannerUrl.splice(index2, 1)
            }
          })
        })
      },
      // 动图图片删除回调
      handleGifRemove(file, fileList) {
        //找到点击删除项的下标index
        let index = this.imageGifList.findIndex(item => {
          return file.url === item.url
        })
        this.form.gifList.splice(index, 1)
        this.imageGifList = fileList
        // 还要遍历表格数据,每条数据对应的banner图集凡是都选中了删除了的图片的,都做相应处理
        this.form.inProductList.forEach((item1, index1) => {
          if (item1.gifName === file.url.split("_")[1]) {
            item1.gifName = ''
          }
        })
      },

      // 添加商品
      addGoodsBtn() {
        var obj = {
          id: shuxinTool.uuid(),
          advertId: '',
          advertPath: '',
          icon: '',
          screen: '',
          banner: '',
        }
        this.form.inProductList.push(obj)
      },
      // 删除单个商品
      deleteGoodsBtn(row) {
        if (shuxinTool.isEmpty(this.form.inProductList)) {
          return;
        }
        for (var i = 0; i < this.form.inProductList.length; i++) {
          if (row.id == this.form.inProductList[i].id) {
            this.form.inProductList.splice(i, 1);
            return;
          }
        }
      },
      // 获取游戏产品options
      advertInputSelect(query, params, res) {
        this.productList = [] //options需要清空
        this.queryParams.productId = '' //产品显示也需要清空
        var that = this;
        if(params == undefined) {
          params = {
            platformType: '',
            groupByIds: ''
          }
        }
        this.inputSelectList("t_filter", "product_id", query, function(data) {
          if(data.length > 0) {
            that.productList = data
            // 默认第一个option
           // that.queryParams.productId = data[0].targetIdColumnInputSelect
            res && res()
          }
        }, JSON.stringify(params))
      },

      //平台change事件
      selectChanged() {
        return new Promise((res, rej) => {
          let platformType = this.form.platformType;
          let params = {
            platformType: shuxinTool.isEmpty(platformType) ? '' : platformType,
            groupByIds: ''
          };
          this.advertInputSelect(null, params, res);
        })
      },
      //清除数据
      removeProductList(){
        this.selectChanged();
        if(this.form.inProductList.length>0){
          for(var i=0;i<this.form.inProductList.length;i++){
           this.form.inProductList[i].productId="";
          }
        }
      },
      /** 修改按钮操作 */
      handlePrice(row) {
        this.isSubmit = false;
        this.priceReset();
        /** 查询产品版本管理列表 */
        var params={
          advertId:row.id
        }
        this.advertId=row.id;
        request({
          url: '/business/plan/priceList',
          method: 'post',
          data:params
        }).then(res => {
          if(res.data.priceList!=null&&res.data.priceList.length>0){
            for(var i=0;i<res.data.priceList.length;i++){
              res.data.priceList[i].planStartTime=shuxinTool.parseTime(res.data.priceList[i].planStartTime,'{y}-{m}-{d}')
            }
          }
          var obj={
            priceList:res.data.priceList
          }
          this.priceForm = obj;
          this.priceOpen = true;
          this.priceTitle = "修改单价计划";
          this.loading = false;
         })
      },
      // 表单重置
      priceReset() {
        this.priceForm = {
          priceList: []
        };
        this.resetForm("priceForm");
      },
      // 添加商品
      addPrice() {
        var obj = {
          id: shuxinTool.uuid(),
          exportPrice: '',
          planStartTime: '',
          isPut:0,
          advertId:this.advertId
        }
        this.priceForm.priceList.push(obj)
      },
      // 删除单个商品
      deletePrice(row) {
        if (shuxinTool.isEmpty(this.priceForm.priceList)) {
          return;
        }
        for (var i = 0; i < this.priceForm.priceList.length; i++) {
          if (row.id == this.priceForm.priceList[i].id) {
            this.priceForm.priceList.splice(i, 1);
            return;
          }
        }
      },
      /** 提交按钮 */
      submitPriceForm: function() {
        this.$refs["priceForm"].validate(valid => {
          if (valid) {
            if (this.isSubmit) {
              return;
            }
            this.isSubmit = true;
            this.priceForm.advertId=this.advertId
            console.log("this.priceForm",this.priceForm);
            updatePricePlan(this.priceForm).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.priceOpen = false;
              } else {
                this.isSubmit = false;
              }
            });
          }
        });
      },
      // 取消按钮
      cancelPrice() {
        this.priceOpen = false;
        this.priceReset();
      },
      upperDownChange(row){
        console.log(row.isUpperDown);
        const id = row.id || this.ids
        var message="是否确认上架“"+row.gameName+"”?";
        if(row.isUpperDown==1){
          message="是否确认下架“"+row.gameName+"”?";
        }
        this.$confirm(message, {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          var params={
             advertId:id,
             isUpperDown:row.isUpperDown
          }
          request({
            url: '/business/advert/upperDownChange',
            method: 'post',
            data:params
          }).then(res => {

          })
        }).then(response => {

        }).catch(function() {
          if(row.isUpperDown=='0'){
            row.isUpperDown='1'
          }else{
            row.isUpperDown='0'
          }
        });
      },
      //公司下拉数据
      companyInputSelect(value) {
        var that = this;
        var params = {
          companyType: 2
        }
        this.inputSelectList("t_filter", "company_id", null, function(data) {
           that.companyList = data;
        }, JSON.stringify(params));
      },
      _getTime(row, column) {
        return row.createTime.slice(0, 10)
      }
    }
  };
</script>
<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
  }
  .avatar {
    width: 100px;
    height: 100px;
    display: block;
  }
  .avatar-uploader .el-upload--picture-card{
    width: 100px !important;
    height: 100px !important;
    line-height: 100px !important;
  }
  .el-upload-list--picture-card .el-upload-list__item {
    /* width: 100px !important;
    height: 100px !important; */
    /* overflow: visible !important; */
    width: 100px !important;
    border: none !important;
    height: 140px !important;
  }
  .el-upload-list--picture-card .el-upload-list__item-thumbnail {
    border: 1px solid #c0ccda !important;
    height: 100px !important;
  }
  .el-upload-list__item-name{
    display: block !important;
  }
  .el-upload-list__item-name {
    display: block !important;
    width: 100% !important;
  }
  .el-icon-document {
    display: none !important;
  }
</style>
