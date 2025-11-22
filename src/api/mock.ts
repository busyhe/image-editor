import { ElMessage } from 'element-plus'

// Mock API functions
export const addCanvasApi = async (projectCode: string) => {
  console.log(`[Mock API] Adding canvas for project: ${projectCode}`)
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return { success: true, message: 'Canvas added successfully' }
}

export const deleteCanvasApi = async (projectCode: string) => {
  console.log(`[Mock API] Deleting canvas for project: ${projectCode}`)
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return { success: true, message: 'Canvas deleted successfully' }
}

export const saveCanvasApi = async (projectCode: string, canvasCode: string, data: any) => {
  console.log(`[Mock API] Saving canvas ${canvasCode} for project ${projectCode}`, data)
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return { success: true, message: 'Canvas saved successfully' }
}
