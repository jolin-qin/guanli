<template>
  <div class="checkedBox">
    <el-checkbox-group v-model="checkedList">
      <div v-for="item in dataList">
        <el-checkbox :key="item.id" :label="item.name"></el-checkbox>
      </div>
    </el-checkbox-group>
  </div>
</template>

<script>
  import request from '@/utils/request'
  import * as shop from "@/api/shuxin"

  export default {
    name: 'RobotCheckBoxGroup',
    props: {
      //值
      value: {
        type: Array
      },
      // 上传地址
      tableName: {
        type: String,
        required: true
      },
      // 上传地址
      columnName: {
        type: String,
        required: true
      },
      // 响应处理函数
      responseFn: Function,
      // 上传时附带的额外参数(同官网)
      requestData: {
        type: String,
        required: true
      },
    },
    data() {
      return {
        checkedList: [],
        dataList: []
      }
    },
    watch: {
      requestData: function() {
        if (!this.requestData) {
          return;
        }
        const that = this;
        var checkedList=[];
        shop.inputSelectList(this.tableName, this.columnName, null, function(data) {
          that.dataList = data;
          for(var i=0;i<data.length;i++){
            checkedList.push(data[i].name)
          }
          that.checkedList = checkedList;
          that.$emit('func',data)
        }, that.requestData);
      }
    },
    methods: {

    }
  }
</script>
<style scoped="scoped">
  .checkedBox {
    height: 150px;
    overflow-y: scroll;
    overflow: auto;
  }
</style>
