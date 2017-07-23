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
		        {{$t("message.user_editor")}}
		        <small><i class="fa fa-edit"></i></small>
		      </h1>
		      <ol class="breadcrumb">
		        <li><a href="/backend/#/app/dashboard"><i class="fa fa-dashboard"></i>{{$t("message.dashboard")}}</a></li>
		        <li class="active">{{$t("message.user_editor")}}</li>
		      </ol>
		    </section>

		    <!-- Main content -->
		    <section class="content">

		    	<!-- form start -->
			    <form id="datum-form" ref="datum-form" class="form-horizontal" v-model="form" enctype="multipart/form-data">
			        <div class="box-body">
			            
			            <div class="form-group">
			                <label for="inputName" class="col-sm-2 control-label">{{$t("message.name_field")}}</label>
			                <div class="col-sm-10">
			                    <input name="name" type="text" class="form-control" id="inputName" v-model="form.name" v-focus>
			                </div>
			            </div>

			            <div class="form-group">
			                <label for="inputUsername" class="col-sm-2 control-label">{{$t("message.display_name")}}</label>
			                <div class="col-sm-10">
			                    <input name="username" type="text" class="form-control" id="inputUsername" v-model="form.username">
			                </div>
			            </div>

						<div class="form-group">
			                <label for="inputEmail" class="col-sm-2 control-label">{{$t("message.email")}}</label>
			                <div class="col-sm-10">
			                    <input name="email" type="email" class="form-control" id="inputEmail" v-model="form.email">
			                </div>
			            </div>

			            <div class="form-group" v-if="user.type === 'admin'">
			                <label for="inputPassword" class="col-sm-2 control-label">{{$t("message.password")}}</label>
			                <div class="col-sm-10">
			                    <input name="password" type="text" class="form-control" id="inputPassword" v-model="form.password">
			                </div>
			            </div>

			            <div class="form-group" v-if="user.type === 'admin'">
			                <label for="inputType" class="col-sm-2 control-label">{{$t("message.type")}}</label>
			                <div class="col-sm-10">
			                    <select name="type" class="form-control plain-select2" id="inputType" v-model="form.type">
			                    	<option value="usual">{{$t("message.usual")}}</option>
			                    	<option value="admin">{{$t("message.admin")}}</option>
			                    </select>
			                </div>
			            </div>

			            <div class="form-group">
			                <label for="inputSex" class="col-sm-2 control-label">{{$t("message.sex")}}</label>
			                <div class="col-sm-10">
			                    <select name="sex" class="form-control plain-select2" id="inputSex" v-model="form.sex">
			                    	<option value="male">{{$t("message.male")}}</option>
			                    	<option value="female">{{$t("message.female")}}</option>
			                    	<option value="unknown">{{$t("message.acdc")}}</option>
			                    </select>
			                </div>
			            </div>

			            <button type="button" class="btn btn-default pull-right" @click="gotoList">{{$t("message.banner_list")}}</button>
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

let _newp = (str) => {
	let result = sanitizeHtml(str.replace(/(?:\r\n|\r|\n)/g, '<br/>'), {allowedTags:['p', 'br'], allowedAttributes:[]});
	return result;
};

let $editor = null;

let clean_form = {
	type: 'usual',
	sex: 'unknown'
};

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
			this.$router.push('/app/users');
		},
		submitForm() {

			let app = this;
			let id  = app.$route.params.id;

			let email = _.escape(_.trim(app.form.email));

			if(!anchorme.validate.email(email)){
				toastr(this.$t("message.please_fill_email"), this.$t("message.error"), 'error');
			} else if(!this.form.username) {
				toastr(this.$t("message.please_fill_username"), this.$t("message.error"), 'error');
			} else if(!this.form.name) {
				toastr(this.$t("message.please_fill_name"), this.$t("message.error"), 'error');
			}else {

				let method = id ? 'put' : 'post';

				// console.info('id:', id);

				app.$http[method]('/api/users', app.form)
				.then((result) => {

					if(result.status === 200 && result.data.id){
						toastr(this.$t("message.user_saved"), this.$t("message.success"), 'success');
					} else {
						toastr(this.$t("message.unable_to_save") + ": " + result.data.message, this.$t("message.error"), 'error');
					}

				}, (error) => {
					console.error('error@saving user:', error);
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

		if(id !== undefined){//edit mode

			this.$http.get('/api/users/' + id).then((result) => {

				if(result.status === 200 && result.data.success){

					app.form = Object.assign({}, app.form, result.data.record);

					app.$refs['datum-form'].reset();

				}else{
					toastr(result.message, this.$t("message.error"), 'error');
					app.$router.back();
				}

			}, (error) => {
				console.error('/api/articles/new', error);
				toastr(error.statusText, this.$t("message.error"), 'error');
			});

		} else {//add mode
			app.form = clean_form;
			app.$refs['datum-form'].reset();
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
			activeItem: 'add_user',
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