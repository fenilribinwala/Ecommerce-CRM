<template>
  <div class="product-detail">
    <div class="space"></div>
    <br>
    <p class="align-left bcrumb">Shop &nbsp; / &nbsp; {{title}}</p>
    <br>
    <b-row>
      <b-col md="2" class="beginner align-left">
        <div class="d-none d-md-block">
          <side-menu-view
            :sidebar="menu"
            :category="category"
            :subCategory="subCategory"
            :term="term"
          ></side-menu-view>
        </div>
      </b-col>
      <b-col md="10">
        <div v-if="data && data.length > 0">
          <div class="product-card align-center" v-for="(product, pid) in data" v-bind:key="pid">
            <div class="link" @click="openProductDetail(product._id)">
              <div class="img-parent" v-if="product && product.thumbnailUrls && product.thumbnailUrls.length > 0">
                <search-result-view-image :product="product"/>
              </div>

              <p
                v-else
                style="font-size: 5em; padding: 10px 0px; text-align: center; color: #bdbdbd"
              >
                <font-awesome-icon icon="shopping-bag" width="100%"/>
              </p>
              <div class="product-card-desc">
                <p class="info">{{product.store}}</p>
                <p class="title">{{product.name}}</p>
                <p>
                  <span
                    v-if="product.marked_price && product.price && product.marked_price.amount > product.price.amount"
                  >
                    <strong
                      class="underline"
                      style="color: red"
                    >{{product.marked_price.currency}} {{product.marked_price.amount}}</strong>&nbsp;&nbsp;
                  </span>

                  <strong v-if="product.price">
                    <span>{{product.price.currency}} {{product.price.amount}}</span>
                  </strong>
                </p>
              </div>
            </div>
          </div>
          <div class="align-center">
            <b-btn
              class="primary-button"
              @click="loadMoreProducts()"
              v-show="data.length < paging.total"
            >See More</b-btn>
          </div>
        </div>
        <div v-else>
          <div class="info" style="font-size: 50px">No result found ...</div>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import SearchResultViewImage from '@/components/vendor-pages/SearchResultViewImage.vue';
import SideMenuView from '@/components/vendor-pages/SideMenuView.vue';

// Initialize router
const router = useRouter();

// Define props
const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  menu: {
    required: true,
    default: () => ({}),
  },
  term: {
    required: false,
    default: '',
    type: String,
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
  paging: {
    required: false,
    default: () => ({}),
  },
});

// Define emits
const emit = defineEmits(['nextpage']);

// Methods
function getPictureStyle(img) {
  if (!img || img.length <= 0) {
    return {
      backgroundImage: 'url(/static/no-image.jpg)',
    };
  }
  return {
    backgroundImage: `url(${img})`,
  };
}

function openProductDetail(pid) {
  router.push(`/product/${pid}`);
}

function loadMoreProducts() {
  emit('nextpage');
}
</script>

<style lang="scss">
.product-detail {
  padding: 0px 10px 10px 10px;
}

.product-card {
  padding: 5px;
  height: 350px;
  width: 210px;
  display: inline-block;
  overflow: hidden;
  margin: 15px 10px;
  vertical-align: top;

  .link {
    cursor: pointer;
  }

  .img-parent {
    height: 250px;
    text-align: center;
  }

  .product-card-desc {
    padding: 5px;
    text-align: left;

    .info {
      color: #bdbdbd;
      padding: 0px;
      margin: 0px;
      font-size: 12px;
    }

    .title {
      font-size: 14px;
      width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0px;
      margin: 0px;
    }
  }
}

.beginner {
  padding: 0px;
}

.product-list {
  padding: 0px;
  margin: 0px;
}

ul {
  padding-left: 0px;
}

.bcrumb {
  color: #bdbdbd;
  margin-left: 10px;
}

.underline {
  text-decoration: line-through;
}

.space {
  height: 65px;
}

.side-menu {
  position: fixed;
  padding: 0px 10px 0px 10px;
  height: 100%;
  width: 250px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.025);
  transition: 0.3s;
  left: 0;
  top: 175px;
  z-index: 2;
  overflow-x: hidden;
  background-color: white;
}
</style>
