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

// import IconEmpty from '@/assets/empty.svg'

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

export type EChartsOption = echarts.ComposeOption<
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
  title?: string // 图表标题
  height?: number // 图表高度
  url?: string // 数据请求地址
  payload?: Record<string, any> // 请求参数
  unit?: string // 数值单位
  average?: number | string // 平均线数值
  averageLabel?: string
  interval?: number // 类目轴标签间隔
  barWidth?: number // 柱子宽度
  borderRadius?: number[] // 柱子圆角
  showBackground?: boolean // 是否显示柱子背景
  backgroundStyleColor?: string // 背景色
  cyclePickColor?: boolean // 是否循环取色
  color?: string[] | string[][] // 柱子颜色，支持渐变色数组从上到下或单色
  mockData?: EchartsResult // Mock 数据
  top?: number // 前几名
  last?: number // 后几名
  graph?: boolean // 是否条形图
  legend?: boolean // 是否显示图例
  stack?: boolean // 是否堆叠柱状图
  cylinder?: boolean // 是否立体圆柱
  cylinderColor?: string | string[] // 立体圆柱顶部颜色
  highlightCylinderColor?: string // 立体圆柱顶部高亮颜色
  highlightName?: string | string[] // 高亮显示的名称（可以是单个名称或名称数组）
  highlightColor?: string | string[] // 高亮颜色，默认为更亮的颜色
  option?: EChartsOption // 额外的echarts配置项
  responseHook?: (data: EchartsResult) => EchartsResult // 表格数据响应处理函数
}

interface LegendData {
  name: string
  color: string
  type: 'square' | 'line'
  selected?: boolean
}

// 定义组件props
const props = withDefaults(defineProps<BarProps>(), {
  height: 300,
  barWidth: 24,
  averageLabel: '均值',
  showBackground: false,
  borderRadius: () => [0],
  color: () => ['#2979EB', '#FBAE3E', '#F86D6D', '#4ACE82', '#B37FEB', '#44C7FD', '#FADB14'], // [['#5F9EFF', '#0D61C9']] 渐变色
  highlightCylinderColor: '#17AD6B',
  highlightColor: () => ['#31D079', '#13A769'],
})

const emit = defineEmits<{
  (e: 'response', list: any): void
  (e: 'click', params: any): void
  (e: 'legend-change', indicator: string[]): void
}>()

const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
// let resizeObserver: ResizeObserver | null = null
// let useWindowResize = false
const legendData = ref<LegendData[]>([])
// 并发控制：追踪与取消正在进行的请求
let requestSerial = 0

const { createMarkLine, createColor } = useEcharts()
const { renderEmpty } = useEmptyEchart(chartRef)

// 计算图例禁用状态
// const legendDisabled = computed(() => {
//   const list = legendData.value.filter(
//     item => item.selected === true && item.name !== props.averageLabel
//   )
//   return list.length <= 1
// })

// 计算样式
const style = computed(() => ({
  flex: '1',
  width: '100%',
  height: `${props.height}px`,
}))

const showAverage = ref(false)

// let maxLabel = 0

// 转换结果为 dataset 格式
const resultToDataset = (data: EchartsResult): DatasetComponentOption => {
  const dimensions = ['category', ...data.series.map(s => s.name)]

  const source = data.xData.map((name, idx) => {
    const row: Array<string | number | undefined> = [name]
    data.series.forEach(s => {
      let v = s.data[idx]
      v = typeof v === 'string' ? Number(v) : v
      row.push(v)
    })
    return row
  })
  // console.log({ dimensions, source })
  return { dimensions, source }
}

// 生成图例
// const generateLegend = (series: BarSeries[]): LegendData[] => {
//   const list: LegendData[] = series
//     .filter(s => s.type === 'bar')
//     .map((s, i) => {
//       let itemColor = ''
//       const index = i % props.color.length
//       if (typeof props.color[index] === 'string') {
//         itemColor = props.color[index] as string
//       } else {
//         const colorArr = props.color as string[][]
//         itemColor = `linear-gradient(180deg, ${colorArr[index][0]}, ${colorArr[index][1]})`
//       }

//       return {
//         name: s.name as string,
//         color: itemColor,
//         type: 'square',
//         selected: true,
//       }
//     })
//   if (props.average) {
//     list.push({
//       name: props.averageLabel,
//       color: '#FF462E',
//       type: 'line',
//       selected: true,
//     })
//   }
//   return list
// }

// 检查是否需要高亮 - 支持单个名称或名称数组
// const shouldHighlight = (name: string): boolean => {
//   if (props.highlightName !== undefined) {
//     if (Array.isArray(props.highlightName)) {
//       return props.highlightName.includes(name)
//     } else {
//       return props.highlightName === name
//     }
//   }
//   return false
// }

// 创建渐变色
// const createGradient = (color1: string, color2: string): echarts.graphic.LinearGradient => {
//   return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//     { offset: 0, color: color1 },
//     { offset: 1, color: color2 },
//   ])
// }

// 获取循环颜色
// const getCycleColor = (
//   dataIndex: number,
//   colorArray: any[]
// ): string | echarts.graphic.LinearGradient => {
//   const cycleIndex = dataIndex % colorArray.length
//   const colorItem = colorArray[cycleIndex]

//   if (Array.isArray(colorItem)) {
//     return createGradient(colorItem[0], colorItem[1])
//   }
//   return colorItem as string
// }

// 获取图例颜色
// const getLegendColor = (
//   seriesItem: any,
//   index: number,
//   colorArray: any[]
// ): string | echarts.graphic.LinearGradient => {
//   if (typeof colorArray[index] === 'string') {
//     const found = legendData.value.find((item: LegendData) => item.name === seriesItem.name)
//     return found?.color || (colorArray[index] as string)
//   }

//   const colorArr = colorArray as string[][]
//   let colorIndex = index % colorArr.length
//   const foundIndex = legendData.value.findIndex((item: LegendData) => item.name === seriesItem.name)

//   if (foundIndex !== -1) {
//     colorIndex = foundIndex % colorArr.length
//   }

//   return createGradient(colorArr[colorIndex][0], colorArr[colorIndex][1])
// }

// 获取高亮颜色（绿色渐变）
// const getHighlightColor = (): string | echarts.graphic.LinearGradient => {
//   // 绿色渐变：从浅绿到深绿
//   const greenGradient = createGradient('#52C41A', '#389E0D')

//   if (props.highlightColor) {
//     // 用户自定义高亮颜色
//     if (Array.isArray(props.highlightColor)) {
//       return createGradient(props.highlightColor[0], props.highlightColor[1])
//     } else {
//       return props.highlightColor
//     }
//   }
//   // 默认使用绿色渐变
//   return greenGradient
// }

// 获取柱子颜色
const getItemColor = (params: CallbackDataParams) => {
  const { dataIndex, seriesIndex } = params
  // console.log('getItemColor', params, dataIndex, seriesIndex)
  let index = seriesIndex ? seriesIndex % props.color.length : 0
  console.log('color index', index, dataIndex)
  if (props.cyclePickColor) {
    index = dataIndex % props.color.length
  }

  return createColor(props.color[index] as string | string[])
  // const { top, last, color, cyclePickColor } = props
  // const dataIndex = params.dataIndex as number
  // const name = params.name as string
  // // 检查是否需要高亮
  // const isHighlighted = shouldHighlight(name)
  // 前几名或后几名特殊处理
  // if ((top && dataIndex < top) || (last && dataIndex >= data.xData.length - last)) {
  //   const defaultColor = createGradient('#FA8175', '#F15039')
  //   return isHighlighted ? getHighlightColor() : defaultColor
  // }
  // 循环取色逻辑
  // if (cyclePickColor && color.length > 0) {
  //   const defaultColor = getCycleColor(dataIndex, color)
  //   return isHighlighted ? getHighlightColor() : defaultColor
  // }
  // 默认逻辑
  // const defaultColor = getLegendColor(seriesItem, index, color)
  // return isHighlighted ? getHighlightColor() : defaultColor
}

// 获取立体圆柱顶部颜色
// const getCircularTop = (params: any, seriesItem: any, idx: number, data: EchartsResult): string => {
//   const { top, last, cyclePickColor } = props
//   const dataIndex = params.dataIndex as number
//   const name = data.xData[dataIndex] || ''
//   const isHighlighted = shouldHighlight(name)

//   // 获取高亮时的圆柱顶部颜色
//   const highlightCylinderColor = props.highlightCylinderColor || '#389E0D'
//   if (cyclePickColor && props.color.length > 0) {
//     let cycleIndex = dataIndex % props.color.length
//     let defaultColor: string
//     if (Array.isArray(props.color[cycleIndex])) {
//       const colorArr = props.color as string[][]
//       defaultColor = colorArr[cycleIndex][1]
//     } else {
//       defaultColor = props.color[cycleIndex] as string
//     }
//     return isHighlighted ? highlightCylinderColor : defaultColor
//   }

//   if ((top && dataIndex < top) || (last && dataIndex >= data.xData.length - last)) {
//     const defaultColor = '#ED4141'
//     return isHighlighted ? highlightCylinderColor : defaultColor
//   } else {
//     let defaultColor: string
//     if (Array.isArray(props.cylinderColor)) {
//       let index = idx % props.cylinderColor.length
//       const foundIndex = legendData.value.findIndex(item => item.name === seriesItem.name)
//       if (foundIndex !== -1) {
//         index = foundIndex % props.cylinderColor.length
//       }
//       defaultColor = props.cylinderColor[index]
//     } else if (props.cylinderColor) {
//       defaultColor = props.cylinderColor as string
//     } else {
//       defaultColor = '#2979EB'
//     }
//     return isHighlighted ? highlightCylinderColor : defaultColor
//   }
// }

// 生成 series 配置
const generateSeries = (data: EchartsResult): BarSeries[] => {
  // 计算平均值
  const averageValue = props.average || data.averageLineValue
  showAverage.value = !!averageValue
  const series: BarSeries[] = []
  const averageLabel = `${props.averageLabel} ${averageValue} ${props.unit || ''}`
  const markLine = averageValue ? createMarkLine(averageLabel, Number(averageValue)) : undefined
  // 如果是条形图，交换x、y轴
  if (markLine && props.graph) {
    // @ts-ignore
    markLine.data[0].yAxis = undefined
    // @ts-ignore
    markLine.data[0].xAxis = Number(averageValue)
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
        // color: params => getItemColor(params, s, idx, data),
      },
      showBackground: props.showBackground,
      backgroundStyle: { color: props.backgroundStyleColor || '#F5F7FA' },
      markLine: markLine,
    }
    series.push(item)
    // 立体圆柱
    // if (props.cylinder) {
    //   let x = 0
    //   if (data.series.length > 1 && props.barWidth) {
    //     x = (idx - (data.series.length - 1) / 2) * (props.barWidth * 1.2)
    //   }
    //   // @ts-ignore
    //   series.push({
    //     type: 'pictorialBar',
    //     name: 'circle-top',
    //     symbolSize: [props.barWidth, props.barWidth / 2],
    //     symbolOffset: [x, -props.barWidth / 4],
    //     z: 10,
    //     symbolPosition: 'end',
    //     // itemStyle: {
    //     //   color: (params: any) => getCircularTop(params, s, idx, data),
    //     // },
    //     animationDelay: 100,
    //     tooltip: { show: false },
    //   })
    // }
  })
  // console.log('generateSeries', series)
  return series
}

// 合并配置项
const mergeOption = (dataset: DatasetComponentOption, series: BarSeries[]): EChartsOption => {
  const defaultOption: EChartsOption = {
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
        // fontFamily: 'Source Han Sans',
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
        // fontFamily: 'Source Han Sans',
        formatter: (value: string) => (props.interval === 0 ? value.split('').join('\n') : value),
        // formatter: (value: string) =>
        // props.interval === 0 ? (maxLabel < 10 ? value.split('').join('\n') : value.replace(/(..)/g, '$1\n')) : value
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
        // fontWeight: 700,
        // fontFamily: 'D-DIN-Bold',
        formatter: (value: number) => `${value}${props.unit === '%' ? props.unit : ''}`,
      },
    },
    dataset: dataset,
    series: series,
  }

  // 如果是条形图，交换x、y轴类型
  if (props.graph) {
    // @ts-ignore
    defaultOption.yAxis.type = 'category'
    // @ts-ignore
    defaultOption.yAxis.inverse = true
    // @ts-ignore
    defaultOption.xAxis.type = 'value'
  }

  return merge(defaultOption, props.option || {})
}

// 初始化图表
const renderChart = (data: EchartsResult) => {
  if (!chartRef.value) return

  // 1. 检查是否已有图表实例
  const existingChart = echarts.getInstanceByDom(chartRef.value)

  // 2. 如果存在，先销毁旧实例释放资源
  if (existingChart) {
    existingChart.dispose()
  }

  // 3. 重新初始化新实例
  chart = echarts.init(chartRef.value)

  const dataset = resultToDataset(data) // 转换数据格式
  const series = generateSeries(data) // 生成 series 配置
  const opt = mergeOption(dataset, series) // 合并配置项

  // 生成图例-解决柱状图点击消失后无法恢复问题
  // if (legendData.value.length === 0) {
  //   legendData.value = generateLegend(series)
  // }
  // console.log('setOption', opt)
  chart.setOption(opt)

  // 添加点击事件监听
  // chart.off('click')
  // chart.on('click', (params: any) => {
  //   // 只处理柱状图的点击，忽略图例等其他元素的点击
  //   if (params.componentType === 'series' && params.seriesType === 'bar') {
  //     emit('click', {
  //       name: params.name, // x轴数据名称（地区名称）
  //       seriesName: params.seriesName, // 系列名称
  //       value: params.value, // 数据值
  //       dataIndex: params.dataIndex, // 数据索引
  //       seriesIndex: params.seriesIndex, // 系列索引
  //       data: params.data, // 完整数据
  //     })
  //   }
  // })
}

// 自适应大小
const resizeChart = () => {
  if (chart) {
    chart.resize()
  }
}

// 获取数据并渲染图表（内部实现）
const doFetchData = async () => {
  // 为本次请求创建序列号（网络请求分支使用）
  const mySerial = ++requestSerial
  let data: EchartsResult = { xData: [], series: [] }

  if (props.mockData && props.mockData.xData && props.mockData.series) {
    data = props.mockData
  } else if (props.url) {
    const params: Record<string, any> = { ...(props.payload || {}) }
    if (legendData.value.length > 0) {
      params.indicator = legendData.value.filter(item => item.selected).map(item => item.name)
      if (params.indicator.length === 0) {
        delete params.indicator
      }
    } else {
      if (Array.isArray(params.indicator) && params.indicator.length === 0) {
        delete params.indicator
      }
    }
    try {
      data = await request.post<EchartsResult>(props.url, params)
    } catch (err: any) {
      // 取消的请求直接忽略，不做任何渲染
      const canceled = err?.code === 'ERR_CANCELED' || err?.name === 'AbortError'
      if (canceled) {
        return
      }
      // 非取消错误保持原有逻辑：弹错由拦截器处理，这里不阻断后续流程
      return
    }

    if (typeof props.responseHook === 'function') {
      data = props.responseHook(data)
    }
    emit('response', data)
  }

  // 若期间又发起了新的请求，则忽略当前已过期的响应
  if (mySerial !== requestSerial) {
    return
  }

  if (Array.isArray(data.xData) && data.xData.length === 0) {
    legendData.value = []
    renderEmpty()
    return
  }
  // console.log('xxxxxxxxxxxxxxxxxxxxx')
  renderChart(data)
}

// 获取数据并渲染图表（带防抖，200ms）
const fetchData = debounce(doFetchData, 200)

// 图例点击事件
// const legendChange = (item: LegendData) => {
//   if (legendDisabled.value && item.selected) {
//     return
//   }
//   item.selected = !item.selected
//   const indicator = legendData.value.filter(item => item.selected).map(item => item.name)
//   emit('legend-change', indicator)
//   if (props.url) {
//     fetchData()
//   }
// }

useResizeObserver(chartRef, resizeChart)

// 监听props变化，重新渲染图表
watch(props, fetchData, { deep: true })

onMounted(fetchData)

onBeforeUnmount(() => {
  // 取消防抖执行
  fetchData.cancel()
  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>
