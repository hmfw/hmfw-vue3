<template>
  <div class="editor">
    <TiptapEditor v-model="content" placeholder="请输入内容..." />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TiptapEditor } from '@mario9/tiptap-editor'
import '@mario9/tiptap-editor/dist/tiptap-vue.css'

const content = ref('')
</script>

<style scoped>
.editor {
  padding: 20px;
}
</style>
