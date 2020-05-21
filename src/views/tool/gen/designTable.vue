<template>
  <el-card>
    <el-tabs v-model="activeName">
      <el-tab-pane label="基本信息" name="basic">
        <basic-info-form ref="basicInfo" :info="info" />
      </el-tab-pane>
      <el-tab-pane label="字段信息" name="cloum">
        <el-table :data="cloumns" :max-height="tableHeight">
          <el-table-column label="序号" type="index" min-width="5%" />
          <el-table-column label="字段名" min-width="10%">
            <template slot-scope="scope">
              <el-input v-model="scope.row.columnName" :disabled="scope.row.disable"></el-input>
            </template>
          </el-table-column>
      <el-table-column label="数据类型" min-width="10%">
        <template slot-scope="scope">
          <el-select v-model="scope.row.dataType" :disabled="scope.row.disable">
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
          <el-table-column label="长度" min-width="10%">
            <template slot-scope="scope">
              <el-input v-model="scope.row.maxLength" :disabled="scope.row.disable"></el-input>
            </template>
          </el-table-column>

          <el-table-column label="主键" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox true-label="1" v-model="scope.row.idColumn" :disabled="scope.row.disable"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="自增" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox true-label="1" v-model="scope.row.isIncrement" :disabled="scope.row.disable"></el-checkbox>
            </template>
          </el-table-column>
        <el-table-column label="字段注释" min-width="10%">
          <template slot-scope="scope">
            <el-input v-model="scope.row.columnComment" :disabled="scope.row.disable"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" min-width="5%">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              icon="el-icon-delete"
              @click="handleDelete(scope.$index,scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <el-form label-width="100px">
      <el-form-item style="text-align: center;margin-left:-100px;margin-top:10px;">
        <el-button type="primary" @click="addColumnShow()">添加字段</el-button>
        <el-button @click="submitForm()">保存</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script>
import { createTable } from "@/api/tool/gen";
import basicInfoForm from "./designBasicInfoForm";
export default {
  name: "GenDesign",
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
      cloumns: [
        {
        columnName:"create_by",
        columnComment:"创建者",
        dataType:"TEXT",
        maxLength:"64",
        disable:true,
        sort:101
        },
        {
        columnName:"create_time",
        columnComment:"创建时间",
        dataType:"DATE_TIME",
        maxLength:"0",
        disable:true,
        sort:102
        },
        {
        columnName:"update_by",
        columnComment:"更新者",
        dataType:"TEXT",
        maxLength:"64",
        disable:true,
        sort:103
        },
        {
        columnName:"update_time",
        columnComment:"更新时间",
        dataType:"DATE_TIME",
        maxLength:"0",
        disable:true,
        sort:104
        }
      ],
      // 字典信息
      dictOptions: [],
      // 表详细信息
      info: {}
    };
  },
  beforeCreate() {

  },
  methods: {
    /** 删除按钮操作 */
    handleDelete(index,row) {
      console.log(index, row);
      this.cloumns.splice(index,1);
    },
    /** 显示添加字段弹窗 */
    addColumnShow() {
      this.activeName="cloum";
      this.cloumns.splice(-4,0,{sort:1});
    },
    /** 提交按钮 */
    submitForm() {
      const basicForm = this.$refs.basicInfo.$refs.designBasicInfoForm;
      Promise.all([basicForm]).then(res => {
       console.log('提交按钮 res:',res)
        const genTable = Object.assign({}, basicForm.model);
        genTable.columns = this.cloumns;
        console.log('提交按钮 genTable:',genTable);

        createTable(genTable).then(res => {
          this.msgSuccess(res.msg);
          if (res.code === 200) {
            this.close();
          }
        });
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
