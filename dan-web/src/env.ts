declare global {
  interface Window {
    env: any
  }
}

// change with your own variables
type EnvType = {
  REACT_APP_BASE_API_URL: string
  REACT_APP_COOKIE_DOMAIN: string
  REACT_APP_GOOGLE_ANALYTICS_ID: string
}
export const env: EnvType = { ...process.env, ...window.env }
