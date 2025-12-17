<script setup lang="ts">
import { ref } from 'vue'
import SolidColor from './SolidColor.vue'
import GradientColor from './GradientColor.vue'
import ImagePattern from './ImagePattern.vue'

defineProps<{
  color?: string
}>()

const emit = defineEmits(['update:color', 'change'])

const activeTab = ref('solid')

// Watch color popover to switch to solid if color is updated externally,
// strictly speaking we don't know the type if it comes from outside unless we parse it.
// Assuming solid for string colors.

const handleSolidChange = (val: string) => {
  emit('update:color', val)
  emit('change', { type: 'solid', value: val })
}

const handleGradientChange = (val: any) => {
  emit('change', { type: 'gradient', value: val })
}

const handleImageChange = (val: string) => {
  emit('change', { type: 'image', value: val })
}
</script>

<template>
  <div class="w-72 bg-white">
    <el-tabs v-model="activeTab" stretch class="bg-picker-tabs">
      <el-tab-pane label="纯色" name="solid">
        <SolidColor :model-value="color" @change="handleSolidChange" />
      </el-tab-pane>
      <el-tab-pane label="渐变" name="gradient">
        <GradientColor @change="handleGradientChange" />
      </el-tab-pane>
      <el-tab-pane label="图片" name="image">
        <ImagePattern @change="handleImageChange" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-tabs__header) {
  margin-bottom: 0px;
}
:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}
:deep(.el-tabs__item) {
  height: 36px;
  line-height: 36px;
  font-size: 13px;
}
:deep(.el-tabs__content) {
  padding-top: 8px;
}
</style>
