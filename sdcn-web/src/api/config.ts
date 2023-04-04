class ApiConfig {
  // private baseApiUrl = 'http://localhost:9080'
  private baseApiUrl = 'https://api.sdcn.info'

  private successCode = 200

  setBaseApiUrl = (url: string) => {
    this.baseApiUrl = url
  }

  getBaseApiUrl = () => this.baseApiUrl

  getSuccessCode = () => this.successCode
}

const config = new ApiConfig()

export default config
