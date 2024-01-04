import { Authenticate, Signout } from '@/apiclient/apiclient'
import State from '@/models/State'
import { getCookie, removeCookie, setAuthDataCookie } from '@/storageClient/storageclient'
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
    token: null
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
    }
  },
  actions: {
    async initBaseData({ commit }) {
      const authData = await getCookie('authData')
      commit('INITDATA', {
        username: authData?.username,
        token: authData?.token
      })
    },
    async signin(
      { commit },
      credentials: AuthResource,
      cancelToken: CancelTokenSource | undefined | null = null
    ) {
      var result = await Authenticate(credentials, cancelToken)
      setAuthDataCookie(result.username ?? '', result.session_token ?? '')
      commit('LOGIN', {
        username: result.username ?? '',
        token: result.session_token ?? ''
      })
    },
    async signout({ commit }, cancelToken: CancelTokenSource | undefined | null = null) {
      try {
        await Signout(cancelToken)
      } catch (error) {
        /* Doesn't really matter tbh. We can change this back one API is up */
      }
      removeCookie('authData')
      commit('LOGOUT')
    }
  }
})

export default function (app) {
  app.use(store)
}
