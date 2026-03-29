<template>
  <div class="admin-page">
    <div class="container">
      <div class="page-header">
        <div>
          <h1 class="page-title">🎛️ Admin Panel</h1>
          <p class="page-subtitle">Manage events</p>
        </div>
        <button class="btn btn-primary" @click="openCreateModal">
          + Create Event
        </button>
      </div>

      <!-- Events Table -->
      <div class="card table-card">
        <div v-if="loading" class="loading-center"><div class="spinner"></div></div>
        <div v-else-if="events.length === 0" class="no-events">
          No events yet. Create your first event!
        </div>
        <div v-else class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Location</th>
                <th>Category</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in events" :key="event.id">
                <td>{{ event.title }}</td>
                <td>{{ formatDate(event.eventDate) }}</td>
                <td>{{ event.location }}</td>
                <td>{{ event.category }}</td>
                <td>{{ event.registrationFee > 0 ? '₹' + event.registrationFee : 'Free' }}</td>
                <td>
                  <span :class="['status-badge', event.status?.toLowerCase()]">
                    {{ event.status }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="btn btn-outline btn-sm" @click="openEditModal(event)">Edit</button>
                    <button class="btn btn-danger btn-sm" @click="deleteEvent(event)">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Event Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal card">
        <div class="modal-header">
          <h2>{{ editingEvent ? 'Edit Event' : 'Create Event' }}</h2>
          <button class="modal-close" @click="showModal = false">✕</button>
        </div>
        <div v-if="error" class="alert alert-error" style="margin:16px 24px 0">{{ error }}</div>
        <form @submit.prevent="saveEvent" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Title *</label>
              <input v-model="form.title" class="form-input" required placeholder="Event Title" />
            </div>
            <div class="form-group">
              <label class="form-label">Category *</label>
              <select v-model="form.category" class="form-input" required>
                <option value="">Select Category</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea v-model="form.description" class="form-input" rows="3" placeholder="Event description..."></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Event Date *</label>
              <input v-model="form.eventDate" type="datetime-local" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">End Date</label>
              <input v-model="form.endDate" type="datetime-local" class="form-input" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Location *</label>
              <input v-model="form.location" class="form-input" required placeholder="Event Location" />
            </div>
            <div class="form-group">
              <label class="form-label">Max Capacity</label>
              <input v-model="form.maxCapacity" type="number" class="form-input" placeholder="100" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Registration Fee (₹)</label>
              <input v-model="form.registrationFee" type="number" class="form-input" placeholder="0 for free" />
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select v-model="form.status" class="form-input">
                <option value="UPCOMING">UPCOMING</option>
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Organizer Name</label>
              <input v-model="form.organizerName" class="form-input" placeholder="Organizer Name" />
            </div>
            <div class="form-group">
              <label class="form-label">Organizer Email</label>
              <input v-model="form.organizerEmail" type="email" class="form-input" placeholder="organizer@email.com" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Image URL</label>
            <input v-model="form.imageUrl" class="form-input" placeholder="https://image-url.com/image.jpg" />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="showModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { eventAPI } from '@/services/api'

const events = ref([])
const loading = ref(true)
const showModal = ref(false)
const saving = ref(false)
const error = ref('')
const editingEvent = ref(null)

const categories = [
  'CONFERENCE', 'WORKSHOP', 'SEMINAR', 'CONCERT',
  'SPORTS', 'NETWORKING', 'WEBINAR', 'FESTIVAL', 'OTHER'
]

const defaultForm = {
  title: '', description: '', eventDate: '', endDate: '',
  location: '', maxCapacity: '', registrationFee: 0,
  category: '', status: 'UPCOMING', organizerName: '',
  organizerEmail: '', imageUrl: ''
}

const form = ref({ ...defaultForm })

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

function openCreateModal() {
  editingEvent.value = null
  form.value = { ...defaultForm }
  error.value = ''
  showModal.value = true
}

function openEditModal(event) {
  editingEvent.value = event
  form.value = {
    title: event.title || '',
    description: event.description || '',
    eventDate: event.eventDate ? event.eventDate.slice(0, 16) : '',
    endDate: event.endDate ? event.endDate.slice(0, 16) : '',
    location: event.location || '',
    maxCapacity: event.maxCapacity || '',
    registrationFee: event.registrationFee || 0,
    category: event.category || '',
    status: event.status || 'UPCOMING',
    organizerName: event.organizerName || '',
    organizerEmail: event.organizerEmail || '',
    imageUrl: event.imageUrl || ''
  }
  error.value = ''
  showModal.value = true
}

async function saveEvent() {
  saving.value = true
  error.value = ''
  try {
    const payload = {
      ...form.value,
      maxCapacity: form.value.maxCapacity ? parseInt(form.value.maxCapacity) : null,
      registrationFee: form.value.registrationFee ? parseFloat(form.value.registrationFee) : 0
    }
    if (editingEvent.value) {
      await eventAPI.update(editingEvent.value.id, payload)
    } else {
      await eventAPI.create(payload)
    }
    showModal.value = false
    await loadEvents()
  } catch (e) {
    error.value = e.response?.data?.message || 'Failed to save event'
  } finally {
    saving.value = false
  }
}

async function deleteEvent(event) {
  if (!confirm(`Delete "${event.title}"?`)) return
  try {
    await eventAPI.delete(event.id)
    await loadEvents()
  } catch (e) {
    alert('Failed to delete event')
  }
}

async function loadEvents() {
  loading.value = true
  try {
    const res = await eventAPI.getAll({ page: 0, size: 100 })
    events.value = res.data.content || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadEvents)
</script>

<style scoped>
.admin-page { padding-bottom: 64px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; padding-top: 32px; margin-bottom: 24px; }
.table-card { overflow: hidden; }
.table-wrapper { overflow-x: auto; }
.no-events { text-align: center; padding: 60px; color: var(--text-muted); font-size: 15px; }
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th { padding: 12px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight: 600; background: var(--surface-3); border-bottom: 1px solid var(--border); }
.data-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--surface-2); }
.status-badge { display: inline-flex; padding: 3px 10px; border-radius: 100px; font-size: 12px; font-weight: 600; }
.status-badge.upcoming { background: #dbeafe; color: #1d4ed8; }
.status-badge.ongoing { background: #d1fae5; color: #065f46; }
.status-badge.completed { background: var(--surface-3); color: var(--text-muted); }
.status-badge.cancelled { background: #fee2e2; color: #991b1b; }
.action-btns { display: flex; gap: 6px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal { width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: white; z-index: 1; }
.modal-close { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-muted); }
.modal-form { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 8px; border-top: 1px solid var(--border); }
textarea.form-input { resize: vertical; }
@media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
</style>