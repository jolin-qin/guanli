<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="广告APPID" prop="appId">
        <el-input v-model="queryParams.appId" placeholder="请输入广告APPID" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="所属平台" prop="platformType">
        <el-select v-model="queryParams.platformType" placeholder="所属平台">
          <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
            :value="item.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="广告名称" prop="gameName">
        <el-input v-model="queryParams.gameName" placeholder="请输入广告名称" clearable size="small" @keyup.enter.native="handleQuery" />
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
      <el-table-column label="公司名称" align="center" prop="company" />
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
          <div v-html="scope.row.isUpperDown"></div>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:advert:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['business:advert:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改广告对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1200px" :before-close="cancel">
      <el-form ref="form" :inline="true" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="广告APPID" prop="appId">
          <el-input v-model="form.appId" placeholder="请输入广告APPID" />
        </el-form-item>
        <el-form-item label="公司名称" prop="company">
          <el-input v-model="form.company" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="所属平台" prop="platformType">
          <el-select v-model="form.platformType" placeholder="所属平台">
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
          <!-- 上传直角图片 -->
          <el-col>
            <el-form-item label="直角" prop="iconRightAngleList">
              <el-upload class="avatar-uploader" :limit="4" action="#" multiple :file-list="imageRightAngleList"
                list-type="picture-card" accept=".jpg, .png, .jpeg" :http-request="requestUpload" :on-success="handleAvatarSuccess"
                :on-remove="handleRemove" :before-upload="beforeUpload">
                <div class="img-upload-button">
                  <i class="el-icon-plus avatar-uploader-icon"></i>
                </div>
              </el-upload>
            </el-form-item>
            <span style="height: 100px;line-height: 100px;color: red;">素材图片分辨率：150 x 150 (JPG，PNG) ，大小50KB以内；</span>
          </el-col>
          <!-- 上传圆角图片 -->
          <el-col>
            <el-form-item label="圆角" prop="iconFilletList">
              <el-upload class="avatar-uploader" :limit="4" action="#" multiple :file-list="imageFilletList"
                list-type="picture-card" accept=".jpg, .png, .jpeg" :http-request="requestUpload" :on-success="handleFilletSuccess"
                :on-remove="handleFilletRemove" :before-upload="beforeUpload">
                <div class="img-upload-button">
                  <i class="el-icon-plus avatar-uploader-icon"></i>
                </div>
              </el-upload>
            </el-form-item>
            <span style="height: 100px;line-height: 100px;color: red;">素材图片分辨率：150 x 150 (JPG，PNG)，大小50KB以内；</span>
          </el-col>
          <!-- 上传banner图片 -->
          <el-col>
            <el-form-item label="banner" prop="bannerList">
              <el-upload class="avatar-uploader" :limit="4" action="#" multiple :file-list="imageBannerList"
                list-type="picture-card" accept=".jpg, .png, .jpeg" :http-request="requestUpload" :on-success="handleBannerSuccess"
                :on-remove="handleBannerRemove" :before-upload="beforeUploadBanner">
                <div class="img-upload-button">
                  <i class="el-icon-plus avatar-uploader-icon"></i>
                </div>
              </el-upload>
            </el-form-item>
            <span style="height: 100px;line-height: 100px;color: red;">素材图片分辨率：960 x 334 (JPG，PNG) ，大小150KB以内；</span>
          </el-col>
          <!-- 上传插屏图片 -->
          <el-col>
            <el-form-item label="插屏" prop="screenList">
              <el-upload class="avatar-uploader" action="#" :limit="4" multiple :file-list="imageScreenList"
                list-type="picture-card" accept=".jpg, .png, .jpeg" :http-request="requestUpload" :on-success="handleScreenSuccess"
                :on-remove="handleScreenRemove" :before-upload="beforeUpload">
                <div class="img-upload-button">
                  <i class="el-icon-plus avatar-uploader-icon"></i>
                </div>
              </el-upload>
            </el-form-item>
            <span style="height: 100px;line-height: 100px;color: red;">素材图片分辨率：150 x 150 (JPG，PNG) ，大小50KB以内；</span>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
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
    exportAdvert
  } from "@/api/business/matrix_advert";
  import * as qpShop from '@/api/global-cache'
  import * as oss from '@/api/aliyunoss'
  import * as shuxinTool from '@/utils/shuxin-tool'
  export default {
    name: "Advert",
    data() {
      return {
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
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 上传图片时,:file-list只是可读的,不能写,因此声明变量做个转变
        imageRightAngleList: [],
        imageFilletList: [],
        imageBannerList: [],
        imageScreenList: [],
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          appId: undefined,
          company: undefined,
          platformType: undefined,
          isDel: 0,
          gameName: undefined,
          isInside: undefined,
          isUpperDown: undefined,
        },
        // 表单参数
        form: {
          iconRightAngleList: [],
          iconFilletList: [],
          bannerList: [],
          screenList: []
        },
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
        dictCache: qpShop.globalCache.shopCache.dictCache,
      };
    },
    created() {
      this.getList();
    },
    methods: {
      // 上传预处理
      beforeUpload(file) {
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
          this.total = response.total;
          this.loading = false;
        });
      },
      // 取消按钮
      cancel() {
        this.open = false
        this.imageRightAngleList = []
        this.imageFilletList = []
        this.imageBannerList = []
        this.imageScreenList = []
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
          createBy: undefined,
          createTime: undefined,
          updateBy: undefined,
          updateTime: undefined,
          iconRightAngleList: [],
          iconFilletList: [],
          bannerList: [],
          screenList: []
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
        this.imageRightAngleList = [];
        this.imageFilletList = [];
        this.imageBannerList = [];
        this.imageScreenList = [];
        this.reset();
        this.open = true;
        this.title = "添加广告";
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.isSubmit=false;
        this.imageRightAngleList = [];
        this.imageFilletList = [];
        this.imageBannerList = [];
        this.imageScreenList = [];
        this.reset();
        const id = row.id || this.ids
        getAdvert(id).then(res => {
          console.log(res)
          this.form = res.data
          this.imageRightAngleList = res.data.inProductList
          this.imageFilletList = res.data.iconFilletList
          this.imageBannerList = res.data.bannerList
          this.imageScreenList = res.data.screenList
          this.open = true;
          this.title = "修改广告";
        });
      },
      /** 提交按钮 */
      submitForm: function() {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if(this.isSubmit){
              return ;
            }
            this.isSubmit=true;
            if (this.form.id != undefined) {
              updateAdvert(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("修改成功");
                  this.open = false;
                  this.getList();
                } else {
                  this.isSubmit = false;
                  this.msgError(response.msg);
                }
              });
            } else {
              addAdvert(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("新增成功");
                  this.open = false;
                  this.getList();
                } else {
                  this.isSubmit=false;
                  this.msgError(response.msg);
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


      // 覆盖默认的上传行为
      requestUpload(option) {
        oss.upload(option)
      },
      // 直角图片上传成功回调
      handleAvatarSuccess(response, file, fileList) {
        const that = this
        if (shuxinTool.isEmpty(response)) {
          return;
        }
        console.log(response)
        this.form.iconRightAngleList.push({ url: response[0]})
        this.imageRightAngleList = fileList
        console.log(this.form.iconRightAngleList)
      },
      // 圆角图片上传成功回调
      handleFilletSuccess(response, file, fileList) {
        const that = this
        if (shuxinTool.isEmpty(response)) {
          return;
        }
        console.log(response)
        this.form.iconFilletList.push({ url: response[0]})
        this.imageFilletList = fileList
        console.log(this.form.iconFilletList)
      },
      // banner图片上传成功回调
      handleBannerSuccess(response, file, fileList) {
        const that = this
        if (shuxinTool.isEmpty(response)) {
          return;
        }
        console.log(response)
        this.form.bannerList.push({ url: response[0]})
        this.imageBannerList = fileList
        console.log(this.form.bannerList)
      },
      // 插屏图片上传成功回调
      handleScreenSuccess(response, file, fileList) {
        const that = this
        if (shuxinTool.isEmpty(response)) {
          return;
        }
        console.log(response)
        this.form.screenList.push({ url: response[0]})
        this.imageScreenList = fileList
        console.log(this.form.screenList)
      },


      // 直角图片删除回调
      handleRemove(file, fileList) {
        //找到点击删除项的下标index
        let index = this.imageRightAngleList.findIndex(item => {
          return file.url === item.url
        })
        this.form.iconRightAngleList.splice(index, 1)
        this.imageRightAngleList = fileList
      },
      // 圆角图片删除回调
      handleFilletRemove(file, fileList) {
        //找到点击删除项的下标index
        let index = this.imageFilletList.findIndex(item => {
          return file.url === item.url
        })
        this.form.iconFilletList.splice(index, 1)
        this.imageFilletList = fileList
      },
      // banner图片删除回调
      handleBannerRemove(file, fileList) {
        //找到点击删除项的下标index
        let index = this.imageBannerList.findIndex(item => {
          return file.url === item.url
        })
        this.form.bannerList.splice(index, 1)
        this.imageBannerList = fileList
      },
      // 插屏图片删除回调
      handleScreenRemove(file, fileList) {
        //找到点击删除项的下标index
        let index = this.imageScreenList.findIndex(item => {
          return file.url === item.url
        })
        this.form.screenList.splice(index, 1)
        this.imageScreenList = fileList
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
    width: 100px !important;
    height: 100px !important;
  }

</style>
