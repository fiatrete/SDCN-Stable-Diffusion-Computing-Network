import userStore from 'stores/userStore'
import { useCallback } from 'react'
import { User } from 'typings/User'
import { AxiosError } from 'axios'
import to from 'await-to-js'
import * as userApi from 'api/user'

const useUser = () => {
  const updateUser = useCallback(async () => {
    const [_userInfoError, _userInfo] = await to<User, AxiosError>(
      userApi.userInfo(),
    )

    if (_userInfoError !== null) {
      console.error('updateUserInfoError', _userInfoError)
      userStore.reset()
      return
    }

    userStore.updateUser(_userInfo)
  }, [])

  return {
    updateUser,
  }
}

export default useUser
