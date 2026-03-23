<template>
  <div class="auth-page">
    <div class="auth-card card">
      <router-link to="/" class="auth-logo">⚡ EventHub</router-link>
      <h1 class="auth-title">Create account</h1>
      <p class="auth-subtitle">Join thousands of event-goers today</p>

      <div v-if="auth.error" class="alert alert-error">{{ auth.error }}</div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input v-model="form.name" type="text" class="form-input" placeholder="John Doe" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input v-model="form.email" type="email" class="form-input" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input v-model="form.phone" type="tel" class="form-input" placeholder="9876543210" required />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <div class="password-input">
            <input v-model="form.password" :type="showPwd ? 'text' : 'password'" class="form-input" placeholder="Min. 6 characters" required minlength="6" />
            <button type="button" class="pwd-toggle" @click="showPwd = !showPwd">{{ showPwd ? '🙈' : '👁️' }}</button>
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-lg submit-btn" :disabled="auth.loading">
          {{ auth.loading ? 'Creating account...' : 'Create Account →' }}
        </button>
      </form>

      <p class="auth-footer">Already have an account? <router-link to="/login" class="auth-link">Login</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
const router = useRouter()
const showPwd = ref(false)
const form = reactive({ name: '', email: '', phone: '', password: '' })

async function handleRegister() {
  const ok = await auth.register(form)
  if (ok) router.push('/dashboard')
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
.auth-footer { text-align: center; font-size: 14px; color: var(--text-muted); }
.auth-link { color: var(--accent); font-weight: 600; }
</style>