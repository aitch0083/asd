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
			        {{$t("message.banner_list")}}
			        <small><i class="fa fa-money"></i></small>
			      </h1>
			      <ol class="breadcrumb">
			        <li><a href="/backend/#/app/dashboard"><i class="fa fa-dashboard"></i>{{$t("message.dashboard")}}</a></li>
			        <li class="active">{{$t("message.banner_editor")}}</li>
			      </ol>
			    </section>

			    <!-- Main content -->
			    <section class="content">
			    	<table id="banner_datatable" class="datatable table table-striped table-bordered dt-responsive nowrap" cellspacing="0">
			    		<thead>
			    			<tr>
			    				<th data-column-id="id" data-type="numeric" data-identifier="true" data-order="desc" data-width="60" data-align="right">{{$t('message.id')}}</th>
			    				<th data-column-id="description" data-width="250">{{$t('message.description')}}</th>
			    				<th data-column-id="author" data-formatter="author">{{$t('message.author')}}</th>
			    				<th data-column-id="online" data-formatter="binary" data-align="center">{{$t('message.online')}}</th>
			    				<th data-column-id="is_youtube" data-formatter="binary" data-align="center">{{$t('message.isyoutube')}}</th>
			    				<th data-column-id="start_time" data-formatter="datetime" data-width="120" data-align="center">{{$t('message.start_time')}}</th>
			    				<th data-column-id="end_time" data-formatter="datetime" data-width="120" data-align="center">{{$t('message.end_time')}}</th>
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

		datatable = $("#banner_datatable").bootgrid({
		    ajax: true,
		    post: function () {
		        return {
		            
		        };
		    },
		    url: "/api/banners/index",
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
		        binary: function(column, row){
		        	return row[column.id] ? '<i class="text-green fa fa-check"></i>' : '<i class="text-yellow fa fa-times"></i>'
		        },
		        datetime: function(column, row){

		        	let _t = row[column.id] && row[column.id] !== '0000-00-00 00:00:00' ? app.$moment(row[column.id]).format('YYYY/MM/DD HH:mm') : '----';

		        	return _t;
		        }
		    }
		}).on("loaded.rs.jquery.bootgrid", () => {

			datatable.find(".command-edit").on("click", (e) => {
				let $this = $(e.target);
				let id    = null;

				if($this.get(0).nodeName === 'BUTTON'){
					id = $this.data("row-id");
				} else {
					id = $this.parent('button').data("row-id");
				}

		    	app.$router.push('/app/edit_banner/' + id);
		    });
		    
		    datatable.find(".command-delete").on("click", (e) => {
		    	let $this = $(e.target);
				let id    = null;

				if($this.get(0).nodeName === 'BUTTON'){
					id = $this.data("row-id");
				} else {
					id = $this.parent('button').data("row-id");
				}
		    	
		    	if(confirm(app.$t("message.are_you_sure"))){
		    		app.$http.delete('/api/banners', {body: {id: id}}).then((result) => {

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
		    });//eo command-delete
		});
	},

	data() {
		return {
			activeItem: 'banner_list',
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