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
			        <small><i class="fa fa-file-text"></i></small>
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
			    				<th data-column-id="id" data-type="numeric" data-identifier="true" data-order="desc" data-width="60" data-align="right">{{$t('message.id')}}</th>
			    				<th data-column-id="title" data-width="350">{{$t('message.title')}}</th>
			    				<th data-column-id="category" data-formatter="category">{{$t('message.category')}}</th>
			    				<th data-column-id="author" data-formatter="author">{{$t('message.author')}}</th>
			    				<th data-column-id="at_top" data-formatter="at_top" data-align="center">{{$t('message.top')}}</th>
			    				<th data-column-id="start_time" data-formatter="datetime" data-width="120" data-align="center">{{$t('message.online_time')}}</th>
			    				<th data-column-id="created" data-formatter="datetime" data-width="120" data-align="center">{{$t('message.created')}}</th>
			    				<th data-column-id="modified" data-formatter="datetime" data-width="120" data-align="center">{{$t('message.modified')}}</th>
			    				<th data-column-id="actions" data-formatter="actions" data-sortable="false" data-width="120" data-align="center">{{$t('message.actions')}}</th>
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

		let app = this;

		//trigger the resize event to adopt the dimension of the viewport
		$(window).trigger('resize');

		datatable = $("#article_datatable").bootgrid({
		    ajax: true,
		    post: function () {
		        return {
		            
		        };
		    },
		    url: "/api/articles/index",
		    formatters: {
		        actions (column, row) {
		            return "<a href=\"/backend/#/app/edit_article/" + row.id +"\" class=\"btn btn-xs btn-default command-edit\" data-row-id=\"" + row.id + "\"><span class=\"fa fa-pencil\"></span></a> " + 
		                   "<button type=\"button\" class=\"btn btn-xs btn-default command-delete\" data-row-id=\"" + row.id + "\"><span class=\"fa fa-trash-o\"></span></button>" + 
		                   "<a href=\""+app.$config.frontend.url+"articles/read/"+row.id+".html\" class=\"btn btn-xs btn-default\" target=\"_blank\" ><span class=\"fa fa-eye\"></span></a>";
		        },
		        category (column, row){
		        	return row.Category.title;
		        },
		        author (column, row){
		        	return row.User.name;
		        },
		        at_top (column, row){
		        	return row.at_top ? '<i class="text-green fa fa-check"></i>' : '<i class="text-yellow fa fa-times"></i>'
		        },
		        datetime (column, row){

		        	let _t = row[column.id] ? app.$moment(row[column.id]).format('YYYY/MM/DD HH:mm') : '----';

		        	return _t;
		        }
		    }
		}).on("loaded.rs.jquery.bootgrid", () => {
		    datatable.find(".command-delete").on("click", function(e) {
		    	let id = $(this).data("row-id");
		    	if(confirm(app.$t("message.are_you_sure"))){
		    		app.$http.delete('/api/articles', {body: {id: id}}).then((result) => {

		    			if(result.status === 200 && result.data.id){
		    				toastr(result.message, app.$t("message.record_deleted"), 'success');
		    				datatable.bootgrid('reload');
						}else{
							toastr(result.message, app.$t("message.error"), 'error');
						}

		    		}, (error) => {
		    			toastr(error.statusText, app.$t("message.error"), 'error');
		    		});
		    	};
		    });
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