<template>
  <div class="echarts-bar relative">
    <div ref="chartRef" :style="style"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { merge, debounce } from 'lodash'
import request, { type EchartsResult } from '@/utils/request'

import * as echarts from 'echarts/core'
import { BarChart, PictorialBarChart } from 'echarts/charts'

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

import type { BarSeriesOption, PictorialBarSeriesOption } from 'echarts/charts'
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
import type { CallbackDataParams } from 'echarts/types/dist/shared'

echarts.use([
  BarChart,
  PictorialBarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LegacyGridContainLabel,
  DatasetComponent,
  MarkLineComponent,
  CanvasRenderer,
])

type BarSeries = BarSeriesOption | PictorialBarSeriesOption

export type BarOption = echarts.ComposeOption<
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
  | DatasetComponentOption
  | MarkLineComponentOption
  | BarSeriesOption
  | PictorialBarSeriesOption
>

export interface BarProps {
  height?: number // 图表高度
  url?: string // 数据请求地址
  payload?: Record<string, any> // 请求参数
  unit?: string // 数值单位
  average?: number | string // 平均线数值
  averageLabel?: string // 平均线标签
  interval?: number // 类目轴标签间隔
  barWidth?: number // 柱子宽度
  borderRadius?: number[] // 柱子圆角
  showBackground?: boolean // 是否显示柱子背景
  backgroundStyleColor?: string // 柱子背景色
  cyclePickColor?: boolean // 是否按数据索引循环取色
  color?: string[] | string[][] // 柱子颜色，支持单色数组或渐变色二维数组（从上到下）
  mockData?: EchartsResult // Mock 数据，优先于 url 请求
  graph?: boolean // 是否为条形图（横向）
  legend?: boolean // 是否显示图例
  stack?: boolean // 是否堆叠柱状图
  option?: BarOption // 额外的 ECharts 配置，会与默认配置深度合并
  responseHook?: (data: EchartsResult) => EchartsResult // 接口响应数据处理函数
}

const props = withDefaults(defineProps<BarProps>(), {
  height: 300,
  barWidth: 24,
  averageLabel: '均值',
  showBackground: false,
  borderRadius: () => [4, 4, 0, 0],
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

const getItemColor = (params: CallbackDataParams) => {
  const { dataIndex, seriesIndex } = params
  const index = props.cyclePickColor
    ? dataIndex % props.color.length
    : (seriesIndex ?? 0) % props.color.length
  return createColor(props.color[index] ?? '#2979EB')
}

const generateSeries = (data: EchartsResult): BarSeries[] => {
  const averageValue = props.average || data.averageLineValue
  showAverage.value = !!averageValue
  const series: BarSeries[] = []
  const averageLabel = `${props.averageLabel} ${averageValue} ${props.unit || ''}`
  const markLine = averageValue ? createMarkLine(averageLabel, Number(averageValue)) : undefined
  // 横向条形图时，平均线需要从纵轴切换到横轴
  if (markLine && props.graph && markLine.data?.[0]) {
    const markLineData = markLine.data[0] as any
    markLineData.yAxis = undefined
    markLineData.xAxis = Number(averageValue)
  }

  data.series.forEach(s => {
    const item: BarSeries = {
      type: 'bar',
      name: s.name,
      barWidth: props.barWidth,
      stack: props.stack ? 'total' : undefined,
      itemStyle: {
        borderRadius: props.borderRadius,
        color: getItemColor,
      },
      showBackground: props.showBackground,
      backgroundStyle: { color: props.backgroundStyleColor || '#F5F7FA' },
      markLine: markLine,
    }
    series.push(item)
  })
  return series
}

const mergeOption = (dataset: DatasetComponentOption, series: BarSeries[]): BarOption => {
  const defaultOption: BarOption = {
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
      axisPointer: { type: 'shadow' },
      valueFormatter: value => `${value}${props.unit ? props.unit : ''}`,
    },
    xAxis: {
      type: 'category',
      axisTick: { show: false },
      axisLabel: {
        fontSize: 14,
        lineHeight: 18,
        color: '#929292',
        interval: props.interval,
        // interval=0 时垂直显示文字，用于密集标签场景
        formatter: (value: string) => (props.interval === 0 ? value.split('').join('\n') : value),
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

  if (props.graph) {
    const yAxis = defaultOption.yAxis as any
    const xAxis = defaultOption.xAxis as any
    yAxis.type = 'category'
    yAxis.inverse = true
    xAxis.type = 'value'
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
    } catch (err: any) {
      // 请求被取消或失败时静默返回（request.ts 拦截器已处理错误提示）
      return
    }

    if (typeof props.responseHook === 'function') {
      data = props.responseHook(data)
    }
    emit('response', data)
  }

  // 忽略已过期的响应（用户快速切换参数时，只渲染最新请求的结果）
  if (mySerial !== requestSerial) {
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
