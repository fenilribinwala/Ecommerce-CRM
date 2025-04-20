<template>
  <div class="checkout">
    <div class="space"></div>
    <h2 class="featured-title">Checkout</h2>

    <b-row>
      <b-col md="6">
        <b-card bg-variant="light" title="Shipping Details" class="text-left">
          <shipping-detail @selected="addressSelected"/>
          <shipping-method/>
          <transition
            name="shipping-form-anim"
            enter-active-class="animated slideInLeft faster"
            leave-active-class="animated slideOutLeft faster"
          >
            <payment-detail v-if="checkoutInitiated"/>

          </transition>
        </b-card>
      </b-col>
      <b-col md="6">
        <b-card bg-variant="light" title="Your Order" class="text-left">
          <order-detail/>
        </b-card>
      </b-col>
    </b-row>

    <div class="bottom-space"></div>
    <div class="checkout-button">
      <div v-if="isSessionActive">
        <div
          v-if="emailConfirmed && !checkoutInitiated && carts.length > 0"
        >
          <b-button
            size="lg"
            class="full-width primary-button"
            @click="handleCheckout()"
          >Get Final Prices</b-button>
          <br />
          <br />
        </div>
        <div v-else-if="!emailConfirmed">
          <p>You cannot checkout currently because your email address has not been confirmed.
            Please click below to resend the confirmation email</p>
          <b-button
            class="primary-button"
            @click="resendEmailConfirmation()"
          >Resend Email Confirmation</b-button>
        </div>

        <div v-if="checkoutInitiated">

        </div>
      </div>
      <div v-else>
        <p>You need to log in first before starting checkout process</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useShippingStore } from '@/stores/shippingStore';
import { useNotification } from '@kyvg/vue3-notification';
import ShippingDetail from '@/components/checkout/ShippingDetail.vue';
import OrderDetail from '@/components/checkout/OrderDetail.vue';
import PaymentDetail from '@/components/checkout/PaymentDetail.vue';
import ShippingMethod from '@/components/checkout/ShippingMethod.vue';
import ProxyUrls from '@/constants/ProxyUrls';

// Initialize router, stores and notification
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const shippingStore = useShippingStore();
const { notify } = useNotification();

// Reactive data
const payment = ref({});

// Computed properties
const selectedAddress = computed(() => shippingStore.getSelectedAddress);
const carts = computed(() => cartStore.cart);
const isSessionActive = computed(() => authStore.isSessionActive);
const checkoutInitiated = computed(() => cartStore.checkoutInitiated);
const emailConfirmed = computed(() => authStore.emailConfirmed);
const shippingMethod = computed({
  get: () => shippingStore.shippingMethod,
  set: (val) => shippingStore.setShippingMethod(val)
});

// Methods
async function addressSelected(selected) {
  shippingStore.addressSelected(selected);
  if (!checkoutInitiated.value) return;
  try {
    await cartStore.createCheckout({
      address: selectedAddress.value,
      shippingMethod: shippingMethod.value,
    });
  } catch (error) {
    notify({
      group: 'all',
      type: 'error',
      text: 'Something went haywire while trying to recalculate the prices. Please try again by changing address.'
    });
  }
}

async function handleCheckout() {
  if (!selectedAddress.value || !shippingMethod.value) {
    notify({
      group: 'all',
      type: 'warn',
      text: 'The shipping method and address should be selected first.'
    });
    return;
  }
  await cartStore.createCheckout({
    address: selectedAddress.value,
    shippingMethod: shippingMethod.value,
  });
}

async function resendEmailConfirmation() {
  try {
    const { data } = await axios({
      method: 'get',
      url: ProxyUrls.resendEmailConfirmation + authStore.getEmail,
    });

    if (data && data.httpStatus === 200) {
      notify({
        group: 'all',
        type: 'success',
        text: 'Confirmation email has been sent to your email address. Please check your email.'
      });
    }
  } catch (err) {
    notify({
      group: 'all',
      type: 'error',
      text: 'There was an error sending out the email. Please try again later'
    });
  }
}
</script>

<style lang="scss">
.checkout {
  padding: 0rem 2rem;
  margin-bottom: 10px;
  padding-bottom: 3rem;
  min-height: 90vh;
  position: relative;
  background-color: #eaecee;

  .bottom-space {
    height: 40px;
  }

  .checkout-button {
    margin-top: 20px;
    padding: 0rem 2rem;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
  }
}
</style>
