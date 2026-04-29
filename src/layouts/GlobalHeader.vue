<template>
  <el-header class="global-header flex-between">
    <div class="header-left">
      <el-icon class="cursor-pointer" @click="layout.toggleCollapsed">
        <Fold v-if="!layout.config.collapsed" />
        <Expand v-else />
      </el-icon>
    </div>

    <HeaderRight />
  </el-header>
</template>

<script setup lang="ts">
import { Fold, Expand } from '@element-plus/icons-vue'
import HeaderRight from './HeaderRight.vue'

import { useLayoutStore } from '@/stores/layout'

const layout = useLayoutStore()
</script>

<style lang="scss">
.global-header {
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}
</style>
