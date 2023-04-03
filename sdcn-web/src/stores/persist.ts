import { User } from 'typings/User'
import Cookies from 'universal-cookie'

const cookies = new Cookies()

class Persist {
  isLoggedIn() {
    return (
      cookies.get('koa:sess') !== undefined &&
      cookies.get('koa:sess.sig') !== undefined
    )
  }

  setUser(user: User) {
    localStorage.setItem('USER', JSON.stringify(user))
  }

  getUser(): User {
    if (this.isLoggedIn()) {
      const u = localStorage.getItem('USER')
      return u
        ? JSON.parse(u)
        : {
            email: '',
            nickname: '',
          }
    } else {
      return {
        email: '',
        nickname: '',
      }
    }
  }

  removeUser() {
    cookies.remove('koa:sess')
    cookies.remove('koa:sess.sig')
    localStorage.removeItem('USER')
  }
}

const persist = new Persist()

export default persist
