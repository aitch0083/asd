<template>
	<div class="banner_editor">
		
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
		        {{$t("message.banner_editor")}}
		        <small><i class="fa fa-edit"></i></small>
		      </h1>
		      <ol class="breadcrumb">
		        <li><a href="/backend/#/app/dashboard"><i class="fa fa-dashboard"></i>{{$t("message.dashboard")}}</a></li>
		        <li class="active">{{$t("message.banner_editor")}}</li>
		      </ol>
		    </section>

		    <!-- Main content -->
		    <section class="content">

		    	<!-- form start -->
			    <form id="datum-form" ref="datum-form" class="form-horizontal" v-model="form" enctype="multipart/form-data">
			        <div class="box-body">
			            <div class="form-group">
			                <label for="inputDescription" class="col-sm-2 control-label">{{$t("message.description_field")}}</label>
			                <div class="col-sm-10">
			                    <input name="description" type="text" class="form-control" id="inputDescription" v-model="form.description" v-focus>
			                </div>
			            </div>

			            <div class="form-group">
			                <label for="inputUrl" class="col-sm-2 control-label">{{$t("message.url_field")}}</label>
			                <div class="col-sm-10">
			                    <input name="url" type="text" class="form-control" id="inputUrl" v-model="form.url">
			                </div>
			            </div>

			            <div class="form-group">
			                <label for="inputCategory" class="col-sm-2 control-label">{{$t("message.category_field")}}</label>
			                <div class="col-sm-10">
			                    <select name="category_id" class="form-control" id="inputCategory">
			                   	</select>
			                </div>
			            </div>
			            
			            <div class="form-group">
			            	<label class="col-sm-2 control-label">&nbsp;</label>
			            	<div class="col-sm-10">
			            		<label for="inputApproved" class="checkbox-label">
			            			{{$t("message.online_field")}}
			            			<input id="inputOnline" name="online" type="checkbox" v-model="form.online" value="1" />
			            		</label>

			            		<label for="inputAtTop" class="checkbox-label">
			            			{{$t("message.youtube_field")}} 
			            			<input id="inputYoutube" name="is_youtube" type="checkbox" v-model="form.is_youtube" value="1" />
			            		</label>

			            		<div class="input-group date pull-left col-sm-6">
									
									<div class="input-group-addon">
										<i class="fa fa-calendar"></i> {{$t("message.start_time")}}
									</div>
									<input name="start_time" type="text" readonly class="form-control pull-right" id="inputStartTime" v-model="form.start_time" :placeholder="placeholders.start_time">
									<div class="input-group-addon" @click="clearStartTime">
										<i class="fa fa-times"></i>
									</div>

									<div class="input-group-addon">
										<i class="fa fa-calendar"></i> {{$t("message.end_time")}}
									</div>
									<input name="end_time" type="text" readonly class="form-control pull-right" id="inputEndTime" v-model="form.end_time" :placeholder="placeholders.end_time">
									<div class="input-group-addon" @click="clearEndTime">
										<i class="fa fa-times"></i>
									</div>
				                </div>

			            		<button type="button" class="btn btn-default pull-right" @click="gotoList">{{$t("message.banner_list")}}</button>
			            		<button type="button" class="btn btn-info pull-right" @click="submitForm">{{$t("message.submit_btn")}}</button>
			            		<button type="button" class="btn btn-success pull-right" @click="uploadThumbnail">{{$t("message.upload_thumbnail")}}</button>
			            	</div>
			            </div>
			            
			        </div>
			    
			    </form><!-- EO form -->

			    <div class="box box-widget" v-if="form.img1">
				    <div class="box-header with-border">
				        <h6>{{$t("message.thumbnail")}}</h6>
				    </div>
				    <!-- /.box-header -->
				    <div class="box-body">
				        <img class="img-responsive pad center-block" :src="form.img1" alt="Thumbnail">
				    </div>
				    <!-- /.box-body -->
				</div>

			    <Modal elementId="panorama-form-modal" 
					   :title="panorama_modal_title" 
					   :showActions="true"
					   :onSave="onSavePanorama">
					<form ref="panorama-form" class="form form-horizontal" v-model="panorama_form" enctype="multipart/form-data">
						<div class="box-body">
							<div class="form-group">
				                <label for="inputPanorama" class="col-sm-2 control-label">{{$t("message.thumbnail")}}</label>
				                <div class="col-sm-10">
				                    <input type="file" name="file[]" class="form-control" id="inputPanorama">
				                </div>
				            </div>
						</div>
					</form>
				</Modal>

		    </section>
		</div>

	</div>
</template>

<script>
import _ from 'lodash';
import Vue from 'vue';
import AdminHeader from './admin.header.vue';
import AdminSideMenu from './admin.sidemenu.vue';
import Modal from './modal.vue';
import toastr from '../../libs/toastr';
import sanitizeHtml from 'sanitize-html';

let _newp = (str) => {
	let result = sanitizeHtml(str.replace(/(?:\r\n|\r|\n)/g, '<br/>'), {allowedTags:['p', 'br'], allowedAttributes:[]});
	return result;
};

let init_category_selection = (app) => {

	$("#inputCategory").select2({
		multiple: true,
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

			id = id ? id : app.form.category_id;

			if(id === undefined){
				return ;
			}

			$.ajax({
                url:'/api/categories/get_list?id='+id,
                dataType:'json'
            }).done((data) => {
            	app.form.category_id = data.id;
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
		let $control         = $('#inputCategory');
		let category_id      = $control.select2('val') || $control.data('category-id');
		app.form.category_id = category_id;
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
		uploadThumbnail() {
			$('#panorama-form-modal').modal('show');
		},
		gotoList() {
			this.$router.push('/app/banners');
		},
		submitForm() {

			let app = this;

			if(!this.form.description) {
				toastr(this.$t("message.please_fill_description"), this.$t("message.error"), 'error');
			//} else if(!this.form.url) {
				//toastr(this.$t("message.please_fill_url"), this.$t("message.error"), 'error');
			} else {

				app.$http.put('/api/banners', app.form)
				.then((result) => {

					if(result.status === 200 && result.data.success){
						toastr(this.$t("message.banner_saved"), this.$t("message.success"), 'success');
					} else {
						toastr(this.$t("message.unable_to_save"), this.$t("message.error"), 'error');
					}

				}, (error) => {
					console.error('error@saving banner:', error);
					toastr(this.$t("message.unable_to_save"), this.$t("message.error"), 'error');
				});
			}

		},
		clearStartTime() {
			$('#inputStartTime').val('');
		},
		clearEndTime() {
			$('#inputEndTime').val('');
		},
		onSavePanorama() {
			let $editor = $('#editor');
			let $modal  = $('#panorama-form-modal');
			let $form   = $modal.find('form');
			let files   = $modal.find('input[type=file]');
			let app     = this;

			if(files.length){

				let file_count = 0;

				_.each(files, (file, idx) => {
					if(file.files.length){
						file_count++;
					}
				});

				if(file_count === 1){
					
					let formData = new FormData($form.get(0));
		
					formData.append('record_id', app.form.id);
					formData.append('model_name', 'Banner');
					formData.append('type', 'banner');
					formData.append('watermark', 'no');

					app.$http
					.post('/api/images', formData)
				    .then((result) => {

				    	$form.get(0).reset();
				    	
				    	if(result.status === 200 && result.data.success){

				    		let image_srcs = result.data.urls;
				    		let images     = result.data.images;

				    		app.form.img1 = result.data.urls[0];

				    		app.$http.put('/api/banners', {
				    			id: app.form.id,
				    			img1: app.form.img1
				    		}).then((result) => {

				    			if(result.status === 200 && result.data.success){
									toastr(this.$t("message.banner_saved"), this.$t("message.success"), 'success');
								} else {
									toastr(this.$t("message.unable_to_save"), this.$t("message.error"), 'error');
								}
				    		})
				    		
				    		app.bus.$emit('open-loading-dialog', false);
				    		$modal.modal('hide');
				    	} else {
				    		console.error('Unable to parse the image URL.');
				    	}

				    }, (error) => {
				    	console.error('Error@uploading the image:', error);
				    });					

				} else {
					toastr(this.$t("message.please_select_image"), this.$t("message.error"), 'error');
				}

	    	} else {
	    		toastr(this.$t("message.please_select_image"), this.$t("message.error"), 'error');
	    	}

	    	return true;
		},//eo onSavePanorama 
		
	},

	beforeMount() {
		
		let user = this.$state.$get('user');

		//init AdminLTE style
		$('body').addClass('hold-transition skin-blue sidebar-mini');
		$('#app').addClass('wrapper');

		if(_.isString(user)){
			user = JSON.parse(user);
		}

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

		$('#inputStartTime').datetimepicker({
			format: 'yyyy-mm-dd hh:ii:00',
			autoclose: true,
	        todayBtn: true,
	        minuteStep: 15
		}).on('change', (event) => {
			app.form.start_time = event.target.value
		});

		$('#inputEndTime').datetimepicker({
			format: 'yyyy-mm-dd hh:ii:00',
			autoclose: true,
	        todayBtn: true,
	        minuteStep: 15
		}).on('change', (event) => {
			app.form.end_time = event.target.value
		});

		app.bus.$on('set.form.category_id', (category_id) => {
			$('#inputCategory').data('category-id', category_id).trigger('change');
			init_category_selection(app);
		});

		if(id !== undefined){//edit mode

			this.$http.get('/api/banners/' + id).then((result) => {

				if(result.status === 200 && result.data.success){

					app.form = Object.assign({}, app.form, result.data.record);

					app.$refs['datum-form'].reset();

					// app.bus.$emit('set.form.user_id', app.form.user_id);
					app.bus.$emit('set.form.category_id', app.form.category_id);

				}else{
					toastr(result.message, this.$t("message.error"), 'error');
					app.$router.back();
				}

			}, (error) => {
				console.error('/api/banners/new', error);
				toastr(error.statusText, this.$t("message.error"), 'error');
			});

		} else {//add mode
			this.$http.get('/api/banners/new').then((result) => {

				if(result.status === 200 && result.data.success){

					app.form = Object.assign({}, app.form, result.data.record);

					app.$refs['datum-form'].reset();

					// app.bus.$emit('set.form.user_id', app.form.user_id);
					app.bus.$emit('set.form.category_id', app.form.category_id);

				}else{
					toastr(result.message, this.$t("message.error"), 'error');
					app.$router.back();
				}

			}, (error) => {
				console.error('/api/banners/new', error);
				toastr(error.statusText, this.$t("message.error"), 'error');
			});
		}

		$(window).trigger('resize');
		
	},//eo mount

	data() {

		return {
			form: {
				title: null,
				titleerror: null,
				user_id: null,
				authorerror: null,
				category_id: null,
				categoryerror: null,
				keywords: null,
				approved: false,
				at_top: false,
				watermark: false,
				content: null,
				abstract: null
			},
			panorama_modal_title: this.$t("message.thumbnail"),
			panorama_form: {
			},
			placeholders: {
				start_time: this.$t("message.start_time"),
				end_time: this.$t("message.end_time"),
			},
			bus: new Vue(),
			activeItem: 'add_banner',
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