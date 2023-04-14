import { makeAutoObservable } from 'mobx'

class UIStore {
  constructor() {
    makeAutoObservable(this)
  }

  private _isMobile = false

  get isMobile() {
    return this._isMobile
  }

  set isMobile(flag: boolean) {
    this._isMobile = flag
  }

  reset() {
    this._isMobile = false
  }
}

export default new UIStore()
