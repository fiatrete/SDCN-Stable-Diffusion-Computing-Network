export default interface User {
  id: number;
  name: string;
  age: number;
  addressHome: string;
}

type UserFields = keyof User;

export const userFields: Record<UserFields, string> = {
  id: 'id',
  name: 'name',
  age: 'age',
  addressHome: 'address_home',
};

export const userTable = 's_user';
