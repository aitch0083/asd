<template>
	<div class="article_list">
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
			        {{$t("message.article_list")}}
			        <small><i class="fa fa-font"></i></small>
			      </h1>
			      <ol class="breadcrumb">
			        <li><a href="/backend/#/app/dashboard"><i class="fa fa-dashboard"></i>{{$t("message.dashboard")}}</a></li>
			        <li class="active">{{$t("message.article_editor")}}</li>
			      </ol>
			    </section>

			    <!-- Main content -->
			    <section class="content">
			    	<table id="article_datatable" class="datatable table table-striped table-bordered dt-responsive nowrap" cellspacing="0">
			    		<thead>
			    			<tr>
			    				<th data-column-id="id" data-type="numeric" data-identifier="true" data-order="desc">{{$t('message.id')}}</th>
			    				<th data-column-id="title">{{$t('message.title')}}</th>
			    				<th data-column-id="category" data-formatter="category">{{$t('message.category')}}</th>
			    				<th data-column-id="author" data-formatter="author">{{$t('message.author')}}</th>
			    				<th data-column-id="at_top" data-formatter="at_top">{{$t('message.top')}}</th>
			    				<th data-column-id="start_time">{{$t('message.online_time')}}</th>
			    				<th data-column-id="created">{{$t('message.created')}}</th>
			    				<th data-column-id="modified">{{$t('message.modified')}}</th>
			    				<th data-column-id="actions" data-formatter="actions" data-sortable="false">{{$t('message.actions')}}</th>
			    			</tr>
			    		</thead>
			    		<tbody></tbody>
			    	</table>
			    </section>
			</div>
	</div>
</template>

<script>
import AdminHeader from './admin.header.vue';
import AdminSideMenu from './admin.sidemenu.vue';
import toastr from '../../libs/toastr';

let datatable = null;
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

		console.info('created');
		datatable = $("#article_datatable").bootgrid({
		    ajax: true,
		    post: function () {
		        return {
		            
		        };
		    },
		    url: "/api/articles/index",
		    formatters: {
		        actions: function(column, row) {
		            return "<button type=\"button\" class=\"btn btn-xs btn-default command-edit\" data-row-id=\"" + row.id + "\"><span class=\"fa fa-pencil\"></span></button> " + 
		                   "<button type=\"button\" class=\"btn btn-xs btn-default command-delete\" data-row-id=\"" + row.id + "\"><span class=\"fa fa-trash-o\"></span></button>";
		        },
		        category: function(column, row){
		        	return row.Category.title;
		        },
		        author: function(column, row){
		        	return row.User.name;
		        },
		        at_top: function(column, row){
		        	return row.at_top ? '<i class="text-green fa fa-check"></i>' : '<i class="text-yellow fa fa-times"></i>'
		        }
		    }
		});
	},

	data() {
		return {
			activeItem: 'article_list',
			messages:[],
			notifications:[],
			tasks:[],
			userprofile: null,
			showToggleButton: true
		};
	}
};

export default component;
</script>

<style>
.datatable {
	width: 100%;
}
.dataTables_length {
	width: 45%;
	float: left;
}
</style>