import Auth from './views/Auth.vue'
import Home from './views/Home.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/auth',
        name: 'Auth',
        component: Auth,
    },
]

const router = new VueRouter({
    routes,
})

export default router