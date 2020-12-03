<template>
  <!-- 设计表 -->
  <el-dialog title="新建表" :visible.sync="visible" width="800px" top="5vh" append-to-body>
    <el-form :model="dbTable" :inline="true">
      <el-form-item label="表名称" prop="tableName"><el-input v-model="dbTable.tableName" placeholder="请输入表名称" clearable size="small" /></el-form-item>
      <el-form-item label="表描述" prop="tableComment"><el-input v-model="dbTable.tableComment" placeholder="请输入表描述" clearable size="small" /></el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="addColumn">添加字段</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="reset">全部清空</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table :data="dbColumnList" height="800px">
        <el-table-column type="index" width="50"></el-table-column>
        <el-table-column label="字段名">
          <template slot-scope="scope">
            <el-input v-model="scope.row.columnName" clearable></el-input>
          </template>
        </el-table-column>
        <el-table-column label="类型">
          <template slot-scope="scope">
            <el-select v-model="scope.row.dataType" @change="handleDataType(scope.row)">
              <el-option label="自增主键" value="AUTO" />
              <el-option label="整数" value="NUM" />
              <el-option label="小数" value="FLOAT" />
              <el-option label="文本" value="TEXT" />
              <el-option label="图片" value="IMG" />
              <el-option label="文件" value="FILE" />
              <el-option label="密码" value="PWD" />
              <el-option label="是非" value="BOOL" />
              <el-option label="年月日" value="DATE" />
              <el-option label="时分秒" value="TIME" />
              <el-option label="完整日期" value="DATE_TIME" />
              <el-option label="富文本" value="TEXT_AREA" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="注释">
          <template slot-scope="scope">
            <el-input v-model="scope.row.columnComment" clearable></el-input>
          </template>
        </el-table-column>
        <el-table-column label="长度">
          <template slot-scope="scope">
            <el-input type="number" v-model="scope.row.maxLength"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="主键" align="center" width="50">
          <template slot-scope="scope">
            <el-checkbox true-label="1" v-model="scope.row.idColumn"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="80">
          <template slot-scope="scope">
            <el-button type="text" size="small" icon="el-icon-delete" @click="handleDelete(scope.$index, scope.row)" v-hasPermi="['tool:gen:remove']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleImportTable">提 交</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createTable } from '@/api/tool/table';
export default {
  data() {
    return {
      // 遮罩层
      visible: false,
      // 表数据
      dbColumnList: [],
      // 查询参数
      dbTable: {}
    };
  },
  methods: {
    // 显示弹框
    show() {
      this.visible = true;
    },
    // 重置
    reset() {
      this.dbColumnList = [];
      this.dbTable = {};
    },
    addColumn() {
      this.dbColumnList.push({});
    },
    // 处理数据类型
    handleDataType(row) {
      console.log(row);
      if ('AUTO' == row.dataType) {
        for(var i in this.dbColumnList){
         if('1'==this.dbColumnList[i].idColumn){
           this.msgError("自增主键已存在");
           row.dataType='';
           return;
         }
        }
        row.idColumn = '1';
        row.maxLength = 11;
        row.columnComment = '表主键ID';
      }
    },
    // 删除字段
    handleDelete(index, row) {
      this.dbColumnList.splice(index, 1);
    },
    /** 创建表按钮操作 */
    handleImportTable() {
      console.log('创建表：', this.dbTable, this.dbColumnList);
      const genTable = Object.assign({}, this.dbTable);
      genTable.columns = this.dbColumnList;
      console.log('创建表：genTable=', genTable);
      createTable(genTable).then(res => {
        this.msgSuccess(res.msg);
        if (res.code === 200) {
           this.visible = false;
           this.$emit("ok");
        }
      });
    }
  }
};
</script>
