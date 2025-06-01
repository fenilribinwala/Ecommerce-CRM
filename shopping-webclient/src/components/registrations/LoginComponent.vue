<template>
  <div>
    <div class="header">
      <h2>
        <p v-if="!forgotEnabled">Login</p>
        <p v-else>Forgot Password</p>
      </h2>
      <p v-if="forgotEnabled">Please enter your email to reset the password.</p>
    </div>

    <BFormGroup>
      <BFormInput
        id="username"
        type="email"
        name="username"
        :state="usernameState"
        v-model="username"
        placeholder="Enter Email"
        aria-describedby="usernameFeedback"
        class="form-control"
      ></BFormInput>
      <BFormInvalidFeedback id="usernameFeedback" class="text-start">
        Enter a valid email address
      </BFormInvalidFeedback>
    </BFormGroup>

    <BFormGroup>
      <BFormInput
        v-if="!forgotEnabled"
        type="password"
        name="password"
        v-model="password"
        @keyup.enter="loginClicked"
        placeholder="Enter Password"
        aria-describedby="passwordFeedback"
        class="form-control"
      ></BFormInput>
      <!-- <BFormInvalidFeedback id="passwordFeedback" class="text-start">Enter at least 6 characters.</BFormInvalidFeedback> -->
    </BFormGroup>
    <!-- <vue-recaptcha @verify="onVerify" @expired="onExpired" :sitekey="recaptchaKey"></vue-recaptcha> -->
    <p class="info text-start">Please enter the captcha before loggin in.</p>

    <p class="forget-password" v-if="!forgotEnabled" @click="forgetPassword">Forgot Password?</p>

    <BButton class="login-button w-100" v-if="!forgotEnabled" @click="loginClicked">Login</BButton>
    <BButton class="login-button w-100" v-if="forgotEnabled" @click="resetPassword">Reset Password</BButton>

    <p class="register-class" @click="register">New User? Register here.</p>
    <div class="modal-bottom"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axiosInstance from '../../plugins/axios';
import ProxyUrl from '@/constants/ProxyUrls';
import Config from '@/config.json';

const emit = defineEmits(['login', 'register', 'close']);

const username = ref('');
const password = ref('');
const forgotEnabled = ref(false);
const recaptchaKey = ref('');
const captchaResp = ref('');

onMounted(() => {
  recaptchaKey.value = Config.RECAPTCHA;
});

function onVerify(response) {
  captchaResp.value = response;
}
function onExpired() {
  captchaResp.value = '';
}

function validEmail(email) {
  // eslint-disable-next-line
  const re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function forgetPassword() {
  forgotEnabled.value = true;
  password.value = '';
}

// async function captchaValidate() {
//   try {
//     let {data} = await axiosInstance({
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//       },
//       url: ProxyUrl.recaptcha,
//       method: 'post',
//       params: {
//         secret: Config.RECAPTCHA_SECRET,
//         response: captchaResp.value,
//       }
//     });
//     if(data && data.success){
//       return true;
//     }else return false;
//   } catch (error) {
//     return false;
//   }
// }

async function loginClicked() {
  // let isValidated = await captchaValidate();
  if (usernameState.value) { // && captchaResp.value.length > 0
    emit('login', {
      email: username.value,
      password: password.value,
      recaptcha: captchaResp.value,
    });
  }
}

async function resetPassword() {
  if (usernameState.value) {
    try {
      const { data } = await axiosInstance({
        method: 'get',
        url: ProxyUrl.forgotPassword + username.value,
      });
      if (data && data.httpStatus === 200) {
        emit('close');
        // Replace this with your notification system for Vue 3
        // For example, use mitt or vue-toastification
        // Here, just use alert as a placeholder
        alert('The email was just sent. Please check your email and follow the instructions.');
      }
    } catch (err) {
      alert('The email could not be sent right now. Please try again later');
    }
  }
}

function register() {
  emit('register');
}

const usernameState = computed(() => {
  if (username.value.length === 0) return null;
  return validEmail(username.value);
});
</script>

<style lang='scss'>
.forget-password {
  text-align: right;
  cursor: pointer;
}

.header {
  color: #267871;
  h2 {
    margin-bottom: 1em;
  }
}
.login-button {
  width: 100%;
  background-image: linear-gradient(to right, #267871, #136a8a) !important;
}

.register-class {
  padding-top: 20px;
  cursor: pointer;
}

.text-start {
  text-align: left !important;
}
.w-100 {
  width: 100% !important;
}
.form-control {
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
}
</style>
