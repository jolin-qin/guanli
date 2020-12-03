<template>
  <!-- 校验表 -->
  <el-dialog :title="title" :visible.sync="visible" width="800px" top="5vh" append-to-body :close-on-click-modal="false">
    <el-form :model="formData">
      <el-form-item label="校验类型" prop="checkType">
        <el-select v-model="formData.checkType">
          <el-option label="修改" value="修改" />
          <el-option label="新增" value="新增" />
          <el-option label="新增与修改" value="新增与修改" />
          <el-option label="删除" value="删除" />
        </el-select>
      </el-form-item>
      <el-form-item label="校验公式" prop="checkFormula">
        <el-input type="textarea" placeholder="请输入校验公式" v-model="formData.checkFormula" maxlength="500" show-word-limit></el-input>
      </el-form-item>
      <el-form-item label="失败提示" prop="checkMsg">
        <el-input type="textarea" placeholder="校验失败后返回给前端的错误提示" v-model="formData.checkMsg" maxlength="255" show-word-limit></el-input>
      </el-form-item>
      <el-form-item><el-button type="primary" icon="el-icon-plus" size="mini" @click="submitForm">添加规则</el-button></el-form-item>
    </el-form>
    <el-row>
      <el-table :data="dataList" height="500px" :row-class-name="tableRowClassName">
        <el-table-column label="执行顺序" type="index" align="center" width="80"></el-table-column>
        <el-table-column label="校验类型" align="center" prop="checkType">
        </el-table-column>
        <el-table-column label="校验公式" align="center" prop="checkFormula"></el-table-column>
        <el-table-column label="失败提示" align="center" prop="checkMsg"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="small" icon="el-icon-sort-up" @click="handleMoveUp(scope.$index, scope.row)">上移</el-button>
            <el-button type="text" size="small" icon="el-icon-delete" @click="handleDelete(scope.$index, scope.row)" v-hasPermi="['tool:gen:remove']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleImportTable">保 存</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addCheckTable,listCheckTable } from '@/api/tool/table';
export default {
  data() {
    return {
      //标题
      title: '',
      // 遮罩层
      visible: false,
      //操作类型
      checkType:{

      },
      // 表数据
      dataList: [],
      // 查询参数
      formData: {},
      //传递过来的表数据
      tableData: {}
    };
  },
  methods: {
    //把每一行的索引放进row
    tableRowClassName ({row, rowIndex}) {
      row.checkSeq = rowIndex;
      return '';
    },
    // 显示弹框
    show(row) {
      console.log('校验表弹窗1 --row:', row);
      this.visible = true;
      this.title = row.tableName + '表的校验规则';
      this.tableData = row;
      this.loadData();
    },
    loadData(){
      listCheckTable(this.tableData).then(res => {
        this.dataList=res.data
      });
    },
    // 重置
    reset() {
      this.dataList = [];
      this.formData = {};
    },
    //添加规则
    submitForm() {
      var data = Object.assign({}, this.formData);
      this.dataList.push(data);
      console.log("添加规则:",this.dataList)
    },
    // 上移字段
    handleMoveUp(index, row) {
        var f = this.dataList.splice(index, 1)[0];
        this.dataList.splice(index-1, 0, f);
    },
    // 删除字段
    handleDelete(index, row) {
      this.dataList.splice(index, 1);
    },
    /** 创建校验规则按钮操作 */
    handleImportTable() {
      console.log('创建校验规则1：', this.tableData, this.dataList);
var params={
        tableName:this.tableData.tableName,
        columns:this.dataList
      }

      console.log('创建校验规则2：params=', params);
      addCheckTable(params).then(res => {
        this.msgSuccess(res.msg);
        if (res.code === 200) {
          this.visible = false;
        }
      });
    }
  }
};
</script>
