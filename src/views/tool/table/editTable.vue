<template>
  <el-card v-loading="loading">
    <el-tabs v-model="activeName">
      <el-tab-pane label="基本信息" name="basic">
        <basic-info-form ref="basicInfo" :info="info" />
      </el-tab-pane>
      <el-tab-pane label="字段信息" name="cloum" >
        <el-table :data="columns" :max-height="tableHeight">
          <el-table-column label="序号" type="index" min-width="5%" />
          <el-table-column label="字段列名" prop="columnName" min-width="12%">
          </el-table-column>
          <el-table-column label="字段别名" prop="columnAlias" min-width="12%">
          </el-table-column>
          <el-table-column label="字段描述" prop="columnComment" min-width="15%">
          </el-table-column>
          <el-table-column label="数据类型" prop="dataTypeName" min-width="11%">
          </el-table-column>
          <el-table-column label="最小长度" prop="minLength" min-width="5%">
          </el-table-column>
          <el-table-column label="最大长度" prop="maxLength" min-width="7%">
          </el-table-column>
          <el-table-column label="名称字段" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox disabled true-label="1" v-model="scope.row.nameColumn"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="主键字段" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox disabled true-label="1" v-model="scope.row.idColumn"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="新增必填" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox disabled true-label="1" v-model="scope.row.roInsert"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="更新必填" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox disabled true-label="1" v-model="scope.row.roUpdate"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="全文搜索" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox disabled true-label="1" v-model="scope.row.search"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="默认值" prop="defaultValue" min-width="10%">
          </el-table-column>
          <el-table-column label="数据格式化" prop="dataFormat" min-width="10%">
          </el-table-column>
          <el-table-column label="虚拟字段" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox disabled true-label="1" v-model="scope.row.virtual"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="关联表" prop="refTableName" min-width="10%">
          </el-table-column>
          <el-table-column label="关联过滤条件" prop="refFilter" min-width="10%">
          </el-table-column>
          <el-table-column label="关联字典" prop="refDictName" min-width="12%">
          </el-table-column>
          <el-table-column label="关联SQL" prop="refSql" min-width="10%">
          </el-table-column>
          <el-table-column label="操作" align="center" width="80">
            <template slot-scope="scope">
              <el-button
                type="text"
                size="small"
                icon="el-icon-delete"
                @click="handleColumnDelete(scope.$index, scope.row)"
                v-hasPermi="['tool:gen:remove']"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <el-form label-width="100px">
      <el-form-item style="text-align: center;margin-left:-100px;margin-top:10px;">
        <el-button icon="el-icon-plus" @click="openAddColumn()">添加字段</el-button>
        <el-button type="primary" @click="submitForm()">提交</el-button>
        <el-button @click="close()">返回</el-button>
      </el-form-item>
    </el-form>
    <add-column ref="columnDialog" @ok="handleAddColumn"></add-column>
  </el-card>
</template>
<script>
import { createTable,getSysTable,listSysTable, createOrEditSysTable,delSysTableColumn,addSysTableColumn  } from "@/api/tool/table";
import { optionselect as getDictOptionselect } from "@/api/system/dict/type";
import basicInfoForm from "./basicInfoForm";
import addColumn from "./addColumn";



export default {
  name: "SysEdit",
  components: {
    basicInfoForm,
    addColumn
  },
  data() {
    return {
      // 选中选项卡的 name
      activeName: "basic",
      //进度条
      loading:false,
      //表id
      tableId:'',
      // 表格的高度
      tableHeight: document.documentElement.scrollHeight - 245 + "px",
      // 表列信息
      columns: [],
      //数据字典map
      dictMap:{},
      dataTypeMap:{
        "AUTO":"自增主键",
        "NUM":"整数",
        "FLOAT":"小数",
        "TEXT":"文本",
        "IMG":"图片",
        "FILE":"文件",
        "PWD":"密码",
        "BOOL":"是非",
        "DATE":"日期",
        "TIME":"时间",
        "DATE_TIME":"日期时间",
        "TEXT_AREA":"富文本"
      },
      //所有表名称map
      tableMap:{},
      // 表详细信息
      info: {},
      //操作类型
      type:'add'
    };
  },
  created() {
    const { tableId } = this.$route.query;
    this.tableId=tableId;
    if(this.tableId){
      this.reset();
      this.type='edit'
      this.loadData();
    }else{
      this.type='add'
    }
  },
  methods: {
    //删除字段
    handleColumnDelete(index, row){
      this.columns.splice(index,1)
     /* this.loading=true;
      delSysTableColumn(row.columnId).then(res=>{
        this.loading=false;
        this.columns.splice(index, 1);
      }).catch(err=>{
         this.loading=false;
      }) */
    },
    /**
     * 查询字典下拉列表
     * 获取所有表
     * 获取表详细信息
     *
     */
    loadData(){
      Promise.all([getDictOptionselect(),listSysTable(), getSysTable(this.tableId)]).then(res=>{
        console.log("Promise res=",res)
        //字典map
        var dictList=res[0].data
        for(var i in dictList){
          this.dictMap[dictList[i].dictType]=dictList[i].dictName
        }

        //获取所有表
        var tableList=res[1].rows
        for(var i in tableList){
          this.tableMap[tableList[i].tableName]=tableList[i].tableComment
        }

        //表详细信息
        var tableDetail=res[2].data
        for(var i in tableDetail.columns){
          this.fillColumnData(tableDetail.columns[i])
        }
        this.columns = tableDetail.columns;
        this.info = tableDetail;
        this.loading=false;
        console.log("表信息：",this.info,"字段列表：",this.columns)
      });
    },
    //补全字段显示用的参数
    fillColumnData(column){
      column.refDictName=this.dictMap[column.refDict]
      column.dataTypeName=this.dataTypeMap[column.dataType]
      column.refTableName=this.tableMap[column.refTable]
    },
    //添加字段的回调方法
    handleAddColumn(value){
      this.fillColumnData(value)
      value.tableId=this.tableId
      console.log("处理新添加的字段：",value)
      this.columns.push(value)


      // this.loading=true;
      /* addSysTableColumn(value).then(res=>{
        this.loadData()
      }).catch(err=>{
         this.loading=false;
      }) */
    },
    /** 添加字段 */
    openAddColumn() {
      this.activeName="cloum";
      this.$refs.columnDialog.show()
    },
    /** 提交按钮 */
    submitForm() {
      const basicForm = this.$refs.basicInfo.$refs.basicInfoForm;
      Promise.all([basicForm].map(this.getFormPromise)).then(res => {
        const validateResult = res.every(item => !!item);
        if (validateResult) {
          const genTable = Object.assign({}, basicForm.model);
          genTable.columns = this.columns;
          genTable.params = {
            treeCode: genTable.treeCode,
            treeName: genTable.treeName,
            treeParentCode: genTable.treeParentCode
          };

          console.log('表信息：',genTable)

         createOrEditSysTable(genTable).then(res => {
           this.msgSuccess(res.msg);
           if (res.code === 200) {
             this.close();
           }
         });

        } else {
          this.msgError("表单校验未通过，请重新检查提交内容");
        }
      });
    },
    getFormPromise(form) {
      return new Promise(resolve => {
        form.validate(res => {
          resolve(res);
        });
      });
    },
    /** 关闭按钮 */
    close() {
      this.$store.dispatch("tagsView/delView", this.$route);
      this.$router.push({ path: "/tool/table", query: { t: Date.now()}})
    },
    //重置
    reset(){
      this.columns=[];
      this.info={};
    }
  }
};
</script>
