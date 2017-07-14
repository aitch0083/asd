<template>
	<div class="dashboard">
		<AdminHeader 
			:messages="messages" 
			:notifications="notifications" 
			:tasks="tasks"
			:userprofile="userprofile"
			:showToggleButton="showToggleButton" />

		<AdminSideMenu :activeItem="activeItem"/>

		<div class="content-wrapper">
			<section class="content-header">
		      <h1>
		        Page Header
		        <small>Optional description</small>
		      </h1>
		      <ol class="breadcrumb">
		        <li><a href="#"><i class="fa fa-dashboard"></i> Level</a></li>
		        <li class="active">Here</li>
		      </ol>
		    </section>

		    <!-- Main content -->
		    <section class="content">

			    <div class="row">

			    	<div class="col-md-3 col-sm-6 col-xs-12">
						<div class="info-box">
							<span class="info-box-icon bg-aqua"><i class="fa fa-file-text"></i></span>

							<div class="info-box-content">
								<span class="info-box-text">{{$t("message.article_list")}}</span>
								<span class="info-box-number">{{article_count}}</span>
							</div>
							<!-- /.info-box-content -->
						</div>
						<!-- /.info-box -->
			        </div><!-- EO article info box -->

			        <div class="col-md-3 col-sm-6 col-xs-12">
						<div class="info-box">
							<span class="info-box-icon bg-green"><i class="fa fa-tree"></i></span>

							<div class="info-box-content">
								<span class="info-box-text">{{$t("message.category_list")}}</span>
								<span class="info-box-number">{{category_count}}</span>
							</div>
							<!-- /.info-box-content -->
						</div>
						<!-- /.info-box -->
			        </div><!-- EO article info box -->

			        <div class="col-md-3 col-sm-6 col-xs-12">
						<div class="info-box">
							<span class="info-box-icon bg-yellow"><i class="fa fa-user"></i></span>

							<div class="info-box-content">
								<span class="info-box-text">{{$t("message.user_list")}}</span>
								<span class="info-box-number">{{user_count}}</span>
							</div>
							<!-- /.info-box-content -->
						</div>
						<!-- /.info-box -->
			        </div><!-- EO article info box -->

			        <div class="col-md-3 col-sm-6 col-xs-12">
						<div class="info-box">
							<span class="info-box-icon bg-red"><i class="fa fa-line-chart"></i></span>

							<div class="info-box-content">
								<span class="info-box-text">{{$t("message.page_view")}}</span>
								<span class="info-box-number">{{page_view}}</span>
							</div>
							<!-- /.info-box-content -->
						</div>
						<!-- /.info-box -->
			        </div><!-- EO article info box -->

			    </div><!-- EO .row -->

		    </section>
		    <!-- /.content -->
		</div>

	</div>
</template>

<script>
import AdminHeader from './admin.header.vue';
import AdminSideMenu from './admin.sidemenu.vue';
import toastr from '../../libs/toastr';

let component = {

	components: {
		AdminHeader,
		AdminSideMenu
	},

	beforeMount() {
		let user = this.$state.$get('user');

		//init AdminLTE style
		$('body').addClass('hold-transition skin-blue sidebar-mini');
		$('#app').addClass('wrapper');

		if(!user){
			toastr(this.$t('message.user_invalid'), this.$t('message.error'), 'error');
			this.$router.push('/');
		} else {
			this.userprofile = user;
		}

		return false;
	},

	mounted() {
		//trigger the resize event to adopt the dimension of the viewport
		$(window).trigger('resize');
	},

	data() {

		return {
			activeItem: 'dashboard',
			article_count: 0,
			category_count: 0,
			user_count: 0,
			page_view: 0,
			messages:[],
			notifications:[],
			tasks:[],
			userprofile: null,
			showToggleButton: true
		};
	}

};//eo component

export default component;
</script>

<style>
</style>