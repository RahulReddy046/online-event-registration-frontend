<template>
  <div class="auth-page">
    <div class="auth-card card">
      <router-link to="/" class="auth-logo">⚡ EventHub</router-link>
      <h1 class="auth-title">Welcome back</h1>
      <p class="auth-subtitle">Login to your account to continue</p>

      <div v-if="auth.error" class="alert alert-error">{{ auth.error }}</div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input v-model="email" type="email" class="form-input" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <div class="password-input">
            <input v-model="password" :type="showPwd ? 'text' : 'password'" class="form-input" placeholder="••••••••" required />
            <button type="button" class="pwd-toggle" @click="showPwd = !showPwd">{{ showPwd ? '🙈' : '👁️' }}</button>
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-lg submit-btn" :disabled="auth.loading">
          {{ auth.loading ? 'Logging in...' : 'Login →' }}
        </button>
      </form>

      <p class="auth-footer">Don't have an account? <router-link to="/register" class="auth-link">Sign up free</router-link></p>

      <div class="demo-accounts">
        <p class="demo-title">Demo Accounts</p>
        <div class="demo-btns">
          <button class="demo-btn" @click="fillDemo('admin@eventapp.com','password')">👑 Admin</button>
          <button class="demo-btn" @click="fillDemo('test@test.com','test123')">👤 User</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const showPwd = ref(false)

function fillDemo(e, p) { email.value = e; password.value = p }

async function handleLogin() {
  const ok = await auth.login(email.value, password.value)
  if (ok) router.push(auth.isAdmin ? '/admin' : '/dashboard')
}
</script>

<style scoped>
.auth-page { min-height: calc(100vh - 130px); display: flex; align-items: center; justify-content: center; padding: 40px 16px; background: linear-gradient(135deg, #fff7ed, #fef3c7 50%, #fff); }
.auth-card { width: 100%; max-width: 420px; padding: 40px; }
.auth-logo { display: inline-flex; align-items: center; gap: 6px; font-family: 'Clash Display', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 24px; }
.auth-title { font-size: 26px; font-weight: 700; margin-bottom: 6px; }
.auth-subtitle { color: var(--text-muted); font-size: 14px; margin-bottom: 28px; }
.auth-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
.submit-btn { width: 100%; justify-content: center; }
.password-input { position: relative; }
.password-input .form-input { padding-right: 44px; }
.pwd-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 16px; cursor: pointer; }
.auth-footer { text-align: center; font-size: 14px; color: var(--text-muted); margin-bottom: 16px; }
.auth-link { color: var(--accent); font-weight: 600; }
.demo-accounts { padding-top: 16px; border-top: 1px solid var(--border); }
.demo-title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight: 600; margin-bottom: 8px; }
.demo-btns { display: flex; gap: 8px; }
.demo-btn { flex: 1; padding: 8px; border: 1.5px solid var(--border); border-radius: 6px; font-size: 13px; font-family: inherit; background: var(--surface-3); cursor: pointer; transition: all 0.15s; }
.demo-btn:hover { border-color: var(--accent); color: var(--accent); }
</style>