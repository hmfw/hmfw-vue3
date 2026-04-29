// useResizeObserver.ts
import { onMounted, onUnmounted, watch, type Ref } from 'vue'

export function useResizeObserver(
  targetRef: Ref<HTMLElement | null | undefined>,
  callback: (entry: DOMRectReadOnly) => void
) {
  let resizeObserver: ResizeObserver | null = null
  let observedEl: HTMLElement | null | undefined = null

  const handleWindowResize = () => {
    if (targetRef.value) {
      callback(targetRef.value.getBoundingClientRect())
    }
  }

  const startObserving = () => {
    if (!targetRef.value) return
    // 如果已经监听了当前元素，无需重复绑定
    if (observedEl === targetRef.value) return

    stopObserving()

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          if (entry?.contentRect) {
            callback(entry.contentRect)
          }
        }
      })
      resizeObserver.observe(targetRef.value)
      observedEl = targetRef.value
    } else {
      window.addEventListener('resize', handleWindowResize)
      // 触发初始回调
      const rect = targetRef.value.getBoundingClientRect()
      callback(rect)
      observedEl = targetRef.value
    }
  }

  const stopObserving = () => {
    // 只在有监听元素时才执行
    if (resizeObserver && observedEl) {
      try {
        resizeObserver.unobserve(observedEl)
      } catch (e) {
        // 忽略错误
      }
      resizeObserver.disconnect()
      resizeObserver = null
    }
    window.removeEventListener('resize', handleWindowResize)
    // 无需取消 throttle
    observedEl = null
  }

  // 监听元素变化
  watch(
    () => targetRef.value,
    (newValue, oldValue) => {
      if (newValue !== oldValue) {
        startObserving()
      }
    },
    { immediate: true }
  )

  // 注册生命周期钩子
  onMounted(startObserving)
  onUnmounted(stopObserving)

  return {
    stop: stopObserving,
    restart: startObserving,
  }
}
