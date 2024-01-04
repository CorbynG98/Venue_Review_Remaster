import { useCookies } from 'vue3-cookies'

interface AuthCookie {
  username: string
  token: string
  fullName: string | null | undefined,
  profile_photo_filename: string | null | undefined
}

export const setAuthDataCookie = (data: AuthCookie) => {
  const { cookies } = useCookies()
  cookies.set('authData', JSON.stringify(data))
}

export const getAuthCookie = () => {
  const { cookies } = useCookies()
  var cookie = cookies.get('authData')
  return cookie as unknown as AuthCookie
}

export const removeCookie = (cookieName: string) => {
  const { cookies } = useCookies()
  cookies.remove(cookieName)
}
