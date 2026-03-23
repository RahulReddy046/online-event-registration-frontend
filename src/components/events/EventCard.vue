<template>
  <div class="event-card card" @click="$router.push(`/events/${event.id}`)">
    <div class="event-img" :style="imgStyle">
      <span :class="['badge', `badge-${event.status?.toLowerCase()}`]">{{ event.status }}</span>
    </div>
    <div class="event-body">
      <div class="event-meta">
        <span class="event-category">{{ event.category }}</span>
        <span class="event-fee">{{ feeText }}</span>
      </div>
      <h3 class="event-title">{{ event.title }}</h3>
      <p class="event-desc">{{ event.description }}</p>
      <div class="event-details">
        <div class="detail-item"><span>📅</span><span>{{ formatDate(event.eventDate) }}</span></div>
        <div class="detail-item"><span>📍</span><span>{{ event.location }}</span></div>
        <div class="detail-item"><span>👥</span><span>{{ spotsLeft }}</span></div>
      </div>
    </div>
    <div class="event-footer">
      <router-link :to="`/events/${event.id}`" class="btn btn-primary btn-sm">View Details →</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ event: { type: Object, required: true } })
const colors = ['#f97316','#6366f1','#10b981','#f59e0b','#ec4899','#14b8a6']
const imgStyle = computed(() => {
  const c = colors[(props.event.id || 0) % colors.length]
  return { background: `linear-gradient(135deg, ${c}22, ${c}55)` }
})
const feeText = computed(() => (!props.event.registrationFee || props.event.registrationFee == 0) ? 'Free' : `₹${props.event.registrationFee}`)
const spotsLeft = computed(() => {
  if (!props.event.maxCapacity) return 'Unlimited spots'
  const left = props.event.maxCapacity - (props.event.currentRegistrations || 0)
  return left <= 0 ? 'Full' : `${left} spots left`
})
function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.event-card { cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; }
.event-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
.event-img { height: 140px; position: relative; display: flex; align-items: flex-start; padding: 12px; }
.event-body { padding: 16px; flex: 1; }
.event-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.event-category { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--accent); }
.event-fee { font-size: 13px; font-weight: 600; color: var(--success); }
.event-title { font-size: 17px; font-weight: 600; margin-bottom: 6px; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.event-desc { font-size: 13px; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 12px; }
.event-details { display: flex; flex-direction: column; gap: 5px; }
.detail-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
.event-footer { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; }
</style>