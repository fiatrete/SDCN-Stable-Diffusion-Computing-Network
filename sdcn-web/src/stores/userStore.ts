import { makeAutoObservable } from 'mobx'
import { User } from 'typings/User'

class UserStore {
  constructor() {
    makeAutoObservable(this)
  }

  private _user: User = {
    id: '',
    name: '',
  }

  get user() {
    return Object.assign({}, this._user)
  }

  get isLoggedIn() {
    return this._user.id !== ''
  }

  updateUser(u: Partial<User>) {
    const cloneUser = { ...u }
    return Object.assign(this._user, cloneUser)
  }

  reset() {
    this._user = {
      id: '',
      name: '',
    }
  }
}

export default new UserStore()
