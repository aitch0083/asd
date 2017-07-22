import VueRouter from 'vue-router';

import Login from './components/login.vue';
import Dashboard from './components/dashboard.vue';
import ArticleList from './components/article.list.vue';
import BannerList from './components/banner.list.vue';
import CategoryList from './components/category.list.vue';
import UserList from './components/user.list.vue';

import ArticleEditor from './components/article.editor.vue';
import BannerEditor from './components/banner.editor.vue';
import UserEditor from './components/user.editor.vue';
import CategoryEditor from './components/category.editor.vue';

let router = new VueRouter({
	suppressTransitionError: false,
	routes: [
		{ path: '/', component: Login },
		{ path: '/app/dashboard', component: Dashboard },
		{ path: '/app/articles', component: ArticleList },
		{ path: '/app/banners', component: BannerList },
		{ path: '/app/categories', component: CategoryList },
		{ path: '/app/users', component: UserList },

		{ path: '/app/add_article', component: ArticleEditor },
		{ path: '/app/edit_article/:id', component: ArticleEditor },

		{ path: '/app/add_banner', component: BannerEditor },
		{ path: '/app/edit_banner/:id', component: BannerEditor },

		{ path: '/app/add_category', component: CategoryEditor },
		{ path: '/app/edit_category/:id', component: CategoryEditor },

		{ path: '/app/add_user', component: UserEditor },
		{ path: '/app/edit_user/:id', component: UserEditor },
	]
});

router.beforeEach((to, from, next) => { 
	next(true);
});

export default router;

