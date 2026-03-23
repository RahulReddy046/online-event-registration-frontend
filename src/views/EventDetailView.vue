<template>
  <div class="event-detail-page">
    <div v-if="loading" class="loading-center"><div class="spinner"></div></div>

    <div v-else-if="event" class="container">
      <div class="breadcrumb">
        <router-link to="/events">Events</router-link>
        <span>›</span>
        <span>{{ event.title }}</span>
      </div>

      <div class="detail-layout">
        <div class="detail-main">
          <div class="event-banner card" :style="bannerStyle">
            <span :class="['badge', `badge-${event.status?.toLowerCase()}`]">{{ event.status }}</span>
            <h1 class="banner-title">{{ event.title }}</h1>
          </div>
          <div class="card info-card">
            <h2 class="section-heading">About This Event</h2>
            <p class="event-description">{{ event.description }}</p>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-icon">📅</span>
                <div>
                  <div class="info-label">Date & Time</div>
                  <div class="info-value">{{ formatDate(event.eventDate) }}</div>
                </div>
              </div>
              <div class="info-item">
                <span class="info-icon">📍</span>
                <div>
                  <div class="info-label">Location</div>
                  <div class="info-value">{{ event.location }}</div>
                </div>
              </div>
              <div class="info-item">
                <span class="info-icon">🏷️</span>
                <div>
                  <div class="info-label">Category</div>
                  <div class="info-value">{{ event.category }}</div>
                </div>
              </div>
              <div class="info-item" v-if="event.organizerName">
                <span class="info-icon">👤</span>
                <div>
                  <div class="info-label">Organizer</div>
                  <div class="info-value">{{ event.organizerName }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-sidebar">
          <div class="card registration-card">
            <div class="reg-price">
              <span class="price-label">Registration Fee</span>
              <span class="price-value">{{ feeText }}</span>
            </div>
            <div class="capacity-bar">
              <div class="cap-header">
                <span>Capacity</span>
                <span>{{ event.currentRegistrations || 0 }} / {{ event.maxCapacity || '∞' }}</span>
              </div>
              <div class="cap-track">
                <div class="cap-fill" :style="{ width: capacityPercent + '%' }"></div>
              </div>
              <span class="cap-label">{{ spotsLeft }}</span>
            </div>

            <div v-if="message" :class="['alert', messageType === 'success' ? 'alert-success' : 'alert-error']">
              {{ message }}
            </div>

            <template v-if="!auth.isLoggedIn">
              <router-link to="/login" class="btn btn-primary" style="width:100%;justify-content:center">
                Login to Register
              </router-link>
            </template>

            <template v-else-if="isRegistered">
              <div class="registered-badge">✅ You're registered!</div>
              <button
                class="btn btn-outline"
                style="width:100%;justify-content:center;margin-top:8px"
                @click="cancelRegistration"
                :disabled="cancelling"
              >
                {{ cancelling ? 'Cancelling...' : 'Cancel Registration' }}
              </button>
            </template>

            <template v-else-if="event.status === 'UPCOMING' || event.status === 'ONGOING'">
              <button
                class="btn btn-primary"
                style="width:100%;justify-content:center"
                @click="handleRegister"
                :disabled="registering || isFull"
              >
                {{ registering ? 'Processing...' : isFull ? 'Event Full' : 'Register Now →' }}
              </button>
              <p v-if="isPaid" class="payment-note">💳 Payment required via UPI</p>
            </template>

            <template v-else>
              <div class="alert alert-error">Registrations closed</div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="container">
      <div class="empty-state card">
        <p>Event not found.</p>
        <router-link to="/events" class="btn btn-primary" style="margin-top:12px">Back to Events</router-link>
      </div>
    </div>

    <!-- Payment Modal -->
    <PaymentModal
      v-if="showPaymentModal"
      :eventId="event.id"
      :eventTitle="event.title"
      :amount="Number(event.registrationFee)"
      @close="showPaymentModal = false"
      @success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { eventAPI, registrationAPI } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import PaymentModal from '@/components/events/PaymentModal.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const event = ref(null)
const loading = ref(true)
const registering = ref(false)
const cancelling = ref(false)
const myRegistrations = ref([])
const message = ref('')
const messageType = ref('success')
const showPaymentModal = ref(false)

const colors = ['#f97316','#6366f1','#10b981','#f59e0b','#ec4899','#14b8a6']

const bannerStyle = computed(() => {
  const c = colors[(event.value?.id || 0) % colors.length]
  return { background: `linear-gradient(135deg, ${c}33, ${c}66)` }
})

const isPaid = computed(() =>
  event.value?.registrationFee && Number(event.value.registrationFee) > 0
)

const feeText = computed(() =>
  isPaid.value ? `₹${event.value.registrationFee}` : 'Free'
)

const capacityPercent = computed(() => {
  if (!event.value?.maxCapacity) return 0
  return Math.min(100, ((event.value.currentRegistrations || 0) / event.value.maxCapacity) * 100)
})

const isFull = computed(() =>
  event.value?.maxCapacity && (event.value.currentRegistrations || 0) >= event.value.maxCapacity
)

const spotsLeft = computed(() => {
  if (!event.value?.maxCapacity) return 'Unlimited spots available'
  const left = event.value.maxCapacity - (event.value.currentRegistrations || 0)
  return left <= 0 ? 'Event is full' : `${left} spots remaining`
})

const isRegistered = computed(() =>
  myRegistrations.value.some(r => r.eventId === event.value?.id)
)

const myRegistrationId = computed(() =>
  myRegistrations.value.find(r => r.eventId === event.value?.id)?.id
)

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })
}

function handleRegister() {
  if (isPaid.value) {
    showPaymentModal.value = true
  } else {
    registerForEvent()
  }
}

function handlePaymentSuccess() {
  showPaymentModal.value = false
  router.push('/dashboard')
}

async function registerForEvent() {
  registering.value = true
  message.value = ''
  try {
    await registrationAPI.register(event.value.id)
    message.value = '🎉 Successfully registered!'
    messageType.value = 'success'
    await loadMyRegistrations()
    event.value.currentRegistrations = (event.value.currentRegistrations || 0) + 1
  } catch (e) {
    message.value = e.response?.data?.message || 'Registration failed'
    messageType.value = 'error'
  } finally {
    registering.value = false
  }
}

async function cancelRegistration() {
  if (!confirm('Cancel your registration?')) return
  cancelling.value = true
  try {
    await registrationAPI.cancel(myRegistrationId.value)
    message.value = 'Registration cancelled.'
    messageType.value = 'success'
    await loadMyRegistrations()
    event.value.currentRegistrations = Math.max(0, (event.value.currentRegistrations || 1) - 1)
  } catch (e) {
    message.value = e.response?.data?.message || 'Cancellation failed'
    messageType.value = 'error'
  } finally {
    cancelling.value = false }
}

async function loadMyRegistrations() {
  if (!auth.isLoggedIn) return
  try {
    const res = await registrationAPI.getMyRegistrations()
    myRegistrations.value = res.data || []
  } catch (e) {}
}

onMounted(async () => {
  try {
    const [eventRes] = await Promise.all([
      eventAPI.getById(route.params.id),
      loadMyRegistrations()
    ])
    event.value = eventRes.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.event-detail-page { padding-bottom: 64px; }
.breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted); padding: 20px 0 16px; }
.breadcrumb a { color: var(--accent); }
.detail-layout { display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: start; }
.event-banner { height: 200px; display: flex; flex-direction: column; justify-content: flex-end; padding: 24px; margin-bottom: 20px; }
.banner-title { font-size: 28px; font-weight: 700; margin-top: 12px; }
.info-card { padding: 28px; }
.section-heading { font-size: 18px; margin-bottom: 12px; }
.event-description { color: var(--text-muted); line-height: 1.7; margin-bottom: 24px; font-size: 15px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.info-item { display: flex; align-items: flex-start; gap: 12px; }
.info-icon { font-size: 20px; }
.info-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight: 600; }
.info-value { font-size: 14px; font-weight: 500; margin-top: 2px; }
.registration-card { padding: 24px; position: sticky; top: 80px; }
.reg-price { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
.price-label { font-size: 13px; color: var(--text-muted); }
.price-value { font-size: 24px; font-weight: 700; color: var(--success); font-family: 'Clash Display', sans-serif; }
.capacity-bar { margin-bottom: 20px; }
.cap-header { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
.cap-track { height: 6px; background: var(--surface-3); border-radius: 3px; overflow: hidden; }
.cap-fill { height: 100%; background: var(--accent); border-radius: 3px; transition: width 0.3s; }
.cap-label { font-size: 12px; color: var(--text-muted); margin-top: 4px; display: block; }
.registered-badge { text-align: center; padding: 10px; background: #d1fae5; color: #065f46; border-radius: 8px; font-weight: 600; font-size: 14px; }
.payment-note { text-align: center; font-size: 12px; color: var(--text-muted); margin-top: 8px; }
.empty-state { text-align: center; padding: 60px; }
@media (max-width: 900px) {
  .detail-layout { grid-template-columns: 1fr; }
  .info-grid { grid-template-columns: 1fr; }
}
</style>