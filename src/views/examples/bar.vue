<template>
  <div class="grid grid-cols-1 gap-y-20">
    <div class="bg-white p-20 rounded-lg">
      <EchartBar v-bind="props1" />
    </div>
    <div class="bg-white p-20 rounded-lg">
      <EchartBar v-bind="props2" />
    </div>
    <div class="bg-white p-20 rounded-lg">
      <EchartBar v-bind="props3" />
    </div>
    <div class="bg-white p-20 rounded-lg">
      <EchartBar v-bind="props4" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import EchartBar, { type BarProps } from '@/components/EchartBar.vue'

// mock 数据
const props1: BarProps = {
  mockData: {
    xData: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    series: [
      {
        name: '销量',
        data: [120, 200, 150, 80, 70, 110, 130],
      },
      {
        name: '库存',
        data: [60, 182, 75, 240, 100, 110, 130],
      },
    ],
    averageLineValue: 122.86,
  },
  unit: '件',
  barWidth: 20,
  showBackground: true,
}

// 空数据
const props2: BarProps = {
  mockData: {
    xData: [],
    series: [],
  },
}

// 循环取色
const props3: BarProps = {
  mockData: {
    xData: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    series: [
      {
        name: '销量',
        data: [120, 200, 150, 80, 70, 110, 130],
      },
    ],
  },
  cyclePickColor: true,
  borderRadius: [24, 24, 0, 0],
}

// 条形图
const props4: BarProps = {
  mockData: {
    xData: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    series: [
      {
        name: '销量',
        data: [120, 200, 150, 80, 70, 110, 130],
      },
    ],
    averageLineValue: 122,
  },
  unit: '件',
  height: 400,
  graph: true,
  borderRadius: [0, 24, 24, 0],
}
</script>
