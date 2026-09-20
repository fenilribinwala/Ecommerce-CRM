<template>
  <div id="search-result-view-image">
    <img v-show="!isHover" class="img-cls"
         @mouseover="isHover = true" :src="product?.thumbnailUrls[0]"/>
    <img v-show="isHover" class="img-cls"
         @mouseleave="isHover = false"
         :src="product?.thumbnailUrls.length > 1 ? product?.thumbnailUrls[1] : product?.thumbnailUrls[0]" >
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Define props
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

// Reactive state
const isHover = ref(false);

// Methods
const getPictureStyle = () => {
  let picture = props.product.thumbnailUrls[0];

  if (isHover.value && props.product.thumbnailUrls.length > 1) {
    // eslint-disable-next-line prefer-destructuring
    picture = props.product.thumbnailUrls[1];
  }
  return {
    'background-image': `url(${picture})`,
    'background-size': 'cover',
    'margin-bottom': '10px',
  };
};
</script>

<style lang="scss">
#search-result-view-image {
  height: 100%;
  width: 100%;
}
.img-cls {
  border-top-right-radius: 0.25rem;
  border-top-left-radius: 0.25rem;
  height: auto;
  width: 100%;
}
</style>
