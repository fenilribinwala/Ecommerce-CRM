<template>
  <div>
    <!-- <stripe-payment/> -->
    <card
      class="stripe-card"
      :class="{ complete }"
      :stripe="stripeKey"
      :options="stripeOptions"
      :paymentReqOptions="reqParams"
      @change="complete = $event.complete"
      @token="payWithGpay"
    />
    <br />
    <BButton
      class="pay-with-stripe"
      @click="pay($event)"
      :disabled="!complete"
      style="font-family: Libre Baskerville; font-size: 14px"
      >Pay by card</BButton
    >
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import _ from 'lodash';
import { Card, Stripe } from './index';
import PaymentRequestDTO from './StripePaymentRequestDTO.json';
import { useCartStore } from '@/stores/cartStore';
import { useRouter } from 'vue-router';
import { useNotification } from '@kyvg/vue3-notification';
import ProxyUrl from '@/constants/ProxyUrls';

// Define props
const props = defineProps({
  totalCost: {
    required: true,
  },
  stripeKey: {
    type: String,
    required: true,
  },
});

// Define emits
const emit = defineEmits(['pay']);

// Initialize router, stores and notification
const router = useRouter();
const cartStore = useCartStore();
const { notify } = useNotification();

// Reactive data
const complete = ref(false);
const stripeOptions = ref({
  // see https://stripe.com/docs/stripe.js#element-options for details
});
const reqParams = ref(_.cloneDeep(PaymentRequestDTO));

// Computed properties
const checkoutId = computed(() => cartStore.checkoutId);

// Watch for changes in totalCost
watch(() => props.totalCost, (newVal) => {
  reqParams.value.total.amount = parseInt(newVal);
});

// Methods
async function pay(event) {
  try {
    event.target.disabled = true;
    let checkout = checkoutId.value;
    const { data } = await axios({
      url: ProxyUrl.stripeInstantPay,
      method: 'post',
      data: {
        checkoutId: checkout,
      },
    });

    if (data && data.httpStatus === 200) {
      console.log(data.responseData);
      if (data.responseData) {
        const paymentMethodReq = await Stripe.createPaymentMethod(
          'card',
          {}
        );
        console.log(paymentMethodReq);

        if (paymentMethodReq.paymentMethod.id) {
          const confirmPayment = await Stripe.confirmCardPayment(
            data.responseData.client_secret,
            {
              payment_method: paymentMethodReq.paymentMethod.id,
            }
          );

          console.log(confirmPayment);

          if (confirmPayment) {
            console.log('inside confirmPayment', confirmPayment);
            if (confirmPayment.paymentIntent.status == 'succeeded') {
              console.log('inside confirmPayment status', confirmPayment);
              if (confirmPayment.hasOwnProperty('error')) {
                notify({
                  group: 'toast',
                  type: 'error',
                  text: `${confirmPayment.error.code},  ${confirmPayment.error.message}. Please try again later`,
                });
                event.target.disabled = false;
              }
              const { data } = await axios({
                url: ProxyUrl.stripeInstantPayment,
                method: 'post',
                data: {
                  checkoutId: checkout,
                  paymentToken: confirmPayment.paymentIntent.id,
                },
              });
              if (data && data.httpStatus === 200) {
                return router.push('/orders');
              }
            } else {
              event.target.disabled = false;
              throw new Error('Card details are invalid!');
            }
          }
        }
      }
      console.log('stripe payWithStripe token', checkout);
    }
  } catch (error) {
    console.log('Stripe error', error.message);
    notify({
      group: 'toast',
      type: 'error',
      text: `Payment error: ${error.message}`,
    });
    event.target.disabled = false;
  }
}

function payWithGpay(token) {
  emit('pay', token);
}
</script>

<style lang="scss" scoped>
.pay-with-stripe {
  padding: 5px;
  background-image: linear-gradient(to right, #267871, #136a8a) !important;
}
</style>
