<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="小游戏APPID" prop="appId">
        <el-input v-model="queryParams.appId" placeholder="请输入小游戏APPID" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>

      <el-form-item label="小游戏名称" prop="gameName">
        <el-input v-model="queryParams.gameName" placeholder="请输入小游戏名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>

      <el-form-item label="所属平台" prop="platformType">
        <el-select v-model="queryParams.platformType" placeholder="所属平台">
          <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
            :value="item.dictValue" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['business:product:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['business:product:remove']">删除</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="小游戏APPID" align="center" prop="appId" />
      <el-table-column label="小游戏名称" align="center" prop="gameName" />
      <el-table-column label="选中的样式组件" align="center" prop="styleAssemblyName" />
      <el-table-column label="诱导点击级别" align="center" prop="guideLevel" />
      <el-table-column label="所属平台" align="center" prop="platformType">
        <template slot-scope="scope">
          <div v-html="scope.row.platformType"></div>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" prop="isCheck">
        <template slot-scope="scope">
          <div v-html="scope.row.isCheck"></div>
        </template>
      </el-table-column>
      <el-table-column label="包名" align="center" prop="pkgName" />
      <el-table-column label="app秘钥" align="center" prop="appKey" />
      <el-table-column label="版本" align="center" prop="version" />
      <el-table-column label="备注信息" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:product:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-edit" @click="attributeUpdate(scope.row)" v-hasPermi="['business:product:edit']">属性</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['business:product:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改产品对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1200px">
      <el-form ref="form" :inline="true" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="小游戏APPID" prop="appId">
          <el-input v-model="form.appId" placeholder="请输入小游戏APPID" />
        </el-form-item>
        <el-form-item label="游戏SECRET" prop="secret">
          <el-input v-model="form.secret" placeholder="请输入游戏SECRET" type="password" />
        </el-form-item>
        <el-form-item label="小游戏名称" prop="gameName">
          <el-input v-model="form.gameName" placeholder="请输入小游戏名称" />
        </el-form-item>
        <el-form-item label="选中的样式组件" prop="styleAssembly">
          <el-select v-model="form.styleAssembly" multiple placeholder="请输入选中的样式组件">
            <el-option v-for="item in styleAssemblyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>

        </el-form-item>
        <el-form-item label="诱导点击级别" prop="guideLevel">
          <el-select v-model="form.guideLevel" placeholder="请输入诱导点击级别">
            <el-option v-for="item in dictCache.guide_level.details" :key="item.dictValue" :label="item.dictLabel"
              :value="item.dictValue" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属平台" prop="platformType">
          <el-select v-model="form.platformType" placeholder="所属平台" @change="selectChanged">
            <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
              :value="item.dictValue" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态" prop="isCheck">
          <el-select v-model="form.isCheck" placeholder="审核状态">
            <el-option v-for="item in dictCache.is_check.details" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue" />
          </el-select>
        </el-form-item>
        <el-form-item label="包名" prop="pkgName">
          <el-input v-model="form.pkgName" placeholder="请输入包名" />
        </el-form-item>
        <el-form-item label="app秘钥" prop="appKey">
          <el-input v-model="form.appKey" placeholder="app秘钥" />
        </el-form-item>
         <el-form-item label="版本" prop="version">
            <el-input v-model="form.version" placeholder="请输入版本" />
        </el-form-item>
        <el-form-item label="备注信息" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入审核备注" />
        </el-form-item>
        <el-table  v-if="isShow" :data="form.inGopdList">
          <el-table-column label="广告名称" align="center" prop="advertId">
            <template slot-scope="scope">
              <el-select v-model="scope.row.advertId" placeholder="广告名称"  @change="selectAdvertExport">
                <el-option v-for="item in advertList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
                  :value="item.targetIdColumnInputSelect"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="广告路径" align="center" prop="advertPath">
            <template slot-scope="scope">
              <el-input type="text" placeholder="请输入广告路径" v-model="scope.row.advertPath"></el-input>
            </template>
          </el-table-column>

          <el-table-column label="权重" align="center" prop="weight">
            <template slot-scope="scope">
              <el-input type="text" placeholder="权重" oninput="if(isNaN(value)) { value = null } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"
                v-model="scope.row.weight"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="单次出现此广告的上限次数" align="center" prop="upperLimit">
            <template slot-scope="scope">
              <el-input type="text" placeholder="次出现此广告的上限次数" oninput="if(isNaN(value)) { value = null } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"
                v-model="scope.row.upperLimit"></el-input>
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


    <!-- 添加或修改产品对话框 -->
    <el-dialog :title="attributeTitle" :visible.sync="attributeOpen" width="1200px">
      <el-form ref="attributeForm" :inline="true"    :model="attributeForm" :rules="attributeRules" label-width="120px">
        <el-table :data="attributeForm.attributeList"
                  row-key="id"
                  default-expand-all
                  :tree-props="{children: 'children'}">
          <el-table-column label="属性key" align="center" prop="attributeList.attributeKey">
            <template slot-scope="scope">
              <el-input type="text" placeholder="请输入属性key" v-model="scope.row.attributeKey"  @input="attributeChange()"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="属性value" align="center" prop="attributeValue">
            <template slot-scope="scope">
              <el-input type="text" placeholder="请输入属性值" v-model="scope.row.attributeValue"  @input="attributeChange()"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="属性说明" align="center" prop="attributeName">
            <template slot-scope="scope">
              <el-input type="text" placeholder="请输入属性说明" v-model="scope.row.attributeName"  @input="attributeChange()"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template   slot-scope="scope">
              <el-button  v-if="scope.row.show" size="mini" type="text" icon="el-icon-add" @click="addAttributeChildren(scope.row)">添加子项</el-button>
              <el-button  v-else="scope.row.show" size="mini" type="text" icon="el-icon-add">&emsp;&emsp;&emsp;&emsp;</el-button>
              <el-button  v-if="scope.row.show"  size="mini" type="text" icon="el-icon-delete" @click="deleteAttribute(scope.row)">删除</el-button>
              <el-button  v-else="scope.row.show" size="mini" type="text" icon="el-icon-delete" @click="deleteAttributeChildren(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="right-float-top pt30">
          <el-button type="primary" icon="el-icon-plus" circle @click="addAttribute"></el-button>
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
  import {
    listProduct,
    getProduct,
    delProduct,
    addProduct,
    updateProduct,
    updateAttributeProduct,
    exportProduct
  } from "@/api/business/matrix_product";
  import * as qpShop from '@/api/global-cache'
  import * as shuxinTool from '@/utils/shuxin-tool'



  export default {
    name: "Product",
    data() {
      return {
        styleAssemblyList: [{
          name: '1_单个挂件',
          id: 1
        }, {
          name: '2_推荐抽屉',
          id: 2
        }, {
          name: '3_复活推荐',
          id: 3
        }, {
          name: '4_猜你喜欢',
          id: 4
        }, {
          name: '5_更多好玩',
          id: 5
        }, {
          name: '6_全屏展示',
          id: 6
        }],
        advertList: [],
        //广告导出配置数据
        advertExportList: [],
        isSubmit: false,
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
        // 产品表格数据
        productList: [],
        // 弹出层标题
        title: "",
        attributeTitle:"",

        // 是否显示弹出层
        open: false,
        //是否显示广告配置
        isShow:false,
        // 是否显示属性弹出层
        attributeOpen:false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          appId: undefined,
          isDel: 0,
          gameName: undefined,
          styleAssembly: undefined,
          guideLevel: undefined,
          platformType: undefined
        },
        // 表单参数
        form: {},
        //选中的产品Id
        productId:0,

        attributeForm:{},

        // 表单校验
        rules: {

          appId: [{
            required: true,
            message: "游戏APPID不能为空",
            trigger: "blur"
          }],
          gameName: [{
            required: true,
            message: "小游戏名称不能为空",
            trigger: "blur"
          }],
          styleAssembly: [{
            required: true,
            message: "样式组件不能为空",
            trigger: "blur"
          }],
          guideLevel: [{
            required: true,
            message: "诱导点击级别",
            trigger: "change"
          }],
          platformType: [{
            required: true,
            message: "所属平台不能为空",
            trigger: "change"
          }],
          isCheck: [{
            required: true,
            message: "审核状态",
            trigger: "change"
          }],
          isCheckA: [{
            required: true,
            message: "审核状态",
            trigger: "change"
          }],
        },


        // 表单校验
        attributeRules: {

          attributeName: [{
            required: true,
            message: "属性名不能为空",
            trigger: "blur"
          }],
          attributeKey: [{
            required: true,
            message: "属性key不能为空",
            trigger: "blur"
          }],
        },

        dictCache: qpShop.globalCache.shopCache.dictCache,
      };
    },
    created() {
      // this.advertInputSelect();
      this.getList();
    },
    methods: {


      /** 查询产品列表 */
      getList() {
        this.loading = true;
        listProduct(this.queryParams).then(response => {
          this.productList = this.shuxinDataFormat("matrix_product", response.rows);

          for (var i=0; i < this.productList.length; i++) {
            console.log("this.productList.styleAssembly=", this.productList[i].styleAssembly)
            var styleAssemblyName = [];
            var styleAssembly = this.productList[i].styleAssembly.split(",");
            for (let item of styleAssembly) {
              switch (parseInt(item)) {
                case 1:
                  styleAssemblyName.push("1_单个挂件")
                  break;
                case 2:
                  styleAssemblyName.push("2_推荐抽屉")
                  break;
                case 3:
                  styleAssemblyName.push("3_复活推荐")
                  break;
                case 4:
                  styleAssemblyName.push("4_猜你喜欢")
                  break;
                case 5:
                  styleAssemblyName.push("5_更多好玩")
                  break;
                case 6:
                  styleAssemblyName.push("6_全屏展示")
                  break;
              }
            }
            this.productList[i].styleAssemblyName = styleAssemblyName.join(" , ")
          }
          this.total = response.total;
          this.loading = false;
        });
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
          remark: undefined,
          appId: undefined,
          isDel: 0,
          gameName: undefined,
          styleAssembly: undefined,
          guideLevel: undefined,
          createBy: undefined,
          createTime: undefined,
          updateBy: undefined,
          updateTime: undefined,
          platformType: undefined,
          inGopdList: [],
        };
        this.resetForm("form");
      },

   // 表单重置
      reset() {
        this.form = {
          id: undefined,
          remark: undefined,
          appId: undefined,
          isDel: 0,
          gameName: undefined,
          styleAssembly: undefined,
          guideLevel: undefined,
          createBy: undefined,
          createTime: undefined,
          updateBy: undefined,
          updateTime: undefined,
          platformType: undefined,
          inGopdList: [],
        };
        this.resetForm("form");
      },



      // 取消按钮
      cancelAttribute() {
        this.attributeOpen = false;
        this.attributeReset();
      },



      // 表单重置
      attributeReset() {
        this.attributeForm = {
          id:undefined,
          attributeList: []
        };
        this.resetForm("attributeForm");
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
        this.isSubmit = false;
        this.reset();
        this.open = true;
        this.isShow=false;
        this.title = "添加产品";
        //保留所有值
        var styleAssembly = [];
        for (let item of this.styleAssemblyList) {
          styleAssembly.push(item.id)
        }
        console.log("styleAssemblyqqq=", styleAssembly)
        this.form.styleAssembly = styleAssembly
        var guide_level = this.dictCache.guide_level.details;
        this.form.guideLevel = guide_level[0].dictValue;

        var platformType = this.dictCache.platform_type.details;
        this.form.platformType = platformType[0].dictValue;

        var isCheck = this.dictCache.is_check.details;
        this.form.isCheck = isCheck[0].dictValue;

        var isCheckA = this.dictCache.is_check.details;
        this.form.isCheckA = isCheckA[0].dictValue;

        this.advertInputSelect(this.form.platformType);
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.isSubmit = false;
        this.reset();
        const id = row.id || this.ids
        getProduct(id).then(response => {
          this.form = response.data;
          var styleAssembly = this.form.styleAssembly.split(",");
          var styleAssemblyValue = [];
          for (let item of styleAssembly) {
            styleAssemblyValue.push(parseInt(item))
          }
          console.log("styleAssembly=", styleAssemblyValue)
          this.form.styleAssembly = styleAssemblyValue
           this.productId = id;
          this.advertInputSelect(this.form.platformType);
          this.isShow = true;
          this.open = true;
          this.title = "修改产品";
          this.advertExportList=response.data.advertExportList;
        });
      },


      /** 修改按钮操作 */
      attributeUpdate(row) {
        this.isSubmit = false;
        this.attributeReset();
        const id = row.id ;
        getProduct(id).then(response => {
          var obj={
            id:row.id,
            attributeList:response.data.attributeList
          }
          this.attributeForm = obj;
          console.log("this.attributeForm",this.attributeForm);
          this.attributeOpen = true;
          this.attributetitle = "修改产品";
        });
      },



   /** 提交按钮 */
      submitForm: function() {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.isSubmit) {
              return;
            }
            this.isSubmit = true;
            this.form.styleAssembly = this.form.styleAssembly.join(",");
            if (this.form.id != undefined) {
              updateProduct(this.form).then(response => {
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
              addProduct(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("新增成功");
                  this.open = false;
                  this.getList();
                } else {
                  this.isSubmit = false;
                  this.msgError(response.msg);
                }
              });
            }
          }
        });
      },


      /** 提交按钮 */
      submitAttributeForm: function() {
        this.$refs["attributeForm"].validate(valid => {
          if (valid) {
            if (this.isSubmit) {
              return;
            }
            this.isSubmit = true;

            console.log("this.attributeForm",this.attributeForm);

            updateAttributeProduct(this.attributeForm).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.attributeOpen = false;
              } else {
                this.isSubmit = false;
                this.msgError(response.msg);
              }
            });
          }
        });
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        var ids = [];
        row.id ? ids.push(row.id) : ids = this.ids;
        this.$confirm('是否确认删除产品编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delProduct(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
      },
      /** 导出按钮操作 */
      handleExport() {
        const queryParams = this.queryParams;
        this.$confirm('是否确认导出所有产品数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportProduct(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
      },


      // 添加商品
      addGoodsBtn() {
        var obj = {
          id: shuxinTool.uuid(),
          advertId: '',
          advertPath: '',
          weight: '5',
          upperLimit: '100',
        }
        this.form.inGopdList.push(obj)
      },


      // 添加商品
      addAttribute() {
        var obj = {
          id: shuxinTool.uuid(),
          attributeName: '',
          attributeKey: '',
          attributeValue: '',
          show:true
        }
        if(this.attributeForm.attributeList==null){
          this.attributeForm.attributeList=[];
        }
        this.attributeForm.attributeList.push(obj)
      },


      attributeChange(){
        console.log("改变了数据");
        this.addAttribute();
        this.attributeForm.attributeList.pop();
      },


      // 添加商品
      addAttributeChildren(row) {
        var obj = {
          id: shuxinTool.uuid(),
          attributeName: '',
          attributeKey: '',
          attributeValue: '',
          fid:row.id,
          show:false
        }
        if(row.children==null){
          row.children=[];
        }
        row.children.push(obj);
        for (var i = 0; i < this.attributeForm.attributeList.length; i++) {
          if (row.id == this.attributeForm.attributeList[i].id) {
            this.attributeForm.attributeList[i]=row;
          }
        }
        this.attributeChange();
      },



      // 删除单个商品
      deleteAttribute(row) {
        if (shuxinTool.isEmpty(this.attributeForm.attributeList)) {
          return;
        }
        for (var i = 0; i < this.attributeForm.attributeList.length; i++) {
          if (row.id == this.attributeForm.attributeList[i].id) {
            this.attributeForm.attributeList.splice(i, 1);
            return;
          }
        }
      },



      // 删除单个商品
      deleteAttributeChildren(row) {
        console.log("row",row);
        for (var i = 0; i < this.attributeForm.attributeList.length; i++) {
          if (row.fid == this.attributeForm.attributeList[i].id) {
            var childrenList=this.attributeForm.attributeList[i].children;
            for (var j = 0; j < childrenList.length; j++) {
              if (row.id == childrenList[j].id) {
                childrenList.splice(j, 1);
                this.attributeForm.attributeList[i].children=childrenList;
                break;
              }
            }
            break;
          }
        }
        this.addAttribute();
        this.attributeForm.attributeList.pop();
      },


      // 删除单个商品
      deleteGoodsBtn(row) {
        if (shuxinTool.isEmpty(this.form.inGopdList)) {
          return;
        }
        for (var i = 0; i < this.form.inGopdList.length; i++) {
          if (row.id == this.form.inGopdList[i].id) {
            this.form.inGopdList.splice(i, 1);
            return;
          }
        }
      },
      // 商场下拉数据
      advertInputSelect(value) {
        var that = this;
        var params = {
          platformType: value,
          productId:this.productId
        }
        console.log("JSON.stringify(params)=",JSON.stringify(params));
        this.inputSelectList("t_filter", "advert_export_id", null, function(data) {
          console.log("data=",data);
           that.advertList = data;
        }, JSON.stringify(params));
      },




      selectChanged(value) {
        this.form.inGopdList=[];
        this.advertInputSelect(value);
      },


      selectAdvertExport(value){
        for(var i=0;i<this.form.inGopdList.length;i++){
          if(value==this.form.inGopdList[i].advertId){
              this.form.inGopdList[i].advertPath=this.selectAdvertPath(value);
          }
        }
      },

      selectAdvertPath(value){
        var advertPath="";
        for(var i=0;i<this.advertExportList.length;i++){
          if(value==this.advertExportList[i].advertId){
              advertPath=this.advertExportList[i].advertPath
              break;
          }
        }
        return advertPath;
      }

    }
  };
</script>
<style>
  .el-input{
    width: 80%;
  }

  .el-table__expand-icon{
    float:left;
    margin-top: 10px;
  }

</style>
