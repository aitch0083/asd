<template>
	<div class="user_editor">
		
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
		        {{$t("message.category_editor")}}
		        <small><i class="fa fa-edit"></i></small>
		      </h1>
		      <ol class="breadcrumb">
		        <li><a href="/backend/#/app/dashboard"><i class="fa fa-dashboard"></i>{{$t("message.dashboard")}}</a></li>
		        <li class="active">{{$t("message.category_editor")}}</li>
		      </ol>
		    </section>

		    <!-- Main content -->
		    <section class="content">

		    	<!-- form start -->
			    <form id="datum-form" ref="datum-form" class="form-horizontal" v-model="form" enctype="multipart/form-data">
			        <div class="box-body">
			            
			            <div class="form-group">
			                <label for="inputTitle" class="col-sm-2 control-label">{{$t("message.title_field")}}</label>
			                <div class="col-sm-10">
			                    <input name="title" type="text" class="form-control" id="inputTitle" v-model="form.title" v-focus>
			                </div>
			            </div>

			            <div class="form-group">
			                <label for="inputDescription" class="col-sm-2 control-label">{{$t("message.description_field")}}</label>
			                <div class="col-sm-10">
			                    <input name="description" type="text" class="form-control" id="inputDescription" v-model="form.description" v-focus>
			                </div>
			            </div>

			            <div class="form-group">
			                <label for="inputCategory" class="col-sm-2 control-label">{{$t("message.parent_field")}}</label>
			                <div class="col-sm-10">
			                    <select name="parent_id" class="form-control" id="inputCategory">
			                   	</select>
			                </div>
			            </div>

			            <button type="button" class="btn btn-default pull-right" @click="gotoList">{{$t("message.category_list")}}</button>
			            <button type="button" class="btn btn-info pull-right" @click="submitForm">{{$t("message.submit_btn")}}</button>
			            
			        </div>
			    
			    </form><!-- EO form -->

		    </section>
		</div>

	</div>
</template>

<script>
import _ from 'lodash';
import Vue from 'vue';
import anchorme from 'anchorme';
import AdminHeader from './admin.header.vue';
import AdminSideMenu from './admin.sidemenu.vue';
import Modal from './modal.vue';
import toastr from '../../libs/toastr';
import sanitizeHtml from 'sanitize-html';

let clean_form = {
	title: '',
	description: '',
	parent_id: null,
	level: 1
};

let _newp = (str) => {
	let result = sanitizeHtml(str.replace(/(?:\r\n|\r|\n)/g, '<br/>'), {allowedTags:['p', 'br'], allowedAttributes:[]});
	return result;
};

let init_category_selection = (app) => {

	$("#inputCategory").select2({
		multiple: false,
		allowClear: true,
		ajax: {
			url: "/api/categories/get_list",
		    dataType: 'json',
		    delay: 1250,
		    multiple: true,
		    data: function(params) {
		        return {
		            q: params.term, // search term
		            page: params.page
		        };
		    },
		    processResults: function(data, params) {
		        params.page = params.page || 1;

		        return {
		            results: data.items,
		            pagination: {
		                more: (params.page * 30) < data.total_count
		            }
		        };
		    },
		    cache: true
		},//eo ajax
		initSelection(element, callback){

			let id = element.data('category-id') || element.val();

			id = id ? id : app.form.parent_id;

			$.ajax({
                url:'/api/categories/get_list?id='+id,
                dataType:'json'
            }).done((data) => {
            	app.form.parent_id = data.id;
                let select2_data = {id: data.id, text: data.title, name: data.title};
                callback(select2_data);
            });
		},
		escapeMarkup(markup) {
		    return markup;
		},//eo escapeMarkup
		templateResult(record) {
			return "<div class=\"clearfix\">" + record.title + " ( "+record.description+" )" + "<div>";
		},
		templateSelection (record) {
			return record.name || record.title;
		}
	}).on('change', (event) => {
		let $control       = $('#inputCategory');
		let parent_id      = $control.select2('val') || $control.data('category-id');
		app.form.parent_id = parent_id;
	});
};

let $editor = null;

let component = {

	components: {
		AdminHeader,
		AdminSideMenu,
		Modal
	},

	watch: {
		'$route'(to, from) {
			if(from.path !== to.path){ //re-initialise the components if the paths are different
				component.mounted.apply(this);
			}
		}
	},

	methods: {
		gotoList() {
			this.$router.push('/app/categories');
		},
		submitForm() {

			let app = this;
			let id  = app.$route.params.id;

			app.form.user_id = app.user.id;

			if(!this.form.title) {
				toastr(this.$t("message.please_fill_title"), this.$t("message.error"), 'error');
			} else if(!this.form.description) {
				toastr(this.$t("message.please_fill_description"), this.$t("message.error"), 'error');
			}else {

				app.$http.post('/api/categories', app.form)
				.then((result) => {

					if(result.status === 200 && result.data.success){
						toastr(this.$t("message.category_saved"), this.$t("message.success"), 'success');
					} else {
						toastr(this.$t("message.unable_to_save") + ": " + result.data.message, this.$t("message.error"), 'error');
					}

				}, (error) => {
					console.error('error@saving category:', error);
					toastr(this.$t("message.unable_to_save"), this.$t("message.error"), 'error');
				});
			}

		}
	},

	beforeMount() {
		
		let user = this.$state.$get('user');

		//init AdminLTE style
		$('body').addClass('hold-transition skin-blue sidebar-mini');
		$('#app').addClass('wrapper');

		if(_.isString(user)){
			user = JSON.parse(user);
		}

		// console.info('user: ', user);

		if(!user){
			toastr(this.$t('message.user_invalid'), this.$t('message.error'), 'error');
			this.$router.push('/');
		} else {
			this.userprofile = user;
		}

		this.user = user;

		return false;
	},

	mounted() {

		let app = this;
		let id  = this.$route.params.id;

		let $input = $('input');

		$input.iCheck({
			checkboxClass: 'icheckbox_flat-green',
			radioClass: 'iradio_flat-green'
		}).on('ifChanged', (event)=>{
			let name    = event.target.name;
			let checked = event.target.checked;

			if(name === 'is_youtube' || name === 'online'){
				app.form[name] = checked ? 1 : 0;
			}
		});

		$('.checkthis').iCheck('check');

		$('.plain-select2').select2();

		app.bus.$on('set.form.parent_id', (parent_id) => {
			$('#inputCategory').data('category-id', parent_id).trigger('change');
			init_category_selection(app);
		});

		if(id !== undefined){//edit mode

			this.$http.get('/api/categories/' + id).then((result) => {

				if(result.status === 200 && result.data.success){

					app.form = Object.assign({}, app.form, result.data.record);

					app.$refs['datum-form'].reset();

					app.bus.$emit('set.form.parent_id', app.form.parent_id);

				}else{
					toastr(result.message, this.$t("message.error"), 'error');
					app.$router.back();
				}

			}, (error) => {
				console.error('/api/articles/new', error);
				toastr(error.statusText, this.$t("message.error"), 'error');
			});

		} else {//add mode
			app.$refs['datum-form'].reset();
			app.form = clean_form;
			init_category_selection(app);	
		}

		$(window).trigger('resize');
		
	},

	data() {

		return {
			user: null,
			form: clean_form,
			placeholders: {
			},
			bus: new Vue(),
			activeItem: 'add_category',
			messages:[],
			notifications:[],
			tasks:[],
			userprofile: null,
			showToggleButton: true,
			upload_pano_params: {},
		};
	}//eo data()
};

export default component;
</script>

<style>
.checkbox-label{
	margin-left: 1rem;
	margin-right: 1rem;
	padding-top: 0.8rem;
}
.half-marco-photo {
	width: 48%;
}
.marco-container{
	width: 100%;
	border: 3px solid #3498DB;
}
.pano-photos{
	max-width: 100%;
	border: 3px solid #27AE60;
}
</style>