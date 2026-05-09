<template>
  <div class="grid grid-cols-1 gap-y-20">
    <div class="bg-white p-20 rounded-lg">
      <EchartLine v-bind="props1" />
    </div>
    <div class="bg-white p-20 rounded-lg">
      <EchartLine v-bind="props2" />
    </div>
    <div class="bg-white p-20 rounded-lg">
      <EchartLine v-bind="props3" />
    </div>
    <div class="bg-white p-20 rounded-lg">
      <EchartLine v-bind="props4" />
    </div>
    <div class="bg-white p-20 rounded-lg">
      <EchartLine v-bind="props5" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import EchartLine, { type LineProps } from '@/components/EchartLine.vue'

// 多系列折线图 + 平均线
const props1: LineProps = {
  mockData: {
    xData: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    series: [
      { name: '销量', data: [120, 200, 150, 80, 70, 110, 130] },
      { name: '库存', data: [60, 182, 75, 240, 100, 110, 130] },
    ],
    averageLineValue: 122.86,
  },
  unit: '件',
  legend: true,
}

// 空数据
const props2: LineProps = {
  mockData: {
    xData: [],
    series: [],
  },
}

// 平滑面积图
const props3: LineProps = {
  mockData: {
    xData: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    series: [
      { name: '访问量', data: [820, 932, 901, 934, 1290, 1330, 1320, 1100, 980, 860, 760, 900] },
    ],
  },
  smooth: true,
  area: true,
  color: [['#2979EB', '#a8c8f8']],
  unit: '次',
}

// 堆叠折线图
const props4: LineProps = {
  mockData: {
    xData: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    series: [
      { name: '邮件营销', data: [120, 132, 101, 134, 90, 230, 210] },
      { name: '联盟广告', data: [220, 182, 191, 234, 290, 330, 310] },
      { name: '视频广告', data: [150, 232, 201, 154, 190, 330, 410] },
    ],
  },
  stack: true,
  legend: true,
  smooth: true,
  height: 350,
}

// 堆叠折线图区域渐变
const props5: LineProps = {
  mockData: {
    xData: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    series: [
      { name: '邮件营销', data: [120, 132, 101, 134, 90, 230, 210] },
      { name: '联盟广告', data: [220, 182, 191, 234, 290, 330, 310] },
      { name: '视频广告', data: [150, 232, 201, 154, 190, 330, 410] },
    ],
  },
  stack: true,
  area: true,
  legend: true,
  smooth: true,
  height: 350,
  color: [
    ['#2979EB', 'rgba(41,121,235,0.05)'],
    ['#FBAE3E', 'rgba(251,174,62,0.05)'],
    ['#4ACE82', 'rgba(74,206,130,0.05)'],
  ],
}
</script>
