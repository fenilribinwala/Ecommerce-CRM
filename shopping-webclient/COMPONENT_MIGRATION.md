# Vue 3 Component Migration Guide

This document provides a step-by-step guide for converting remaining Vue 2 components to Vue 3 with Pinia.

## Component Migration Checklist

For each component, follow these steps:

1. **Replace Vuex imports with Pinia store imports**
   ```javascript
   // OLD - Vue 2 with Vuex
   import { mapGetters } from 'vuex';
   
   // NEW - Vue 3 with Pinia
   import { useAuthStore } from '@/stores/authStore';
   import { useCartStore } from '@/stores/cartStore';
   ```

2. **Convert Options API to Composition API**
   ```javascript
   // OLD - Options API
   export default {
     data() { return { count: 0 } },
     methods: { increment() { this.count++ } },
     computed: { doubled() { return this.count * 2 } }
   }
   
   // NEW - Composition API with <script setup>
   import { ref, computed } from 'vue';
   
   const count = ref(0);
   const doubled = computed(() => count.value * 2);
   function increment() { count.value++ }
   ```

3. **Replace lifecycle hooks**
   ```javascript
   // OLD
   created() { ... }
   mounted() { ... }
   
   // NEW
   import { onMounted } from 'vue';
   
   onMounted(() => { ... });
   ```

4. **Update store access**
   ```javascript
   // OLD
   this.$store.getters['authStore/isAuthenticated']
   await this.$store.dispatch('cartStore/addToCart', item);
   
   // NEW
   const authStore = useAuthStore();
   const cartStore = useCartStore();
   
   authStore.isAuthenticated
   await cartStore.addToCart(item);
   ```

5. **Update router access**
   ```javascript
   // OLD
   this.$router.push('/checkout');
   
   // NEW
   import { useRouter } from 'vue-router';
   
   const router = useRouter();
   router.push('/checkout');
   ```

6. **Update emit syntax**
   ```javascript
   // OLD
   this.$emit('close');
   
   // NEW
   const emit = defineEmits(['close']);
   emit('close');
   ```

7. **Replace filters with methods**
   ```javascript
   // OLD
   filters: {
     formatDate(value) { return format(value); }
   }
   {{ date | formatDate }}
   
   // NEW
   function formatDate(value) { return format(value); }
   {{ formatDate(date) }}
   ```

## Components Already Migrated

1. ✅ **HeaderMenu.vue**
   - Converted to Pinia stores
   - Updated to Composition API
   - Fixed event handling

2. ✅ **Cart.vue**
   - Converted to Pinia stores
   - Updated to Composition API
   - Fixed filter with method

## Components To Migrate Next

The following components still need migration (sorted by priority):

1. **LeftMenu.vue** - Used by HeaderMenu.vue
2. **SearchView.vue** - Main search functionality
3. **OrderView.vue** - Order display functionality
4. **Checkout.vue** - Critical path for purchases
5. **ShippingDetail.vue** - Required for checkout
6. **PaymentDetail.vue** - Required for checkout
7. **ProductDescription.vue** - Product display functionality

## Common Issues to Watch For

1. **Refs vs Reactive values**
   - Remember to use `.value` when accessing ref values
   - Reactive objects don't need `.value`

2. **Pinia store initialization timing**
   - Ensure stores are initialized before being used
   - Check for undefined values

3. **Component props**
   - Use `defineProps()` instead of `props` option
   - No longer available via `this.propName`

4. **Event handling**
   - Use `defineEmits(['event-name'])` instead of `this.$emit`
   - Use `emit('event-name')` to emit events

5. **Template refs**
   - Define with `const elementRef = ref(null)`
   - Access with `elementRef.value`

## Helper Patterns

### Store module pattern
```javascript
// stores/someStore.js
import { defineStore } from 'pinia';

export const useSomeStore = defineStore('some', {
  state: () => ({
    items: []
  }),
  getters: {
    getItems: (state) => state.items
  },
  actions: {
    async fetchItems() {
      // Implementation
    }
  }
});

// In component
import { useSomeStore } from '@/stores/someStore';
const someStore = useSomeStore();
const items = computed(() => someStore.getItems);
```

### API call pattern
```javascript
async function fetchData() {
  try {
    // Show loading state
    isLoading.value = true;
    
    // Make API call
    const result = await apiCall();
    
    // Process result
    data.value = result;
    
    // Show success notification
    notify({
      group: 'all',
      type: 'success',
      text: 'Data loaded successfully'
    });
  } catch (error) {
    // Handle error
    console.error(error);
    notify({
      group: 'all',
      type: 'error',
      text: 'Failed to load data'
    });
  } finally {
    // Hide loading state
    isLoading.value = false;
  }
}
```
