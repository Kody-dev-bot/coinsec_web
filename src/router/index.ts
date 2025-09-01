import {createRouter, createWebHistory} from 'vue-router'

const Login = () => import('@/views/Auth/login.vue')
const Register = () => import('@/views/Auth/register.vue')
const Home = () => import('@/views/Home/index.vue')
const Admin = () => import('@/views/Admin/index.vue')
const AboutView = () => import('@/views/About/index.vue')

const routes = [
    {
        path: '/',
        name: 'Root',
        component: () => import('@/views/Auth/login.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
    {
        path: '/home',
        name: 'Home',
        component: Home,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/admin',
        name: 'Admin',
        component: Admin,
        meta: {
            requiresAuth: true
        }
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

// 添加全局路由监听
router.beforeEach((to, from, next) => {

    // 如果访问的是根路径，则根据登录状态决定跳转位置
    if (to.path === '/') {
        const token = localStorage.getItem('tokenValue');
        // 更严格的token验证
        if (token && token !== 'undefined' && token !== 'null' && token !== '' && token !== '""') {
            // 已登录，跳转到首页
            console.log('检测到有效token，跳转到首页');
            next('/home');
        } else {
            // 未登录，跳转到登录页
            console.log('未检测到有效token，跳转到登录页');
            next('/login');
        }
    }
    // 如果访问的是需要认证的页面
    else if (to.meta.requiresAuth) {
        console.log('访问需要认证的页面');
        const token = localStorage.getItem('tokenValue');
        console.log('当前token值:', token);

        if (token && token !== 'undefined' && token !== 'null' && token !== '' && token !== '""') {
            console.log('认证通过，允许访问');
            next();
        } else {
            console.log('认证失败，跳转到登录页');
            next('/login');
        }
    }
    // 其他情况正常跳转
    else {
        console.log('访问其他路径，正常跳转');
        next();
    }

});

// 添加后置守卫用于调试
router.afterEach((to, from) => {
    console.log('路由跳转完成:', {from: from.path, to: to.path});
});

export default router