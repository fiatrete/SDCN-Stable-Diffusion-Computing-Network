export type UserRole = 0 | 1 // 0普通用户, 1管理员

export interface User {
  email: string
  userId: string
  nickname: string
  avatarImgUrl?: string
  role: UserRole
  honorAmount: number
  apiKey: string
}
