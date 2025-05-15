<template>
  <div class="align-left description" style="padding: 10px">
    <h3>{{product.name}}</h3>
    <h6>By {{product.store}}</h6>

    <h4>{{product.price.currency}} {{product.price.amount}}</h4>
    <div class="custom-attributes">
      <div v-for="(attrib, aid) in customizations" v-bind:key="aid">
        <div v-if="attrib.type === 'Array'">
          <BFormGroup
            :label-cols="2"
            :label="attrib.name"
            :label-for="attrib.name+aid"
            label-size=""
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
                    v-b-tooltip.hover
                    :title="color.name"
                    @click="colorClicked(attrib.key, color)"
                    v-bind:class="{'selected': color.hexValue === selectedCustomizations[attrib.key].hexValue && color.name === selectedCustomizations[attrib.key].name}"
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
    <div v-html="product.details_html"></div>

    <BPopover
      ref="popoverRef"
      v-model="showLoginPopover"
      target="add-to-cart-sync"
      placement="top-end"
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
import { ref, computed, onMounted, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cartStore'; // Assuming Pinia store
import { useAuthStore } from '@/stores/authStore'; // Assuming Pinia store
import _ from 'lodash';

// Props
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

// Router and stores
const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

// Reactive state
const product = ref(null);
const selectedCustomizations = ref({});
const showLoginPopover = ref(false);
const popoverRef = ref(null);

// Computed properties
const customizations = computed(() => {
  return product.value?.customizationOptions?.customizations || [];
});

const isSessionActive = computed(() => {
  return authStore.isSessionActive;
});

// Methods
const addToCart = async () => {
  if (!isSessionActive.value) {
    if (popoverRef.value) {
      // For Vue 3, component methods are accessed differently
      popoverRef.value.show = true;
    }
    showLoginPopover.value = true;
    return;
  }

  // Disable the popover
  if (popoverRef.value) {
    popoverRef.value.show = false;
  }

  product.value.customValues = {};
  Object.keys(selectedCustomizations.value).forEach((key) => {
    if (typeof selectedCustomizations.value[key] === 'string') {
      product.value.customValues[key] = selectedCustomizations.value[key];
    } else {
      product.value.customValues[key] = `${
        selectedCustomizations.value[key].name
      }|${selectedCustomizations.value[key].hexValue}`;
    }
  });

  // Access Pinia store action directly
  const val = await cartStore.addToTheCart([product.value]);

  if (val) {
    // Notification system - using whatever notification system you have in Vue 3
    // This assumes you have a similar notification system
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
      text: `${product.value.name} couldn't be added for some reason. Please try again later`,
    });
  }
};

const colorClicked = (key, colorObj) => {
  selectedCustomizations.value[key] = colorObj;
};

const increaseCount = () => {
  product.value.counts += 1;
};

const decreaseCount = () => {
  product.value.counts -= 1;
  if (product.value.counts < 0) {
    product.value.counts = 0;
  }
};

// Initialize the notification system - update based on your notification library
const notify = (options) => {
  // This is a placeholder for whatever notification system you're using
  // You might use something like:
  // useToast().success(options.text)
  // or
  // app.config.globalProperties.$notify(options)
  console.log('Notification:', options);
};

// Initialize component
onBeforeMount(() => {
  product.value = props.data;
})

onMounted(() => {
  product.value = props.data;
  selectedCustomizations.value = _.cloneDeep(product.value.customValues);
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
