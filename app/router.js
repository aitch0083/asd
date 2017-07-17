import VueRouter from 'vue-router';

import Login from './components/login.vue';
import Dashboard from './components/dashboard.vue';
import ArticleList from './components/article.list.vue';

let router = new VueRouter({
	suppressTransitionError: false,
	routes: [
		{ path: '/', component: Login },
		{ path: '/app/dashboard', component: Dashboard },
		{ path: '/app/articles', component: ArticleList }
	]
});

router.beforeEach((to, from, next) => { 
	next(true);
});

export default router;

