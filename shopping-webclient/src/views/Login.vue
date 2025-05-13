<template>
  <div>
    <div class="login">
      <div class="content">
        <div class="auth-box">
          <user-account-modal @loginSuccess="loggedIn"></user-account-modal>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useLoaderStore } from '@/stores/loaderStore'; // Assuming a Pinia loader store
import UserAccountModal from '@/components/registrations/UserAccountModal.vue';

// Component name for debugging (optional in Vue 3)
defineOptions({
  name: 'Login'
});

const registrationClass = ref(['registration-mode']);
const userLoggedIn = ref(false);

const router = useRouter();
const route = useRoute();
const loaderStore = useLoaderStore();

const loggedIn = () => {
  // Do something when logged in
  const previousPath = route.query.previousPath || null;
  router.push(previousPath || '/');
  loaderStore.unsetLoader(); // Using Pinia store action
};
</script>

<style lang="scss" scoped>
@import '../assets/css/global.scss';

.login {
  height: 100vh;
  // background-image: $gradient-color;
  // line-height: 100vh;

  // .content {
  //   display: inline-block;
  //   vertical-align: middle;
  //   line-height: normal;
  //   width: 100%;
  // }
}

.auth-box {
  // width: 70%;
  // margin: auto;
  background-color: white;
  box-shadow: 5px 6px 10px 0px #2e3532;
}
</style>
