<template>
  <div class="events-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Browse Events</h1>
        <p class="page-subtitle">Find and register for events that interest you</p>
      </div>

      <div class="filters-bar card">
        <div class="search-box">
          <span>🔍</span>
          <input v-model="searchQuery" type="text" placeholder="Search events..." class="search-input" @keyup.enter="fetchEvents" />
        </div>
        <div class="filter-group">
          <select v-model="selectedCategory" class="form-select filter-select">
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <select v-model="selectedStatus" class="form-select filter-select">
            <option value="">All Status</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button class="btn btn-primary" @click="fetchEvents">Search</button>
          <button class="btn btn-outline" @click="clearFilters">Clear</button>
        </div>
      </div>

      <div class="results-header">
        <span class="results-count" v-if="!loading">{{ totalElements }} events found</span>
      </div>

      <div v-if="loading" class="loading-center"><div class="spinner"></div></div>
      <div v-else-if="events.length" class="events-grid">
        <EventCard v-for="event in events" :key="event.id" :event="event" />
      </div>
      <div v-else class="empty-state card">
        <div class="empty-icon">📭</div>
        <h3>No events found</h3>
        <p>Try adjusting your search or filters</p>
        <button class="btn btn-primary" @click="clearFilters" style="margin-top:12px">Clear Filters</button>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button class="btn btn-outline btn-sm" :disabled="page === 0" @click="changePage(page - 1)">← Prev</button>
        <span class="page-info">Page {{ page + 1 }} of {{ totalPages }}</span>
        <button class="btn btn-outline btn-sm" :disabled="page >= totalPages - 1" @click="changePage(page + 1)">Next →</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { eventAPI } from '@/services/api'
import EventCard from '@/components/events/EventCard.vue'

const events = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const page = ref(0)
const totalPages = ref(0)
const totalElements = ref(0)
const categories = ['CONFERENCE','WORKSHOP','SEMINAR','CONCERT','SPORTS','NETWORKING','WEBINAR','FESTIVAL','OTHER']

async function fetchEvents() {
  loading.value = true
  try {
    let res
    if (searchQuery.value.trim()) {
      res = await eventAPI.search(searchQuery.value, { page: page.value, size: 9 })
    } else {
      res = await eventAPI.getAll({ page: page.value, size: 9, category: selectedCategory.value || undefined, status: selectedStatus.value || undefined })
    }
    events.value = res.data.content || []
    totalPages.value = res.data.totalPages || 0
    totalElements.value = res.data.totalElements || 0
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

function clearFilters() {
  searchQuery.value = ''; selectedCategory.value = ''; selectedStatus.value = ''; page.value = 0
  fetchEvents()
}

function changePage(p) {
  page.value = p; fetchEvents()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(fetchEvents)
</script>

<style scoped>
.events-page { padding-bottom: 64px; }
.filters-bar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; padding: 16px 20px; margin-bottom: 24px; }
.search-box { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 200px; background: var(--surface-3); border: 1.5px solid var(--border); border-radius: 8px; padding: 0 12px; }
.search-input { border: none; background: transparent; outline: none; font-family: inherit; font-size: 14px; padding: 10px 0; width: 100%; }
.filter-group { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.filter-select { min-width: 150px; }
.results-header { margin-bottom: 16px; }
.results-count { font-size: 14px; color: var(--text-muted); font-weight: 500; }
.events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
.empty-state { text-align: center; padding: 80px 40px; color: var(--text-muted); }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state h3 { font-size: 20px; margin-bottom: 8px; color: var(--text); }
.pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 40px; }
.page-info { font-size: 14px; color: var(--text-muted); }
@media (max-width: 768px) {
  .filters-bar { flex-direction: column; align-items: stretch; }
  .events-grid { grid-template-columns: 1fr; }
}
</style>