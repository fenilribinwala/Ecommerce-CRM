<template>
  <div id="main-page">
    <div class="main-bg"></div>
    <h1 class="featured-title">SPRING 2019 COLLECTION</h1>
    <div v-for="(design, did) in featuredDesigns" :key="did" class="designs">
      <design-entry :design="design" @shop="gotoProduct"/>
    </div>
    <h1 class="featured-title">Hottest Trends</h1>
    <FeaturedStripe/>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import Product from '@/data/featuredProduct.json';
import FeatureService from '@/services/FeaturedService';
import FeaturedStripe from '@/components/homepage/FeaturedStripe.vue';
import DesignEntry from '@/components/homepage/designs/DesignEntry.vue';

const router = useRouter();
const product = ref(null);
const currentSection = 'homepage';
const featuredDesigns = ref([]);

function gotoProduct(product) {
  router.push(`/products/${product._id}`);
}

onMounted(() => {
  product.value = Product;
  FeatureService.getFeatureListFor(currentSection)
    .then((data) => {
      featuredDesigns.value = data;
    })
    .catch((err) => {
      console.log(err);
    });
});
</script>

<style lang="scss">
@import '../../assets/css/global.scss';
@import '../../assets/css/sidebar.scss';
@import '../../assets/css/overrides.scss';
@import '../../assets/css/hover.css';
@import '../../assets/css/drift-basic.css';


.designs {
  margin-bottom: 1rem;
}

.veniqa-button:hover {
  background-color: $pitch-black;
  border: 2px solid $pitch-black;
}

.absolute-buttons {
  position: absolute;
  bottom: 0;
  width: 100%;
  margin-bottom: 100px;
}

.main-bg {
  // background-image: url('https://www.fearlesss.co.uk/media/wysiwyg/Copy_of_SPRING_TWENTY_NINETEEN-2.jpg');
  background-image: url('./../../assets/images/homepage.jpg');
  height: 100vh;
  background-size: cover;
  background-repeat: no-repeat;
  background-position-x: center;

  .content {
    display: flex;
    height: 100%;
    margin: auto;

    div {
      margin: auto;
    }
  }
}

.jumbotron {
  padding: 0px 0px 0px 0px !important;
  margin: 0px 0px 0px 0px !important;
}

.featured-title {
  margin: 0px 0px 0px 0px;
  padding: 40px 10px;
  color: #5d6d7e;
  // background-color: #eaecee;
  font-family: 'Quicksand';
}
</style>
