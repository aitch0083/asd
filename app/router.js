import VueRouter from 'vue-router';

import Login from './components/login.vue';
import Dashboard from './components/dashboard.vue';
import ArticleList from './components/article.list.vue';
import BannerList from './components/banner.list.vue';
import CategoryList from './components/category.list.vue';
import UserList from './components/user.list.vue';

let router = new VueRouter({
	suppressTransitionError: false,
	routes: [
		{ path: '/', component: Login },
		{ path: '/app/dashboard', component: Dashboard },
		{ path: '/app/articles', component: ArticleList },
		{ path: '/app/banners', component: BannerList },
		{ path: '/app/categories', component: CategoryList },
		{ path: '/app/users', component: UserList },
	]
});

router.beforeEach((to, from, next) => { 
	next(true);
});

export default router;

