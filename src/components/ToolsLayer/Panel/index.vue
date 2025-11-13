<script setup lang="ts">
import { X } from 'lucide-vue-next'

const handleClose = () => {
  console.log('close')
}
</script>

<template>
  <div>
    <div class="bg-white rounded-md flex flex-col h-[calc(100vh-140px)] relative w-[280px]">
      <div
        class="panel-header flex items-center justify-between border-b border-[#DCDFE6] h-[48px] pl-4 pr-2 relative w-full z-1"
      >
        <span>面板</span>
        <el-button text :icon="X" />
      </div>
      <div class="panel-content flex-1 overflow-y-auto"></div>
    </div>
  </div>
</template>
