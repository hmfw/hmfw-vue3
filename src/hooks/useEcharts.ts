import { onMounted, type Ref } from 'vue'

import * as echarts from 'echarts/core'
import { GraphicComponent } from 'echarts/components'

import { useResizeObserver } from './useResizeObserver'
import IconEmpty from '@/assets/empty.svg'

import type { MarkLineComponentOption } from 'echarts/components'

echarts.use([GraphicComponent])

export function useEcharts() {
  // 创建颜色渐变
  const createColor = (color: string | string[]) => {
    if (Array.isArray(color)) {
      return new echarts.graphic.LinearGradient(
        0,
        0,
        0,
        1,
        color.map((c, i) => ({ offset: i / (color.length - 1), color: c }))
      )
    }
    return color
  }

  // 创建平均线
  const createMarkLine = (label: string, value: number | string): MarkLineComponentOption => {
    return {
      silent: true,
      symbol: 'none',
      lineStyle: { color: '#ff462e', type: 'dashed', width: 1 },
      data: [
        {
          type: 'average',
          yAxis: value,
          label: {
            show: true,
            fontSize: 14,
            color: '#ff462e',
            position: 'insideEndTop',
            formatter: `${label}`,
          },
        },
      ],
    }
  }

  return {
    createColor,
    createMarkLine,
  }
}

// 渲染无数据图表
export function useEmptyEchart(targetRef: Ref<HTMLElement | null | undefined>) {
  let chart: echarts.ECharts | null = null

  useResizeObserver(targetRef, () => {
    chart?.resize()
  })

  // 渲染无数据图表
  const renderEmpty = () => {
    if (!targetRef.value) return

    const instance = echarts.getInstanceByDom(targetRef.value)
    if (instance) {
      instance.dispose()
    }

    chart = echarts.init(targetRef.value)

    const option = {
      graphic: {
        type: 'group',
        left: 'center',
        top: 'center',
        cursor: 'default',
        children: [
          {
            type: 'image',
            style: { image: IconEmpty, width: 110, height: 110 },
          },
          {
            type: 'text',
            top: 110,
            left: 20,
            style: { text: '暂无数据', fill: '#929292', font: '18px Source Han Sans' },
          },
        ],
      },
    }

    chart.setOption(option)
  }

  onMounted(() => {
    if (chart) {
      chart.dispose()
      chart = null
    }
  })

  return {
    renderEmpty,
  }
}
