import { Authenticate, Signout, Signup } from '@/apiclient/apiclient'
import { UserSignupData } from '@/models/AuthResource'
import State from '@/models/State'
import { getAuthCookie, removeCookie, setAuthDataCookie } from '@/storageClient/storageclient'
import { CancelTokenSource } from 'axios'
import { createStore } from 'vuex'

interface AuthResource {
  username: string
  password: string
}

export const store = createStore<State>({
  state: {
    isLoggedIn: false,
    username: null,
    token: null,
    fullName: null,
    profile_photo_filename: null
  },
  getters: {
    isLoggedIn(state) {
      return state.isLoggedIn
    }
  },
  mutations: {
    LOGIN(state, data) {
      state.isLoggedIn = true
      state.username = data.username
      state.token = data.token
      state.fullName = data.fullName
      state.profile_photo_filename = data.profile_photo_filename
    },
    LOGOUT(state) {
      state.isLoggedIn = false
      state.username = null
      state.token = null
    },
    INITDATA(state, data) {
      state.isLoggedIn = data.username == null ? false : true
      state.username = data.username
      state.token = data.token
      state.fullName = data.fullName
      state.profile_photo_filename = data.profile_photo_filename
    }
  },
  actions: {
    async initBaseData({ commit }) {
      const authData = await getAuthCookie()
      commit('INITDATA', {
        username: authData?.username,
        token: authData?.token,
        fullName: authData?.fullName,
        profile_photo_filename: authData?.profile_photo_filename
      })
    },
    async signup(
      { commit },
      userData: UserSignupData,
      cancelToken: CancelTokenSource | undefined | null = null
    ) {
      var result = await Signup(userData, cancelToken)
      setAuthDataCookie({
        username: result?.username,
        token: result?.token,
        fullName: result?.fullName,
        profile_photo_filename: result?.profile_photo_filename
      })
      commit('LOGIN', {
        username: result.username,
        token: result.token,
        fullName: result?.fullName,
        profile_photo_filename: result?.profile_photo_filename
      })
    },
    async signin(
      { commit },
      credentials: AuthResource,
      cancelToken: CancelTokenSource | undefined | null = null
    ) {
      var result = await Authenticate(credentials, cancelToken)
      setAuthDataCookie({
        username: result?.username,
        token: result?.token,
        fullName: result?.fullName,
        profile_photo_filename: result?.profile_photo_filename
      })
      commit('LOGIN', {
        username: result.username,
        token: result.token,
        fullName: result?.fullName,
        profile_photo_filename: result?.profile_photo_filename
      })
    },
    async signout({ commit }, cancelToken: CancelTokenSource | undefined | null = null) {
      commit('LOGOUT')
      try {
        await Signout(cancelToken)
        removeCookie('authData')
      } catch (error) {
        /* Doesn't really matter tbh. We can change this back one API is up */
      }
    }
  }
})

export default function (app) {
  app.use(store)
}
