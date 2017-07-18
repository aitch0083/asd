<template>
	
	<!-- Left side column. contains the logo and sidebar -->
	<aside class="main-sidebar">

	    <!-- sidebar: style can be found in sidebar.less -->
	    <section class="sidebar">

	        <!-- Sidebar Menu -->
	        <ul class="sidebar-menu">
	            <li class="header">{{$t("message.menu")}}</li>

	            <li :class="{ 'active':( activeItem === 'dashboard') }">
	            	<a href="/backend/#/app/dashboard"><i class="fa fa-tachometer text-olive"></i> <span>{{$t('message.dashboard')}}</span></a>
	           	</li>

	           	<li :class="{ 'active':( activeItem === 'article_list') }">
	            	<a href="/backend/#/app/articles"><i class="fa fa-file-text text-red"></i> <span>{{$t('message.article_list')}}</span></a>
	           	</li>

	           	<li :class="{ 'active':( activeItem === 'banner_list') }">
	            	<a href="/backend/#/app/banners"><i class="fa fa-money text-green"></i> <span>{{$t('message.banner_list')}}</span></a>
	           	</li>

	           	<li :class="{ 'active':( activeItem === 'category_list') }">
	            	<a href="/backend/#/app/categories"><i class="fa fa-tree text-blue"></i> <span>{{$t('message.category_list')}}</span></a>
	           	</li>

	           	<li :class="{ 'active':( activeItem === 'user_list') }">
	            	<a href="/backend/#/app/users"><i class="fa fa-user text-teal"></i> <span>{{$t('message.user_list')}}</span></a>
	           	</li>

	           	<li>
	           		<a @click="logout"><i class="fa fa-sign-out text-red"></i> <span>{{$t("message.logout")}}</span></a>
	           	</li>

	           	<li class="header">{{$t("message.fast_links")}}</li>

	           	<li :class="{ 'active':( activeItem === 'add_article') }">
	            	<a href="/backend/#/app/add_article"><i class="fa fa-plus text-red"></i> <span>{{$t('message.add_article')}}</span></a>
	           	</li>

	           	<li :class="{ 'active':( activeItem === 'add_banner') }">
	            	<a href="/backend/#/app/add_banner"><i class="fa fa-plus text-green"></i> <span>{{$t('message.add_banner')}}</span></a>
	           	</li>

	           	<li :class="{ 'active':( activeItem === 'add_category') }">
	            	<a href="/backend/#/app/add_category"><i class="fa fa-plus text-blue"></i> <span>{{$t('message.add_category')}}</span></a>
	           	</li>

	           	<li :class="{ 'active':( activeItem === 'add_user') }">
	            	<a href="/backend/#/app/add_user"><i class="fa fa-plus text-teal"></i> <span>{{$t('message.add_user')}}</span></a>
	           	</li>
	            
	        </ul>
	        <!-- /.sidebar-menu -->
	    </section>
	    <!-- /.sidebar -->
	</aside>
</template>

<script>
import _      from 'lodash';

import toastr from '../../libs/toastr';

export default {
	name: 'AdminSideMenu',
	props: [
		'activeItem'
	],
	methods: {
		logout(event) {
			event.preventDefault();

			let user = this.$state.$get('user');

			this.$http.post('/api/users/logout',{
				uid: user.created
			}).then((result) => {

				if(result.status === 200 && result.data.success){
					toastr(this.$t(result.data.message), this.$t("message.success"), 'success');
					this.$state.$del('user');
					this.$router.push('/');
				} else {
					toastr(this.$t(result.data.message), this.$t("message.warning"), 'warning');
				}

			}, (error) => {
				toastr(error.statusText, this.$t("message.error"), 'error');
			});
		}
	},
	data() {

		let user = this.$state.$get('user');

		return {
			user
		};
	},
	mounted (){
		// console.info('activeItem:', this.activeItem);
	}
}
</script>

<style>
</style>