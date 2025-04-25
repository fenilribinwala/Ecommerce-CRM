<template>
  <div class="p-5 mb-4 bg-light rounded-3 stripecontent">
    <BRow class="d-flex flex-row justify-content-center align-items-center">
      <BCol
        sm="2"
        v-for="(product, key) in products"
        :key="key"
        :style="{ backgroundImage: 'url(' + product.url + ')' }"
        class="box d-flex flex-column justify-content-center align-items-center"
        href="#"
      >
        <div class="description erere d-flex flex-column justify-content-center align-items-center">
          <h4>{{product.name}}</h4>
          <p>{{product.price}}</p>
        </div>
      </BCol>
    </BRow>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const products = ref([
  {
    name: 'Telly Rwer',
    price: '$45.00',
    url: 'https://imagescdn.forever21.in/img/app/product/8/855098-10039653.jpg?auto=format&w=390',
  },
  {
    name: 'Telly Rwer Jacket',
    price: '$45.00',
    url: 'https://imagescdn.forever21.in/img/app/product/8/854843-10036689.jpg?auto=format&w=390',
  },
  {
    name: 'Defined Bold Dress',
    price: '$44.00',
    url: 'https://imagescdn.forever21.in/img/app/product/8/855096-10039629.jpg?auto=format&w=390',
  },
  {
    name: 'Bugged Shoes',
    price: '$46.00',
    url: 'https://i.pinimg.com/originals/05/07/fd/0507fd06e18f9101f3a4b95b17f2896c.jpg',
  },
  {
    name: 'Terminal Pants',
    price: '$45.00',
    url: 'https://imagescdn.forever21.in/img/app/product/8/854186-10028498.jpg?auto=format&w=390',
  },
  {
    name: 'Shaped Tee',
    price: '$77.00',
    url: 'https://www.forever21.com/images/default_330/00329137-02.jpg',
  },
]);
</script>

<style lang="scss" scoped>
.box {
  height: 50vh;
  background-color: white;
  background-size: cover;
  background-position: center center;
  padding: 0px 0px 0px 0px !important;
}
.box:hover {
  background-size: cover;
  background-position: center center;
}
.description {
  height: inherit;
  width: inherit;
  color: rgba(0, 0, 0, 0);
}
.description:hover {
  color: white;
  background-color: #1b1a1aad;
  width: -webkit-fill-available;
  -webkit-transition: background-color 500ms linear;
  -ms-transition: background-color 500ms linear;
  transition: background-color 500ms linear;
}
</style>
