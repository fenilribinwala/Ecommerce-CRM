<template>
  <div id="search-result-view-image">
    <img v-if="product && product.thumbnailUrls && product.thumbnailUrls.length > 0" 
      v-show="!isHover" 
      class="img-cls"
      @mouseover="isHover = true" 
      :src="product.thumbnailUrls[0]"/>
    <img v-if="product && product.thumbnailUrls && product.thumbnailUrls.length > 0" 
      v-show="isHover" 
      class="img-cls"
      @mouseleave="isHover = false"
      :src="product.thumbnailUrls.length > 1 ? product.thumbnailUrls[1] : product.thumbnailUrls[0]" >
    <div v-else class="no-image">
      <font-awesome-icon icon="shopping-bag" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Define props
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

// Reactive data
const isHover = ref(false);

// Computed properties
const hasThumbnails = computed(() => {
  return props.product && 
         props.product.thumbnailUrls && 
         props.product.thumbnailUrls.length > 0;
});

// Methods
function getPictureStyle() {
  if (!hasThumbnails.value) {
    return {
      backgroundImage: 'url(/static/no-image.jpg)',
      backgroundSize: 'cover',
      marginBottom: '10px',
    };
  }
  
  let picture = props.product.thumbnailUrls[0];

  if (isHover.value && props.product.thumbnailUrls.length > 1) {
    picture = props.product.thumbnailUrls[1];
  }
  
  return {
    backgroundImage: `url(${picture})`,
    backgroundSize: 'cover',
    marginBottom: '10px',
  };
}
</script>

<style lang="scss">
#search-result-view-image {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.img-cls {
  border-top-right-radius: 0.25rem;
  border-top-left-radius: 0.25rem;
  height: auto;
  width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.no-image {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #bdbdbd;
  font-size: 4em;
}
</style>
