<script setup lang="ts">
import ColorPicker from '../ColorPicker/index.vue'

defineProps<{
  modelValue?: string
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const handleChange = (val: string) => {
  emit('update:modelValue', val)
  emit('change', val)
}
</script>

<template>
  <ColorPicker :model-value="modelValue" @change="handleChange" />
</template>
