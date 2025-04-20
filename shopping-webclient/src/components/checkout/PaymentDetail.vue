<template>
  <div id="payment">
    <h4>Payment</h4>
    <hr />
    <stripe-payment :totalCost="totalPrice" :stripeKey="stripeKey" @pay="startPayment" />
    <br />
    <hr />
    <div class="align-center">
      <b-btn class="primary-button" @click="handlePayment()">Pay with BKASH</b-btn>&nbsp;&nbsp;
    </div>
    <!-- <b-btn disabled class="primary-button">Pay with Khalti</b-btn> -->
    <div class="align-center">
      <khalti :text="'Pay with Khalti'" :config="khaltiConfig" :total="totalPrice" @success="startKhaltiPayment" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cartStore';
import { useShippingStore } from '@/stores/shippingStore';
import { useNotification } from '@kyvg/vue3-notification';
import StripePayment from '@/components/checkout/stripe/Stripe.vue';
import paymentService from '@/services/paymentService';
import Config from '@/config.json';
import { Khalti } from '@/components/checkout/khalti';

// Initialize router, stores and notification
const router = useRouter();
const cartStore = useCartStore();
const shippingStore = useShippingStore();
const { notify } = useNotification();

// Reactive data
const stripeKey = ref(Config.STRIPE_KEY);
const khaltiConfig = ref({
  productIdentity: '0000',
  productName: 'Veniqa',
  key: Config.KHALTI_KEY,
});

// Computed properties
const checkoutId = computed(() => cartStore.checkoutId);
const totalPrice = computed(() => {
  const cost = cartStore.getTotal;
  if (cost == null) return 0;
  return parseInt(cost.amount * 100);
});

const shippingMethod = computed({
  get: () => shippingStore.shippingMethod,
  set: (val) => shippingStore.setShippingMethod(val)
});

// Initialize data on component creation
onMounted(() => {
  khaltiConfig.value.productIdentity = checkoutId.value;
});

// Methods
async function startPayment(token) {
  if (!checkoutId.value || checkoutId.value.length <= 0) return;
  try {
    const data = await paymentService.payWithStripe(token, checkoutId.value);

    cartStore.resetOrders();
    router.push(`/orders/${data.order_id}`);
    notify({
      group: 'all',
      type: 'success',
      text: 'Payment was successful.'
    });
    console.log('payWithStripe token', token);
  } catch (error) {
    console.log('Error with Veniqa payment', error);
    notify({
      group: 'all',
      type: 'error',
      text: 'Payment could not be completed at the moment'
    });
  }
}

async function startKhaltiPayment(payload) {
  if (!checkoutId.value || checkoutId.value.length <= 0) return;

  try {
    const data = await paymentService.payWithKhalti(
      payload.token,
      checkoutId.value,
    );

    cartStore.resetOrders();
    router.push(`/orders/${data.order_id}`);
    notify({
      group: 'all',
      type: 'success',
      text: 'Payment was successful.'
    });
  } catch (error) {
    console.log('Error with Veniqa payment', error);
    notify({
      group: 'all',
      type: 'error',
      text: 'Payment could not be completed at the moment'
    });
  }
}

async function handlePayment() {
  try {
    await cartStore.pay();
    notify({
      group: 'all',
      type: 'success',
      text: 'Payment processed'
    });
    shippingMethod.value = null;
  } catch (error) {
    console.log(error);
    const msg = error.httpStatus ? '' : error.response.data.errorDetails;
    notify({
      group: 'all',
      type: 'error',
      text: `Error: ${msg}`
    });
  }
}
</script>

<style lang="scss">
#payment {
  margin: 2rem 0rem;
}
</style>
