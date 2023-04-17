export type UserRole = 0 | 1 // 0:Normal 1:Administrator
export interface User {
  email: string
  userId: string
  nickname: string
  avatarImgUrl?: string
  role: UserRole
  honorAmount: number
  apiKey: string
  firstTimeLogin: boolean
}
