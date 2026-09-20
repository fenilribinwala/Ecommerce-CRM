<template>
  <div :class="zoomer_box">
    <b-row>
      <b-col md="2">
        <div class="control-box" v-bind:class="{'d-none d-md-block': thumbs.length <=1}">
          <div @click="moveThumbs('left')" class="control">
            <slot name="left">
              <font-awesome-icon :icon="'chevron-circle-up'"></font-awesome-icon>
            </slot>
          </div>
          <div class="thumb-list">
            <img
              @mouseover="chooseThumb(thumb, $event)"
              draggable="false"
              v-show="key < options.scroll_items"
              :key="key"
              :src="thumb.url"
              @click="chooseThumb(thumb, $event)"
              v-for="(thumb, key) in thumbs"
              class="responsive-image"
              v-bind:style="{'boxShadow' : thumb.id === choosedThumb.id ? '0px 0px 0px 2px ' + options.choosed_thumb_border_color : ''}"
              :class="{'choosed-thumb': thumb.id === choosedThumb.id}"
            />
          </div>
          <div @click="moveThumbs('right')" class="control">
            <slot name="right">
              <font-awesome-icon :icon="'chevron-circle-down'"></font-awesome-icon>
            </slot>
          </div>
        </div>
      </b-col>
      <b-col md="10">
        <div class="preview-box">
          <img
            :src="previewImg.url"
            :data-zoom="previewLargeImg.url"
            class="responsive-image"
            draggable="false"
          />
        </div>
      </b-col>
    </b-row>
    <div :id="pane_id" class="pane-container d-none d-md-block"></div>
  </div>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, onBeforeMount, ref, watch} from 'vue';
// We need this specific version of working Drift-Zoom package.
import Drift from '../../assets/drift-zoom/src/js/Drift';

/**
 * Courtesy of akulubala from vue-product-zoomer
 */
const props = defineProps({
  baseZoomerOptions: {
    type: Object,
    default: () => ({})
  },
  baseImages: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

// Reactive state
const previewImg = ref({});
const previewLargeImg = ref({});
const thumbs = ref([]);
const normal_size = ref([]);
const large_size = ref([]);
const choosedThumb = ref({});
const drift = ref(null);
const options = ref({
  zoomFactor: 4,
  pane: 'pane',
  hoverDelay: 300,
  namespace: 'container-zoomer',
  move_by_click: true,
  scroll_items: 4,
  choosed_thumb_border_color: '#ff3d00',
  // move_button_style: 'chevron'
});

// Computed properties
const zoomer_box = computed(() => `${options.value.namespace}-zoomer-box`);
const pane_id = computed(() => `${options.value.namespace}-pane-container`);
const move_button = computed(() =>
  options.value.move_button_style === 'chevron'
    ? {
      left: 'chevron-left',
      right: 'chevron-right'
    }
    : {
      left: 'angle-double-left',
      right: 'angle-double-right'
    }
);

// Methods
const runImager = () => {
  document
    .querySelector(`.${zoomer_box.value} .thumb-list`)
    .setAttribute(
      'style',
      `grid-template-columns: repeat(${props.baseZoomerOptions.scroll_items}, auto)`
    );
  const t = setInterval(() => {
    if (document.readyState === 'complete') {
      if (options.value.pane === 'container-round') {
        options.value.inlinePane = true;
      } else {
        options.value.inlinePane = false;
        options.value.paneContainer = document.getElementById(pane_id.value);
        
        // Get the exact position and dimensions of the preview image
        const previewImage = document.querySelector(`.${zoomer_box.value} .preview-box img`);
        if (previewImage) {
          const imageRect = previewImage.getBoundingClientRect();
          const pageRect = document.body.getBoundingClientRect();
          
          let customStyle = '';
          if (options.value.pane === 'pane') {
            // Position the zoom pane exactly over the preview image
            customStyle = `width:${imageRect.width}px;height:${imageRect.height}px;left:${imageRect.left - pageRect.left}px;top:${imageRect.top - pageRect.top}px;`;
          } else {
            // For container mode, position over the image as well
            customStyle = `width:${imageRect.width}px;height:${imageRect.height}px;left:${imageRect.left - pageRect.left}px;top:${imageRect.top - pageRect.top}px;`;
          }
          options.value.paneContainer.setAttribute('style', customStyle);
        }
      }
      options.value.injectBaseStyles = true;
      const previewImg = `.${zoomer_box.value} .preview-box img`;
      drift.value = drift.value
        ? drift.value
        : new Drift(document.querySelector(previewImg), options.value);
      clearInterval(t);
    }
  }, 500);
};

const moveThumbs = (direction) => {
  const len = thumbs.value.length;
  if (direction === 'right') {
    const moveThumb = thumbs.value.splice(len - 1, 1);
    thumbs.value = [moveThumb[0], ...thumbs.value];
  } else {
    const moveThumb = thumbs.value.splice(0, 1);
    thumbs.value = [...thumbs.value, moveThumb[0]];
  }
};

const chooseThumb = (thumb, event) => {
  const eventType = event.type;
  if (eventType === 'mouseover') {
    if (options.value.move_by_click !== true) {
      choosedThumb.value = thumb;
    }
  } else {
    choosedThumb.value = thumb;
  }
};

// Watch for changes to choosedThumb
watch(choosedThumb, (thumb) => {
  const matchNormalImg = normal_size.value.find(img => img.id === thumb.id);
  const matchLargeImg = large_size.value.find(img => img.id === thumb.id);
  previewLargeImg.value = Object.assign({}, matchLargeImg);
  previewImg.value = Object.assign({}, matchNormalImg);
  if (drift.value !== null) {
    drift.value.setZoomImageURL(matchLargeImg.url);
  }
});

// Initialize data
const initializeData = () => {
  if (Object.keys(props.baseImages).length > 0) {
    for (const key in props.baseImages) {
      if (Object.prototype.hasOwnProperty.call(props.baseImages, key)) {
        // Need to handle arrays differently in Vue 3 refs
        if (Array.isArray(props.baseImages[key])) {
          // eslint-disable-next-line no-eval
          eval(`${key}.value = props.baseImages[key]`);
        }
      }
    }
  }

  if (normal_size.value.length === 0) {
    console.log('Product Zoomer Need Normal Size Image At Least!!!');
    return;
  }

  if (thumbs.value.length === 0) {
    thumbs.value = [...normal_size.value];
  }

  if (large_size.value.length === 0) {
    large_size.value = [...normal_size.value];
  }

  // Select first thumb
  if (thumbs.value.length > 0) {
    choosedThumb.value = thumbs.value[0];
  }

  if (Object.keys(props.baseZoomerOptions).length > 0) {
    for (const key in props.baseZoomerOptions) {
      if (Object.prototype.hasOwnProperty.call(props.baseZoomerOptions, key)) {
        options.value[key] = props.baseZoomerOptions[key];
        console.log(`Set ${key} to ${props.baseZoomerOptions[key]}`);
      }
    }
  }

  if (options.value.pane === 'container-round' || options.value.pane === 'container') {
    options.value.hoverBoundingBox = false;
  } else {
    options.value.hoverBoundingBox = true;
  }
};


onBeforeMount(() => {
  initializeData();
})

// Lifecycle hooks
onMounted(() => {
  runImager();
  // initializeData();
  window.addEventListener('resize', runImager);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', runImager);
});
</script>

<style>
@import '../../assets/css/drift-basic.css';

.preview-box {
  margin-bottom: 1vh;
}

@media (max-width: 768px) {
  .control {
    display: grid;
    align-items: center;
    font-size: x-large;
    cursor: pointer;
    justify-content: center;
  }

  .control-box {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    grid-column-gap: 5px;
  }

  .control-box .thumb-list {
    display: grid;
    grid-column-gap: 4px;
  }
}

.choosed-thumb {
  border-radius: 0px;
}

.pane-container {
  display: none;
  position: absolute;
  z-index: 10000;
  pointer-events: none;
}

.responsive-image {
  height: auto;
  width: 100%;
}

.thumb-list > img {
  margin-bottom: 10px;
}
</style>
