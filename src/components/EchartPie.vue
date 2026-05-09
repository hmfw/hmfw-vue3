<template>
  <div class="echarts-pie relative">
    <div ref="chartRef" :style="style"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { merge, debounce } from 'lodash'
import request, { type EchartsResult } from '@/utils/request'

import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'

import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

import type { PieSeriesOption } from 'echarts/charts'
import type {
  TitleComponentOption,
  TooltipComponentOption,
  LegendComponentOption,
} from 'echarts/components'

import { useEmptyEchart } from '@/hooks/useEcharts'
import { useResizeObserver } from '@/hooks/useResizeObserver'

echarts.use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer])

export type PieOption = echarts.ComposeOption<
  TitleComponentOption | TooltipComponentOption | LegendComponentOption | PieSeriesOption
>

export interface PieProps {
  height?: number // 图表高度
  url?: string // 数据请求地址
  payload?: Record<string, any> // 请求参数
  unit?: string // tooltip 数值单位
  donut?: boolean // 是否为环形图
  rose?: boolean // 是否为玫瑰图（南丁格尔）
  radius?: string | string[] // 自定义半径，覆盖 donut 默认值
  center?: string[] | number[] //
  legend?: boolean // 是否显示图例（位于底部居中）
  color?: string[] // 颜色数组
  mockData?: EchartsResult // Mock 数据，优先于 url 请求
  option?: PieOption // 额外的 ECharts 配置，会与默认配置深度合并
  responseHook?: (data: EchartsResult) => EchartsResult // 接口响应数据处理函数
}

const props = withDefaults(defineProps<PieProps>(), {
  height: 300,
  legend: true,
  center: () => ['50%', '50%'],
  color: () => ['#2979EB', '#FBAE3E', '#F86D6D', '#4ACE82', '#B37FEB', '#44C7FD', '#FADB14'],
})

const emit = defineEmits<{
  (e: 'response', list: any): void
}>()

const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
// 竞态条件保护：快速切换参数时，只渲染最新请求的结果，忽略已过期的响应
let requestSerial = 0

const { renderEmpty } = useEmptyEchart(chartRef)

const style = computed(() => ({
  flex: '1',
  width: '100%',
  height: `${props.height}px`,
}))

// 将 EchartsResult 的 xData + series[0].data 转换为饼图所需的 [{name, value}] 格式
const resultToPieData = (data: EchartsResult) =>
  data.xData.map((name, i) => ({
    name,
    value: Number(data.series[0]?.data[i] ?? 0),
  }))

const generateSeries = (data: EchartsResult): PieSeriesOption => {
  const radius = props.radius ?? (props.donut ? ['40%', '68%'] : '65%')
  return {
    type: 'pie',
    radius,
    center: props.center,
    // 环形图加圆角，视觉更精致
    itemStyle: { borderRadius: props.donut ? 4 : 0 },
    roseType: props.rose ? 'area' : undefined,
    label: { formatter: '{b}: {d}%' },
    data: resultToPieData(data),
  }
}

const mergeOption = (series: PieSeriesOption): PieOption => {
  const legendOption = props.legend ? { bottom: 0 } : undefined

  const defaultOption: PieOption = {
    color: props.color,
    tooltip: {
      trigger: 'item',
      valueFormatter: value => `${value}${props.unit ? props.unit : ''}`,
    },
    legend: legendOption,
    series: series,
  }

  return merge(defaultOption, props.option || {})
}

const renderChart = (data: EchartsResult) => {
  if (!chartRef.value) return

  // 销毁旧实例防止内存泄漏
  const existingChart = echarts.getInstanceByDom(chartRef.value)
  if (existingChart) {
    existingChart.dispose()
  }

  chart = echarts.init(chartRef.value)
  chart.setOption(mergeOption(generateSeries(data)))
}

const resizeChart = () => {
  if (chart) {
    chart.resize()
  }
}

const doFetchData = async () => {
  const mySerial = ++requestSerial
  let data: EchartsResult = { xData: [], series: [] }

  if (props.mockData && props.mockData.xData && props.mockData.series) {
    data = props.mockData
  } else if (props.url) {
    const params: Record<string, any> = { ...(props.payload || {}) }
    try {
      data = await request.post<EchartsResult>(props.url, params)
    } catch {
      // 请求被取消或失败时静默返回（request.ts 拦截器已处理错误提示）
      return
    }

    if (typeof props.responseHook === 'function') {
      data = props.responseHook(data)
    }
    emit('response', data)
  }

  if (mySerial !== requestSerial) {
    // 忽略已过期的响应（用户快速切换参数时，只渲染最新请求的结果）
    return
  }

  if (Array.isArray(data.xData) && data.xData.length === 0) {
    renderEmpty()
    return
  }
  renderChart(data)
}

const DEBOUNCE_DELAY = 200
const fetchData = debounce(doFetchData, DEBOUNCE_DELAY)

useResizeObserver(chartRef, resizeChart)

watch(props, fetchData, { deep: true })

onMounted(fetchData)

onBeforeUnmount(() => {
  fetchData.cancel()
  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>
