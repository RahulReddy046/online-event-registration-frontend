<template>
  <header class="navbar">
    <div class="container navbar-inner">
      <router-link to="/" class="logo">
        <span class="logo-icon">⚡</span>
        <span class="logo-text">EventHub</span>
      </router-link>

      <nav class="nav-links">
        <router-link to="/events" class="nav-link">Browse Events</router-link>
        <router-link to="/calendar" class="nav-link">📅 Calendar</router-link>
        <template v-if="auth.isLoggedIn">
          <router-link to="/dashboard" class="nav-link">
            My Registrations
          </router-link>
          <router-link v-if="auth.isAdmin" to="/admin" class="nav-link nav-link-admin">
            Admin Panel
          </router-link>
          <router-link v-if="auth.isSuperAdmin" to="/super-admin" class="nav-link nav-link-super">
            👑 Super Admin
          </router-link>
        </template>
      </nav>

      <div class="nav-actions">
        <template v-if="!auth.isLoggedIn">
          <router-link to="/login" class="btn btn-outline btn-sm">Login</router-link>
          <router-link to="/register" class="btn btn-primary btn-sm">Sign Up</router-link>
        </template>
        <template v-else>
          <div class="user-menu" @click="menuOpen = !menuOpen" ref="menuRef">
            <div class="user-avatar">{{ initials }}</div>
            <span class="user-name">{{ auth.userName }}</span>
            <span class="chevron">▾</span>
            <div v-if="menuOpen" class="dropdown">
              <router-link to="/dashboard" class="dropdown-item" @click="menuOpen = false">
                My Registrations
              </router-link>
              <router-link v-if="auth.isAdmin" to="/admin" class="dropdown-item" @click="menuOpen = false">
                Admin Panel
              </router-link>
              <router-link v-if="auth.isSuperAdmin" to="/super-admin" class="dropdown-item" @click="menuOpen = false">
                👑 Super Admin
              </router-link>
              <router-link to="/calendar" class="dropdown-item" @click="menuOpen = false">
                📅 Calendar
              </router-link>
              <hr class="dropdown-divider">
              <button class="dropdown-item danger" @click="logout">
                Logout
              </button>
            </div>
          </div>
        </template>
      </div>

      <button class="mobile-toggle" @click="mobileOpen = !mobileOpen">
        <span></span><span></span><span></span>
      </button>
    </div>

    <div v-if="mobileOpen" class="mobile-menu">
      <router-link to="/events" class="mobile-link" @click="mobileOpen = false">Browse Events</router-link>
      <router-link to="/calendar" class="mobile-link" @click="mobileOpen = false">📅 Calendar</router-link>
      <template v-if="auth.isLoggedIn">
        <router-link to="/dashboard" class="mobile-link" @click="mobileOpen = false">My Registrations</router-link>
        <router-link v-if="auth.isAdmin" to="/admin" class="mobile-link" @click="mobileOpen = false">Admin Panel</router-link>
        <router-link v-if="auth.isSuperAdmin" to="/super-admin" class="mobile-link" @click="mobileOpen = false">👑 Super Admin</router-link>
        <button class="mobile-link danger" @click="logout">Logout</button>
      </template>
      <template v-else>
        <router-link to="/login" class="mobile-link" @click="mobileOpen = false">Login</router-link>
        <router-link to="/register" class="mobile-link" @click="mobileOpen = false">Sign Up</router-link>
      </template>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)
const mobileOpen = ref(false)
const menuRef = ref(null)

const initials = computed(() =>
  auth.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
)

function logout() {
  auth.logout()
  menuOpen.value = false
  router.push('/')
}

function handleClickOutside(e) {
  if (menuRef.value && !menuRef.value.contains(e.target))
    menuOpen.value = false
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.navbar { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
.navbar-inner { display: flex; align-items: center; gap: 32px; height: 64px; }
.logo { display: flex; align-items: center; gap: 8px; font-family: 'Clash Display', sans-serif; font-size: 20px; font-weight: 700; }
.logo-icon { font-size: 22px; }
.nav-links { display: flex; align-items: center; gap: 4px; flex: 1; }
.nav-link { padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 500; color: var(--text-muted); transition: all 0.15s; }
.nav-link:hover, .nav-link.router-link-active { color: var(--text); background: var(--surface-3); }
.nav-link-admin { color: var(--accent) !important; }
.nav-link-super { color: #f59e0b !important; }
.nav-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.user-menu { position: relative; display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 8px; cursor: pointer; border: 1.5px solid var(--border); transition: all 0.15s; }
.user-menu:hover { border-color: var(--accent); }
.user-avatar { width: 28px; height: 28px; background: var(--accent); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
.user-name { font-size: 14px; font-weight: 500; }
.chevron { font-size: 12px; color: var(--text-muted); }
.dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: white; border: 1px solid var(--border); border-radius: 10px; box-shadow: var(--shadow-lg); min-width: 180px; padding: 6px; z-index: 200; }
.dropdown-item { display: block; width: 100%; padding: 8px 12px; border-radius: 6px; font-size: 14px; color: var(--text); background: none; border: none; text-align: left; cursor: pointer; transition: background 0.1s; text-decoration: none; }
.dropdown-item:hover { background: var(--surface-3); }
.dropdown-item.danger { color: var(--danger); }
.dropdown-divider { border: none; border-top: 1px solid var(--border); margin: 4px 0; }
.mobile-toggle { display: none; flex-direction: column; gap: 5px; background: none; border: none; padding: 4px; margin-left: auto; }
.mobile-toggle span { display: block; width: 22px; height: 2px; background: var(--text); border-radius: 2px; }
.mobile-menu { display: flex; flex-direction: column; padding: 12px 16px; border-top: 1px solid var(--border); background: white; }
.mobile-link { padding: 10px 8px; font-size: 15px; color: var(--text); border-bottom: 1px solid var(--border); background: none; border-left: none; border-right: none; border-top: none; text-align: left; cursor: pointer; text-decoration: none; display: block; }
.mobile-link.danger { color: var(--danger); }
@media (max-width: 768px) {
  .nav-links, .nav-actions { display: none; }
  .mobile-toggle { display: flex; }
}
</style>