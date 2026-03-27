<template>
  <div class="super-admin-container">
    <h1>Super Admin Dashboard</h1>
    <p>Welcome, Master Administrator. You have full system access.</p>
    
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Users</h3>
        <p>Manage all registered accounts</p>
      </div>
      <div class="stat-card">
        <h3>System Logs</h3>
        <p>View critical application events</p>
      </div>
    </div>

    <section class="admin-content">
      <p>System Status: <span class="status-online">Operational</span></p>
    </section>
  </div>
</template>

<script setup>
// You can add your logic here later
</script>

<style scoped>
.super-admin-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
.stat-card {
  padding: 1.5rem;
  background: #f4f4f4;
  border-radius: 8px;
  border-left: 5px solid #6200ee;
}
.status-online {
  color: green;
  font-weight: bold;
}
</style>