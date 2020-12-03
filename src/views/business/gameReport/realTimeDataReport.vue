<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="所属平台:">
        <el-select @change="paramsChange" v-model="queryParams.platformType" placeholder="所属平台">
          <el-option v-for="item in dictCache.platform_type.details" :key="item.dictValue" :label="item.dictLabel"
            :value="item.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="游戏分组:">
       <el-select @change="paramsChange" v-model="queryParams.gameGroup" multiple placeholder="分组" clearable size="small">
         <el-option v-for="item in groupList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
           :value="item.targetIdColumnInputSelect"></el-option>
       </el-select>
      </el-form-item>
      <el-form-item label="游戏产品:">
         <el-select v-model="queryParams.productId" multiple placeholder="请选择">
          <el-option v-for="item in advertList" :key="item.targetIdColumnInputSelect" :label="item.targetNameColumnInputSelect"
            :value="item.targetIdColumnInputSelect"></el-option>
         </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 图表 -->
    <div class="qpgame">
      <el-row :gutter="10" type="flex" justify="space-around" class="mb8 qphead">
        <el-col  :span="24" >
          <h2>汇总统计</h2>
        </el-col>
      </el-row>
      <!-- tabs切换 -->
      <el-tabs type="border-card" @tab-click="tabHandleClick">
        <el-tab-pane v-for="(item, index) in tabs" :key="item.key" :label="item.title">
        </el-tab-pane>
        <line-chart :x="xData[timeActiveIndex]" :yNames="yNames" :ys="tabs[tabActiveIndex].ys" />
      </el-tabs>
      <!-- 时间粒度按钮 -->
      <ul class="timeBtnContainer">
      	<li class="item"
          v-for="(item, index) in timeItems"
          :key="index"
          :class="timeActiveIndex == index ? 'active' : ''"
          @click="changeTime($event, index)"
          :data-timePeriod="item.timePeriod">{{item.title}}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import * as qpShop from '@/api/global-cache'
import LineChart from '../../dashboard/LineChart.vue'
import { downLoadZip } from "@/utils/zipdownload"
import { getData, isEmpty } from "@/utils/shuxin-tool"

import request from '@/utils/request'

export default {
  name: "realTimeDataReport",
  components: {
    LineChart,
  },
  data() {
    return {
      advertList:[],
      groupList:[],
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
      // 类目监控表格
      //exportTradeList: [],
      // 乘放游戏平台默认值
      defaultPlatformType: '',
      queryParams: {
          platformType: '',
          gameGroup: [],
          productId: []
      },
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      dictCache: qpShop.globalCache.shopCache.dictCache,
      // 代表tab的index
      tabActiveIndex: 0,
      // 代表时间粒度的index
      timeActiveIndex: 0,
      yNames: [
        {
          name: '今天',
          textStyle: {
            color: '#FFDB82'
          }
        },{
          name: '昨天',
          textStyle: {
            color: '#7DDDC5'
          }
        },{
          name: '七天',
          textStyle: {
            color: '#F1A9D1'
          }
        }
      ],
      xData: [
        ['00:00','00:15','00:30','00:45','01:00','01:15','01:30','01:45','02:00','02:15','02:30','02:45','03:00','03:15','03:30','03:45','04:00','04:15','04:30','04:45','05:00','05:15','05:30','05:45','06:00','06:15','06:30','06:45','07:00','07:15','07:30','07:45','08:00','08:15','08:30','08:45','09:00','09:15','09:30','09:45','10:00','10:15','10:30','10:45','11:00','11:15','11:30','11:45','12:00','12:15','12:30','12:45','13:00','13:15','13:30','13:45','14:00','14:15','14:30','14:45','15:00','15:15','15:30','15:45','16:00','16:15','16:30','16:45','17:00','17:15','17:30','17:45','18:00','18:15','18:30','18:45','19:00','19:15','19:30','19:45','20:00','20:15','20:30','20:45','21:00','21:15','21:30','21:45','22:00','22:15','22:30','22:45','23:00','23:15','23:30','23:45'],
        ['00:00','00:30','01:00','01:30','02:00','02:30','03:00','03:30','04:00','04:30','05:00','05:30','06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30'],
        ['00:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'],
      ],
      // 对比图表切换tabs
      tabs: [
        {
          title: '实时访问次数',
          ys: [],
          key: 'visitCount'
        },
        {
          title: '实时注册人数',
          ys: [],
          key: 'registerCount'
        },
        {
          title: '实时访问人数',
          ys: [],
          key: 'visitPeopleCount'
        },
        {
          title: '实时导出人数',
          ys: [],
          key: 'exportPeopleCount'
        },
        {
          title: '实时导出次数',
          ys: [],
          key: 'exportCount'
        }
      ],
      // 专门用来保存刚进页面请求得到tabs中的ys数组数据,方便切换时间按钮的时候对tabs中的ys做筛选处理
      copyYs: [],
      // 时间粒度按钮
      timeItems: [
        {
          title: '15分钟',
          timePeriod: 1
        },{
          title: '30分钟',
          timePeriod: 2
        },{
          title: '1小时',
          timePeriod: 4
        }
      ]

    }
  },
  created() {
    this.groupInputSelect();
    this._defaultPlatform() //设置默认平台，会触发paramsChange()函数
  },
  methods: {
    /** 查询角色列表 */
    getList() {
      this.loading = true;
      // 先清空copyYs,清空是为了搜索会再次调用getList，要确保每次调用都是从后台获取到的符合要求的数据
      this.copyYs = []
      // console.log(this.tabActiveIndex)
      // console.log(this.timeActiveIndex)
      request({
        url: '/reportGameQuery/queryRealTimeData',
        method: 'post',
        data:JSON.stringify(this.getQueryData())
      }).then(
        res => {
          // 获取到昨天,前天,七天前的总数据
          let obj = res.data || {}
          let resArr = []
          for(let key in obj) {
            resArr.unshift(obj[key])
          }
          this.tabs.forEach(tab => {
            // 每次请求都应该清空tab.ys
            tab.ys = []
            // 先拿最近日期de数据遍历，item1代表昨天的数据，前天的数据，七天前的数据
            resArr.forEach((item1, index) => {
              let itemArr = [];
              // items代表某个时间点的注册数据，导出，访问啊.....5个数据
              item1.forEach((items) => {
                itemArr.push(items[tab.key])
              })
              tab.ys.push(itemArr)
            })
            // 把所有的tab.ys都push进copyYs
            this.copyYs.push(tab.ys)
          })
          //分timeActiveIndex等于几几种情况
          let originArr = this.copyYs[this.tabActiveIndex]
          this._judgeTime(originArr, this.tabActiveIndex)
          // console.log(this.tabs[this.tabActiveIndex].ys)
          this.loading = false;
        }
      )
    },
    getQueryData(){
      return {
          "productIds": this.queryParams["productId"],
          "groupByIds": this.queryParams["gameGroup"],
          "platformType": this.queryParams["platformType"],
      }
    },

    // tab项被选中时触发
    tabHandleClick(tab) {
      let index = Number(tab.index)
      this.tabActiveIndex = index
      // 根据index，拿取copyYs里对应的数据
      let originYs = this.copyYs[index]
      //分timeActiveIndex等于几几种情况
      this._judgeTime(originYs, index)
      console.log(this.tabs[index].ys)
    },
    // 点击时间粒度按钮切换
    changeTime(e, index) {
      //改变xData的相应值
      this.timeActiveIndex = index
      // 获取tabActiveIndex对应的copyYs中的ys值,拿它来做处理
      let originYs = this.copyYs[this.tabActiveIndex]
      //相应的时间粒度按钮对应的时间段映射值，比如15分钟为1，那么30分钟就是2，1小时就是4
      let timePeriodNum = Number(getData(e.target, 'timePeriod'))
      this.tabs[this.tabActiveIndex].ys = this._getChangeTimeArr(originYs, timePeriodNum)
      console.log(this.tabs[this.tabActiveIndex].ys)
    },
    // 根据时间粒度重新遍历各tabs项里的ys
    _getChangeTimeArr(arr, timePeriod) {
      let computeArr = []
      arr.forEach(item => {
        let itemArr = []
        for(let i=0; i<item.length; i=i+timePeriod) {
          itemArr.push(item[i])
        }
        computeArr.push(itemArr)
      })
      // console.log(computeArr)
      return computeArr
    },
    // 搜索或者重置的时候时间粒度处于哪个等级
    _judgeTime(arr, index) {
      if(this.timeActiveIndex === 0) {
        this.tabs[index].ys = arr
      } else if (this.timeActiveIndex === 1) {
        this.tabs[index].ys = this._getChangeTimeArr(arr, 2)
      } else if (this.timeActiveIndex === 2) {
        this.tabs[index].ys = this._getChangeTimeArr(arr, 4)
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      // 没选产品不能请求
      if(this.queryParams.productId.length > 0) {
        this.getList()
      } else {
        this.$message.error('游戏产品是必选的参数哦~');
      }
    },
    /** 重置按钮操作 */
    resetQuery() {
      // this.queryParams = {
      //   platformType: '',
      //   gameGroup: [],
      //   productId: []
      // }
      this.queryParams.platformType = this.defaultPlatformType
      this.queryParams.gameGroup = []
      //此处为什么不修改productId的值，是因为设置了平台，会联动到产品
      this.resetForm("queryForm"); //全局方法
      this.asyncCall()
      // this.getList();
    },
    //平台、分组change事件
    paramsChange() {
      return new Promise((resolve, reject) => {
        console.log("我被触发了")
        let groupByIds = this.queryParams["gameGroup"]; //是个数组
        console.log(groupByIds)
        let platformType = this.queryParams["platformType"];
        let groupByIdsStr = "";
        if(groupByIds.length > 0) {
          for(let i = 0;i < groupByIds.length;i++) {
            groupByIdsStr += "'" + groupByIds[i] +"',";
          }
          groupByIdsStr = groupByIdsStr.substring(0,groupByIdsStr.length - 1);
        }
        let params = {
          platformType: isEmpty(platformType) ? '' : platformType,
          groupByIds: groupByIdsStr
        };
        this.advertInputSelect(null, params, resolve);
      })
    },

    advertInputSelect(query, params, resolve) {
      this.advertList = [] //options需要清空
      this.queryParams.productId = [] //产品显示也需要清空
      var that = this;
      if(params == undefined) {
        params = {
          platformType: '',
          groupByIds: ''
        }
      }
      this.inputSelectList("t_filter", "product_id", query, function(data) {
        if(data.length > 0) {
          that.advertList = data
          that.queryParams.productId.push(data[0].targetIdColumnInputSelect)
        } else {
          // that.advertList = []
          that.queryParams.productId = []
        }
        resolve && resolve()
      }, JSON.stringify(params));
    },
    // 异步函数同步话执行
    async asyncCall() {
      await this.paramsChange() //等此函数执行完再执行getList()
      this.getList()
    },
    // 设置默认平台函数
    _defaultPlatform() {
      // let arr = this.dictCache.platform_type.details
      // if(arr.length > 0) {
      //   let value = arr[0].dictValue
      //   this.queryParams['platformType'] = value
      // }
      // this.asyncCall()
      let arr = this.dictCache.platform_type.details
      let value = arr[0].dictValue
      this.queryParams.platformType = value
      this.defaultPlatformType = value
      this.asyncCall()
    },
    // 商场下拉数据
    groupInputSelect(query) {
      var that = this;
      this.inputSelectList("t_filter", "group_id", query, function(data) {
        that.groupList = data;
      })
    },
    /**导出类目监控*/
    exportTarde(){
      var filterJsonStr = JSON.stringify(this.getQueryData());
      downLoadZip(encodeURI("/reportGameExport/gameExportTrade?filterJson=" + filterJsonStr), "exportTrade",true);
    }
  }
};
</script>
<style scoped="scoped" lang="scss">
  .qphead h2{
    font-size: 1.1rem;
    margin-top: -1px;
    padding-top: 10px;
  }
  .qphead h2 span{
    margin: 0 15px;
    color: #ccc;
    font-size: 0.9rem;
  }
  .qpgame{
    margin-bottom: 35px;
    position: relative;
  }
  .timeBtnContainer {
    position: absolute;
    top: 85px;
    right: 20px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    .item {
      list-style-type: none;
      padding: 7px 15px;
      background-color: #999;
      color: #fff;
      margin-right: 10px;
      border-radius: 3px;
      font-size: 12px;
      &:hover {
        cursor: pointer;
      }
      &.active {
        background-color: #1890ff;
      }
    }
  }
</style>
