<template>
  <div class="dashboard-page">
    <div class="container">
      <div class="page-header">
        <div>
          <h1 class="page-title">My Dashboard</h1>
          <p class="page-subtitle">Welcome back, {{ auth.userName }} 👋</p>
        </div>
        <router-link to="/events" class="btn btn-primary">Browse Events →</router-link>
      </div>

      <div class="stats-grid">
        <div class="stat-card card"><div class="stat-icon">🎟️</div><div class="stat-info"><div class="stat-value">{{ totalRegistrations }}</div><div class="stat-label">Total Registrations</div></div></div>
        <div class="stat-card card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value">{{ confirmedCount }}</div><div class="stat-label">Confirmed</div></div></div>
        <div class="stat-card card"><div class="stat-icon">📅</div><div class="stat-info"><div class="stat-value">{{ upcomingCount }}</div><div class="stat-label">Upcoming Events</div></div></div>
      </div>

      <div class="section-title-row">
        <h2 class="section-heading">My Registrations</h2>
        <select v-model="statusFilter" class="form-select" style="width:auto">
          <option value="">All</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div v-if="loading" class="loading-center"><div class="spinner"></div></div>

      <div v-else-if="filteredRegistrations.length" class="registrations-list">
        <div v-for="reg in filteredRegistrations" :key="reg.id" class="reg-item card">
          <div class="reg-color-bar" :style="{ background: getColor(reg.eventId) }"></div>
          <div class="reg-body">
            <div class="reg-header">
              <div>
                <h3 class="reg-event-title">{{ reg.eventTitle }}</h3>
                <div class="reg-code">Confirmation: {{ reg.confirmationCode }}</div>
              </div>
              <span :class="['badge', `badge-${reg.status?.toLowerCase()}`]">{{ reg.status }}</span>
            </div>
            <div class="reg-details">
              <span class="reg-detail">📅 {{ formatDate(reg.eventDate) }}</span>
              <span class="reg-detail">📍 {{ reg.eventLocation }}</span>
              <span class="reg-detail">💳 {{ reg.paymentStatus }}</span>
            </div>
            <div class="reg-actions">
              <router-link :to="`/events/${reg.eventId}`" class="btn btn-outline btn-sm">View Event</router-link>
              <button v-if="reg.status === 'CONFIRMED'" class="btn btn-danger btn-sm" @click="cancelReg(reg)">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state card">
        <div class="empty-icon">🎫</div>
        <h3>No registrations yet</h3>
        <p>Start exploring events and register for ones you're interested in!</p>
        <router-link to="/events" class="btn btn-primary" style="margin-top:16px">Browse Events →</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { registrationAPI } from '@/services/api'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
const registrations = ref([])
const loading = ref(true)
const statusFilter = ref('')
const colors = ['#f97316','#6366f1','#10b981','#f59e0b','#ec4899','#14b8a6']

function getColor(id) { return colors[(id || 0) % colors.length] }
const filteredRegistrations = computed(() => statusFilter.value ? registrations.value.filter(r => r.status === statusFilter.value) : registrations.value)
const totalRegistrations = computed(() => registrations.value.length)
const confirmedCount = computed(() => registrations.value.filter(r => r.status === 'CONFIRMED').length)
const upcomingCount = computed(() => registrations.value.filter(r => r.status === 'CONFIRMED' && r.eventDate && new Date(r.eventDate) > new Date()).length)

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function cancelReg(reg) {
  if (!confirm(`Cancel registration for "${reg.eventTitle}"?`)) return
  try { await registrationAPI.cancel(reg.id); reg.status = 'CANCELLED' }
  catch (e) { alert(e.response?.data?.message || 'Cancellation failed') }
}

onMounted(async () => {
  try { const res = await registrationAPI.getMyRegistrations(); registrations.value = res.data || [] }
  catch (e) { console.error(e) }
  finally { loading.value = false }
})
</script>

<style scoped>
.dashboard-page { padding-bottom: 64px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-top: 32px; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
.stat-card { display: flex; align-items: center; gap: 16px; padding: 20px 24px; }
.stat-icon { font-size: 32px; }
.stat-value { font-size: 28px; font-weight: 700; font-family: 'Clash Display', sans-serif; }
.stat-label { font-size: 13px; color: var(--text-muted); }
.section-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-heading { font-size: 20px; font-weight: 600; }
.registrations-list { display: flex; flex-direction: column; gap: 16px; }
.reg-item { display: flex; overflow: hidden; }
.reg-color-bar { width: 5px; flex-shrink: 0; }
.reg-body { flex: 1; padding: 20px 24px; }
.reg-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.reg-event-title { font-size: 17px; font-weight: 600; margin-bottom: 4px; }
.reg-code { font-size: 12px; color: var(--text-muted); font-family: monospace; }
.reg-details { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 14px; }
.reg-detail { font-size: 13px; color: var(--text-muted); }
.reg-actions { display: flex; gap: 8px; }
.empty-state { text-align: center; padding: 80px 40px; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state h3 { font-size: 20px; margin-bottom: 8px; }
.empty-state p { color: var(--text-muted); }
@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; gap: 16px; }
}
</style>