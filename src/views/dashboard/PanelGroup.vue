<template>
  <el-row :gutter="20" class="panel-group">
    <el-row :gutter="20"  class="qp-module">
      <el-col :span="6">
        <div class="grid-content bg-purple">
           <div class="robot-status">机器人在线<a @click="onDetailClick('onLine')">详情</a></div>
           <div class="robot-num"><svg-icon icon-class="signal" /> <span>{{ robotTotalData.onlineRobot }}台</span></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="grid-content bg-purple">
           <div class="robot-status">机器人离线<a @click="onDetailClick('outline')">详情</a></div>
           <div class="robot-num"><svg-icon icon-class="offline" /> <span>{{ robotTotalData.outlineRobot }}台</span></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="grid-content bg-purple">
           <div class="robot-status">机器人异常<a @click="onDetailClick('robotError')">详情</a></div>
           <div class="robot-num"><svg-icon icon-class="abnormal" /> <span>{{ robotTotalData.robotErrorTotal }}台</span></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="grid-content bg-purple">
           <div class="robot-status">机器人缺货<a @click="onDetailClick('outOfStock')">详情</a></div>
           <div class="robot-num"><svg-icon icon-class="shopping" /> <span>{{ robotTotalData.outOfStockRobot }}台</span></div>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="qp-module">
      <el-col :span="6">
        <div class="grid-content bg-purple  today">
           <div class="robot-status">累计销售额</div>
           <div class="robot-num">￥{{ totalData.allSales }}</div>
           <div class="robot-bus"><p>盈余：{{ totalData.allSales }}</p><p>积分：{{ totalData.allSales }}</p></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="grid-content bg-purple today">
           <div class="robot-status">今日销售额</div>
           <div class="robot-num">￥{{ totalData.todaySales }}</div>
           <div class="robot-bus"><p>盈余：{{ totalData.todayProfit }}</p><p>积分：{{ totalData.todayIntegral }}</p></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="grid-content bg-purple  today">
           <div class="robot-status">本周销售额</div>
           <div class="robot-num">￥{{ totalData.weekSales }}</div>
           <div class="robot-bus"><p>盈余：{{ totalData.weekProfit }}</p><p>积分：{{ totalData.weekIntegral }}</p></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="grid-content bg-purple  today">
           <div class="robot-status">本月销售额</div>
           <div class="robot-num">￥{{ totalData.monthSales }}</div>
           <div class="robot-bus"><p>盈余：{{ totalData.monthProfit }}</p><p>积分：{{ totalData.monthIntegral }}</p></div>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="qp-module">
      <el-col :span="8">
        <div class="grid-content bg-purple">
           <div class="robot-status">累计会员总数</div>
           <div class="robot-num">{{ memberLotteryCouponIntegralData.allMemberNum }}</div>
           <div class="robot-bus"><p>今日新增：{{ memberLotteryCouponIntegralData.allMemberNum }}</p></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="grid-content bg-purple">
           <div class="robot-status">累计购买人数</div>
           <div class="robot-num">{{ memberLotteryCouponIntegralData.allPayNum }}</div>
           <div class="robot-bus"><p>今日购买人数：{{ memberLotteryCouponIntegralData.todayPayNum }}</p></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="grid-content bg-purple">
           <div class="robot-status">累计抽奖人数</div>
           <div class="robot-num">{{ memberLotteryCouponIntegralData.allLotteryNum }}</div>
           <div class="robot-bus"><p>今日抽奖人数：{{ memberLotteryCouponIntegralData.todayLotteryNum }}</p></div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="qp-module">
      <el-col :span="8">
        <div class="grid-content bg-purple">
           <div class="robot-status">累计发放优惠券</div>
           <div class="robot-num">{{ memberLotteryCouponIntegralData.allCouponNum }}</div>
           <div class="robot-bus"><p>已使用：{{ memberLotteryCouponIntegralData.todayCouponNum }}</p></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="grid-content bg-purple">
           <div class="robot-status">累计积分发放</div>
           <div class="robot-num">{{ memberLotteryCouponIntegralData.allIntegralNum }}</div>
           <div class="robot-bus"><p>已使用：{{ memberLotteryCouponIntegralData.useIntegralNum }}</p></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="grid-content bg-purple">
           <div class="robot-status">累计展现量</div>
           <div class="robot-num">{{ memberLotteryCouponIntegralData.allRobotUser }}</div>
           <div class="robot-bus"><p>今日展现量：{{ memberLotteryCouponIntegralData.todayRobotUser }}</p></div>
        </div>
      </el-col>
    </el-row>

  <!-- </el-row> -->
    <!-- 机器人详情弹出框-->
    <el-dialog :title="title" :visible.sync="open" width="900px">
      <el-table v-loading="loading" :data="robotList">
        <el-table-column label="机器人名称" align="center" prop="name" />
        <el-table-column label="区域" align="center" prop="area" />
        <el-table-column label="服务地址" align="center" prop="location" />
        <el-table-column label="维护人" align="center" prop="principal" />
        <el-table-column label="当前状态" align="center" prop="robotStatus">
          <template slot-scope="scope">
            <span>{{ scope.row.rowData.robotStatus }}</span>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" align="center" prop="create_time" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.create_time) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="标签" align="center" prop="robotLabelNames">
          <template slot-scope="scope">
              <span>{{ scope.row.rowData.robotLabelNames }}</span>
            </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleDetail(scope.row)"
            >详情</el-button>
          </template>
        </el-table-column>
      </el-table>

    </el-dialog>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'
import request from '@/utils/request'
import * as shuxinTool from '@/utils/shuxin-tool'

export default {
  components: {
    CountTo
  },
  props: {
    robotTotalData: Object,
    totalData: Object,
    memberLotteryCouponIntegralData: Object
  },
  data() {
    return {
      robotType: '',
      title: '机器人列表',
      open: false,
      // 遮罩层
      loading: true,
      total: 0,
      robotList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
      }
    }
  },
  methods: {
    onDetailClick(type){
      request({
        url: '/robot/robotReport/robotDetail',
        method: 'post',
        data:JSON.stringify({type: type})
      }).then(response => {
        this.robotList = this.shuxinDataFormat("t_robot",response.rows);
        this.total = response.total;
        this.loading = false;
        this.open = true;

      })
    },
    handleDetail(row){
      //跳转机器人详情
      this.open = false;
      this.$router.push("/robots/details?id="+row.id);
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

 .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
		box-shadow:0px 2px 12px 0 rgba(0, 0, 0, 0.2);
    // border: 1px solid rgba(0, 0, 0, 0.1);
    // box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.1);
    background: #fff;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 136px;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
  .robot-status{
        min-height: 50px;
        line-height: 50px;
        border-bottom: 1px solid #ddd;
        padding: 0 10px;
        font-size: 17px;
  }
  .robot-status a{
    color: #666;
    float: right;
  }
  .robot-num{
        line-height: 86px;
        text-align: center;
        font-size: 24px;
        color: #666;
  }
  .qp-module{
    margin-bottom: 10px;
  }
  .bg-purple a{
    font-size: 14px;
  }
  .robot-num span{
    padding-left: 10px;
  }
  .robot-bus{
    width: 100%;
    min-height: 46px;
    padding: 0 15px;
  }
  .robot-bus p{
    float: left;
    width: 50%;
  }
  .robot-bus p:nth-child(2){
    text-align: right;
  }
  .today .robot-num{
    line-height: 66px !important;
  }



  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
		box-shadow:0px 2px 12px 0 rgba(0, 0, 0, 0.2);
//     box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
//     border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #34bfa3
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
