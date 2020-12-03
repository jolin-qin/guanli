<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['robot:type:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['robot:type:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['robot:type:remove']"
        >删除</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="typeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="75" align="center" />
      <el-table-column label="code" align="center" prop="code" />
      <el-table-column label="报表名称" align="center" prop="name" />
      <el-table-column label="父SQL" align="center" prop="parentSql" />
      <el-table-column label="明细SQL" align="center" prop="detailSql" />
      <el-table-column label="父关联字段" align="center" prop="parentRefColumn" />
      <el-table-column label="明细关联字段" align="center" prop="detailRefColumn" />
      <el-table-column label="模板" align="center" prop="file" >
        <template slot-scope="scope" ><div v-html="scope.row.file" ></div></template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改商品类型 对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px"  :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="code" prop="code">
          <el-input v-model="form.code" placeholder="请输入code" maxlength="50" />
        </el-form-item>
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="父SQL" prop="parentSql">
          <el-input v-model="form.parentSql" placeholder="请输入父SQL"></el-input>
        </el-form-item>
        <el-form-item label="明细SQL" prop="detailSql">
          <el-input v-model="form.detailSql" placeholder="请输入明细SQL"></el-input>
        </el-form-item>
        <el-form-item label="父关联字段" prop="parentRefColumn">
          <el-input v-model="form.parentRefColumn" placeholder="请输入关联字段"></el-input>
        </el-form-item>
        <el-form-item label="明细关联字段" prop="detailRefColumn">
          <el-input v-model="form.detailRefColumn" placeholder="请输入关联字段"></el-input>
        </el-form-item>
        <el-form-item label="模板" prop="file">
          <!-- <el-upload
        	class="avatar-uploader"
        	action="#"
        	:show-file-list="false"
        	:http-request="requestUpload"
        	:before-upload="beforeUpload"
        	:on-success="handleVideoSuccess">
        	<i class="el-upload el-icon-plus avatar-uploader-icon"></i>
          </el-upload> -->

          <el-upload
            class="avatar-uploader"
            action="#"
            :multiple="false"
            accept=".xls, .xlsx, .docx"
            :http-request="requestUpload"
            :on-success="handleVideoSuccess"
            :before-upload="beforeUpload">
            <div class="img-upload-button">
              <svg-icon icon-class="plus" />
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as exportConfig from "@/api/system/export";
import * as oss from '@/api/aliyunoss'

export default {
  data() {
    return {
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
      // 商品类型 表格数据
      typeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        search:undefined,
        contact: undefined,
        dealerId: undefined,
        thanks: undefined,
        createdBy: undefined,
        createdTime: undefined,
        updatedBy: undefined,
        updatedTime: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    //上传成功回调
    handleVideoSuccess (response, file, fileList) {
      if(response==null||response==undefined){
        return;
      }
      this.form.file = response[0];
    },
    // 覆盖默认的上传行为
    async requestUpload(option) {
      oss.upload(option)
    },
    // 上传预处理
    beforeUpload(file) {

    },
    /** 查询商品类型 列表 */
    getList() {
      this.loading = true;
      exportConfig.listExport(this.queryParams).then(response => {
	    this.typeList = this.shuxinDataFormat("s_export", response.rows);
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
        name: undefined,
        contact: undefined,
        dealerId: undefined,
        thanks: undefined,
        createdBy: undefined,
        createdTime: undefined,
        updatedBy: undefined,
        updatedTime: undefined
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
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加模板 ";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids[0]
      exportConfig.getExport(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改模板 ";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            exportConfig.updateExport(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            exportConfig.addExport(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除模板 编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportConfig.delExport(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    }
  }
};
</script>
