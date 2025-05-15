<template>
  <div class="product-detail">
    <div class="space"></div>
    <div v-if="product != null">
      <p class="align-left">Shop &nbsp; / &nbsp; {{ product.name }}</p>
      <hr>
      <BRow>
        <BCol md="7" class="beginner">
          <div>
            <product-image-gallery
              :base-images="productImages"
              :base-zoomer-options="zoomerOptions"
            />
          </div>
        </BCol>
        <BCol md="5">
          <ProductDescription :data="product"/>
        </BCol>
      </BRow>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useNotification} from '@kyvg/vue3-notification'; // Assuming Vue 3 notification plugin
import ProxyUrls from '@/constants/ProxyUrls';
import ProductImageGallery from '@/components/product-detail/ProductImageGallery.vue';
import ProductDescription from '@/components/product-detail/ProductDescription.vue';
import axios from 'axios';

// Component props
const props = defineProps({
  productId: {
    type: String,
    required: true,
  },
});

// Reactive state
const product = ref(null);
const zoomerOptions = ref({
  zoomFactor: 1.5,
  pane: 'container',
  hoverDelay: 300,
  namespace: 'zoomer',
  move_by_click: false,
  scroll_items: 4,
  choosed_thumb_border_color: '#2c3e50',
});

const productImages = ref({
  normal_size: [],
});

// Notification system
const {notify} = useNotification();

// Fetch product details
const fetchProductDetails = async () => {
  if (props.productId) {
    try {
      const {data} = await axios({
        url: ProxyUrls.getProductDefinitionUrl + props.productId,
        method: 'get', // Note: changed 'type' to 'method' which is more standard
      });

      if (data) {
        data.responseData.counts = 0;
        product.value = data.responseData;

        // Process product images
        product.value.detailedImageUrls.forEach((picture, pid) => {
          productImages.value.normal_size.push({
            id: pid,
            url: picture,
          });
        });

        // Process custom values
        product.value.customValues = {};
        for (let i = 0; i < product.value.customizationOptions.customizations.length; i += 1) {
          const attrib = product.value.customizationOptions.customizations[i];
          product.value.customValues[attrib.key] =
            attrib.values.length > 0 ? attrib.values[0] : '';
        }
      }
    } catch (err) {
      console.log(err);
      notify({
        group: 'all',
        type: 'error',
        text: 'Product detail could not be retrieved at the moment. Please try again later.',
      });
    }
  }
};

// Lifecycle hook - replaces created()
onMounted(fetchProductDetails);
</script>

<style lang="scss" scoped>
.product-detail {
  width: 80%;
  margin: auto;
  margin-bottom: 10px;
}
</style>
