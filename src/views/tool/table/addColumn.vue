<template>
  <!-- 添加字段 -->
  <el-dialog title="添加字段" :visible.sync="visible" width="800px" top="5vh" append-to-body>
    <el-form :model="columnData" :inline="true" label-width="120px">
      <el-form-item label="字段名" >
        <el-input
          v-model="columnData.columnName"
          placeholder="请输入字段名"
          clearable
          size="small"
        />
      </el-form-item>
      <el-form-item label="字段别名" >
        <el-input
          v-model="columnData.columnAlias"
          placeholder="请输入字段别名"
          clearable
          size="small"
        />
      </el-form-item>
      <el-form-item label="字段注释">
        <el-input
          v-model="columnData.columnComment"
          placeholder="请输入注释"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="columnData.dataType">
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
      </el-form-item>
      <el-form-item label="最小长度">
        <el-input
          v-model="columnData.minLength"
          placeholder="请输入表描述"
          clearable
          size="small"
        />
      </el-form-item>
      <el-form-item label="最大长度">
        <el-input
          v-model="columnData.maxLength"
          placeholder="请输入表描述"
          clearable
          size="small"
        />
      </el-form-item>
      <el-form-item label="设为主键">
        <el-checkbox true-label="1" v-model="columnData.idColumn"></el-checkbox>
      </el-form-item>
      <el-form-item label="新增时必填">
        <el-checkbox true-label="1" v-model="columnData.roInsert"></el-checkbox>
      </el-form-item>
      <el-form-item label="更新时必填">
        <el-checkbox true-label="1" v-model="columnData.roUpdate"></el-checkbox>
      </el-form-item>
      <el-form-item label="开启全文搜索">
        <el-checkbox true-label="1" v-model="columnData.search"></el-checkbox>
      </el-form-item>
      <el-form-item label="设为名称字段">
        <el-checkbox true-label="1" v-model="columnData.nameColumn"></el-checkbox>
      </el-form-item>
      <el-form-item label="虚拟字段">
        <el-checkbox true-label="1" v-model="columnData.virtual"></el-checkbox>
      </el-form-item>
      <br />
      <el-form-item label="默认值">
        <el-input
          v-model="columnData.defaultValue"
          placeholder="请输入默认值"
          clearable
          size="small"
        />
      </el-form-item>
      <el-form-item label="数据格式化">
        <el-input
          v-model="columnData.dataFormat"
          placeholder="请输入数据格式化"
          clearable
          size="small"
        />
      </el-form-item>
      <el-form-item label="关联表">
        <el-select v-model="columnData.refTable" clearable filterable placeholder="请选择">
          <el-option
            v-for="dict in tableList"
            :key="dict.tableName"
            :label="dict.tableComment"
            :value="dict.tableName">
            <span style="float: left">{{ dict.tableComment }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ dict.tableName }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关联过滤条件">
        <el-select v-model="columnData.refFilter" clearable filterable placeholder="请选择">
          <el-option
            v-for="dict in tablesOptions"
            :key="dict.tableName"
            :label="dict.tableComment"
            :value="dict.tableName">
            <span style="float: left">{{ dict.tableComment }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ dict.tableName }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关联字典">
        <el-select v-model="columnData.refDict" clearable filterable placeholder="请选择">
         <el-option
             v-for="dict in dictOptions"
             :key="dict.dictType"
             :label="dict.dictName"
             :value="dict.dictType">
             <span style="float: left">{{ dict.dictName }}</span>
             <span style="float: right; color: #8492a6; font-size: 13px">{{ dict.dictType }}</span>
         </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关联SQL">
        <el-input
          v-model="columnData.refSql"
          placeholder="请输入数据格式化"
          clearable
          size="small"
        ></el-input>
      </el-form-item>
        <el-form-item label="排序规则">
            <el-select v-model="columnData.orderByType" placeholder="请选择排序方式">
                <el-option label="升序" value="asc"></el-option>
                <el-option label="降序" value="desc"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item>
          <el-input type="age" placeholder="请输入执行顺序" v-model.number="columnData.orderBySeq" autocomplete="off"></el-input>
        </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleImportTable">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { listSysTable } from "@/api/tool/table";
import { optionselect as getDictOptionselect } from "@/api/system/dict/type";

export default {
  data() {
    return {
      // 遮罩层
      visible: false,
      // 选中数组值
      tables: [],
      // 总条数
      total: 0,
      // 字典列表
      tablesOptions: [],
      // 字典列表
      dictOptions: [],
      // 表列表数据
      tableList: [],
      // 查询参数
      columnData: {}
    };
  },
  methods: {
    // 显示弹框
    show() {
      this.getList();
      this.visible = true;
    },
    // 查询表数据
    getList() {
      listSysTable({}).then(res => {
        if (res.code === 200) {
          this.tableList = res.rows;
        }
      });
      /** 查询字典下拉列表 */
      getDictOptionselect().then(response => {
        this.dictOptions = response.data;
      });
    },
    /** 导入按钮操作 */
    handleImportTable() {
      console.log("添加字段 this.columnData=",this.columnData)
      this.visible = false;
      this.$emit("ok",this.columnData);
    }
  }
};
</script>
