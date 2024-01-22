import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: { name: 'venues' }
    },
    {
      path: '/Home',
      name: 'home2',
      redirect: { name: 'venues' }
    },
    {
      path: '/Venues',
      name: 'venues',
      component: () => import('../views/VenuesView.vue')
    },
    {
      path: '/Venues/:venue_id',
      name: 'venuedetails',
      component: () => import('../views/VenueDetailsView.vue')
    },
    {
      path: '/Signin',
      name: 'signin',
      component: () => import('../views/SigninView.vue')
    },
    {
      path: '/Login',
      name: 'login',
      redirect: { name: 'signin' }
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
