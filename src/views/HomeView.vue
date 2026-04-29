<script setup lang="ts">
import { ref } from 'vue'

const msg = ref<string>('Hello World!')
const count = ref<number>(0)

function increment() {
  count.value++
}
</script>

<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <el-button type="primary" @click="increment">Count is: {{ count }}</el-button>
  </div>
</template>

<style scoped>
.hello {
  text-align: center;
}
</style>
