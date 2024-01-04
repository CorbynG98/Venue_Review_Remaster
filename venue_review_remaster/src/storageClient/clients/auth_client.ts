import { useCookies } from 'vue3-cookies'

export const setAuthDataCookie = (username: string, token: string) => {
  const { cookies } = useCookies()
  cookies.set('authData', JSON.stringify({ username: username, token: token }))
}

export const getCookie = (cookieName: string) => {
  const { cookies } = useCookies()
  return JSON.parse(cookies.get(cookieName))
}

export const removeCookie = (cookieName: string) => {
  const { cookies } = useCookies()
  cookies.remove(cookieName)
}
