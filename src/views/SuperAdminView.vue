<template>
  <div class="super-admin-page">
    <div class="container">
      <div class="page-header">
        <div>
          <h1 class="page-title">👑 Super Admin Panel</h1>
          <p class="page-subtitle">Manage admins and all users</p>
        </div>
        <button class="btn btn-primary" @click="showCreateModal = true">
          + Add Admin
        </button>
      </div>

      <div class="tabs">
        <button :class="['tab', { active: activeTab === 'admins' }]" @click="activeTab = 'admins'">
          👮 Admins ({{ admins.length }})
        </button>
        <button :class="['tab', { active: activeTab === 'users' }]" @click="activeTab = 'users'">
          👥 All Users ({{ users.length }})
        </button>
      </div>

      <div v-if="activeTab === 'admins'" class="card table-card">
        <div v-if="loading" class="loading-center"><div class="spinner"></div></div>
        <div v-else class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th>
                <th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="admin in admins" :key="admin.id">
                <td>
                  <div class="user-cell">
                    <div class="user-av" :style="{ background: getColor(admin.id) }">
                      {{ admin.name[0] }}
                    </div>
                    {{ admin.name }}
                  </div>
                </td>
                <td>{{ admin.email }}</td>
                <td>
                  <span :class="['role-badge', admin.role.toLowerCase()]">
                    {{ admin.role === 'SUPER_ADMIN' ? '👑 Super Admin' : '👮 Admin' }}
                  </span>
                </td>
                <td>
                  <span :class="['status-badge', admin.isActive ? 'active' : 'inactive']">
                    {{ admin.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <div class="action-btns" v-if="admin.role !== 'SUPER_ADMIN'">
                    <button class="btn btn-outline btn-sm" @click="demote(admin)">Demote</button>
                    <button class="btn btn-danger btn-sm" @click="deactivate(admin)">Deactivate</button>
                  </div>
                  <span v-else style="color:var(--text-muted);font-size:13px">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="activeTab === 'users'" class="card table-card">
        <div v-if="loading" class="loading-center"><div class="spinner"></div></div>
        <div v-else class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th>
                <th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>
                  <div class="user-cell">
                    <div class="user-av" :style="{ background: getColor(user.id) }">
                      {{ user.name[0] }}
                    </div>
                    {{ user.name }}
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span :class="['role-badge', user.role.toLowerCase()]">
                    {{ user.role }}
                  </span>
                </td>
                <td>
                  <span :class="['status-badge', user.isActive ? 'active' : 'inactive']">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <button v-if="user.role === 'USER'" class="btn btn-outline btn-sm" @click="promote(user)">
                    Make Admin
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal card">
        <div class="modal-header">
          <h2>Create New Admin</h2>
          <button class="modal-close" @click="showCreateModal = false">✕</button>
        </div>
        <div v-if="modalError" class="alert alert-error" style="margin:16px 24px 0">{{ modalError }}</div>
        <div v-if="modalSuccess" class="alert alert-success" style="margin:16px 24px 0">{{ modalSuccess }}</div>
        <form @submit.prevent="createAdmin" class="modal-form">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input v-model="newAdmin.name" class="form-input" required placeholder="Admin Name" />
          </div>
          <div class="form-group">
            <label class="form-label">Email *</label>
            <input v-model="newAdmin.email" type="email" class="form-input" required placeholder="admin@email.com" />
          </div>
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input v-model="newAdmin.phone" class="form-input" placeholder="9999999999" />
          </div>
          <div class="form-group">
            <label class="form-label">Password *</label>
            <input v-model="newAdmin.password" type="password" class="form-input" required placeholder="Min 6 characters" minlength="6" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="showCreateModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="creating">
              {{ creating ? 'Creating...' : 'Create Admin' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { superAdminAPI } from '@/services/api'

const admins = ref([])
const users = ref([])
const loading = ref(true)
const activeTab = ref('admins')
const showCreateModal = ref(false)
const creating = ref(false)
const modalError = ref('')
const modalSuccess = ref('')
const colors = ['#f97316','#6366f1','#10b981','#f59e0b','#ec4899','#14b8a6']
const newAdmin = ref({ name: '', email: '', phone: '', password: '' })

function getColor(id) { return colors[(id || 0) % colors.length] }

async function loadData() {
  loading.value = true
  try {
    const [adminsRes, usersRes] = await Promise.all([
      superAdminAPI.getAllAdmins(),
      superAdminAPI.getAllUsers()
    ])
    admins.value = adminsRes.data
    users.value = usersRes.data
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function createAdmin() {
  creating.value = true
  modalError.value = ''
  modalSuccess.value = ''
  try {
    await superAdminAPI.createAdmin(newAdmin.value)
    modalSuccess.value = 'Admin created successfully!'
    newAdmin.value = { name: '', email: '', phone: '', password: '' }
    await loadData()
    setTimeout(() => { showCreateModal.value = false; modalSuccess.value = '' }, 2000)
  } catch (e) {
    modalError.value = e.response?.data?.message || 'Failed to create admin'
  } finally { creating.value = false }
}

async function promote(user) {
  if (!confirm(`Promote ${user.name} to Admin?`)) return
  try { await superAdminAPI.promoteToAdmin(user.id); await loadData() }
  catch (e) { alert('Failed') }
}

async function demote(admin) {
  if (!confirm(`Demote ${admin.name} to User?`)) return
  try { await superAdminAPI.demoteToUser(admin.id); await loadData() }
  catch (e) { alert('Failed') }
}

async function deactivate(admin) {
  if (!confirm(`Deactivate ${admin.name}?`)) return
  try { await superAdminAPI.deactivate(admin.id); await loadData() }
  catch (e) { alert('Failed') }
}

onMounted(loadData)
</script>

<style scoped>
.super-admin-page { padding-bottom: 64px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; padding-top: 32px; margin-bottom: 24px; }
.tabs { display: flex; gap: 4px; margin-bottom: 20px; background: var(--surface-3); padding: 4px; border-radius: 10px; width: fit-content; }
.tab { padding: 8px 20px; border-radius: 8px; border: none; background: none; font-family: inherit; font-size: 14px; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
.tab.active { background: white; color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
.table-card { overflow: hidden; }
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th { padding: 12px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight: 600; background: var(--surface-3); border-bottom: 1px solid var(--border); }
.data-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--surface-2); }
.user-cell { display: flex; align-items: center; gap: 10px; }
.user-av { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: white; flex-shrink: 0; }
.role-badge { display: inline-flex; padding: 3px 10px; border-radius: 100px; font-size: 12px; font-weight: 600; }
.role-badge.super_admin { background: #fef3c7; color: #92400e; }
.role-badge.admin { background: #dbeafe; color: #1d4ed8; }
.role-badge.user { background: var(--surface-3); color: var(--text-muted); }
.status-badge { display: inline-flex; padding: 3px 10px; border-radius: 100px; font-size: 12px; font-weight: 600; }
.status-badge.active { background: #d1fae5; color: #065f46; }
.status-badge.inactive { background: #fee2e2; color: #991b1b; }
.action-btns { display: flex; gap: 6px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal { width: 100%; max-width: 440px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.modal-close { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-muted); }
.modal-form { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 8px; border-top: 1px solid var(--border); }
</style>