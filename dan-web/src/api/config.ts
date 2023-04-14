import { env } from 'env'
import persist from 'stores/persist'
import userStore from 'stores/userStore'

class ApiConfig {
  private baseApiUrl = env.REACT_APP_BASE_API_URL

  private successCode = 200

  private publicApiKey = ''

  setBaseApiUrl = (url: string) => {
    this.baseApiUrl = url
  }

  getBaseApiUrl = () => this.baseApiUrl

  getSuccessCode = () => this.successCode

  setPublicApiKey = (key: string) => {
    this.publicApiKey = key
    persist.setPublicApiKey(key)
  }

  getPublicApiKey = () => this.publicApiKey || persist.getPublicApiKey()

  getApiKey = () =>
    userStore.isLoggedIn ? userStore.user.apiKey : this.getPublicApiKey()
}

const config = new ApiConfig()

export default config
