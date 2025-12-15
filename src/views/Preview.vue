<script setup lang="ts">
import { ref } from 'vue'
import FabricView from '@/components/FabricView/index.vue'
import templateData from './template.json'
import templateData2 from './template2.json'

const jsonData = ref<any>(templateData)
// Example URL, commented out for now as we use local data
// const jsonUrl = ref('https://example.com/template.json');
</script>

<template>
  <div class="preview-page">
    <div class="preview-header">
      <h1>Fabric.js Preview Component Demo</h1>
    </div>
    <div class="preview-content">
      <FabricView
        :data="jsonData"
        :width="400"
        :height="400"
        fit="contain"
        backgroundColor="#ffffff"
        preview
      />
      <!-- <FabricView :url="jsonUrl" /> -->
    </div>
  </div>
</template>

<style scoped>
.preview-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.preview-header {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #ddd;
  text-align: center;
}

.preview-content {
  flex: 1;
  width: 100%;
  min-height: 0; /* Important for flex child to scroll/resize properly */
  padding: 20px;
  box-sizing: border-box;
}
</style>
