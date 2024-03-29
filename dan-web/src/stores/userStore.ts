import { makeAutoObservable } from 'mobx'
import { User } from 'typings/User'
import persist from './persist'

class UserStore {
  constructor() {
    makeAutoObservable(this)
  }

  private _user: User = persist.getUser()

  get user() {
    return Object.assign({}, this._user)
  }

  get isLoggedIn() {
    return this._user.userId !== '' && this._user.apiKey !== ''
  }

  updateUser(u: Partial<User>) {
    const cloneUser = { ...u }
    const nUser = Object.assign(this._user, cloneUser)

    persist.setUser(nUser)

    return nUser
  }

  reset() {
    persist.removeUser()
    this._user = {
      email: '',
      userId: '',
      nickname: '',
      role: 0,
      honorAmount: 0,
      apiKey: '',
      firstTimeLogin: false,
    }
  }
}

export default new UserStore()
