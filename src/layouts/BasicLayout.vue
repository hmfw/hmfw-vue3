<template>
  <el-container class="min-h-screen basic-layout">
    <GlobalSider />
    <el-container class="is-vertical">
      <GlobalHeader />
      <el-main class="h-0 bg-[#f5f5f5]">
        <router-view />
      </el-main>
      <GlobalFooter />
    </el-container>
  </el-container>
</template>
<script setup lang="ts">
import GlobalSider from './GlobalSider.vue'
import GlobalHeader from './GlobalHeader.vue'
import GlobalFooter from './GlobalFooter.vue'
</script>
