import { defineStore } from 'pinia'
import { authAPI } from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) =>
      state.user?.role === 'ADMIN' ||
      state.user?.role === 'SUPER_ADMIN',
    isSuperAdmin: (state) =>
      state.user?.role === 'SUPER_ADMIN',
    userName: (state) => state.user?.name || ''
  },

  actions: {
    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const res = await authAPI.login({ email, password })
        this.token = res.data.token
        this.user = {
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role
        }
        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        return true
      } catch (e) {
        this.error = e.response?.data?.message ||
          'Invalid email or password'
        return false
      } finally {
        this.loading = false
      }
    },

    async register(data) {
      this.loading = true
      this.error = null
      try {
        const res = await authAPI.register(data)
        this.token = res.data.token
        this.user = {
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role
        }
        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        return true
      } catch (e) {
        this.error = e.response?.data?.message ||
          'Registration failed'
        return false
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})