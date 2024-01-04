import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/VenuesView.vue')
    },
    {
      path: '/Home',
      name: 'home',
      component: () => import('../views/VenuesView.vue')
    },
    {
      path: '/Venues',
      name: 'venues',
      component: () => import('../views/VenuesView.vue')
    },
    {
      path: '/Signin',
      name: 'signin',
      component: () => import('../views/SigninView.vue')
    },
    {
      path: '/Login',
      name: 'login',
      component: () => import('../views/SigninView.vue')
    },
    {
      path: '/Signup',
      name: 'signup',
      component: () => import('../views/SignupView.vue')
    },
    {
      path: '/Profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue')
    }
  ]
})

export default router
