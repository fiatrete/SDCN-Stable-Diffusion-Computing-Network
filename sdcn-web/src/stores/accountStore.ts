import { makeAutoObservable } from 'mobx'
import { Account } from 'typings/Account'

class AccountStore {
  constructor() {
    makeAutoObservable(this)
  }

  private _account: Account = {
    id: '',
    email: '',
    nickname: '',
  }

  get user() {
    return Object.assign({}, this._account)
  }

  get isLoggedIn() {
    return this._account.id !== ''
  }

  updateUser(u: Partial<Account>) {
    const cloneAccount = { ...u }
    return Object.assign(this._account, cloneAccount)
  }

  reset() {
    this._account = {
      id: '',
      email: '',
      nickname: '',
    }
  }
}

export default new AccountStore()
