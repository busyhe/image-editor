import { fabric } from 'fabric'

const originalToObject = fabric.Object.prototype.toObject

fabric.Object.prototype.toObject = function (propertiesToInclude: string[]) {
  return originalToObject.call(this, ['id', 'name'].concat(propertiesToInclude))
}
