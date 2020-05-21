<template>
  <el-card>
    <el-tabs v-model="activeName">
      <el-tab-pane label="基本信息" name="basic">
        <basic-info-form ref="basicInfo" :info="info" />
      </el-tab-pane>
      <el-tab-pane label="字段信息" name="cloum">
        <el-table :data="cloumns" :max-height="tableHeight">
          <el-table-column label="序号" type="index" min-width="5%" />
          <el-table-column
            label="字段列名"
            prop="columnName"
            min-width="10%"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="字段描述" min-width="10%">
            <template slot-scope="scope">
              <el-input v-model="scope.row.columnComment"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="字段别名" min-width="10%">
            <template slot-scope="scope">
              <el-input v-model="scope.row.columnAlias"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="数据类型" min-width="10%">
            <template slot-scope="scope">
              <el-select v-model="scope.row.dataType">
                <el-option label="整数" value="NUM" />
                <el-option label="小数" value="FLOAT" />
                <el-option label="文本" value="TEXT" />
                <el-option label="图片" value="IMG" />
                <el-option label="文件" value="FILE" />
                <el-option label="密码" value="PWD" />
                <el-option label="是非" value="BOOL" />
                <el-option label="日期" value="DATE" />
                <el-option label="时间" value="TIME" />
                <el-option label="日期时间" value="DATE_TIME" />
                <el-option label="富文本" value="TEXT_AREA" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="Java类型" min-width="10%">
            <template slot-scope="scope">
              <el-select v-model="scope.row.javaType">
                <el-option label="Long" value="Long" />
                <el-option label="String" value="String" />
                <el-option label="Integer" value="Integer" />
                <el-option label="Double" value="Double" />
                <el-option label="BigDecimal" value="BigDecimal" />
                <el-option label="Date" value="Date" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="Java属性" min-width="10%">
            <template slot-scope="scope">
              <el-input v-model="scope.row.javaField"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="主键" min-width="5%">
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
          <el-table-column label="全文检索" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox true-label="1" v-model="scope.row.search"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="显示类型" min-width="10%">
            <template slot-scope="scope">
              <el-select v-model="scope.row.htmlType">
                <el-option label="文本框" value="input" />
                <el-option label="文本域" value="textarea" />
                <el-option label="下拉框" value="select" />
                <el-option label="单选框" value="radio" />
                <el-option label="复选框" value="checkbox" />
                <el-option label="日期控件" value="datetime" />
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="生成信息" name="genInfo">
        <gen-info-form ref="genInfo" :info="info" />
      </el-tab-pane>
    </el-tabs>
    <el-form label-width="100px">
      <el-form-item style="text-align: center;margin-left:-100px;margin-top:10px;">
        <el-button type="primary" @click="submitForm()">提交</el-button>
        <el-button @click="close()">返回</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script>
import { getGenTable, updateGenTable } from "@/api/tool/gen";
import { optionselect as getDictOptionselect } from "@/api/system/dict/type";
import basicInfoForm from "./basicInfoForm";
import genInfoForm from "./genInfoForm";
export default {
  name: "GenEdit",
  components: {
    basicInfoForm,
    genInfoForm
  },
  data() {
    return {
      // 选中选项卡的 name
      activeName: "cloum",
      // 表格的高度
      tableHeight: document.documentElement.scrollHeight - 245 + "px",
      // 表列信息
      cloumns: [],
      // 字典信息
      dictOptions: [],
      // 表详细信息
      info: {}
    };
  },
  beforeCreate() {
    const { tableId } = this.$route.query;
    if (tableId) {
      // 获取表详细信息
      getGenTable(tableId).then(res => {
        this.cloumns = res.data.info.columns;
        this.info = res.data.info;
      });
      /** 查询字典下拉列表 */
      getDictOptionselect().then(response => {
        this.dictOptions = response.data;
      });
    }
  },
  methods: {
    /** 提交按钮 */
    submitForm() {
      const basicForm = this.$refs.basicInfo.$refs.basicInfoForm;
      const genForm = this.$refs.genInfo.$refs.genInfoForm;
      Promise.all([basicForm, genForm].map(this.getFormPromise)).then(res => {
        const validateResult = res.every(item => !!item);
        if (validateResult) {
          const genTable = Object.assign({}, basicForm.model, genForm.model);
          genTable.columns = this.cloumns;
          genTable.params = {
            treeCode: genTable.treeCode,
            treeName: genTable.treeName,
            treeParentCode: genTable.treeParentCode
          };
          updateGenTable(genTable).then(res => {
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
      this.$router.push({ path: "/tool/gen", query: { t: Date.now()}})
    }
  }
};
</script>
