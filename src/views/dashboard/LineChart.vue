<template>
  <div id="echarts" :class="className" class="nihao" :style="{height:height,width:width}" />
</template>
<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
//import 'echarts/theme/macarons.js' //引入echarts主题
import resize from './mixins/resize'
import * as shuxinTool from '@/utils/shuxin-tool'
export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    //用于接收图例组件数据（就是图表中有几种线条）
    yNames: Array,
    //接收用于series数据,多折线时用到
    ys: Array,
    x: Array,
    y: Array
  },
  data() {
    return {
      chart: null,
      yNamesData: [],
      ysData: [],
      xData: [],
      yData: []
    }
  },
  watch:{
    x: {
      handler: function(newValue, oldValue) {
        this.xData = newValue
        console.log(this.xData)
      },
      immediate: true
    },

    yNames: {
      handler: function(newValue, oldValue) {
        this.yNamesData = newValue
      },
      immediate:true
    },
    ys: function(newQuestion, oldQuestion){
      this.ysData = newQuestion
      console.log(newQuestion)
      setTimeout(() => {
        this.initChart()
      }, 20)
    },
    y: {
      handler: function(newValue, oldValue) {
        this.yData = newValue
        console.log(this.yData)
        setTimeout(() => {
          this.initChart()
        }, 20)
      },
      immediate:true
    }
  },
  mounted() {
    // setTimeout(() => {
    //   this.initChart()
    // }, 20)
    // console.log(this.yNames)
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initOption(){
      var option = {
        xAxis: {
          data: this.xData,
          boundaryGap: false,
          axisTick: {
            show: false
          }
        },
        grid: {
          left: 10,
          right: 10,
          bottom: 20,
          top: 30,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10]
        },
        yAxis: {
          axisTick: {
            show: false
          }
        },
        legend: {
          show: true,
          top: '0',
          left: 'center',
          data: [],
          icon: 'circle'
        },
        series: [{
          name: '数量',
          itemStyle: {
            normal: {
              color: '#FF005A',
              lineStyle: {
                color: '#FF005A',
                width: 2
              }
            }
          },
          smooth: true,
          type: 'line',
          data: this.yData,
          animationDuration: 2800,
          animationEasing: 'cubicInOut'
        }]
      }
      // 当一个图标需要表示多种折线的时候定义图例组件的
      // this.yNamesData.length != 0
      if (!shuxinTool.isEmpty(this.yNamesData)){
        option.legend.data = this.yNamesData;
        // console.log(this.yNamesData)
      }
      // !shuxinTool.isEmpty(this.ysData
      if (!shuxinTool.isEmpty(this.ysData)){
        option.series = [];
        // console.log("00")
        // console.log(this.yNamesData)
        for (var i=0; i<this.ysData.length; i++){
          option.series.push({
            name: this.yNamesData[i].name,
            itemStyle: {
              normal: {
                color: this.yNamesData[i].textStyle.color,
                lineStyle: {
                  color: this.yNamesData[i].textStyle.color,
                  width: 2
                }
              }
            },
            smooth: true,
            type: 'line',
            data: this.ysData[i],
            animationDuration: 2800,
            animationEasing: 'cubicInOut'
          })
        }
      }
      return option;
    },
    initChart() {
      let ele = document.getElementById('echarts')
      if (!ele) {
          return false
      }
      this.chart = echarts.init(ele, 'macarons')
      this.chart.setOption(this.initOption())
      console.log("我初始化了")
    }
  }
}
</script>
<style lang="scss" rel="stylesheet/scss">

</style>
