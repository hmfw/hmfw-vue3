<template>
  <div class="redirect-container"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  const { params, query } = route
  const { path } = params

  const targetPath = Array.isArray(path) ? path.join('/') : path

  if (targetPath) {
    router.replace({
      path: '/' + targetPath,
      query,
    })
  } else {
    router.replace('/')
  }
})
</script>

<style>
/* .redirect-container {
  display: none;
} */
</style>
