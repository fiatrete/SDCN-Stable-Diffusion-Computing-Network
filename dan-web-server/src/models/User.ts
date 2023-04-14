export default interface User {
  id: bigint;
  uuid: string;
  nickname: string;
  avatarImg: string;
  email: string;
  role: number;
  honorAmount: bigint;
  apiKey: string;
  create_time: Date;
}

type UserFields = keyof User;

export const userFields: Record<UserFields, string> = {
  id: 'id',
  uuid: 'uuid',
  nickname: 'nickname',
  avatarImg: 'avatarImg',
  email: 'email',
  role: 'role',
  honorAmount: 'honor_amount',
  apiKey: 'api_key',
  create_time: 'create_time',
};

export const userTable = 'account';
