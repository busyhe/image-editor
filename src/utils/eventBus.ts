import mitt from 'mitt'

type Events = {
  refreshMaterialList: void
}

const eventBus = mitt<Events>()

export default eventBus
