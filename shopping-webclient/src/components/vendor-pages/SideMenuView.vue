<template>
  <div>
    <ul v-show="Object.keys(sidebar).length > 0">
      <li v-for="(product, pkey) in sidebar" v-bind:key="pkey">
        <div v-if="product && product.length > 0 && shouldProductDisplay(pkey, product)">
          <span style="font-size:large">
            <strong>{{product[0].category}}</strong>
          </span>
          <ul>
            <li v-for="(subcategory, sid) in product" v-bind:key="sid">
              <a
                @click="openSubCategory(subcategory, pkey)"
                class="d-none d-md-block"
                :class="{'bold': activeSubCategory(subcategory.subcategory)}"
              >{{subcategory.subcategory}}</a>
            </li>
          </ul>
          <br>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import _ from 'lodash';

// Define props
const props = defineProps({
  sidebar: {
    required: true,
  },
  category: {
    required: false,
    default: '',
    type: String,
  },
  subCategory: {
    required: false,
    default: '',
    type: String,
  },
  term: {
    required: false,
    default: '',
    type: String,
  },
});

// Initialize router
const router = useRouter();

// Methods
const openSubCategory = (subcat, keyy) => {
  router.push({
    path: '/search',
    query: {
      term: props.term,
      category: props.category.length > 0 ? props.category : keyy,
      subCategory: subcat.subcategory,
    },
  });
};

const shouldProductDisplay = (catgry, subcats) => {
  if (props.category.length <= 0) {
    if (
      props.subCategory.length > 0
      && _.findIndex(subcats, v => v.subcategory === props.subCategory) >= 0
    ) {
      return true;
    }
    if (props.subCategory.length <= 0) return true;
    return false;
  }
  if (props.category === catgry) return true;
  return false;
};

const activeSubCategory = (subCat) => {
  return subCat === props.subCategory;
};
</script>

<style lang="scss">
ul {
  padding: 0px;
  list-style-type: none;
}
a {
  padding: 0px !important;
  margin: 0px !important;
}
li {
  margin-bottom: 5px;
  margin-top: 5px;
}
.bold {
  font-weight: bold;
}
</style>
