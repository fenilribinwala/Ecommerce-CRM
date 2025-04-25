<template>
  <div class="white-bg">
    <div class="header">
      <h2>
        <strong>Register</strong>
      </h2>
    </div>

    <b-form-group>
      <b-form-input
        id="name"
        type="text"
        name="name"
        :state="nameState"
        v-model="name"
        placeholder="Enter your full name"
        aria-describedby="nameFeedback"
      ></b-form-input>
      <b-form-invalid-feedback id="nameFeedback" class="align-left">
        <!-- This will only be shown if the preceeding input has an invalid state -->
        The name field cannot be empty.
      </b-form-invalid-feedback>
    </b-form-group>

    <b-form-group>
      <b-form-input
        id="username"
        type="email"
        name="username"
        :state="usernameState"
        v-model="username"
        placeholder="Enter Username"
        aria-describedby="usernameFeedback"
      ></b-form-input>
      <b-form-invalid-feedback id="usernameFeedback" class="align-left">
        <!-- This will only be shown if the preceeding input has an invalid state -->
        Enter a valid email address
      </b-form-invalid-feedback>
    </b-form-group>

    <b-form-group>
      <b-form-input
        id="password"
        type="password"
        name="password"
        :state="passwordState"
        v-model="password"
        placeholder="Enter a password"
        aria-describedby="passwordFeedback"
      ></b-form-input>
      <b-form-invalid-feedback
        id="passwordFeedback"
        class="align-left">Enter at least 7 characters.</b-form-invalid-feedback>
    </b-form-group>

    <b-form-group>
      <b-form-input
        id="confirmPassword"
        type="password"
        name="confirmPassword"
        :state="confirmPasswordState"
        v-model="confirmPassword"
        placeholder="Re-enter the password"
        aria-describedby="confirmPasswordFeedback"
      ></b-form-input>
      <b-form-invalid-feedback
        id="confirmPasswordFeedback"
        class="align-left"
      >It should match the password entered.</b-form-invalid-feedback>
    </b-form-group>

    <b-form-group>
      <b-form-input
        id="phone"
        type="tel"
        name="phone"
        :state="phoneState"
        v-model="phone"
        placeholder="Enter a phone number"
        aria-describedby="phoneFeedback"
      ></b-form-input>
      <b-form-invalid-feedback
        id="phoneFeedback"
        class="align-left">Phone number invalid.</b-form-invalid-feedback>
    </b-form-group>

    <p class="info align-left" v-if="!recaptchaVerified">Please complete the reCAPTCHA to register.</p>
    <p class="info align-left success-text" v-else>reCAPTCHA verified ✓</p>

    <div class="modal-bottom"></div>
    <b-btn class="register-button" @click="registerClicked()">Register</b-btn>

    <p class="register-class" @click="loginNavigation()">Already a User? Go back to login.</p>
    <div class="modal-bottom"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useReCaptcha } from 'vue-recaptcha-v3';
import Config from '@/config.json';

// Define emits
const emit = defineEmits(['register', 'loginNav']);

// Setup recaptcha
const { executeRecaptcha, recaptchaLoaded } = useReCaptcha();

// Reactive data
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const phone = ref('');
const name = ref('');
const captchaResp = ref('');
const recaptchaVerified = ref(false);

// Computed properties
const usernameState = computed(() => {
  if (username.value.length === 0) return null;
  return validEmail(username.value);
});

const passwordState = computed(() => {
  if (password.value.length === 0) return null;
  return password.value.length > 6;
});

const confirmPasswordState = computed(() => {
  if (confirmPassword.value.length === 0) return null;
  return confirmPassword.value === password.value;
});

const phoneState = computed(() => {
  if (phone.value.length === 0) return null;
  return phone.value.length === 10;
});

const nameState = computed(() => {
  if (name.value.length === 0) return null;
  return name.value.length > 0;
});

// Methods
function validEmail(email) {
  // eslint-disable-next-line
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

async function verifyRecaptcha() {
  try {
    await recaptchaLoaded();
    const token = await executeRecaptcha('register');
    captchaResp.value = token;
    recaptchaVerified.value = true;
    return token;
  } catch (error) {
    console.error('reCAPTCHA error:', error);
    recaptchaVerified.value = false;
    captchaResp.value = '';
    return '';
  }
}

async function registerClicked() {
  if (!recaptchaVerified.value) {
    await verifyRecaptcha();
  }

  if (
    usernameState.value &&
    passwordState.value &&
    confirmPasswordState.value &&
    phoneState.value &&
    nameState.value &&
    captchaResp.value.length > 0
  ) {
    emit('register', {
      email: username.value,
      password: password.value,
      phone: phone.value,
      name: name.value,
      recaptcha: captchaResp.value
    });
  }
}

function loginNavigation() {
  emit('loginNav');
}

// Initialize recaptcha on component mount
onMounted(async () => {
  // We'll verify recaptcha on register button click
});
</script>

<style lang="scss">
.register-button {
  width: 100%;
  background-image: linear-gradient(to right, #136a8a, #267871) !important;
}

.register-class {
  padding-top: 20px;
  cursor: pointer;
}
</style>
