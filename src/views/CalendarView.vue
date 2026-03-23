<template>
  <div class="calendar-page">
    <div class="container">
      <div class="page-header">
        <div>
          <h1 class="page-title">📅 Events Calendar</h1>
          <p class="page-subtitle">Browse all events by date</p>
        </div>
        <router-link to="/events" class="btn btn-outline">List View →</router-link>
      </div>

      <div class="card calendar-card">
        <div class="cal-header">
          <button class="cal-nav" @click="prevMonth">‹</button>
          <h2 class="cal-month">{{ monthName }} {{ year }}</h2>
          <button class="cal-nav" @click="nextMonth">›</button>
        </div>
        <div class="cal-days-header">
          <div v-for="day in dayLabels" :key="day" class="day-label">{{ day }}</div>
        </div>
        <div class="cal-grid">
          <div
            v-for="(cell, i) in calendarCells"
            :key="i"
            :class="['cal-cell', {
              'other-month': !cell.currentMonth,
              'today': cell.isToday,
              'has-events': cell.events.length > 0
            }]"
          >
            <div class="cell-date">{{ cell.day }}</div>
            <div class="cell-events">
              <div
                v-for="event in cell.events.slice(0, 2)"
                :key="event.id"
                class="cell-event"
                :style="{ background: getEventColor(event) }"
                @click.stop="$router.push(`/events/${event.id}`)"
                :title="event.title"
              >{{ event.title }}</div>
              <div
                v-if="cell.events.length > 2"
                class="cell-more"
                @click.stop="selectedDay = cell"
              >+{{ cell.events.length - 2 }} more</div>
            </div>
          </div>
        </div>
      </div>

      <div class="legend">
        <div class="legend-item" v-for="cat in categoryColors" :key="cat.name">
          <div class="legend-dot" :style="{ background: cat.color }"></div>
          <span>{{ cat.name }}</span>
        </div>
      </div>

      <div class="month-events">
        <h3 class="month-events-title">Events in {{ monthName }}</h3>
        <div v-if="monthEvents.length === 0" class="no-events">No events this month</div>
        <div v-else class="month-events-list">
          <div
            v-for="event in monthEvents"
            :key="event.id"
            class="month-event-item card"
            @click="$router.push(`/events/${event.id}`)"
          >
            <div class="event-date-box" :style="{ background: getEventColor(event) }">
              <div class="date-day">{{ getDay(event.eventDate) }}</div>
              <div class="date-month">{{ getMonth(event.eventDate) }}</div>
            </div>
            <div class="event-info">
              <h4 class="event-title">{{ event.title }}</h4>
              <div class="event-meta-row">
                <span>📍 {{ event.location }}</span>
                <span>🏷️ {{ event.category }}</span>
                <span :class="['fee', { free: !event.registrationFee || event.registrationFee == 0 }]">
                  {{ event.registrationFee && event.registrationFee > 0 ? '₹' + event.registrationFee : 'Free' }}
                </span>
              </div>
            </div>
            <div class="event-arrow">→</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedDay" class="modal-overlay" @click.self="selectedDay = null">
      <div class="day-modal card">
        <div class="modal-header">
          <h2>{{ formatSelectedDay }}</h2>
          <button class="modal-close" @click="selectedDay = null">✕</button>
        </div>
        <div class="day-events-list">
          <div
            v-for="event in selectedDay.events"
            :key="event.id"
            class="day-event-item"
            @click="$router.push(`/events/${event.id}`); selectedDay = null"
          >
            <div class="day-event-dot" :style="{ background: getEventColor(event) }"></div>
            <div>
              <div class="day-event-title">{{ event.title }}</div>
              <div class="day-event-meta">{{ event.location }} · {{ event.category }}</div>
            </div>
            <span class="day-event-arrow">→</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { eventAPI } from '@/services/api'

const events = ref([])
const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
const selectedDay = ref(null)

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const categoryColors = [
  { name: 'Conference', color: '#6366f1' },
  { name: 'Workshop', color: '#f97316' },
  { name: 'Sports', color: '#10b981' },
  { name: 'Festival', color: '#ec4899' },
  { name: 'Webinar', color: '#14b8a6' },
  { name: 'Networking', color: '#f59e0b' }
]
const colorMap = {
  CONFERENCE: '#6366f1', WORKSHOP: '#f97316', SPORTS: '#10b981',
  FESTIVAL: '#ec4899', WEBINAR: '#14b8a6', NETWORKING: '#f59e0b',
  SEMINAR: '#8b5cf6', CONCERT: '#ef4444', OTHER: '#64748b'
}

function getEventColor(event) { return colorMap[event.category] || '#64748b' }

const year = computed(() => currentYear.value)
const monthName = computed(() =>
  new Date(currentYear.value, currentMonth.value, 1)
    .toLocaleString('en-IN', { month: 'long' })
)

const calendarCells = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const daysInPrev = new Date(currentYear.value, currentMonth.value, 0).getDate()
  const cells = []

  for (let i = firstDay - 1; i >= 0; i--) {
    const date = new Date(currentYear.value, currentMonth.value - 1, daysInPrev - i)
    cells.push({ day: daysInPrev - i, currentMonth: false, isToday: false, date, events: getEventsForDate(date) })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(currentYear.value, currentMonth.value, d)
    cells.push({ day: d, currentMonth: true, isToday: date.toDateString() === today.toDateString(), date, events: getEventsForDate(date) })
  }
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, d)
    cells.push({ day: d, currentMonth: false, isToday: false, date, events: getEventsForDate(date) })
  }
  return cells
})

const monthEvents = computed(() =>
  events.value.filter(e => {
    if (!e.eventDate) return false
    const d = new Date(e.eventDate)
    return d.getMonth() === currentMonth.value && d.getFullYear() === currentYear.value
  }).sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
)

const formatSelectedDay = computed(() => {
  if (!selectedDay.value) return ''
  return selectedDay.value.date.toLocaleDateString('en-IN',
    { weekday: 'long', day: 'numeric', month: 'long' })
})

function getEventsForDate(date) {
  return events.value.filter(e => e.eventDate &&
    new Date(e.eventDate).toDateString() === date.toDateString())
}

function prevMonth() {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
  else currentMonth.value--
}
function nextMonth() {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
  else currentMonth.value++
}
function getDay(d) { return new Date(d).getDate() }
function getMonth(d) { return new Date(d).toLocaleString('en-IN', { month: 'short' }) }

onMounted(async () => {
  try {
    const res = await eventAPI.getAll({ page: 0, size: 100 })
    events.value = res.data.content || []
  } catch (e) { console.error(e) }
})
</script>

<style scoped>
.calendar-page { padding-bottom: 64px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; padding-top: 32px; margin-bottom: 24px; }
.calendar-card { overflow: hidden; margin-bottom: 20px; }
.cal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.cal-month { font-size: 20px; font-weight: 700; }
.cal-nav { background: none; border: 1.5px solid var(--border); border-radius: 8px; width: 36px; height: 36px; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.cal-nav:hover { border-color: var(--accent); color: var(--accent); }
.cal-days-header { display: grid; grid-template-columns: repeat(7, 1fr); border-bottom: 1px solid var(--border); }
.day-label { padding: 10px; text-align: center; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
.cal-cell { min-height: 100px; padding: 8px; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); transition: background 0.15s; }
.cal-cell:nth-child(7n) { border-right: none; }
.cal-cell:hover { background: var(--surface-2); }
.cal-cell.other-month { background: var(--surface-3); }
.cal-cell.other-month .cell-date { color: #cbd5e1; }
.cal-cell.today .cell-date { background: var(--accent); color: white; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; }
.cell-date { font-size: 13px; font-weight: 600; margin-bottom: 4px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; }
.cell-events { display: flex; flex-direction: column; gap: 2px; }
.cell-event { font-size: 10px; color: white; padding: 2px 6px; border-radius: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; font-weight: 600; }
.cell-event:hover { opacity: 0.8; }
.cell-more { font-size: 10px; color: var(--accent); font-weight: 600; cursor: pointer; padding: 1px 4px; }
.legend { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 32px; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; }
.month-events-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.no-events { text-align: center; padding: 40px; color: var(--text-muted); }
.month-events-list { display: flex; flex-direction: column; gap: 12px; }
.month-event-item { display: flex; align-items: center; gap: 16px; padding: 16px 20px; cursor: pointer; transition: transform 0.2s; }
.month-event-item:hover { transform: translateX(4px); box-shadow: var(--shadow-lg); }
.event-date-box { width: 56px; height: 56px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; color: white; }
.date-day { font-size: 20px; font-weight: 800; line-height: 1; }
.date-month { font-size: 11px; font-weight: 600; text-transform: uppercase; }
.event-info { flex: 1; }
.event-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.event-meta-row { display: flex; gap: 16px; font-size: 12px; color: var(--text-muted); flex-wrap: wrap; }
.fee { font-weight: 600; color: var(--accent); }
.fee.free { color: var(--success); }
.event-arrow { font-size: 18px; color: var(--text-muted); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.day-modal { width: 100%; max-width: 400px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.modal-close { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-muted); }
.day-events-list { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.day-event-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
.day-event-item:hover { background: var(--surface-3); }
.day-event-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.day-event-title { font-size: 14px; font-weight: 600; }
.day-event-meta { font-size: 12px; color: var(--text-muted); }
.day-event-arrow { margin-left: auto; color: var(--text-muted); }
@media (max-width: 768px) {
  .cal-cell { min-height: 60px; padding: 4px; }
  .cell-event { display: none; }
  .cal-cell.has-events .cell-date { color: var(--accent); font-weight: 800; }
}
</style>