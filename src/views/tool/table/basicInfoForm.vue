<template>
  <el-form ref="basicInfoForm" :model="info" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item label="表名称" prop="tableName">
          <el-input placeholder="请输入表名称" v-model="info.tableName" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="表别名" prop="tableAlias">
          <el-input placeholder="请输入" v-model="info.tableAlias" />
        </el-form-item>
      </el-col>
	  <el-col :span="12">
	    <el-form-item label="表类型" prop="tableType">
		   <el-select v-model="info.tableType" placeholder="请选择表类型">
		      <el-option
		        v-for="item in tableTypeList"
		        :key="item.value"
		        :label="item.label"
		        :value="item.value">
		      </el-option>
		    </el-select>
	    </el-form-item>
	  </el-col>
    <el-col :span="12">
      <el-form-item label="表描述" prop="tableComment">
        <el-input placeholder="请输入" v-model="info.tableComment" />
      </el-form-item>
    </el-col>
      <el-col :span="12">
        <el-form-item label="孩子节点字段" prop="childColumn">
          <el-input placeholder="请输入" v-model="info.childColumn" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="父节点字段" prop="parentColumn">
          <el-input placeholder="请输入" v-model="info.parentColumn" />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" :rows="3" v-model="info.remark"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script>
export default {
  name: "BasicInfoForm",
  props: {
    info: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
		 tableTypeList: [{
		          value: 'physical',
		          label: '物理表'
		        }, {
		          value: 'virtual',
		          label: '虚拟表'
		        }, {
		          value: 'view',
		          label: '视图'
		        }],
      rules: {
        tableName: [
          { required: true, message: "请输入表名称", trigger: "blur" }
        ],
        tableComment: [
          { required: true, message: "请输入表描述", trigger: "blur" }
        ],
        tableAlias: [
          { required: true, message: "请输入表别名", trigger: "blur" }
        ]
      }
    };
  }
};
</script>
