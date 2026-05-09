<template>
  <div class="echarts-line relative">
    <div ref="chartRef" :style="style"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { merge, debounce } from 'lodash'
import request, { type EchartsResult } from '@/utils/request'

import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  MarkLineComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { LegacyGridContainLabel } from 'echarts/features'

import type { LineSeriesOption } from 'echarts/charts'
import type {
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  LegendComponentOption,
  DatasetComponentOption,
  MarkLineComponentOption,
} from 'echarts/components'

import { useEcharts, useEmptyEchart } from '@/hooks/useEcharts'
import { useResizeObserver } from '@/hooks/useResizeObserver'

echarts.use([
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LegacyGridContainLabel,
  DatasetComponent,
  MarkLineComponent,
  CanvasRenderer,
])

export type LineOption = echarts.ComposeOption<
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
  | DatasetComponentOption
  | MarkLineComponentOption
  | LineSeriesOption
>

export interface LineProps {
  height?: number // 图表高度
  url?: string // 数据请求地址
  payload?: Record<string, any> // 请求参数
  unit?: string // 数值单位
  average?: number | string // 平均线数值
  averageLabel?: string // 平均线标签
  interval?: number // 类目轴标签间隔
  smooth?: boolean // 是否平滑曲线
  area?: boolean // 是否显示面积填充
  areaOpacity?: number // 面积填充透明度
  symbol?: boolean // 是否显示数据点
  lineWidth?: number // 线条宽度
  // 颜色数组，支持单色字符串数组或渐变色二维数组（从上到下）；渐变仅作用于面积填充，线条始终取首色
  color?: string[] | string[][]
  mockData?: EchartsResult // Mock 数据，优先于 url 请求
  legend?: boolean // 是否显示图例（位于右上角）
  stack?: boolean // 是否堆叠
  option?: LineOption // 额外的 ECharts 配置，会与默认配置深度合并
  responseHook?: (data: EchartsResult) => EchartsResult // 接口响应数据处理函数
}

const props = withDefaults(defineProps<LineProps>(), {
  height: 300,
  averageLabel: '均值',
  areaOpacity: 0.3,
  symbol: true,
  lineWidth: 2,
  color: () => ['#2979EB', '#FBAE3E', '#F86D6D', '#4ACE82', '#B37FEB', '#44C7FD', '#FADB14'],
})

const emit = defineEmits<{
  (e: 'response', list: any): void
}>()

const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
// 竞态条件保护：快速切换参数时，只渲染最新请求的结果，忽略已过期的响应
let requestSerial = 0

const { createMarkLine, createColor } = useEcharts()
const { renderEmpty } = useEmptyEchart(chartRef)

const style = computed(() => ({
  flex: '1',
  width: '100%',
  height: `${props.height}px`,
}))

// 用于在 mergeOption 中动态调整 grid.top，为平均线标签预留空间
const showAverage = ref(false)

const resultToDataset = (data: EchartsResult): DatasetComponentOption => {
  const dimensions = ['category', ...data.series.map(s => s.name)]
  const source = data.xData.map((name, idx) => {
    const row: Array<string | number | undefined> = [name]
    data.series.forEach(s => {
      const value = s.data[idx]
      row.push(typeof value === 'string' ? Number(value) : value)
    })
    return row
  })
  return { dimensions, source }
}

const generateSeries = (data: EchartsResult): LineSeriesOption[] => {
  const averageValue = props.average || data.averageLineValue
  showAverage.value = !!averageValue
  const averageLabel = `${props.averageLabel} ${averageValue} ${props.unit || ''}`
  const markLine = averageValue ? createMarkLine(averageLabel, Number(averageValue)) : undefined

  return data.series.map((s, i) => {
    const rawColor = props.color[i % props.color.length] ?? '#2979EB'
    // 线条始终用纯色（取渐变数组的第一个色值），面积填充才使用渐变
    const solidColor = Array.isArray(rawColor) ? rawColor[0] : rawColor
    return {
      type: 'line',
      name: s.name,
      smooth: props.smooth,
      symbol: props.symbol ? 'circle' : 'none',
      symbolSize: 6,
      lineStyle: { width: props.lineWidth, color: solidColor },
      itemStyle: { color: solidColor },
      areaStyle: props.area
        ? { opacity: props.areaOpacity, color: createColor(rawColor) as any }
        : undefined,
      stack: props.stack ? 'total' : undefined,
      markLine: markLine,
    }
  })
}

const mergeOption = (dataset: DatasetComponentOption, series: LineSeriesOption[]): LineOption => {
  const defaultOption: LineOption = {
    color: props.color,
    grid: {
      top: (props.unit && props.unit !== '%') || props.legend ? 40 : showAverage.value ? 35 : 18,
      left: 1,
      right: 10,
      bottom: 10,
      containLabel: true,
    },
    title: {
      text: props.unit && props.unit !== '%' ? `单位：${props.unit}` : '',
      left: -4,
      top: 2,
      textStyle: {
        fontSize: 13,
        fontWeight: 400,
        color: '#C7C7C7',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' },
      valueFormatter: value => `${value}${props.unit ? props.unit : ''}`,
    },
    legend: props.legend ? { right: 0, top: 0 } : undefined,
    xAxis: {
      type: 'category',
      axisTick: { show: false },
      axisLabel: {
        fontSize: 14,
        lineHeight: 18,
        color: '#929292',
        interval: props.interval,
      },
      axisLine: {
        lineStyle: { color: '#e6e7eb' },
      },
      splitLine: {
        lineStyle: { type: 'dashed', color: '#e6e7eb' },
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: { color: '#e6e7eb' },
      },
      splitLine: {
        lineStyle: { type: 'dashed', color: '#e6e7eb' },
      },
      axisLabel: {
        color: '#929292',
        fontSize: 15,
        formatter: (value: number) => `${value}${props.unit === '%' ? props.unit : ''}`,
      },
    },
    dataset: dataset,
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

  const dataset = resultToDataset(data)
  const series = generateSeries(data)
  const opt = mergeOption(dataset, series)

  chart.setOption(opt)
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
