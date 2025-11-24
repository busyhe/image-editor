<script setup lang="ts">
import { Download } from 'lucide-vue-next'
import { debounce } from 'lodash-es'
import { useEditorStore } from '@/stores/modules/editor'
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { saveCanvasApi } from '@/api/mock'
import { useTemplateStore } from '@/stores/modules/template'

const editorStore = useEditorStore()
const templateStore = useTemplateStore()

const cbMap = {
  saveImg() {
    editorStore.editor.saveImg()
  },
  saveJson() {
    editorStore.editor.saveJson()
  },
  saveToProject() {
    handleSaveProject()
  },
}

const saveWith = debounce(function (type: keyof typeof cbMap) {
  cbMap[type] && typeof cbMap[type] === 'function' && cbMap[type]()
}, 300)

// Save Project Logic
const dialogVisible = ref(false)
const loading = ref(false)
const saveLoading = ref(false)
const formRef = ref()
const formData = reactive({
  projectName: '',
  category: '',
})
const categoryOptions = ref<{ label: string; value: string }[]>([])

const rules = {
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
}

const fetchCategories = async () => {
  loading.value = true
  // Mock async fetch
  setTimeout(() => {
    categoryOptions.value = [
      { label: '海报', value: 'poster' },
      { label: '社交媒体', value: 'social_media' },
      { label: '名片', value: 'card' },
      { label: '其他', value: 'other' },
    ]
    loading.value = false
  }, 500)
}

const handleSaveProject = () => {
  dialogVisible.value = true
  formData.projectName = ''
  formData.category = ''
  fetchCategories()
}

const confirmSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      saveLoading.value = true
      try {
        // Get canvas image
        // Get workspace object
        const workspace = editorStore.canvas?.getObjects().find((item) => item.id === 'workspace')
        const { left, top, width, height } = (workspace as any) || {
          left: 0,
          top: 0,
          width: 0,
          height: 0,
        }

        // Get canvas image
        const dataURL = editorStore.canvas?.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 1,
          left,
          top,
          width,
          height,
        })

        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        console.log('Saving Project:', {
          name: formData.projectName,
          category: formData.category,
          image: dataURL, // Truncated for log
        })

        ElMessage.success('项目保存成功')
        dialogVisible.value = false
      } catch (error) {
        console.error(error)
        ElMessage.error('保存失败')
      } finally {
        saveLoading.value = false
      }
    }
  })
}

const handleManualSave = async () => {
  const projectCode = new URLSearchParams(window.location.search).get('code')
  if (!projectCode) {
    // Fallback to save project dialog if no code
    handleSaveProject()
    return
  }

  const currentTemplate = templateStore.curTemplate
  if (!currentTemplate) return

  editorStore.setIsSaving(true)
  try {
    await saveCanvasApi(projectCode, currentTemplate.id, currentTemplate)
    ElMessage.success('保存成功')
  } catch (error) {
    console.error(error)
    ElMessage.error('保存失败')
  } finally {
    editorStore.setIsSaving(false)
  }
}

const isSaving = computed(() => editorStore.isSaving)
</script>

<template>
  <div>
    <el-button type="primary" class="mr-2" :loading="isSaving" @click="handleManualSave">
      {{ isSaving ? '保存中' : '保 存' }}
    </el-button>
    <el-dropdown placement="bottom-end" @command="saveWith">
      <el-button type="primary">
        <Download :size="16" />
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="saveImg">下载 png 图片</el-dropdown-item>
          <el-dropdown-item command="saveJson">保存 JSON 数据</el-dropdown-item>
          <el-dropdown-item command="saveToProject">保存项目</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <el-dialog v-model="dialogVisible" title="保存项目" width="400px">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="formData.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select
            v-model="formData.category"
            placeholder="请选择分类"
            :loading="loading"
            style="width: 100%"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="saveLoading" @click="confirmSave"> 保存 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
