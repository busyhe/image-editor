<script setup lang="ts">
import Title from './Title/index.vue'
import Export from './Export/index.vue'
import ActionTools from './ActionTools/index.vue'
import Layer from './Layer/index.vue'
import CanvasList from './CanvasList/index.vue'
import LayerButton from './LayerButton/index.vue'
</script>

<template>
  <!-- 标题 -->
  <Title class="absolute top-4 left-4" />
  <!-- 导出按钮 -->
  <Export class="absolute top-4 right-4" />
  <!-- 操作工具栏 -->
  <ActionTools class="absolute top-4 w-[80%] ml-[10%]" />
  <!-- 图层栏 -->
  <Layer class="absolute left-0 bottom-16 flex gap-2 justify-center p-0 px-4" />
  <!-- 图层按钮 -->
  <LayerButton class="absolute left-4 bottom-4" />
  <!-- 画布列表 -->
  <CanvasList class="absolute right-0 bottom-[68px] flex gap-2 justify-center p-0 px-[12px]" />
</template>
