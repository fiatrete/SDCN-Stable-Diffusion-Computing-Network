import { env } from 'env'

class ApiConfig {
  private baseApiUrl = env.REACT_APP_BASE_API_URL

  private successCode = 200

  setBaseApiUrl = (url: string) => {
    this.baseApiUrl = url
  }

  getBaseApiUrl = () => this.baseApiUrl

  getSuccessCode = () => this.successCode
}

const config = new ApiConfig()

export default config
