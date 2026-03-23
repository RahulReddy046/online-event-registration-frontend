<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="payment-modal card">
      <div class="modal-header">
        <h2>💳 Complete Payment</h2>
        <button class="modal-close" @click="$emit('close')">✕</button>
      </div>

      <div class="payment-body">
        <div class="event-summary">
          <div class="summary-row">
            <span>Event</span>
            <span class="summary-value">{{ eventTitle }}</span>
          </div>
          <div class="summary-row">
            <span>Amount</span>
            <span class="summary-value amount">₹{{ amount }}</span>
          </div>
        </div>

        <div class="payment-steps">
          <div class="step" :class="{ active: currentStep === 1, done: currentStep > 1 }">
            <div class="step-num">1</div>
            <span>Scan & Pay</span>
          </div>
          <div class="step-line"></div>
          <div class="step" :class="{ active: currentStep === 2, done: currentStep > 2 }">
            <div class="step-num">2</div>
            <span>Enter UTR</span>
          </div>
          <div class="step-line"></div>
          <div class="step" :class="{ active: currentStep === 3 }">
            <div class="step-num">3</div>
            <span>Confirm</span>
          </div>
        </div>

        <!-- Step 1: QR Code -->
        <div v-if="currentStep === 1" class="step-content">
          <p class="step-instruction">Scan the QR code using any UPI app</p>
          <div class="qr-container">
            <img :src="qrCodeUrl" alt="UPI QR Code" class="qr-image" />
            <div class="upi-id-box">
              <span>UPI ID:</span>
              <strong>{{ upiId }}</strong>
              <button class="copy-btn" @click="copyUpiId">
                {{ copied ? '✅ Copied!' : '📋 Copy' }}
              </button>
            </div>
          </div>
          <div class="upi-apps">
            <p>Pay using any app:</p>
            <div class="app-icons">
              <span class="app-icon">📱 GPay</span>
              <span class="app-icon">📱 PhonePe</span>
              <span class="app-icon">📱 Paytm</span>
              <span class="app-icon">📱 BHIM</span>
            </div>
          </div>
          <button
            class="btn btn-primary"
            style="width:100%;justify-content:center;margin-top:16px"
            @click="currentStep = 2"
          >
            I have paid → Enter UTR Number
          </button>
        </div>

        <!-- Step 2: UTR Number -->
        <div v-if="currentStep === 2" class="step-content">
          <p class="step-instruction">
            Enter the UTR / Transaction ID from your payment app
          </p>
          <div class="form-group">
            <label class="form-label">UTR / Transaction ID *</label>
            <input
              v-model="utrNumber"
              type="text"
              class="form-input"
              placeholder="e.g. 123456789012"
              maxlength="25"
            />
            <small class="help-text">
              Find this in your UPI app under transaction history
            </small>
          </div>
          <div v-if="error" class="alert alert-error">{{ error }}</div>
          <div class="step-buttons">
            <button class="btn btn-outline" @click="currentStep = 1">← Back</button>
            <button
              class="btn btn-primary"
              @click="submitPayment"
              :disabled="loading"
            >
              {{ loading ? 'Submitting...' : 'Submit →' }}
            </button>
          </div>
        </div>

        <!-- Step 3: Success -->
        <div v-if="currentStep === 3" class="step-content success-content">
          <div class="success-icon">🎉</div>
          <h3>Registration Submitted!</h3>
          <p>Your payment is being verified by the admin.</p>
          <div class="confirmation-box">
            <div class="conf-row">
              <span>UTR Number</span>
              <strong>{{ utrNumber }}</strong>
            </div>
            <div class="conf-row">
              <span>Amount Paid</span>
              <strong>₹{{ amount }}</strong>
            </div>
            <div class="conf-row">
              <span>Status</span>
              <span class="badge badge-upcoming">Pending Verification</span>
            </div>
          </div>
          <p class="note">
            You will receive confirmation once payment is verified.
            Check your dashboard for updates.
          </p>
          <button
            class="btn btn-primary"
            style="width:100%;justify-content:center;margin-top:16px"
            @click="$emit('success')"
          >
            Go to My Dashboard →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { registrationAPI } from '@/services/api'

const props = defineProps({
  eventId: { type: Number, required: true },
  eventTitle: { type: String, required: true },
  amount: { type: Number, required: true }
})

const emit = defineEmits(['close', 'success'])

const currentStep = ref(1)
const utrNumber = ref('')
const loading = ref(false)
const error = ref('')
const copied = ref(false)

// ← Replace with your actual UPI ID
const upiId = 'yourname@upi'

const qrCodeUrl = computed(() => {
  const upiString = `upi://pay?pa=${upiId}&pn=EventHub&am=${props.amount}&cu=INR&tn=${encodeURIComponent(props.eventTitle)}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`
})

async function copyUpiId() {
  await navigator.clipboard.writeText(upiId)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

async function submitPayment() {
  if (!utrNumber.value.trim()) {
    error.value = 'Please enter your UTR / Transaction ID'
    return
  }
  if (utrNumber.value.trim().length < 6) {
    error.value = 'UTR number must be at least 6 characters'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await registrationAPI.registerWithPayment(props.eventId, utrNumber.value.trim())
    currentStep.value = 3
  } catch (e) {
    error.value = e.response?.data?.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}
.payment-modal { width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px; border-bottom: 1px solid var(--border);
}
.modal-header h2 { font-size: 18px; }
.modal-close { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-muted); }
.payment-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
.event-summary {
  background: var(--surface-3); border-radius: 8px; padding: 12px 16px;
}
.summary-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 14px; padding: 4px 0;
}
.summary-value { font-weight: 600; }
.amount { font-size: 20px; color: var(--accent); font-family: 'Clash Display', sans-serif; }
.payment-steps {
  display: flex; align-items: center; justify-content: center; gap: 0;
}
.step { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.step-num {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--border); color: var(--text-muted);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600;
}
.step.active .step-num { background: var(--accent); color: white; }
.step.done .step-num { background: var(--success); color: white; }
.step span { font-size: 11px; color: var(--text-muted); white-space: nowrap; }
.step.active span { color: var(--accent); font-weight: 600; }
.step-line { flex: 1; height: 2px; background: var(--border); margin: 0 8px; margin-bottom: 16px; min-width: 40px; }
.step-content { display: flex; flex-direction: column; gap: 16px; }
.step-instruction { font-size: 14px; color: var(--text-muted); text-align: center; }
.qr-container { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.qr-image {
  width: 200px; height: 200px;
  border: 2px solid var(--border); border-radius: 12px;
  padding: 8px; background: white;
}
.upi-id-box {
  display: flex; align-items: center; gap: 8px;
  background: var(--surface-3); padding: 8px 14px;
  border-radius: 8px; font-size: 14px; flex-wrap: wrap;
  justify-content: center;
}
.copy-btn {
  background: none; border: 1px solid var(--border);
  border-radius: 4px; padding: 3px 10px; font-size: 12px;
  cursor: pointer; font-family: inherit;
}
.copy-btn:hover { border-color: var(--accent); color: var(--accent); }
.upi-apps { text-align: center; }
.upi-apps p { font-size: 13px; color: var(--text-muted); margin-bottom: 8px; }
.app-icons { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.app-icon {
  font-size: 12px; background: var(--surface-3);
  padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border);
}
.help-text { font-size: 12px; color: var(--text-muted); }
.step-buttons { display: flex; gap: 8px; }
.step-buttons .btn { flex: 1; justify-content: center; }
.success-content { text-align: center; align-items: center; }
.success-icon { font-size: 56px; }
.success-content h3 { font-size: 22px; }
.success-content > p { color: var(--text-muted); font-size: 14px; }
.confirmation-box {
  background: var(--surface-3); border-radius: 8px;
  padding: 16px; width: 100%; text-align: left;
}
.conf-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0; font-size: 14px; border-bottom: 1px solid var(--border);
}
.conf-row:last-child { border-bottom: none; }
.note {
  font-size: 12px; color: var(--text-muted);
  background: #fff7ed; padding: 10px; border-radius: 6px;
  border: 1px solid #fed7aa; width: 100%;
}
</style>