<script setup lang="ts">
import { ElConfigProvider, type ComponentSize } from 'element-plus'
import { ref } from 'vue'

const size = ref<ComponentSize>('default')
const zIndex = ref(3000)
</script>

<template>
  <el-config-provider :size="size" :z-index="zIndex">
    <router-view />
  </el-config-provider>
</template>
