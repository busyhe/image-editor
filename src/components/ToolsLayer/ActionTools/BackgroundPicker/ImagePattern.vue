<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from 'lucide-vue-next'

const emit = defineEmits(['change'])
const fileInput = ref<HTMLInputElement | null>(null)

const handleUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const url = URL.createObjectURL(file)
  emit('change', url)

  // Clear input
  if (fileInput.value) fileInput.value.value = ''
}

const triggerUpload = () => {
  fileInput.value?.click()
}
</script>

<template>
  <div class="p-2 pt-0 flex flex-col items-center justify-center gap-4">
    <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleUpload" />

    <div
      class="border border-dashed border-gray-300 rounded-lg p-6 w-full flex flex-col items-center cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-colors"
      @click="triggerUpload"
    >
      <Upload :size="24" class="text-gray-400 mb-2" />
      <span class="text-sm text-gray-500">点击上传图片</span>
    </div>
  </div>
</template>
