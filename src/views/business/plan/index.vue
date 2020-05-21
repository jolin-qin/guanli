<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="关联的广告" prop="advertId">
        <el-select v-model="queryParams.advertId" multiple placeholder="选择广告" @change="advertChange">
          <el-option v-for="item in advertList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
            :value="item.targetIdColumnInputSelect"></el-option>
        </el-select>
      </el-form-item>
     <el-form-item label="开始投放时间"  prop="planStartTime">
       <el-date-picker
         v-model="queryParams.planStartTime"
         size="small"
         style="width: 400px"
         value-format="yyyy-MM-dd HH:mm:ss"
         type="datetimerange"
         range-separator="-"
         start-placeholder="投放开始时间"
         end-placeholder="投放结束时间"
       ></el-date-picker>
     </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['business:plan:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['business:plan:remove']"
        >删除</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="planList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="关联的广告" align="center" prop="advertId" />
      <el-table-column label="所属平台" align="center" prop="platformType">
        <template slot-scope="scope">
          <div v-html="scope.row.platformType"></div>
        </template>
      </el-table-column>
      <el-table-column label="投放单价" align="center" prop="exportPrice" />
      <el-table-column label="投放开始时间" align="center" prop="planStartTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.planStartTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="投放结束时间" align="center" prop="planEndTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.planEndTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预计导出量" align="center" prop="exportCount" />
      <el-table-column label="投放状态"  align="center"  prop="isStart" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.isStart!='已结束'"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['business:plan:edit']"
          >修改</el-button>
          <el-button
            v-if="scope.row.isStart!='已结束'"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['business:plan:remove']"
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

    <!-- 添加或修改广告投放计划对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">

        <el-form-item label="关联的广告" prop="advertId">
          <el-select v-model="form.advertId"  placeholder="选择广告" >
            <el-option v-for="item in advertList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
              :value="item.targetIdColumnInputSelect"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="投放单价" prop="exportPrice">
          <el-input v-model="form.exportPrice"  oninput="if(isNaN(value)) { value = null } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"  placeholder="请输入投放单价" />
        </el-form-item>
        <el-form-item label="投放开始时间" prop="planStartTime">
          <el-date-picker  clearable  size="small" style="width: 200px"
           :editable="false"
            v-model="form.planStartTime"
            type="datetime"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择投放开始时间"
            :picker-options="pickerOptionsStart">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="投放结束时间" prop="planEndTime">
          <el-date-picker  clearable   size="small" style="width: 200px"
            :editable="false"
            v-model="form.planEndTime"
            type="datetime"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择投放结束时间"
            :picker-options="pickerOptionsEnd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="预计导出量" prop="exportCount">
          <el-input v-model="form.exportCount" placeholder="请输入预计导出量" oninput="value=value.replace(/[^\d]/g,'')" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
           <el-input v-model="form.remark" placeholder="请输入备注信息" />
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
import { listPlan, getPlan, delPlan, addPlan, updatePlan, exportPlan } from "@/api/business/matrix_advert_plan";
import * as qpShop from '@/api/global-cache'

export default {
  name: "Plan",
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
      // 广告投放计划表格数据
      planList: [],
      advertList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        advertId: undefined,
        exportPrice: undefined,
        isDel: 0,
        planStartTime: undefined,
        planEndTime: undefined,
        exportCount: undefined,
        isPut: undefined,
      },
      // 表单参数
      form: {
      },

      pickerOptionsStart: {
              disabledDate: time => {
                const endDateVal = new Date(this.form.planEndTime).getTime()
                if (endDateVal) {
                  return time.getTime() > endDateVal - 0
                }
              }
      },
      pickerOptionsEnd: {
              disabledDate: time => {
                const beginDateVal = new Date(this.form.planStartTime).getTime()
                if (beginDateVal) {
                  return time.getTime() < beginDateVal - 0
                }
              }
      },
      // 表单校验
      rules: {
        advertId: [{
          required: true,
          message: "广告不能为空",
          trigger: "change"
        }],
        exportPrice: [{
          required: true,
          message: "投放单价不能为空",
          trigger: "blur"
        }],
        planStartTime: [{
          required: true,
          message: "投放开始时间不能为空",
          trigger: "blur"
        }],
        planEndTime: [{
          required: true,
          message: "投放结束时间不能为空",
          trigger: "blur"
        }],
        exportCount: [{
          required: true,
          message: "预计导出量不能为空",
          trigger: "blur",
        }],
      },
        dictCache: qpShop.globalCache.shopCache.dictCache,

    };
  },
  created() {
    this.getList();
    this.advertInputSelect();
  },
  methods: {



    /** 查询广告投放计划列表 */
    getList() {
      this.loading = true;
      listPlan(this.queryParams).then(response => {
        this.planList = this.shuxinDataFormat("matrix_advert_plan", response.rows);
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
        advertId: undefined,
        exportPrice: undefined,
        isDel: undefined,
        planStartTime: undefined,
        planEndTime: undefined,
        exportCount: undefined,
        isPut: undefined,
        createBy: undefined,
        createTime: undefined,
        updateBy: undefined,
        updateTime: undefined
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
      this.isSubmit=false;
      this.reset();
      this.form.isDel =0;
      this.open = true;
      this.title = "添加广告投放计划";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.isSubmit=false;
      this.reset();
      const id = row.id || this.ids
      getPlan(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改广告投放计划";
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
            updatePlan(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                 this.isSubmit=false;
                this.msgError(response.msg);
              }
            });
          } else {
            addPlan(this.form).then(response => {
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
      this.$confirm('是否确认删除广告投放计划编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delPlan(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有广告投放计划数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportPlan(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    },


   // 商场下拉数据
     advertInputSelect(query) {
       var that = this;
       this.inputSelectList("matrix_advert_plan", "advert_id", query, function(data) {
         that.advertList = data;
       });
     },

     advertChange(e) {
       var area = e.join(",");
       this.advert_id = area;
       this.queryParams.label = '';
       this.queryParams.id = '';
       this.labelList = []
       this.robotList = []
       if (e != '') {
         this.labelInputSelect(area);
       }
     }

  }
};
</script>
