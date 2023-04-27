import { FormInstance } from 'antd'
import { makeAutoObservable } from 'mobx'

class PlaygroundStore {
  constructor() {
    makeAutoObservable(this)
  }

  private _activePlaygroundTabKey = 'txt2img'
  private _forms: { [key: string]: FormInstance } = {}

  //   private _txt2imgForm: FormInstance | undefined = undefined
  //   private _img2imgForm: FormInstance | undefined = undefined
  //   private _inpaintingForm: FormInstance | undefined = undefined

  get activePlaygroundTabKey() {
    return this._activePlaygroundTabKey
  }

  set activePlaygroundTabKey(key: string) {
    this._activePlaygroundTabKey = key
  }

  getForm(key: string) {
    return this._forms[key]
  }

  putForm(key: string, form: FormInstance) {
    this._forms[key] = form
  }

  //   get txt2imgForm() {
  //     return this._txt2imgForm
  //   }

  //   set txt2imgForm(form: FormInstance | undefined) {
  //     this._txt2imgForm = form
  //   }

  //   get img2imgForm() {
  //     return this._img2imgForm
  //   }

  //   set img2imgForm(form: FormInstance | undefined) {
  //     this._img2imgForm = form
  //   }

  //   get inpaintingForm() {
  //     return this._inpaintingForm
  //   }

  //   set inpaintingForm(form: FormInstance | undefined) {
  //     this._inpaintingForm = form
  //   }

  //   getForm(key: string) {
  //     switch (key) {
  //       case 'txt2img':
  //         return this._txt2imgForm
  //       case 'img2img':
  //         return this._img2imgForm
  //       case 'inpainting':
  //         return this._inpaintingForm
  //       default:
  //         return undefined
  //     }
  //   }

  reset() {
    this._activePlaygroundTabKey = 'txt2img'
  }
}

export default new PlaygroundStore()
