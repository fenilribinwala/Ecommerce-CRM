<template>
  <div id="search">
    <search-result-view
      :data="searchResult"
      :title="'Search Result'"
      :menu="categories"
      :term="term"
      :category="category"
      :subCategory="subCategory"
      :paging="paging"
      @nextpage="loadMoreData"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useCategoryStore } from '@/stores/categoryStore';
import { useSearchStore } from '@/stores/searchStore';
import SearchResultView from '@/components/vendor-pages/SearchResultView.vue';
import PagingOption from '@/dto/Pagination.json';
import _ from 'lodash';

// Initialize route and stores
const route = useRoute();
const categoryStore = useCategoryStore();
const searchStore = useSearchStore();

// Reactive data
const term = ref('');
const category = ref('');
const subCategory = ref('');
const paging = reactive(_.cloneDeep(PagingOption));

// Computed properties
const categories = computed(() => categoryStore.categories);
const masterCategoryList = computed(() => categoryStore.masterList);
const searchResult = computed(() => searchStore.searchResult);

// Watch for route query changes
watch(() => route.query, (value) => {
  assignQueryValues(value);
});

// Initialize component
onMounted(async () => {
  await categoryStore.getCategoriesData();
  assignQueryValues(route.query);
});

// Methods
function assignQueryValues(value) {
  if (value.category) category.value = value.category;
  else category.value = '';

  if (value.subCategory) subCategory.value = value.subCategory;
  else subCategory.value = '';

  if (value.term) term.value = value.term;
  else term.value = '';

  searchStore.resetStore();
  paging.page = 1;

  performSearch();
}

async function performSearch() {
  const payload = {};

  payload.term = term.value;

  if (category.value.length > 0 && subCategory.value.length > 0) {
    payload.subcategories = _.map(
      _.filter(
        masterCategoryList.value,
        v => v.subcategory === subCategory.value && v.category === category.value,
      ),
      '_id',
    );
  } else if (subCategory.value.length > 0) {
    payload.subcategories = _.map(
      _.filter(
        masterCategoryList.value,
        v => v.subcategory === subCategory.value,
      ),
      '_id',
    );
  } else if (category.value.length > 0) {
    payload.subcategories = _.map(categories.value[category.value], '_id');
  }

  payload.paging = paging;

  const pageResp = await searchStore.searchForProduct(payload);

  _.assign(paging, pageResp);
}

function loadMoreData() {
  paging.page += parseInt(1);
  performSearch();
}
</script>

<style lang="scss">
#search {
}
</style>
