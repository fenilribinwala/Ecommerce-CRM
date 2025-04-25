 /* eslint-disable */

<template>
  <div class="align-left description" style="padding: 10px">
    <h3>{{product.name}}</h3>
    <h6>By {{product.store}}</h6>

    <h4>{{product.price.currency}} {{product.price.amount}}</h4>
    <div class="custom-attributes">
      <div v-for="(attrib, aid) in customizations" v-bind:key="aid">
        <div v-if="attrib.type === 'Array'">
          <b-form-group
            :label-cols="2"
            :label="attrib.name"
            :label-for="attrib.name+aid"
            horizontal
          >
            <b-form-select
              v-model="selectedCustomizations[attrib.key]"
              :options="attrib.values"
              :name="attrib.name+aid"
              :id="attrib.name+aid"
              size="sm"
              style="max-width: 150px"
            />
            <b-form-invalid-feedback id="countryFeedback">
              <!-- This will only be shown if the preceeding input has an invalid state -->
              The {{attrib.name}} cannot be empty.
            </b-form-invalid-feedback>
          </b-form-group>
        </div>

        <!-- Show Color selection for colors -->
        <div v-if="attrib.type==='Colors'">
          <b-row>
            <b-col md="2">{{attrib.name}}</b-col>
            <b-col md="9">
              <ul class="color-select">
                <li v-for="(color, cid) in attrib.values" v-bind:key="cid">
                  <div
                    v-bind:style="{'background-color': color.hexValue}"
                    v-b-tooltip.hover
                    :title="color.name"
                    @click="colorClicked(attrib.key, color)"
                    v-bind:class="{'selected': color.hexValue === selectedCustomizations[attrib.key].hexValue && color.name === selectedCustomizations[attrib.key].name}"
                  ></div>
                </li>
              </ul>
            </b-col>
          </b-row>
        </div>
      </div>
    </div>
    <p style="margin-top: 20px">
      <b-button id="add-to-cart-sync" class="add-to-cart" @click="addToCart()">
        <font-awesome-icon icon="shopping-bag"/>&nbsp;
        Add to Cart
      </b-button>
    </p>
    <hr>
    <div v-html="product.details_html"></div>

    <b-popover
      ref="popover"
      :show.sync="showLoginPopover"
      target="add-to-cart-sync"
      placement="topright"
    >
      <p class="info">You need to login to add products to the cart.</p>
      <div class="align-center">
        <b-btn
          size="sm"
          class="primary-button"
          style="margin-top: 0.2rem;"
          @click="router.push('/login')"
        >Login</b-btn>
      </div>
    </b-popover>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useNotification } from '@kyvg/vue3-notification';
import _ from 'lodash';

// Define props
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

// Initialize router, stores and notification
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const { notify } = useNotification();

// Reactive data
const product = ref(null);
const selectedCustomizations = reactive({});
const showLoginPopover = ref(false);
const popover = ref(null);

// Computed properties
const isSessionActive = computed(() => authStore.isSessionActive);
const customizations = computed(() => product.value.customizationOptions.customizations);

// Initialize component
onMounted(() => {
  product.value = props.data;
  Object.assign(selectedCustomizations, _.cloneDeep(product.value.customValues));
});

// Methods
async function addToCart() {
  if (!isSessionActive.value) {
    popover.value.$emit('enable');
    showLoginPopover.value = true;
    return;
  }

  // Disable the popover in case the add to cart is possible
  popover.value.$emit('disable');

  product.value.customValues = {};
  Object.keys(selectedCustomizations).forEach((key) => {
    if (typeof selectedCustomizations[key] === 'string') {
      product.value.customValues[key] = selectedCustomizations[key];
    } else {
      product.value.customValues[key] = `${
        selectedCustomizations[key].name
      }|${selectedCustomizations[key].hexValue}`;
    }
  });

  const val = await cartStore.addToTheCart([product.value]);

  if (val) {
    notify({
      group: 'toast',
      type: 'success',
      text: `Added ${product.value.name} to the cart`,
      title: 'Added to Cart<font-awesome-icon icon="cart"/>',
    });
  } else {
    notify({
      group: 'toast',
      type: 'warn',
      text: `${
        product.value.name
      } couldn't be added for some reason. Please try again later`,
    });
  }
}

function colorClicked(key, colorObj) {
  selectedCustomizations[key] = colorObj;
}

function increaseCount() {
  product.value.counts += 1;
}

function decreaseCount() {
  product.value.counts -= 1;
  if (product.value.counts < 0) {
    product.value.counts = 0;
  }
}
</script>

<style lang="scss" scoped>
.description {
  p {
    padding: 5px 0px;
    margin: 0px;

    span {
      margin-right: 10px;
    }

    .icon {
      font-size: 1.5em;

      &:hover {
        cursor: pointer;
      }
    }
  }

  .color-select {
    padding-left: 0px;
    li,
    div {
      display: inline-block;
      height: 30px;
      width: 30px;
      margin-right: 10px;

      &:hover {
        cursor: pointer;
      }

      .selected {
        border: 2px solid black;
      }
    }
  }

  .custom-attributes {
    margin-top: 1rem;
  }
  .section-title {
    font-size: 1.2em;
  }

  .add-to-cart {
    background-color: white; /*this for transparent button*/
    border: 2px solid black; /* this is for button border*/
    border-radius: 0px;
    color: black;
    padding: 10px 40px;
  }
  .add-to-cart:hover {
    background-color: black; /*this for transparent button*/
    border: 2px solid black; /* this is for button border*/
    border-radius: 0px;
    color: white;
  }
  h3 {
    color: black;
  }
}
</style>
