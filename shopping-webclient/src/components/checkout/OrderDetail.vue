<template>
  <div class="order-detail align-left">
      <ul class="orders">
        <li v-for="(item, itemIndex) in orders" v-bind:key="itemIndex">
          <b-row>
            <b-col md="3">
              <div
                class="order-img order-desc"
                v-if="item.product.thumbnailUrls && item.product.thumbnailUrls.length > 0"
                @click="gotoProduct(item.product)"
                :style="orderPicture(item.product.thumbnailUrls[0])"
              ></div>
            </b-col>
            <b-col md="5">
              <div class="order-desc" @click="gotoProduct(item.product)">
                {{item.product.name}}
                <br>
                <div style="font-size: 12px">
                  <span
                    v-for="(custom, cid) of item.customizations"
                    v-bind:key="cid"
                  >{{customDisplay(custom)}} |</span>
                </div>
              </div>
              <span class="delete" @click="deleteSelected(item)">Delete</span>
            </b-col>
            <b-col class="align-right">
              <b-form-select
                size="sm"
                v-model="item.counts"
                :options="countOptions"
                @change.native="updateCartItem(item)"
                class="mb-3"
              />
            </b-col>
            <b-col
              class="align-right"
            >{{item ? item.aggregatedPrice.currency : ''}} {{item ? item.aggregatedPrice.amount : ''}}</b-col>
          </b-row>
        </li>
      </ul>
    <hr>

    <div class="total-line" v-if="orders && orders.length > 0">
      <b-row>
        <!-- <hr> -->
        <b-col cols="8" class="align-right">
          <strong>Total Weight</strong>
        </b-col>
        <b-col
          class="align-right"
        >{{parseFloat(totalWeight.quantity).toFixed(2)}} {{totalWeight.unit}}</b-col>
      </b-row>

      <b-row>
        <!-- <hr> -->
        <b-col cols="8" class="align-right">
          <strong>Sub Total</strong>
        </b-col>
        <b-col class="align-right">{{subtotal.currency}} {{parseFloat(subtotal.amount).toFixed(2)}}</b-col>
      </b-row>

      <b-row v-if="serviceCharge">
        <!-- <hr> -->
        <b-col cols="8" class="align-right">
          <strong>Service Charge</strong>
        </b-col>
        <b-col
          class="align-right"
        >{{serviceCharge.currency}} {{parseFloat(serviceCharge.amount).toFixed(2)}}</b-col>
      </b-row>

      <b-row v-if="shippingPrice">
        <!-- <hr> -->
        <b-col cols="8" class="align-right">
          <strong>Shipping Charge</strong>
        </b-col>
        <b-col
          class="align-right"
        >{{shippingPrice.currency}} {{parseFloat(shippingPrice.amount).toFixed(2)}}</b-col>
      </b-row>

      <b-row v-if="tariffPrice">
        <!-- <hr> -->
        <b-col cols="8" class="align-right">
          <strong>Tariff Charge</strong>
        </b-col>
        <b-col
          class="align-right"
        >{{tariffPrice.currency}} {{parseFloat(tariffPrice.amount).toFixed(2)}}</b-col>
      </b-row>

      <br>
      <b-row v-if="cartTotal">
        <!-- <hr> -->
        <b-col cols="8" class="align-right">
          <strong>Total</strong>
        </b-col>
        <b-col class="align-right">
          <strong>{{cartTotal.currency}} {{parseFloat(cartTotal.amount).toFixed(2)}}</strong>
        </b-col>
      </b-row>
    </div>

    <div v-if="orders && orders.length <= 0" class="order-empty">
      <div class="content">
        <div>You have not ordered yet.
          <br>
          <br>
          <b-button @click="gotoDealPage()" class="primary-button">Go Get Orderin</b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cartStore';
import { useNotification } from '@kyvg/vue3-notification';

// Initialize router, store and notification
const router = useRouter();
const cartStore = useCartStore();
const { notify } = useNotification();

// Reactive data
const countOptions = ref([]);

// Initialize component
onMounted(() => {
  countOptions.value = Array.from(Array(200).keys(), val => val + 1);
});

// Computed properties
const orders = computed(() => cartStore.cart);
const cartTotal = computed(() => cartStore.getTotal);
const subtotal = computed(() => cartStore.getSubTotal);
const serviceCharge = computed(() => cartStore.getServiceCharge);
const shippingPrice = computed(() => cartStore.getShippingPrice);
const tariffPrice = computed(() => cartStore.getTariffPrice);
const totalWeight = computed(() => cartStore.getTotalWeight);

// Methods
function customDisplay(val) {
  return val.indexOf('|') >= 0 ? val.split('|')[0] : val;
}

function orderPicture(img) {
  return {
    'background-image': `url(${img})`,
    width: '100%',
    height: '70px',
    'background-size': 'contain',
    'background-repeat': 'no-repeat',
  };
}

function gotoDealPage() {
  router.push('/');
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
</script>

<style lang="scss" scoped>
@import '../../assets/css/global.scss';

.delete {
  cursor: pointer;
  color: #7e7e7e;
  font-size: 12px;
  text-decoration: underline;
}

.order-empty {
  // height: 500px;
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

.orders {
  list-style-type: none;
  padding: 10px 0px;
  margin-top: 20px;
  width: 100%;
  li {
    padding: 10px 0px;
    margin-bottom: 10px;
    border-bottom: 1px solid #ddd;
    width: 100%;
  }

  span {
    padding: 1rem 0px;
  }

  .order-desc {
    cursor: pointer;
  }
}

.total-line {
  margin-top: 20px;
}
</style>
