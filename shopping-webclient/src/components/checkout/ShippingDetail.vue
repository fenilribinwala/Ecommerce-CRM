<template>
  <div class="align-left shipping">
    <div v-if="allAddresses.length > 0" class="addresses">
      <ul class="shipping-list">
        <li
          v-for="(add, aIndex) in allAddresses"
          v-bind:key="aIndex"
          v-bind:class="{'selected' : addressEqual(add)}"
          @click="chooseAddress(add)"
        >
          <b-row>
            <b-col>
              {{add.firstName}} {{add.lastName}}
              <br>
              {{add.addressLine1}} {{add.addressLine2}}
              <br>
              {{add.state}} {{add.country}} {{add.zipCode}}
            </b-col>
            <b-col>
              <div class="align-right">
                <a @click="editClicked(add)">Edit</a> &nbsp;&nbsp;&nbsp;
                <a @click="deleteClicked(add)">Delete</a>
              </div>
            </b-col>
          </b-row>
        </li>
      </ul>
    </div>
    <div v-else-if="allAddresses.length <= 0 && !isShowAddAddress">
      <div class="empty-info">
        <p>Nothing to display</p>
      </div>
    </div>

    <!-- Show list of existing addresses here with choice to choose -->
    <a @click="showAddAddress()" v-if="isSessionActive">
      <font-awesome-icon icon="plus"/>&nbsp;&nbsp; Add a new address
    </a>


    <!-- Input form to add new address for the user -->
    <transition
      name="shipping-form-anim"
      enter-active-class="animated slideInLeft faster"
      leave-active-class="animated slideOutLeft faster"
    >
      <div v-if="isShowAddAddress" class="shipping-form">
        <hr>
        <b-row>
          <b-col md="6">
            <b-form-group>
              <label for="firstName">First Name:</label>
              <b-form-input
                id="firstName"
                type="text"
                name="firstName"
                size="sm"
                :state="firstNameState"
                v-model="shippingDeet.firstName"
                placeholder="Enter your first name"
                aria-describedby="firstNameFeedback"
              ></b-form-input>
              <b-form-invalid-feedback id>
                <!-- This will only be shown if the preceeding input has an invalid state -->
                First name cannot be empty
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group>
              <label for="lastName">Last Name:</label>
              <b-form-input
                id="lastName"
                size="sm"
                type="text"
                name="lastName"
                v-model="shippingDeet.lastName"
                placeholder="Enter your last name"
              ></b-form-input>
            </b-form-group>
          </b-col>
        </b-row>

        <b-form-group>
          <label for="address1">Address 1:</label>
          <b-form-input
            id="address1"
            type="text"
            size="sm"
            name="text"
            :state="address1State"
            v-model="shippingDeet.addressLine1"
            placeholder="Enter your address"
            aria-describedby="address1State"
          ></b-form-input>
          <b-form-invalid-feedback id="address1State">
            <!-- This will only be shown if the preceeding input has an invalid state -->
            Please enter your address before continuing
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group>
          <label for="address2">Address 2:</label>
          <b-form-input
            id="address2"
            type="text"
            name="address2"
            size="sm"
            v-model="shippingDeet.addressLine2"
            placeholder="Enter your address 2"
          ></b-form-input>
        </b-form-group>

        <b-row>
          <b-col>
            <b-form-group>
              <label for="city">City:</label>
              <b-form-input
                id="city"
                type="text"
                name="text"
                :state="cityState"
                size="sm"
                v-model="shippingDeet.city"
                placeholder="Enter your city"
                aria-describedby="cityStatee"
              ></b-form-input>
              <b-form-invalid-feedback id="cityStatee">
                <!-- This will only be shown if the preceeding input has an invalid state -->
                Please enter your city before continuing
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group>
              <label for="phone">Phone:</label>
              <b-form-input
                id="phone"
                type="number"
                name="text"
                :state="phoneState"
                size="sm"
                v-model="shippingDeet.mobilePhone"
                placeholder="Enter your phone number"
                aria-describedby="phoneStatee"
              ></b-form-input>
              <b-form-invalid-feedback id="phoneStatee">
                <!-- This will only be shown if the preceeding input has an invalid state -->
                Please enter your city before continuing
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col>
            <b-form-group>
              <label for="state">State:</label>
              <b-form-input
                id="state"
                type="text"
                name="state"
                size="sm"
                :state="stateState"
                v-model="shippingDeet.state"
                placeholder="Your State"
                aria-describedby="stateFeedback"
              ></b-form-input>
              <b-form-invalid-feedback id="stateFeedback">
                <!-- This will only be shown if the preceeding input has an invalid state -->
                Please enter your state.
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group>
              <label for="zip">Zip Code:</label>
              <b-form-input
                id="zip"
                type="number"
                name="zip"
                size="sm"
                :state="zipState"
                v-model="shippingDeet.zipCode"
                placeholder="Enter your Zip Code."
                aria-describedby="zipFeedback"
              ></b-form-input>
              <b-form-invalid-feedback id="zipFeedback">
                <!-- This will only be shown if the preceeding input has an invalid state -->
                Your Zip Code cannot be empty.
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group>
              <label for="country">Country</label>
              <b-form-select
                v-model="shippingDeet.country"
                :options="countryOptions"
                size="sm"
                :state="countryState"
              ></b-form-select>
              <b-form-invalid-feedback id="stateFeedback">
                <!-- This will only be shown if the preceeding input has an invalid state -->
                Please select a country
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>

        <div class="action-buttons">
          <b-button
            size="sm"
            class="cancel-btn"
            variant="secondary"
            @click="cancelForm()"
          >Cancel</b-button>
          <b-button size="sm" @click="saveAddress()" variant="primary">Save</b-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useShippingStore } from '@/stores/shippingStore';
import ShippingDTO from '@/dto/ShippingAddress.json';
import _ from 'lodash';

// Define emits
const emit = defineEmits(['selected']);

// Initialize router and stores
const router = useRouter();
const authStore = useAuthStore();
const shippingStore = useShippingStore();

// Reactive data
const isShowAddAddress = ref(false);
const shippingDeet = reactive(_.cloneDeep(ShippingDTO));
const description = ref('');
const isUpdate = ref(false);
const countryOptions = ref(['Bangladesh', 'Nepal']);

// Computed properties
const allAddresses = computed(() => shippingStore.allAddresses);
const selectedAddress = computed(() => shippingStore.getSelectedAddress);
const isSessionActive = computed(() => authStore.isSessionActive);

// Initialize data on component creation
onMounted(async () => {
  await shippingStore.addressAction({
    address: null,
    action: 'get',
  });

  if (allAddresses.value.length > 0 && !selectedAddress.value) {
    emit('selected', allAddresses.value[0]);
  }
});

// Form validation computed properties
const cityState = computed(() => {
  if (shippingDeet.city == null) return null;
  return shippingDeet.city.length >= 1;
});

const phoneState = computed(() => {
  if (shippingDeet.mobilePhone == null) return null;
  return shippingDeet.mobilePhone.length >= 1;
});

const firstNameState = computed(() => {
  if (shippingDeet.firstName == null) return null;
  return shippingDeet.firstName.length >= 1;
});

const address1State = computed(() => {
  if (shippingDeet.addressLine1 == null) return null;
  return shippingDeet.addressLine1.length > 0;
});

const stateState = computed(() => {
  if (shippingDeet.state == null) return null;
  return shippingDeet.state.length > 0;
});

const zipState = computed(() => {
  if (shippingDeet.zipCode == null) return null;
  return shippingDeet.zipCode.length > 0;
});

const countryState = computed(() => {
  if (shippingDeet.country == null) return null;
  return shippingDeet.country.length > 0;
});

// Methods
function showAddAddress() {
  isShowAddAddress.value = true;
}

function hideAddAddress() {
  isShowAddAddress.value = false;
}

function cancelForm() {
  resetFields();
  isShowAddAddress.value = false;
  isUpdate.value = false;
}

function resetFields() {
  // Reset all fields in the shippingDeet object
  Object.keys(shippingDeet).forEach(key => {
    shippingDeet[key] = null;
  });
}

function addressEqual(givenAdd) {
  return _.isEqual(givenAdd, selectedAddress.value);
}

function chooseAddress(add) {
  emit('selected', add);
}

function editClicked(address) {
  isUpdate.value = true;
  Object.assign(shippingDeet, _.cloneDeep(address));
  isShowAddAddress.value = true;
}

function deleteClicked(address) {
  const cloned = _.cloneDeep(address);
  shippingStore.addressAction({
    address: cloned,
    action: 'delete',
  });
}

async function saveAddress() {
  // Set empty strings for null values
  Object.keys(shippingDeet).forEach(key => {
    if (shippingDeet[key] == null) {
      shippingDeet[key] = '';
    }
  });
  
  if (
    firstNameState.value &&
    address1State.value &&
    stateState.value &&
    zipState.value &&
    countryState.value &&
    cityState.value
  ) {
    const cloned = _.cloneDeep(shippingDeet);
    const res = await shippingStore.addressAction({
      address: cloned,
      action: isUpdate.value ? 'put' : 'post',
    });

    if (res) {
      isUpdate.value = false;
      resetFields();
      isShowAddAddress.value = false;
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/css/global.scss';
.shipping-form {
  padding: 10px 0px;
  // background: white;

  .cancel-btn {
    margin-right: 10px;
    margin-top: 2em;
  }

  .action-buttons {
    padding: 10px 0px;
  }
}

.shipping {
  margin-top: 30px;
}

.shipping-list {
  list-style-type: none;
  padding: 0px;
  margin-bottom: 20px;
  li {
    padding: 10px;
    padding-left: 1.2em;
    margin-bottom: 10px;

    &.selected {
      // background: $gradient-color;
      background: $pitch-black;
      color: white;
    }

    &:hover {
      cursor: pointer;
    }
  }
}
</style>
