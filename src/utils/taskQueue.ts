type Task<T = any> = () => Promise<T>

export class TaskQueue {
  private queue: Task[] = []
  private isProcessing = false

  constructor() {}

  enqueue<T>(task: Task<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const wrappedTask = async () => {
        try {
          const result = await task()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }

      this.queue.push(wrappedTask)
      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.isProcessing) return
    this.isProcessing = true

    while (this.queue.length > 0) {
      const task = this.queue.shift()
      if (task) {
        try {
          await task()
        } catch (error) {
          console.error('Task execution failed:', error)
        }
      }
    }

    this.isProcessing = false
  }

  get size() {
    return this.queue.length
  }
}

export const globalTaskQueue = new TaskQueue()
