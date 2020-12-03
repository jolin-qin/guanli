<template>
  <div>
    <el-form ref="elForm" :model="formData" :rules="rules" size="medium" label-width="100px">
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="formData.mobile" placeholder="请输入手机号" :maxlength="11" show-word-limit clearable
          prefix-icon='el-icon-mobile' :style="{width: '100%'}"></el-input>
      </el-form-item>
      <el-form-item label="单行文本" prop="field101">
        <el-input v-model="formData.field101" placeholder="请输入单行文本" clearable :style="{width: '100%'}">
        </el-input>
      </el-form-item>
      <el-form-item label="多行文本" prop="field102">
        <el-input v-model="formData.field102" type="textarea" placeholder="请输入多行文本"
          :autosize="{minRows: 4, maxRows: 4}" :style="{width: '100%'}"></el-input>
      </el-form-item>
      <el-form-item label="计数器" prop="field103">
        <el-input-number v-model="formData.field103" placeholder="计数器"></el-input-number>
      </el-form-item>
      <el-form-item label="密码" prop="field104">
        <el-input v-model="formData.field104" placeholder="请输入密码" clearable show-password
          :style="{width: '100%'}"></el-input>
      </el-form-item>
      <el-form-item label="下拉选择" prop="field105">
        <el-select v-model="formData.field105" placeholder="请选择下拉选择" clearable :style="{width: '100%'}">
          <el-option v-for="(item, index) in field105Options" :key="index" :label="item.label"
            :value="item.value" :disabled="item.disabled"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="级联选择" prop="field106">
        <el-cascader v-model="formData.field106" :options="field106Options" :props="field106Props"
          :style="{width: '100%'}" placeholder="请选择级联选择" clearable></el-cascader>
      </el-form-item>
      <el-form-item label="开关" prop="field107" required>
        <el-switch v-model="formData.field107"></el-switch>
      </el-form-item>
      <el-form-item label="滑块" prop="field108" required>
        <el-slider :max='100' :step='1' v-model="formData.field108"></el-slider>
      </el-form-item>
      <el-form-item label="时间选择" prop="field109">
        <el-time-picker v-model="formData.field109" format="HH:mm:ss" value-format="HH:mm:ss"
          :picker-options='{"selectableRange":"00:00:00-23:59:59"}' :style="{width: '100%'}"
          placeholder="请选择时间选择" clearable></el-time-picker>
      </el-form-item>
      <el-form-item label="时间范围" prop="field110">
        <el-time-picker v-model="formData.field110" is-range format="HH:mm:ss" value-format="HH:mm:ss"
          :style="{width: '100%'}" start-placeholder="开始时间" end-placeholder="结束时间" range-separator="至"
          clearable></el-time-picker>
      </el-form-item>
      <el-form-item label="日期选择" prop="field111">
        <el-date-picker v-model="formData.field111" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
          :style="{width: '100%'}" placeholder="请选择日期选择" clearable></el-date-picker>
      </el-form-item>
      <el-form-item label="日期范围" prop="field112">
        <el-date-picker type="daterange" v-model="formData.field112" format="yyyy-MM-dd"
          value-format="yyyy-MM-dd" :style="{width: '100%'}" start-placeholder="开始日期" end-placeholder="结束日期"
          range-separator="至" clearable></el-date-picker>
      </el-form-item>
      <el-form-item label="评分" prop="field113">
        <el-rate v-model="formData.field113"></el-rate>
      </el-form-item>
      <el-form-item label="颜色选择" prop="field114" required>
        <el-color-picker v-model="formData.field114" size="medium"></el-color-picker>
      </el-form-item>
      <el-form-item label="上传" prop="field115" required>
        <el-upload ref="field115" :file-list="field115fileList" :action="field115Action"
          :before-upload="field115BeforeUpload">
          <el-button size="small" type="primary" icon="el-icon-upload">点击上传</el-button>
        </el-upload>
      </el-form-item>
      <el-row gutter="15">
      </el-row>
      <el-form-item size="large">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  components: {},
  props: [],
  data() {
    return {
      formData: {
        mobile: '',
        field101: undefined,
        field102: undefined,
        field103: undefined,
        field104: undefined,
        field105: undefined,
        field106: [],
        field107: false,
        field108: 0,
        field109: null,
        field110: null,
        field111: null,
        field112: null,
        field113: 0,
        field114: null,
        field115: null,
      },
      rules: {
        mobile: [{
          required: true,
          message: '请输入手机号',
          trigger: 'blur'
        }, {
          pattern: /^1(3|4|5|7|8|9)\d{9}$/,
          message: '手机号格式错误',
          trigger: 'blur'
        }],
        field101: [{
          required: true,
          message: '请输入单行文本',
          trigger: 'blur'
        }],
        field102: [{
          required: true,
          message: '请输入多行文本',
          trigger: 'blur'
        }],
        field103: [{
          required: true,
          message: '计数器',
          trigger: 'blur'
        }],
        field104: [{
          required: true,
          message: '请输入密码',
          trigger: 'blur'
        }],
        field105: [{
          required: true,
          message: '请选择下拉选择',
          trigger: 'change'
        }],
        field106: [{
          required: true,
          type: 'array',
          message: '请至少选择一个field106',
          trigger: 'change'
        }],
        field109: [{
          required: true,
          message: '请选择时间选择',
          trigger: 'change'
        }],
        field110: [{
          required: true,
          message: '时间范围不能为空',
          trigger: 'change'
        }],
        field111: [{
          required: true,
          message: '请选择日期选择',
          trigger: 'change'
        }],
        field112: [{
          required: true,
          message: '日期范围不能为空',
          trigger: 'change'
        }],
        field113: [{
          required: true,
          message: '评分不能为空',
          trigger: 'change'
        }],
      },
      field115Action: 'https://jsonplaceholder.typicode.com/posts/',
      field115fileList: [],
      field105Options: [{
        "label": "选项一",
        "value": 1
      }, {
        "label": "选项二",
        "value": 2
      }],
      field106Options: [],
      field106Props: {
        "multiple": false
      },
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    submitForm() {
      this.$refs['elForm'].validate(valid => {
        if (!valid) return
        // TODO 提交表单
      })
    },
    resetForm() {
      this.$refs['elForm'].resetFields()
    },
    getField106Options() {
      // TODO 发起请求获取数据
      this.field106Options
    },
    field115BeforeUpload(file) {
      let isRightSize = file.size / 1024 / 1024 < 2
      if (!isRightSize) {
        this.$message.error('文件大小超过 2MB')
      }
      return isRightSize
    },
  }
}

</script>
<style>
.el-rate {
  display: inline-block;
  vertical-align: text-top;
}

.el-upload__tip {
  line-height: 1.2;
}

</style>
