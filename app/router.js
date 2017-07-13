import VueRouter from 'vue-router';

import Login from './components/login.vue';

let router = new VueRouter({
	suppressTransitionError: false,
	routes: [
		{ path: '/', component: Login }
	]
});

router.beforeEach((to, from, next) => { 
	next(true);
});

export default router;

