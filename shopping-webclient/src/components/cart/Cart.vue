<template>
  <div id="cart" class="align-left">
    <p href="javascript:void(0)" class="closebtn pointer" @click="$emit('close')">×</p>
    <h4 class="align-center">Cart</h4>

    <div v-if="orders && orders.length <= 0" class="order-empty">
      <div class="content">
        <div>
          {{isSessionActive ? 'Your cart is empty.' : 'You need to login first to add to cart'}}
          <br>
          <b-btn
            class="primary-button"
            v-if="!isSessionActive"
            @click="router.push('/login')"
          >Login</b-btn>
        </div>
      </div>
    </div>
    <ul class="orders">
      <li v-for="(item, itemIndex) in orders" v-bind:key="itemIndex">
        <b-row>
          <b-col cols="3" style="padding-right: 0">
            <img
              :src="item.product.thumbnailUrls[0]"
              alt="No Image"
              class="cart-img order-desc"
              v-if="item.product.thumbnailUrls && item.product.thumbnailUrls.length > 0"
              @click="gotoProduct(item.product)"
            >
          </b-col>
          <b-col cols="9">
            <div class="order-desc" @click="gotoProduct(item.product)">
              <strong>
                {{item.product.name}}
                <br>
                {{item ? item.aggregatedPrice.currency : ''}} {{item ? item.aggregatedPrice.amount : ''}}
                <br>
              </strong>
              <div style="font-size: 12px; margin-top: 5px; ">
                <span
                  v-for="(custom, cid) of item.customizations"
                  v-bind:key="cid"
                >{{customDisplay(custom)}} |</span>
              </div>
            </div>
            <div class="delete" @click="deleteSelected(item)" style="margin: 5px 0px">Delete</div>
            <div>
              <b-form-select
                size="sm"
                v-model="item.counts"
                :options="countOptions"
                @change.native="updateCartItem(item)"
                class="mb-3"
                style="max-width: 100px"
              />
            </div>
          </b-col>
        </b-row>
      </li>
    </ul>

    <div class="total-line align-center bottom-action" v-if="orders && orders.length > 0">
      <b-row>
        <!-- <hr> -->
        <b-col cols="8" class="align-left">
          <strong>Sub Total</strong>
        </b-col>
        <b-col class="align-right">
          <strong>{{subtotal.currency}} {{parseFloat(subtotal.amount).toFixed(2)}}</strong>
        </b-col>
      </b-row>
      <br>
      <p class="info align-center">Final cost will be calculated during checkout.</p>
      <b-btn class="addToCart" @click="gotoCheckout()">Checkout</b-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useNotification } from '@kyvg/vue3-notification';

// Define props and emits
const props = defineProps({
  sidebarWidth: {
    type: Number,
    required: false,
    default: 350,
  },
});

const emit = defineEmits(['close']);

// Initialize router, stores and notification
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const { notify } = useNotification();

// Reactive data
const countOptions = ref([]);

// Init data on component creation
onMounted(() => {
  countOptions.value = Array.from(Array(200).keys(), val => val + 1);
});

// Methods
function customDisplay(val) {
  return val.indexOf('|') >= 0 ? val.split('|')[0] : val;
}

function gotoCheckout() {
  if (orders.value && orders.value.length > 0) {
    router.push('/checkout');
    emit('close');
  }
}

async function gotoProduct(pid) {
  if (!pid) return;
  router.push(`/products/${pid._id}`);
}

async function updateCartItem(item) {
  if (item.counts > 0) {
    try {
      await cartStore.updateOrders([item]);
      notify({
        group: 'all',
        type: 'success',
        text: 'The cart has been successfully updated.'
      });
    } catch (err) {
      console.log('Error', err);
      notify({
        group: 'all',
        type: 'error',
        text: 'Cart could not be updated at the moment. Please try again later.'
      });
    }
  }
}

async function deleteSelected(item) {
  try {
    await cartStore.deleteOrders([item]);
  } catch (err) {
    console.log(err);
  }
}

// Computed properties
const orders = computed(() => cartStore.cart);
const subtotal = computed(() => cartStore.getSubTotal);
const isSessionActive = computed(() => authStore.isSessionActive);
</script>

<style lang="scss" scoped>
#cart {
  padding: 0rem 0.5rem;
  h4 {
    margin-bottom: 2rem;
  }

  .total-line {
    padding: 0.5rem 1rem;
  }

  .bottom-action {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 25vh;
    padding-top: 2rem;
    padding-bottom: 2rem;
    background-color: darken(white, 5%);
  }

  .order-empty {
    height: 500px;
    line-height: 500px;
    color: #bdbdbd;
    font-size: 1.5em;
    text-align: center;

    .content {
      display: inline-block;
      vertical-align: middle;
      line-height: normal;
    }
  }
}
.orders {
  list-style-type: none;
  padding: 0px;
  width: 100%;
  max-height: 60vh;
  overflow: auto;

.order-desc {
  cursor: pointer;
}

  .checkbox-item {
    padding-top: 20px;
  }

  li {
    padding: 10px;
    margin-bottom: 10px;
    width: 100%;
}

  span {
    padding: 1rem 0px;
  }

  .cart-img {
    width: 100%;
    height: auto;
  }
}
</style>
