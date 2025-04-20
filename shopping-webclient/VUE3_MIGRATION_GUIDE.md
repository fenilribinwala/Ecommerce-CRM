# Vue 3 Migration Guide - Veniqa Shopping Web Client

This document outlines the key changes made during the migration from Vue 2 to Vue 3, including solutions to common issues encountered during the process.

## Major Changes

### 1. Vue Core Changes
- Migrated from Vue 2.7 to Vue 3.4
- Updated Vue Router from v3 to v4
- Replaced Vuex with Pinia for state management
- Migrated from Options API to Composition API
- Updated template syntax (`v-model`, slots, etc.)

### 2. Dependencies
- Added:
  - `pinia` - State management replacing Vuex
  - `pinia-plugin-persistedstate` - For persistent state
  - `@kyvg/vue3-notification` - Notification system compatible with Vue 3
  - `mitt` - Event bus replacement
  - `bootstrap-vue-3` - Bootstrap components for Vue 3
  - `vue-recaptcha-v3` - Recaptcha integration for Vue 3
- Removed:
  - `vuex` - Replaced with Pinia
  - `vue-analytics` - Not compatible with Vue 3
  - `bootstrap-vue` - Replaced with bootstrap-vue-3
  - `vue-recaptcha` - Replaced with vue-recaptcha-v3

## Common Issues & Solutions

### 1. Pinia Store Naming Conflicts

#### Issue
When migrating from Vuex to Pinia, we encountered errors like:
```
'set' on proxy: trap returned falsish for property 'getCart'
```

These errors occurred because in Pinia you cannot have a getter and an action with the same name, which often happened during the Vuex migration since Vuex encouraged using actions like `getCart` and getters with similar names.

#### Solution
- Renamed getters to match the state property names (e.g., `getCart` → `cart`)
- Renamed actions to use more descriptive verbs (e.g., `getCart` → `fetchCart`)
- For state properties with naming conflicts, renamed the state variables:
  ```javascript
  // Before
  state: () => ({
    cart: {},
    orders: [],
  })
  
  // After
  state: () => ({
    cartData: {},
    orderList: [],
  })
  ```

Specific examples of Pinia conflict resolution:
1. In `cartStore.js`:
   - Renamed getter `getCart` to `cart` and state `cart` to `cartData`
   - Renamed action `getCart` to `fetchCart` 
   - Renamed getter `getOrders` to `orders` and state `orders` to `orderList`
   - Renamed getter `getCheckout` to `checkout` and state `checkout` to `checkoutData`
   - Renamed action `addToCart` to `addToTheCart`

2. In `shippingStore.js`:
   - Renamed getter `getAddresses` to `addresses` and state `addresses` to `addressList`
   - Renamed action `getAddresses` to `fetchAddresses`

### 2. SASS/CSS Modernization

#### Issue
Many SASS deprecation warnings related to:
- Deprecated SASS functions like `darken()` and `lightness()`
- Deprecated `@import` syntax in SASS
- Global built-in functions being deprecated in Dart Sass 3.0.0

#### Solution
1. Added the SASS color module import at the top of files:
   ```scss
   @use "sass:color";
   ```

2. Replaced deprecated functions with modern alternatives:
   - `darken($color, $amount)` → `color.scale($color, $lightness: -$amount%)`
   - `lightness($color)` → `color.scale($color, $lightness: 30%)`

3. Files updated:
   - `global.scss`
   - `LeftMenu.vue`
   - `Cart.vue`

## Component Migration Process

The migration process for each component followed these steps:

1. **Update Script Section**:
   - Replace Options API with Composition API
   - Replace `export default {}` with `<script setup>`
   - Convert data properties to `ref()` or `reactive()`
   - Move computed properties to `computed()`
   - Move methods to standalone functions
   - Import and use Pinia stores instead of Vuex

2. **Update Template Section**:
   - Replace `$store` references with direct store calls
   - Update event handling syntax
   - Update slot syntax from `slot="name"` to `#name`

3. **Update Style Section**:
   - Modernize SASS syntax and functions
   - Import required SASS modules

## Migrated Components

The following components have been successfully migrated:

1. Core Components:
   - HeaderMenu.vue
   - LeftMenu.vue
   - Cart.vue

2. Checkout Components:
   - Checkout.vue
   - ShippingDetail.vue
   - ShippingMethod.vue
   - OrderDetail.vue
   - PaymentDetail.vue
   - Stripe.vue

3. Product Components:
   - ProductDescription.vue

4. View Components:
   - SearchView.vue
   - OrderView.vue

5. Registration Components:
   - RegisterComponent.vue
   - UserAccountModal.vue

## Pinia Store Structure

We've implemented the following Pinia stores to replace Vuex:

1. `authStore.js` - Authentication and user management
2. `cartStore.js` - Shopping cart functionality
3. `shippingStore.js` - Shipping addresses and methods
4. `orderStore.js` - Order tracking and history
5. `categoryStore.js` - Product categories
6. `searchStore.js` - Product search functionality
7. `loaderStore.js` - Loading state management

## Testing the Migration

After completing all migration steps:
1. Run `docker-compose up --build shopping-webclient`
2. Check for any remaining errors in the console
3. Test all core functionality:
   - Authentication
   - Product browsing
   - Shopping cart
   - Checkout
   - Order history

## Future Improvements

1. **TypeScript Integration**: Consider adding TypeScript for better type safety and developer experience.
2. **SASS Modernization**: Complete modernization of all SCSS files to use `@use` and `@forward` instead of `@import`.
3. **Full Test Coverage**: Implement comprehensive tests for all components and stores.
4. **Code Splitting**: Implement dynamic imports for better performance.
5. **Composition API Refinement**: Refactor composition hooks into reusable functions.
