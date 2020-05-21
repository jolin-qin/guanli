<template>
  <el-card>
    <el-tabs v-model="activeName">
      <el-tab-pane label="基本信息" name="basic">
        <basic-info-form ref="basicInfo" :info="info" />
      </el-tab-pane>
      <el-tab-pane label="字段信息" name="cloum">
        <el-table :data="columns" :max-height="tableHeight">
          <el-table-column label="序号" type="index" min-width="5%" />
          <el-table-column label="字段列名" min-width="15%">
            <template slot-scope="scope">
              <el-input v-model="scope.row.columnName"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="字段描述" min-width="15%">
            <template slot-scope="scope">
              <el-input v-model="scope.row.columnComment"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="字段别名" min-width="15%">
            <template slot-scope="scope">
              <el-input v-model="scope.row.columnAlias"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="数据类型" min-width="11%">
            <template slot-scope="scope">
              <el-select v-model="scope.row.dataType">
                <el-option label="自增" value="AUTO" />
                <el-option label="整数" value="NUM" />
                <el-option label="小数" value="FLOAT" />
                <el-option label="字符串" value="TEXT" />
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
          <el-table-column label="最小长度" min-width="5%">
            <template slot-scope="scope">
              <el-input v-model="scope.row.minLength"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="最大长度" min-width="7%">
            <template slot-scope="scope">
              <el-input v-model="scope.row.maxLength"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="名称字段" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox true-label="1" v-model="scope.row.nameColumn"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="主键字段" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox true-label="1" v-model="scope.row.idColumn"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="新增必填" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox true-label="1" v-model="scope.row.roInsert"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="更新必填" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox true-label="1" v-model="scope.row.roUpdate"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="全文搜索" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox true-label="1" v-model="scope.row.search"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="默认值" min-width="10%">
            <template slot-scope="scope">
              <el-input v-model="scope.row.defaultValue"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="数据格式化" min-width="10%">
            <template slot-scope="scope">
              <el-input v-model="scope.row.dataFormat"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="虚拟字段" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox true-label="1" v-model="scope.row.virtual"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="关联表" min-width="20%">
            <template slot-scope="scope">
              <el-select v-model="scope.row.refTable" clearable filterable placeholder="请选择">
                <el-option
                  v-for="dict in tablesOptions"
                  :key="dict.tableName"
                  :label="dict.tableComment"
                  :value="dict.tableName">
                  <span style="float: left">{{ dict.tableComment }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ dict.tableName }}</span>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="关联过滤条件" min-width="10%">
            <template slot-scope="scope">
              <el-input v-model="scope.row.refFilter"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="关联字典" min-width="12%">
            <template slot-scope="scope">
              <el-select v-model="scope.row.refDict" clearable filterable placeholder="请选择">
                <el-option
                  v-for="dict in dictOptions"
                  :key="dict.dictType"
                  :label="dict.dictName"
                  :value="dict.dictType">
                  <span style="float: left">{{ dict.dictName }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ dict.dictType }}</span>
              </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="关联SQL" min-width="10%">
            <template slot-scope="scope">
              <el-input v-model="scope.row.refSql"></el-input>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <el-form label-width="100px">
      <el-form-item style="text-align: center;margin-left:-100px;margin-top:10px;">
        <el-button @click="addColumn()">添加字段</el-button>
        <el-button type="primary" @click="submitForm()">提交</el-button>
        <el-button @click="close()">返回</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script>
import { getSysTable,tableOptionSelect, updateSysTable } from "@/api/tool/table";
import { optionselect as getDictOptionselect } from "@/api/system/dict/type";
import basicInfoForm from "./basicInfoForm";
export default {
  name: "SysEdit",
  components: {
    basicInfoForm
  },
  data() {
    return {
      // 选中选项卡的 name
      activeName: "basic",
      // 表格的高度
      tableHeight: document.documentElement.scrollHeight - 245 + "px",
      // 表列信息
      columns: [],
      // 字典信息
      dictOptions: [],
      //所有表
      tablesOptions: [],
      // 表详细信息
      info: {}
    };
  },
  beforeCreate() {
    const { tableId } = this.$route.query;
    if (tableId) {
      // 获取表详细信息
      getSysTable(tableId).then(res => {
        this.columns = res.data.columns;
        this.info = res.data;
      });
      /** 查询表下拉列表 */
      tableOptionSelect().then(response => {
        this.tablesOptions = response.data;
      });
      /** 查询字典下拉列表 */
      getDictOptionselect().then(response => {
        this.dictOptions = response.data;
      });
    }
  },
  methods: {
    /** 添加字段 */
    addColumn() {
      this.activeName="cloum";
      this.columns.push({tableId:this.info.tableId,tableName:this.info.tableName});
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
          updateSysTable(genTable).then(res => {
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
    }
  }
};
</script>
