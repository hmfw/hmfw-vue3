<template>
  <PageContainer title="仪表板" sub-title="数据概览">
    <el-row :gutter="16" class="dashboard-cards">
      <el-col :xl="6" :lg="8" :md="12" :sm="24" :xs="24">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>总用户数</span>
              <el-tag type="primary">日</el-tag>
            </div>
          </template>
          <div class="card-content">
            <h3 class="card-value">1,234</h3>
            <div class="card-trend">
              <span class="trend-up">+12%</span>
              <span class="trend-label">较昨日</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xl="6" :lg="8" :md="12" :sm="24" :xs="24">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>订单总数</span>
              <el-tag type="success">周</el-tag>
            </div>
          </template>
          <div class="card-content">
            <h3 class="card-value">5,678</h3>
            <div class="card-trend">
              <span class="trend-up">+8%</span>
              <span class="trend-label">较上周</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xl="6" :lg="8" :md="12" :sm="24" :xs="24">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>销售额</span>
              <el-tag type="warning">月</el-tag>
            </div>
          </template>
          <div class="card-content">
            <h3 class="card-value">¥ 89,012</h3>
            <div class="card-trend">
              <span class="trend-up">+15%</span>
              <span class="trend-label">较上月</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xl="6" :lg="8" :md="12" :sm="24" :xs="24">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>访问量</span>
              <el-tag type="danger">年</el-tag>
            </div>
          </template>
          <div class="card-content">
            <h3 class="card-value">12,345</h3>
            <div class="card-trend">
              <span class="trend-up">+23%</span>
              <span class="trend-label">较去年</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </PageContainer>
</template>

<script setup lang="ts">
import PageContainer from '@/layouts/PageContainer.vue'
export interface DashboardProps {}
</script>

<style scoped lang="scss">
// .dashboard-cards {
//   margin-top: 16px;
// }

// .dashboard-card {
//   margin-bottom: 16px;
//   transition: all 0.3s;

//   &:hover {
//     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
//     transform: translateY(-2px);
//   }
// }

// .card-header {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;

//   span {
//     font-weight: 500;
//     color: rgba(0, 0, 0, 0.85);
//   }
// }

// .card-content {
//   text-align: center;
//   padding: 16px 0;
// }

// .card-value {
//   margin: 0 0 12px 0;
//   font-size: 24px;
//   font-weight: 600;
//   color: var(--el-color-primary);
// }

// .card-trend {
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 8px;
// }

// .trend-up {
//   color: #52c41a;
//   font-weight: 500;
// }

// .trend-label {
//   color: rgba(0, 0, 0, 0.45);
//   font-size: 14px;
// }
</style>
