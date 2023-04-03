class ApiConfig {
  private baseApiUrl = 'http://43.154.195.80:8080'

  private successCode = 200

  setBaseApiUrl = (url: string) => {
    this.baseApiUrl = url
  }

  getBaseApiUrl = () => this.baseApiUrl

  getSuccessCode = () => this.successCode
}

const config = new ApiConfig()

export default config
