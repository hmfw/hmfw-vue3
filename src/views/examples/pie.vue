<template>
  <div class="grid grid-cols-1 gap-y-20">
    <div class="bg-white p-20 rounded-lg">
      <EchartPie v-bind="props1" />
    </div>
    <div class="bg-white p-20 rounded-lg">
      <EchartPie v-bind="props2" />
    </div>
    <div class="bg-white p-20 rounded-lg">
      <EchartPie v-bind="props3" />
    </div>
    <div class="bg-white p-20 rounded-lg">
      <EchartPie v-bind="props4" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import EchartPie, { type PieProps } from '@/components/EchartPie.vue'

// 基础饼图
const props1: PieProps = {
  mockData: {
    xData: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎'],
    series: [{ name: '访问来源', data: [335, 310, 234, 135, 1548] }],
  },
  unit: '次',
  legend: true,
  height: 360,
}

// 环形图
const props2: PieProps = {
  mockData: {
    xData: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎'],
    series: [{ name: '访问来源', data: [335, 310, 234, 135, 1548] }],
  },
  unit: '次',
  donut: true,
  legend: true,
  height: 360,
  option: {
    legend: {
      right: 0,
      top: 'center',
      orient: 'vertical',
    },
  },
}

// 玫瑰图
const props3: PieProps = {
  mockData: {
    xData: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎'],
    series: [{ name: '访问来源', data: [335, 310, 234, 135, 1548] }],
  },
  rose: true,
  legend: true,
  height: 360,
}

// 空数据
const props4: PieProps = {
  mockData: {
    xData: [],
    series: [],
  },
}
</script>
