<template>
  <div class="exception-page h-full flex-center flex-col">
    <img src="@/assets/403.svg" class="mb-24" alt="403 Forbidden" />
    <h1 class="leading-32 my-8">403</h1>
    <p class="text-[#999999]">抱歉，您无权访问此页面。</p>
    <el-button class="mt-24" type="primary" @click="goHome">返回首页</el-button>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const goHome = () => {
  router.push({ path: '/' })
}
</script>
