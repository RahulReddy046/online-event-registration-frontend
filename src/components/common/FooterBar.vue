<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <span class="logo-text">⚡ EventHub</span>
        <p class="footer-tagline">Discover and register for events near you.</p>
      </div>
      <div class="footer-links">
        <router-link to="/events">Browse Events</router-link>
        <router-link to="/register">Create Account</router-link>
        <router-link to="/login">Login</router-link>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">© 2026 EventHub. Built with Spring Boot & Vue.js</div>
    </div>
  </footer>
</template>

<style scoped>
.footer { background: var(--primary); color: #94a3b8; margin-top: auto; }
.footer-inner { display: flex; justify-content: space-between; align-items: flex-start; gap: 40px; padding: 48px 24px 32px; }
.logo-text { font-family: 'Clash Display', sans-serif; font-size: 20px; font-weight: 700; color: white; display: block; margin-bottom: 8px; }
.footer-tagline { font-size: 14px; max-width: 240px; }
.footer-links { display: flex; flex-direction: column; gap: 12px; }
.footer-links a { font-size: 14px; color: #94a3b8; transition: color 0.15s; }
.footer-links a:hover { color: white; }
.footer-bottom { border-top: 1px solid #1e293b; padding: 16px 24px; font-size: 13px; text-align: center; }
@media (max-width: 768px) { .footer-inner { flex-direction: column; } }
</style>