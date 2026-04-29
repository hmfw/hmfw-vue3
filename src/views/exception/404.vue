<template>
  <div class="exception-page h-full flex-center flex-col">
    <img src="@/assets/404.svg" class="mb-24" alt="404 Not Found" />
    <h1 class="leading-32 my-8">404</h1>
    <p class="text-[#999999]">抱歉，您访问的页面不存在。</p>
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
