<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="cachedViews">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </router-view>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 从 TagsView 组件获取缓存列表
const cachedViews = ref<string[]>([])

// 提供缓存列表给 TagsView 组件
provide('cachedViews', cachedViews)
</script>
