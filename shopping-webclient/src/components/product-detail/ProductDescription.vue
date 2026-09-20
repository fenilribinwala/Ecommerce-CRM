<template>
  <div class="align-left description" style="padding: 10px">
    <h3>{{ product?.name }}</h3>
    <h6>By {{ product?.store }}</h6>
    <h4>{{ product?.price?.currency }} {{ product?.price?.amount }}</h4>
    <div class="custom-attributes">
      <div v-for="(attrib, aid) in customizations" v-bind:key="aid">
        <div v-if="attrib.type === 'Array'">
          <BFormGroup
            :label-cols="2"
            :label="attrib.name"
            :label-for="attrib.name+aid"
            class="mb-3"
          >
            <BFormSelect
              v-model="selectedCustomizations[attrib.key]"
              :options="attrib.values"
              :name="attrib.name+aid"
              :id="attrib.name+aid"
              size="sm"
              style="max-width: 150px"
            />
            <BFormInvalidFeedback id="countryFeedback">
              The {{attrib.name}} cannot be empty.
            </BFormInvalidFeedback>
          </BFormGroup>
        </div>

        <!-- Show Color selection for colors -->
        <div v-if="attrib.type==='Colors'">
          <BRow>
            <BCol md="2">{{attrib.name}}</BCol>
            <BCol md="9">
              <ul class="color-select">
                <li v-for="(color, cid) in attrib.values" v-bind:key="cid">
                  <div
                    v-bind:style="{'background-color': color.hexValue}"
                    :title="color.name"
                    @click="colorClicked(attrib.key, color)"
                    v-bind:class="{
                      'selected': selectedCustomizations[attrib.key] &&
                                 color.hexValue === selectedCustomizations[attrib.key].hexValue &&
                                 color.name === selectedCustomizations[attrib.key].name
                    }"
                  ></div>
                </li>
              </ul>
            </BCol>
          </BRow>
        </div>
      </div>
    </div>
    <p style="margin-top: 20px">
      <BButton id="add-to-cart-sync" class="add-to-cart" @click="addToCart">
        <font-awesome-icon icon="shopping-bag"/>&nbsp;
        Add to Cart
      </BButton>
    </p>
    <hr>
    <div v-if="product?.details_html" v-html="product.details_html"></div>

    <BPopover
      ref="popoverRef"
      :show.sync="showLoginPopover"
      target="add-to-cart-sync"
      placement="top"
      title="Login Required"
      triggers="manual"
    >
      <template #title>Login Required</template>
      <p class="info">You need to login to add products to the cart.</p>
      <div class="align-center">
        <BButton
          size="sm"
          class="primary-button"
          style="margin-top: 0.2rem;"
          @click="router.push('/login')"
        >Login</BButton>
      </div>
    </BPopover>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useNotification } from '@kyvg/vue3-notification';
import _ from 'lodash';
import {
  BButton,
  BFormGroup,
  BFormSelect,
  BFormInvalidFeedback,
  BRow,
  BCol,
  BPopover
} from 'bootstrap-vue-3';

// Props
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

// Initialize router, stores and notifications
const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const {notify} = useNotification();
const popoverRef = ref(null);

// Reactive state
const product = ref(null);
const selectedCustomizations = ref({});
const showLoginPopover = ref(false);

// Computed properties
const customizations = computed(() => {
  if (!product.value || !product.value.customizationOptions) return [];
  return product.value.customizationOptions.customizations || [];
});

const isSessionActive = computed(() => {
  return authStore.isSessionActive;
});

// Methods
const colorClicked = (key, colorObj) => {
  if (!selectedCustomizations.value) {
    selectedCustomizations.value = {};
  }
  selectedCustomizations.value[key] = colorObj;
};

const addToCart = async () => {
  if (!isSessionActive.value) {
    showLoginPopover.value = true;
    return;
  }

  // Hide popover
  showLoginPopover.value = false;

  if (!product.value) return;

  product.value.customValues = {};
  Object.keys(selectedCustomizations.value || {}).forEach((key) => {
    const customization = selectedCustomizations.value[key];
    if (!customization) return;

    if (typeof customization === 'string') {
      product.value.customValues[key] = customization;
    } else {
      product.value.customValues[key] = `${customization.name}|${customization.hexValue}`;
    }
  });

  try {
    const val = await cartStore.addToTheCart([product.value]);

    if (val) {
      notify({
        group: 'toast',
        type: 'success',
        text: `Added ${product.value.name} to the cart`,
        title: 'Added to Cart',
      });
    } else {
      notify({
        group: 'toast',
        type: 'warn',
        text: `${product.value.name} couldn't be added for some reason. Please try again later`,
      });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    notify({
      group: 'toast',
      type: 'error',
      text: 'An error occurred while adding to cart',
    });
  }
};

const increaseCount = () => {
  if (product.value) {
    product.value.counts = (product.value.counts || 0) + 1;
  }
};

const decreaseCount = () => {
  if (product.value) {
    product.value.counts = (product.value.counts || 0) - 1;
    if (product.value.counts < 0) {
      product.value.counts = 0;
    }
  }
};

// Initialize component
onMounted(() => {
  try {
    if (props.data) {
      product.value = props.data;

      // Initialize customizations safely
      if (product.value.customValues) {
        selectedCustomizations.value = _.cloneDeep(product.value.customValues);
      } else {
        selectedCustomizations.value = {};
      }
    }
  } catch (error) {
    console.error('Error initializing ProductDescription:', error);
  }
});
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
