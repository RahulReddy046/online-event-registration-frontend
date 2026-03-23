<template>
  <div class="home">

    <!-- ═══ HERO ═══ -->
    <section class="hero">
      <div class="hero-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="grid-overlay"></div>
      </div>
      <div class="container hero-inner">
        <div class="hero-content">
          <div class="hero-pill">
            <span class="pill-dot"></span>
            Live events happening near you
          </div>
          <h1 class="hero-title">
            Discover Events<br>
            <span class="title-gradient">That Move You</span>
          </h1>
          <p class="hero-sub">
            From tech conferences to music festivals — find, register,
            and experience events that match your passion. 100% free to join.
          </p>
          <div class="hero-cta">
            <router-link to="/events" class="cta-primary">
              <span>Explore Events</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </router-link>
            <router-link v-if="!auth.isLoggedIn" to="/register" class="cta-secondary">
              Create Free Account
            </router-link>
          </div>
          <div class="hero-social-proof">
            <div class="avatars">
              <div class="av" style="background:#f97316">R</div>
              <div class="av" style="background:#6366f1">K</div>
              <div class="av" style="background:#10b981">A</div>
              <div class="av" style="background:#f59e0b">S</div>
            </div>
            <p><strong>2,400+</strong> people joined this month</p>
          </div>
        </div>
        <div class="hero-visual">
          <div class="event-float-card fc-1">
            <div class="fc-icon">🎤</div>
            <div class="fc-info">
              <div class="fc-title">Tech Summit 2026</div>
              <div class="fc-meta">Apr 15 · Hyderabad</div>
            </div>
            <div class="fc-badge">Free</div>
          </div>
          <div class="event-float-card fc-2">
            <div class="fc-icon">🎨</div>
            <div class="fc-info">
              <div class="fc-title">Design Workshop</div>
              <div class="fc-meta">May 10 · Bangalore</div>
            </div>
            <div class="fc-badge paid">₹999</div>
          </div>
          <div class="event-float-card fc-3">
            <div class="fc-icon">🏃</div>
            <div class="fc-info">
              <div class="fc-title">City Marathon</div>
              <div class="fc-meta">Jun 1 · Hussain Sagar</div>
            </div>
            <div class="fc-badge paid">₹299</div>
          </div>
          <div class="hero-circle">
            <div class="circle-inner">
              <span class="circle-num">500+</span>
              <span class="circle-label">Events</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ MARQUEE ═══ -->
    <div class="marquee-bar">
      <div class="marquee-track">
        <span v-for="item in marqueeItems" :key="item" class="marquee-item">
          {{ item }} <span class="marquee-dot">✦</span>
        </span>
        <span v-for="item in marqueeItems" :key="'b'+item" class="marquee-item">
          {{ item }} <span class="marquee-dot">✦</span>
        </span>
      </div>
    </div>

    <!-- ═══ STATS ═══ -->
    <section class="stats-section">
      <div class="container stats-grid">
        <div class="stat-card" v-for="stat in stats" :key="stat.label">
          <div class="stat-icon">{{ stat.icon }}</div>
          <div class="stat-num">{{ stat.num }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- ═══ FEATURED EVENTS ═══ -->
    <section class="events-section">
      <div class="container">
        <div class="section-head">
          <div class="section-tag">🔥 Hot Right Now</div>
          <h2 class="section-title">Upcoming Events</h2>
          <p class="section-sub">Don't miss these incredible experiences</p>
          <router-link to="/events" class="view-all-btn">
            View All Events →
          </router-link>
        </div>

        <div v-if="loading" class="loading-center"><div class="spinner"></div></div>

        <div v-else-if="events.length" class="events-grid">
          <div
            v-for="(event, i) in events"
            :key="event.id"
            class="event-card"
            :style="{ animationDelay: i * 0.1 + 's' }"
            @click="$router.push(`/events/${event.id}`)"
          >
            <div class="card-banner" :style="getBannerStyle(event)">
              <div class="card-category">{{ event.category }}</div>
              <div class="card-fee" :class="{ free: !event.registrationFee || event.registrationFee == 0 }">
                {{ event.registrationFee && event.registrationFee > 0 ? '₹' + event.registrationFee : 'FREE' }}
              </div>
            </div>
            <div class="card-body">
              <div class="card-status" :class="event.status?.toLowerCase()">{{ event.status }}</div>
              <h3 class="card-title">{{ event.title }}</h3>
              <p class="card-desc">{{ event.description }}</p>
              <div class="card-meta">
                <span class="meta-item">📅 {{ formatDate(event.eventDate) }}</span>
                <span class="meta-item">📍 {{ event.location }}</span>
                <span class="meta-item">👥 {{ getSpotsLeft(event) }}</span>
              </div>
            </div>
            <div class="card-footer">
              <router-link :to="`/events/${event.id}`" class="card-btn">
                Register Now →
              </router-link>
            </div>
          </div>
        </div>

        <div v-else class="empty-events">
          <div class="empty-icon">📭</div>
          <p>No events yet. Check back soon!</p>
          <router-link v-if="auth.isAdmin" to="/admin" class="cta-primary" style="margin-top:16px;display:inline-flex">
            + Create First Event
          </router-link>
        </div>
      </div>
    </section>

    <!-- ═══ CATEGORIES ═══ -->
    <section class="categories-section">
      <div class="container">
        <div class="section-head centered">
          <div class="section-tag">🗂️ Browse by Type</div>
          <h2 class="section-title">Find Your Vibe</h2>
        </div>
        <div class="categories-grid">
          <router-link
            v-for="cat in categories"
            :key="cat.name"
            to="/events"
            class="cat-card"
          >
            <div class="cat-emoji">{{ cat.emoji }}</div>
            <div class="cat-name">{{ cat.name }}</div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- ═══ HOW IT WORKS ═══ -->
    <section class="how-section">
      <div class="container">
        <div class="section-head centered">
          <div class="section-tag">⚡ Super Simple</div>
          <h2 class="section-title">3 Steps to Your Next Event</h2>
        </div>
        <div class="steps-grid">
          <div class="step-card" v-for="(step, i) in steps" :key="i">
            <div class="step-num">0{{ i + 1 }}</div>
            <div class="step-icon">{{ step.icon }}</div>
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-desc">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ TESTIMONIALS ═══ -->
    <section class="testimonials-section">
      <div class="container">
        <div class="section-head centered">
          <div class="section-tag">💬 What People Say</div>
          <h2 class="section-title">Loved by Event-Goers</h2>
        </div>
        <div class="testimonials-grid">
          <div class="testimonial-card" v-for="t in testimonials" :key="t.name">
            <div class="t-stars">★★★★★</div>
            <p class="t-text">"{{ t.text }}"</p>
            <div class="t-author">
              <div class="t-avatar" :style="{ background: t.color }">{{ t.name[0] }}</div>
              <div>
                <div class="t-name">{{ t.name }}</div>
                <div class="t-role">{{ t.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ CTA BANNER ═══ -->
    <section v-if="!auth.isLoggedIn" class="cta-banner">
      <div class="cta-bg">
        <div class="cta-orb cta-orb-1"></div>
        <div class="cta-orb cta-orb-2"></div>
      </div>
      <div class="container cta-content">
        <div class="cta-tag">🎯 Join the Community</div>
        <h2 class="cta-title">Ready to Experience<br>Something Amazing?</h2>
        <p class="cta-sub">Join 10,000+ event-goers discovering incredible experiences every day.</p>
        <div class="cta-actions">
          <router-link to="/register" class="cta-primary large">
            Get Started Free →
          </router-link>
          <router-link to="/events" class="cta-ghost">
            Browse Events First
          </router-link>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { eventAPI } from '@/services/api'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
const events = ref([])
const loading = ref(true)

const marqueeItems = [
  'Conferences', 'Workshops', 'Marathons', 'Music Festivals',
  'Networking Events', 'Webinars', 'Seminars', 'Cultural Fests',
  'Tech Summits', 'Photography'
]

const stats = [
  { icon: '🎟️', num: '500+', label: 'Events Listed' },
  { icon: '👥', num: '10K+', label: 'Registrations' },
  { icon: '🏙️', num: '20+', label: 'Cities Covered' },
  { icon: '⭐', num: '4.9/5', label: 'User Rating' }
]

const categories = [
  { emoji: '💻', name: 'Conference' },
  { emoji: '🛠️', name: 'Workshop' },
  { emoji: '🎵', name: 'Concert' },
  { emoji: '🏃', name: 'Sports' },
  { emoji: '🤝', name: 'Networking' },
  { emoji: '🎓', name: 'Seminar' },
  { emoji: '💻', name: 'Webinar' },
  { emoji: '🎪', name: 'Festival' }
]

const steps = [
  { icon: '🔍', title: 'Discover Events', desc: 'Browse hundreds of events by category, location or date. Find exactly what excites you.' },
  { icon: '📝', title: 'Register Instantly', desc: 'One click registration for free events. Secure UPI payment for paid events.' },
  { icon: '🎉', title: 'Enjoy & Connect', desc: 'Attend the event, meet amazing people, and create unforgettable memories.' }
]

const testimonials = [
  { name: 'Rahul Sharma', role: 'Software Engineer', color: '#f97316', text: 'Found the Tech Summit through EventHub and it was incredible! The registration was so smooth and hassle-free.' },
  { name: 'Priya Nair', role: 'Designer', color: '#6366f1', text: 'I attend workshops every month through this platform. The variety of events is amazing and payment is super easy.' },
  { name: 'Arjun Reddy', role: 'Startup Founder', color: '#10b981', text: 'The networking events I found here helped me connect with investors. Best platform for professional events!' }
]

const colors = ['#f97316', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#14b8a6']

function getBannerStyle(event) {
  const c = colors[(event.id || 0) % colors.length]
  return { background: `linear-gradient(135deg, ${c}33 0%, ${c}88 100%)` }
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getSpotsLeft(event) {
  if (!event.maxCapacity) return 'Unlimited spots'
  const left = event.maxCapacity - (event.currentRegistrations || 0)
  if (left <= 0) return 'Full'
  return `${left} spots left`
}

onMounted(async () => {
  try {
    const res = await eventAPI.getAll({ page: 0, size: 6 })
    events.value = res.data.content || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* ── HERO ── */
.hero {
  position: relative;
  min-height: 92vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: #050a14;
}
.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
}
.orb-1 {
  width: 500px; height: 500px;
  background: #f97316;
  top: -100px; left: -100px;
  animation: drift 8s ease-in-out infinite alternate;
}
.orb-2 {
  width: 400px; height: 400px;
  background: #6366f1;
  bottom: -80px; right: 10%;
  animation: drift 10s ease-in-out infinite alternate-reverse;
}
.orb-3 {
  width: 300px; height: 300px;
  background: #10b981;
  top: 30%; right: 30%;
  animation: drift 12s ease-in-out infinite alternate;
}
@keyframes drift {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(30px, 20px) scale(1.1); }
}
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}
.hero-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  padding: 80px 24px;
  position: relative;
  z-index: 1;
}
.hero-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(249,115,22,0.12);
  border: 1px solid rgba(249,115,22,0.3);
  color: #fb923c;
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 24px;
  animation: fadeUp 0.6s ease both;
}
.pill-dot {
  width: 6px; height: 6px;
  background: #f97316;
  border-radius: 50%;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
.hero-title {
  font-size: 64px;
  font-weight: 800;
  line-height: 1.05;
  color: white;
  margin-bottom: 20px;
  animation: fadeUp 0.6s 0.1s ease both;
}
.title-gradient {
  background: linear-gradient(135deg, #f97316, #f59e0b, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-sub {
  font-size: 17px;
  color: #94a3b8;
  line-height: 1.7;
  max-width: 480px;
  margin-bottom: 36px;
  animation: fadeUp 0.6s 0.2s ease both;
}
.hero-cta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 32px;
  animation: fadeUp 0.6s 0.3s ease both;
}
.cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #f97316, #ea6c05);
  color: white;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
  box-shadow: 0 8px 24px rgba(249,115,22,0.35);
}
.cta-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(249,115,22,0.45); }
.cta-primary.large { padding: 16px 36px; font-size: 16px; }
.cta-secondary {
  display: inline-flex;
  align-items: center;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #e2e8f0;
  border: 1.5px solid rgba(255,255,255,0.15);
  text-decoration: none;
  transition: all 0.2s;
  background: rgba(255,255,255,0.05);
}
.cta-secondary:hover { border-color: rgba(249,115,22,0.5); color: #fb923c; background: rgba(249,115,22,0.05); }
.cta-ghost {
  display: inline-flex;
  align-items: center;
  padding: 16px 28px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #e2e8f0;
  border: 1.5px solid rgba(255,255,255,0.2);
  text-decoration: none;
  transition: all 0.2s;
}
.cta-ghost:hover { border-color: white; color: white; }
.hero-social-proof {
  display: flex;
  align-items: center;
  gap: 12px;
  animation: fadeUp 0.6s 0.4s ease both;
}
.avatars { display: flex; }
.av {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 2px solid #050a14;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: white;
  margin-left: -8px;
}
.av:first-child { margin-left: 0; }
.hero-social-proof p { font-size: 13px; color: #94a3b8; }
.hero-social-proof strong { color: white; }

/* Hero Visual */
.hero-visual {
  position: relative;
  height: 400px;
  animation: fadeUp 0.6s 0.2s ease both;
}
.event-float-card {
  position: absolute;
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 240px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  transition: transform 0.3s;
}
.event-float-card:hover { transform: translateY(-4px) scale(1.02); }
.fc-1 { top: 20px; left: 0; animation: float 4s ease-in-out infinite; }
.fc-2 { top: 50%; left: 20%; transform: translateY(-50%); animation: float 5s ease-in-out infinite 0.5s; }
.fc-3 { bottom: 20px; right: 0; animation: float 4.5s ease-in-out infinite 1s; }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.fc-2 { animation: float2 5s ease-in-out infinite 0.5s; }
@keyframes float2 {
  0%, 100% { transform: translateY(-50%); }
  50% { transform: translateY(calc(-50% - 8px)); }
}
.fc-icon { font-size: 28px; }
.fc-title { font-size: 13px; font-weight: 600; color: white; }
.fc-meta { font-size: 11px; color: #94a3b8; margin-top: 2px; }
.fc-badge {
  margin-left: auto;
  background: rgba(16,185,129,0.2);
  color: #34d399;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.fc-badge.paid { background: rgba(249,115,22,0.2); color: #fb923c; }
.hero-circle {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 140px; height: 140px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(249,115,22,0.2), rgba(99,102,241,0.2));
  border: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  animation: spin-slow 20s linear infinite;
}
@keyframes spin-slow {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
.circle-inner {
  display: flex; flex-direction: column; align-items: center;
  animation: spin-slow-reverse 20s linear infinite;
}
@keyframes spin-slow-reverse {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}
.circle-num { font-size: 28px; font-weight: 800; color: white; line-height: 1; }
.circle-label { font-size: 11px; color: #94a3b8; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── MARQUEE ── */
.marquee-bar {
  background: #f97316;
  padding: 12px 0;
  overflow: hidden;
}
.marquee-track {
  display: flex;
  gap: 0;
  animation: marquee 30s linear infinite;
  width: max-content;
}
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.marquee-item {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0 24px;
  white-space: nowrap;
}
.marquee-dot { color: rgba(255,255,255,0.5); font-size: 10px; }

/* ── STATS ── */
.stats-section {
  background: white;
  padding: 48px 0;
  border-bottom: 1px solid #e2e8f0;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
}
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px;
  border-right: 1px solid #e2e8f0;
  text-align: center;
}
.stat-card:last-child { border-right: none; }
.stat-icon { font-size: 28px; }
.stat-num {
  font-size: 36px;
  font-weight: 800;
  color: #0f172a;
  font-family: 'Clash Display', sans-serif;
  line-height: 1;
}
.stat-label { font-size: 13px; color: #64748b; font-weight: 500; }

/* ── EVENTS ── */
.events-section { padding: 80px 0; background: #f8fafc; }
.section-head {
  display: flex;
  flex-direction: column;
  margin-bottom: 40px;
  position: relative;
}
.section-head.centered { align-items: center; text-align: center; }
.section-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
  padding: 4px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  width: fit-content;
}
.section-title {
  font-size: 36px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}
.section-sub { color: #64748b; font-size: 15px; }
.view-all-btn {
  position: absolute;
  right: 0;
  top: 40px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #f97316;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  border: 1.5px solid #fed7aa;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
}
.view-all-btn:hover { background: #fff7ed; }
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}
.event-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.25s, box-shadow 0.25s;
  animation: fadeUp 0.5s ease both;
  display: flex;
  flex-direction: column;
}
.event-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
.card-banner {
  height: 160px;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px;
}
.card-category {
  background: rgba(0,0,0,0.3);
  backdrop-filter: blur(4px);
  color: white;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.card-fee {
  background: #10b981;
  color: white;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
}
.card-fee:not(.free) { background: #f97316; }
.card-body { padding: 20px; flex: 1; }
.card-status {
  display: inline-flex;
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}
.card-status.upcoming { background: #dbeafe; color: #1d4ed8; }
.card-status.ongoing { background: #d1fae5; color: #065f46; }
.card-status.completed { background: #f1f5f9; color: #475569; }
.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 14px;
}
.card-meta { display: flex; flex-direction: column; gap: 5px; }
.meta-item { font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 5px; }
.card-footer {
  padding: 14px 20px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
}
.card-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #f97316, #ea6c05);
  color: white;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}
.card-btn:hover { transform: translateX(2px); box-shadow: 0 4px 12px rgba(249,115,22,0.3); }
.empty-events { text-align: center; padding: 80px; color: #64748b; }
.empty-icon { font-size: 48px; margin-bottom: 12px; }

/* ── CATEGORIES ── */
.categories-section {
  padding: 80px 0;
  background: white;
}
.categories-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 16px;
  margin-top: 40px;
}
.cat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 24px 12px;
  border-radius: 16px;
  border: 1.5px solid #e2e8f0;
  text-decoration: none;
  transition: all 0.2s;
  background: white;
}
.cat-card:hover {
  border-color: #f97316;
  background: #fff7ed;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(249,115,22,0.12);
}
.cat-emoji { font-size: 28px; }
.cat-name { font-size: 12px; font-weight: 600; color: #374151; text-align: center; }

/* ── HOW IT WORKS ── */
.how-section { padding: 80px 0; background: #050a14; }
.how-section .section-title { color: white; }
.how-section .section-tag { background: rgba(249,115,22,0.15); border-color: rgba(249,115,22,0.3); }
.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-top: 48px;
  position: relative;
}
.steps-grid::before {
  content: '';
  position: absolute;
  top: 40px;
  left: 16%;
  right: 16%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(249,115,22,0.4), transparent);
}
.step-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 32px 28px;
  text-align: center;
  transition: all 0.3s;
}
.step-card:hover {
  background: rgba(249,115,22,0.08);
  border-color: rgba(249,115,22,0.3);
  transform: translateY(-4px);
}
.step-num {
  font-size: 11px;
  font-weight: 800;
  color: #f97316;
  letter-spacing: 2px;
  margin-bottom: 16px;
}
.step-icon { font-size: 40px; margin-bottom: 16px; }
.step-title { font-size: 18px; font-weight: 700; color: white; margin-bottom: 10px; }
.step-desc { font-size: 14px; color: #94a3b8; line-height: 1.7; }

/* ── TESTIMONIALS ── */
.testimonials-section { padding: 80px 0; background: #f8fafc; }
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 48px;
}
.testimonial-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  padding: 28px;
  transition: all 0.2s;
}
.testimonial-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
.t-stars { color: #f59e0b; font-size: 16px; margin-bottom: 14px; letter-spacing: 2px; }
.t-text { font-size: 14px; color: #374151; line-height: 1.7; margin-bottom: 20px; font-style: italic; }
.t-author { display: flex; align-items: center; gap: 12px; }
.t-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: white; font-size: 16px;
  flex-shrink: 0;
}
.t-name { font-size: 14px; font-weight: 700; color: #0f172a; }
.t-role { font-size: 12px; color: #64748b; }

/* ── CTA BANNER ── */
.cta-banner {
  position: relative;
  padding: 100px 0;
  overflow: hidden;
  background: #050a14;
  text-align: center;
}
.cta-bg { position: absolute; inset: 0; pointer-events: none; }
.cta-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}
.cta-orb-1 { width: 400px; height: 400px; background: #f97316; top: -100px; left: -100px; }
.cta-orb-2 { width: 300px; height: 300px; background: #6366f1; bottom: -80px; right: -80px; }
.cta-content { position: relative; z-index: 1; }
.cta-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(249,115,22,0.12);
  border: 1px solid rgba(249,115,22,0.3);
  color: #fb923c;
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 20px;
}
.cta-title {
  font-size: 52px;
  font-weight: 800;
  color: white;
  line-height: 1.1;
  margin-bottom: 16px;
}
.cta-sub { font-size: 17px; color: #94a3b8; margin-bottom: 36px; }
.cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .categories-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 768px) {
  .hero-inner { grid-template-columns: 1fr; padding: 60px 16px; gap: 40px; }
  .hero-title { font-size: 40px; }
  .hero-visual { display: none; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .stat-card:nth-child(2) { border-right: none; }
  .events-grid { grid-template-columns: 1fr; }
  .categories-grid { grid-template-columns: repeat(4, 1fr); }
  .steps-grid { grid-template-columns: 1fr; }
  .steps-grid::before { display: none; }
  .testimonials-grid { grid-template-columns: 1fr; }
  .cta-title { font-size: 32px; }
  .section-head { flex-direction: column; }
  .view-all-btn { position: static; margin-top: 12px; align-self: flex-start; }
}
</style>