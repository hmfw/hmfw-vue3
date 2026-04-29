<template>
  <div class="exception-page h-full flex-center flex-col">
    <img src="@/assets/500.svg" class="mb-24" alt="500 Internal Server Error" />
    <h1 class="leading-32 my-8">500</h1>
    <p class="text-[#999999]">抱歉，服务器出错了。</p>
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
