import { env } from 'env'
import { User } from 'typings/User'
import Cookies from 'universal-cookie'

const cookies = new Cookies()

class Persist {
  // USER
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
            userId: '',
            nickname: '',
            role: 0,
            honorAmount: 0,
            apiKey: '',
            firstTimeLogin: false,
          }
    } else {
      return {
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

  removeUser() {
    console.log('Cookie.Domain', env.REACT_APP_COOKIE_DOMAIN)

    cookies.remove('koa:sess', { domain: env.REACT_APP_COOKIE_DOMAIN })
    cookies.remove('koa:sess.sig', { domain: env.REACT_APP_COOKIE_DOMAIN })
    localStorage.removeItem('USER')
  }

  // CONFIG
  setPublicApiKey(key: string) {
    localStorage.setItem('PUBLIC_API_KEY', key)
  }

  getPublicApiKey() {
    return localStorage.getItem('PUBLIC_API_KEY')
  }

  removePublicApiKey() {
    localStorage.removeItem('PUBLIC_API_KEY')
  }
}

const persist = new Persist()

export default persist
