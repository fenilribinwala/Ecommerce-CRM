import { createRouter, createWebHistory } from 'vue-router';
import Config from '@/app-configs';

// Lazy load components
const Home = () => import('@/views/Home.vue');
const Checkout = () => import('@/components/checkout/Checkout.vue');
const MainPage = () => import('@/components/homepage/MainPage.vue');
const Login = () => import('@/views/Login.vue');
const PageNotFound = () => import('@/views/Notfound.vue');

const routes = [
  {
    path: '/',
    component: Home,
    children: [
      {
        path: '',
        component: MainPage,
      },
      {
        path: 'about',
        name: 'about',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '@/views/About.vue'),
      },
      {
        path: 'search',
        component: () => import('@/views/SearchView.vue'),
      },
      {
        path: 'faqs',
        name: 'faqs',
        component: () => import(/* webpackChunkName: "about" */ '@/views/FAQs.vue'),
      },
      {
        path: 'contact',
        name: 'contact',
        component: () => import(/* webpackChunkName: "about" */ '@/views/Contact.vue'),
      },
      {
        path: 'checkout',
        component: Checkout,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'orders',
        component: () => import('@/views/OrderView.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'orders/:id',
        component: () => import('@/components/orders/SingleOrderDetail.vue'),
        meta: {
          requiresAuth: true,
        },
        props: true,
      },
      {
        path: 'product/:productId',
        component: () => import('@/views/ProductDetail.vue'),
        props: true,
      },
    ],
  },
  {
    path: '/email-confirmation/:token',
    props: true,
    component: () => import('@/views/EmailConfirmation.vue'),
  },
  {
    path: '/password-reset/:token',
    props: true,
    component: () => import('@/views/PasswordConfirmation.vue'),
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/*',
    name: 'PageNotFound',
    component: PageNotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  }
});

// Auth guard that prevents the page from going forward if the user is not authorized for the paths that need authorization.
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (localStorage.getItem('email') == null || localStorage.getItem('email') === 'null') {
      next({
        path: '/login',
        query: {
          previousPath: from.fullPath
        }
      });
    } else {
      next();
    }
  } else if (to.fullPath === '/login') {
    // Setting previous path here so that it can be rerouted to old url that was open before login
    next({
      path: '/login',
      query: {
        previousPath: from.fullPath
      }
    });
  } else {
    next();
  }
});

export default router;
