import { makeAutoObservable, observable } from 'mobx'

import { ModelInfos } from 'api/playground'

class UIStore {
  constructor() {
    makeAutoObservable(this, {
      modelInfos: observable.ref,
    })
  }

  modelInfos: ModelInfos = {
    Models: [],
    LoRAs: [],
    Samplers: [],
  }

  reset() {
    this.modelInfos = {
      Models: [],
      LoRAs: [],
      Samplers: [],
    }
  }
}

export default new UIStore()
