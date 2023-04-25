import { makeAutoObservable, observable } from 'mobx'

import { ModelDetails, ModelInfos } from 'api/playground'

class UIStore {
  constructor() {
    makeAutoObservable(this, {
      modelInfos: observable.ref,
      modelDetails: observable.ref,
    })
  }

  modelInfos: ModelInfos = {
    Models: [],
    LoRAs: [],
    Samplers: [],
  }

  modelDetails: ModelDetails = {}

  reset() {
    this.modelInfos = {
      Models: [],
      LoRAs: [],
      Samplers: [],
    }
    this.modelDetails = {}
  }
}

export default new UIStore()
