import {createRouter, createWebHistory} from 'vue-router'
import Login from '@/views/Login/index.vue'

const Home = () => import('@/views/Home/index.vue')
const AboutView = () => import('@/views/About/index.vue')

const routes = [
    {
        path: '/',
        name: 'Login',
        component: Login
    },
    {
        path: '/Home',
        name: 'Home',
        component: Home
    },
    {
        path: '/about',
        name: 'About',
        component: AboutView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router