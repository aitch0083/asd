<template>
	<div class="article_editor">
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
		        {{$t("message.article_editor")}}
		        <small><i class="fa fa-edit"></i></small>
		      </h1>
		      <ol class="breadcrumb">
		        <li><a href="/backend/#/app/dashboard"><i class="fa fa-dashboard"></i>{{$t("message.dashboard")}}</a></li>
		        <li class="active">{{$t("message.article_editor")}}</li>
		      </ol>
		    </section>

		    <!-- Main content -->
		    <section class="content">

		    	<!-- form start -->
			    <form ref="datum-form" class="form-horizontal" v-model="form">
			        <div class="box-body">
			            <div class="form-group" :class="{ 'has-error':form.titleerror }">
			                <label for="inputTitle" class="col-sm-2 control-label">{{$t("message.title_field")}}</label>
			                <div class="col-sm-10">
			                    <input type="text" class="form-control" id="inputTitle" v-model="form.title" v-focus>
			                    <span class="help-block" v-if="form.titleerror">{{form.titleerror}}</span>
			                </div>
			            </div>
			            <div class="form-group" :class="{ 'has-error':form.authorerror }">
			                <label for="inputAuthor" class="col-sm-2 control-label">{{$t("message.author_field")}}</label>
			                <div class="col-sm-10">
			                    <!-- <input type="hidden" class="form-control" id="inputAuthor" v-model="form.user_id"> -->
			                    <select class="form-control" id="inputAuthor">
			                    	<option value=""></option>
			                    </select>
			                    <span class="help-block" v-if="form.authorerror">{{form.authorerror}}</span>
			                </div>
			            </div>
			            <div class="form-group" :class="{ 'has-error':form.categoryerror }">
			                <label for="inputCategory" class="col-sm-2 control-label">{{$t("message.category_field")}}</label>
			                <div class="col-sm-10">
			                    <!-- <input type="hidden" class="form-control" id="inputCategory" v-model="form.category_id"> -->
			                   	<select class="form-control" id="inputCategory">
			                   		<option value=""></option>
			                   	</select>
			                    <span class="help-block" v-if="form.categoryerror">{{form.categoryerror}}</span>
			                </div>
			            </div>
			            <div class="form-group">
			                <label for="inputKeywords" class="col-sm-2 control-label">{{$t("message.keyword_field")}}</label>
			                <div class="col-sm-10">
			                    <input type="text" class="form-control" id="inputKeywords" v-model="form.keywords">
			                </div>
			            </div>

			            <div class="form-group">
			            	<label class="col-sm-2 control-label">&nbsp;</label>
			            	<div class="col-sm-10">
			            		<label for="inputApproved" class="checkbox-label">
			            			{{$t("message.approved_field")}}
			            			<input id="inputApproved" name="approved" type="checkbox" v-model="form.approved" value="1" />
			            		</label>

			            		<label for="inputAtTop" class="checkbox-label">
			            			{{$t("message.at_top_field")}} 
			            			<input id="inputAtTop" name="at_top" type="checkbox" v-model="form.at_top" value="1" />
			            		</label>

			            		<label for="inputWatermark" class="checkbox-label">
			            			{{$t("message.watermark_field")}}
			            			<input id="inputWatermark" name="watermark" class="checkthis" checked="checked" type="checkbox" v-model="form.watermark" value="1" />
			            		</label>

		            			<div class="input-group date pull-left col-sm-3">
									<div class="input-group-addon">
										<i class="fa fa-calendar"></i>
									</div>
									<input type="text" readonly class="form-control pull-right" id="inputStartTime" v-model="form.start_time" :placeholder="placeholders.start_time">
									<div class="input-group-addon" @click="clearStartTime">
										<i class="fa fa-times"></i>
									</div>
				                </div>

			            		<button type="button" class="btn btn-default pull-right" @click="gotoList">{{$t("message.article_list")}}</button>
			            		<button type="button" class="btn btn-info pull-right" @click="submitForm">{{$t("message.submit_btn")}}</button>
			            	</div>
			            </div>

			            <div class="form-group">
			            	<div id="editor"></div>
			            </div>
			        </div>
			    
			    </form><!-- EO form -->

		    </section>
		</div>

		<Modal elementId="panorama-form-modal" 
			   :title="panorama_modal_title" 
			   :showActions="true"
			   :onSave="onSavePanorama">
			<form ref="panorama-form" class="form form-horizontal" v-model="panorama_form" enctype="multipart/form-data">
				<div class="box-body">
					<div class="form-group">
		                <label for="inputPanorama" class="col-sm-2 control-label">{{$t("message.panorama")}}</label>
		                <div class="col-sm-10">
		                    <input type="file" name="file[]" class="form-control" id="inputPanorama">
		                </div>
		            </div>
				</div>
			</form>
		</Modal>

		<Modal elementId="marco-form-modal" 
			   :title="marco_modal_title" 
			   :showActions="true"
			   :onSave="onSaveMarco">
			<form ref="marco-form" class="form form-horizontal" v-model="marcomarco_form" enctype="multipart/form-data">
				<div class="box-body">
					<div class="form-group">
		                <label for="inputMarcoLeft" class="col-sm-3 control-label">{{$t("message.marco_left")}}</label>
		                <div class="col-sm-9">
		                    <input type="file" name="file[]" class="form-control" id="inputMarcoLeft">
		                </div>
		            </div>
		            <div class="form-group">
		                <label for="inputMarcoRight" class="col-sm-3 control-label">{{$t("message.marco_right")}}</label>
		                <div class="col-sm-9">
		                    <input type="file" name="file[]" class="form-control" id="inputMarcoRight">
		                </div>
		            </div>
				</div>
			</form>
		</Modal>

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

let init_author_selection = (app) => {
	
	$("#inputAuthor").select2({
		ajax: {
			url: "/api/users/get_list",
		    dataType: 'json',
		    delay: 1250,
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

			let id = element.data('user-id');

			if(id === undefined){
				return ;
			}

			$.ajax({
                url:'/api/users/get_list?id='+id,
                dataType:'json'
            }).done((data) => {
            	app.form.user_id = data.id;
                let select2_data = {id: data.id, text: data.name, name: data.name};
                callback(select2_data);
            });
		},
		escapeMarkup (markup) {
		    return markup;
		},//eo escapeMarkup
		templateResult(record) {
			return "<div class=\"clearfix\">" + record.name + " ( "+record.display_name+" )" + "<div>";
		},
		templateSelection (record) {
			return record.name || record.text;
		}
	}).on('change', (event) => {
		let user_id = $('#inputAuthor').select2('val');
		app.form.user_id = user_id;
	});
};

let init_category_selection = (app) => {

	$("#inputCategory").select2({
		ajax: {
			url: "/api/categories/get_list",
		    dataType: 'json',
		    delay: 1250,
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
		gotoList() {
			this.$router.push('/app/articles');
		},
		submitForm() {

			// console.info('form:', this.form);return;
			// console.info('this.form.category_id:', this.form.category_id);
			// console.info('this.form.user_id:', this.form.user_id);
			
			this.form.abstract = _.trim($('#editor').summernote('code').replace(/<\/?[^>]+(>|$)|\&nbsp;|\r?\n/g, ""));

			if(!this.form.category_id) {
				toastr(this.$t("message.please_select_category"), this.$t("message.error"), 'error');
			} else if(!this.form.user_id) {
				toastr(this.$t("message.please_select_user"), this.$t("message.error"), 'error');
			} else if(!this.form.title) {
				toastr(this.$t("message.please_fill_title"), this.$t("message.error"), 'error');
			} else if(!this.form.abstract) {
				toastr(this.$t("message.please_write_something"), this.$t("message.error"), 'error');
			} else {

				this.form.content = $('#editor').summernote('code');

				this.$http.put('/api/articles', this.form)
				.then((result) => {

					if(result.status === 200 && result.data.success){

						toastr(this.$t("message.article_saved"), this.$t("message.success"), 'success');

					} else {
						toastr(this.$t("message.unable_to_save"), this.$t("message.error"), 'error');
					}

				}, (error) => {
					console.error('error@saving article:', error);
					toastr(this.$t("message.unable_to_save"), this.$t("message.error"), 'error');
				});
			}

		},
		clearStartTime() {
			$('#inputStartTime').val('');
		},
		onSavePanorama() {
			let $editor = $('#editor');
			let $modal  = $('#panorama-form-modal');
			let $form   = $modal.find('form');
			let files   = $modal.find('input[type=file]');
			let app     = this;

			// console.info('files:', files);

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
					formData.append('model_name', 'Article');
					formData.append('type', '2020');
					formData.append('watermark', app.form.watermark ? 'yes' : 'no');

					app.$http
					.post('/api/images', formData)
				    .then((result) => {

				    	$form.get(0).reset();
				    	
				    	if(result.status === 200 && result.data.success){

				    		let image_srcs = result.data.urls;
				    		let images     = result.data.images;
				    		
				    		$editor.summernote('insertImage', image_srcs[0], function($image){
				    			$image.css('maxHeight', '300px');
								$image.addClass('pano-photos hide-pano-photo').attr('title', app.$t("message.panorama"));
							});

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
		onSaveMarco() {
			let $editor = $('#editor');
			let $modal = $('#marco-form-modal');
			let $form  = $modal.find('form');
			let files  = $modal.find('input[type=file]');
			let app    = this;

			// console.info('files:', files);

			if(files.length){

				let file_count = 0;

				_.each(files, (file, idx) => {
					if(file.files.length){
						file_count++;
					}
				});

				if(file_count === 2){
					
					let formData = new FormData($form.get(0));
		
					formData.append('record_id', app.form.id);
					formData.append('model_name', 'Article');
					formData.append('type', '2020');
					formData.append('watermark', app.form.watermark ? 'yes' : 'no');

					app.$http
					.post('/api/images', formData)
				    .then((result) => {

				    	$form.get(0).reset();
				    	
				    	if(result.status === 200 && result.data.success){

				    		let image_srcs      = result.data.urls;
				    		let images          = result.data.images;
				    		let marco_html      = '';
				    		let _prv_width      = 0;
				    		let _prv_height     = 0;
				    		let is_width_wrong  = false;
				    		let is_height_wrong = false;

				    		//Check if two images have the same sizes
				    		_.each(images, (img, idx) => {
				    			if(_prv_width === 0){
				    				_prv_width = img.width;
				    			}

				    			if(img.width != _prv_width){
				    				is_width_wrong = true;
				    			}

				    			if(_prv_height === 0){
				    				_prv_height = img.height;
				    			}

				    			if(img.height != _prv_height){
				    				is_height_wrong = true;
				    			}
				    		});

				    		if(is_width_wrong || is_height_wrong){

				    			toastr(this.$t("message.marco_image_dimension_dismatch"), this.$t("message.warning"), 'warning');

				    			return false;
				    		}

				    		_.each(image_srcs, (url, idx) => {
				    			marco_html += '<img src="'+url+'" class="marco-photos half-marco-photo" />';
				    		});

				    		if(marco_html){
				    			$editor.summernote('insertNode', $('<div class="marco-container" title="'+app.$t("message.marcomarco")+'">' + marco_html + '</div><br/>').get(0));
				    		}	

				    		app.bus.$emit('open-loading-dialog', false);
				    		$modal.modal('hide');
				    	} else {
				    		console.error('Unable to parse the image URL.');
				    	}

				    }, (error) => {
				    	console.error('Error@uploading the image:', error);
				    });					

				} else {
					toastr(this.$t("message.please_select_2_images"), this.$t("message.error"), 'error');
				}

	    		

	    	} else {
	    		toastr(this.$t("message.please_select_image"), this.$t("message.error"), 'error');
	    	}

	    	return true;
		}//eo onSaveMarco
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
		let id  = this.$route.params.id;

		let PanoButton = (context) => {
			var ui = $.summernote.ui;

			// create button
			var button = ui.button({
				contents: '<i style="" class="fa fa-camera-retro"></i>',
				tooltip: 'Upload Panorama',
				click: function () {

					$('#panorama-form-modal').modal('show');					

					app.uploadPanoVisiable               = true;
					app.upload_pano_params['record_id']  = app.form.id;
					app.upload_pano_params['model_name'] = 'Article';
					app.upload_pano_params['type']       = 'panorama';
					app.upload_pano_params['watermark']  = app.form.watermark ? 'yes' : 'no';
				}
			});

			return button.render();   // return button as jquery object 
		}

		let TwentyTwentyButton = (context) => {
	  		var ui = $.summernote.ui;
	  		
	  		var button = ui.button({
			    contents: '<i style="" class="fa fa-columns"></i>',
			    tooltip: 'Marco Marco',
			    click: function () {

			    	let $modal = $('#marco-form-modal');

			    	$modal.modal('show');

			    	app.upload2020Visiable               = true;
			    	app.upload_2020_params['record_id']  = app.form.id;
			    	app.upload_2020_params['model_name'] = 'Article';
			    	app.upload_2020_params['type']       = '2020';
			    	app.upload_2020_params['watermark']  = app.form.watermark ? 'yes' : 'no';
			    }
		  	});

		  	return button.render();   // return button as jquery object 	
	  	};

		$editor = $('#editor').summernote({
			height:    500,
			maxHeight: 500,
			toolbar: [
				['style',    ['style']],
		        ['font',     ['bold', 'underline', 'clear']],
		        ['fontname', ['fontname']],
		        ['fontsize', ['fontsize']],
		        ['color',    ['color']],
		        ['para',     ['ul', 'ol', 'paragraph']],
		        ['table',    ['table']],
		        ['insert',   ['link', 'picture', 'video', 'pano', 'twenty']],
		        ['view',     ['fullscreen', 'codeview', 'help']]
			],
			buttons: {
			    pano: PanoButton,
			    twenty: TwentyTwentyButton
			},
			callbacks: {
				onImageUpload (files) {

					// console.info('files:', files);
					
					app.bus.$emit('open-loading-dialog', true);

					let formData = new FormData();
		
					_.each(files, (file, idx) => {
						formData.append('file[]', file);
					});

					formData.append('record_id', app.form.id);
					formData.append('model_name', 'Article');
					formData.append('watermark', app.form.watermark ? 'yes' : 'no')

					app.$http
					.post('/api/images', formData)
				    .then((result) => {
				    	
				    	if(result.status === 200 && result.data.success){
				    		_.each(result.data.urls, (url) => {
				    			$editor.summernote('insertImage', url);
				    		});
				    		app.bus.$emit('open-loading-dialog', false);
				    	} else {
				    		console.error('Unable to parse the image URL.');
				    	}

				    }, (error) => {
				    	console.error('Error@uploading the image:', error);
				    });

				},//eo onImageUpload

				onPaste (e) {
					var bufferText = ((e.originalEvent || e).clipboardData || window.clipboardData).getData('Text');
					var $node = $('<div>' + _newp(bufferText) + '</div>');

					$editor.summernote('insertNode', $node.get(0));

					e.preventDefault();

					return false;
				}				
			}
		});

		let $input = $('input');

		$input.iCheck({
			checkboxClass: 'icheckbox_flat-green',
			radioClass: 'iradio_flat-green'
		}).on('ifChanged', (event)=>{
			let name    = event.target.name;
			let checked = event.target.checked;

			if(name === 'at_top' || name === 'approved'){
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

		
		

		app.bus.$on('set.form.user_id', (user_id) => {
			$('#inputAuthor').data('user-id', user_id).trigger('change');
			init_author_selection(app);
		});

		app.bus.$on('set.form.category_id', (category_id) => {
			$('#inputCategory').data('category-id', category_id).trigger('change');
			init_category_selection(app);
		});

		if(id !== undefined){//edit mode

			this.$http.get('/api/articles/' + id).then((result) => {

				if(result.status === 200 && result.data.success){

					app.form = Object.assign({}, app.form, result.data.record);

					app.$refs['datum-form'].reset();

					$editor.summernote('code', app.form.content);
					
					app.bus.$emit('set.form.user_id', app.form.user_id);
					app.bus.$emit('set.form.category_id', app.form.category_id);

				}else{
					toastr(result.message, this.$t("message.error"), 'error');
					app.$router.back();
				}

			}, (error) => {
				console.error('/api/articles/new', error);
				toastr(error.statusText, this.$t("message.error"), 'error');
			});

		} else {//add mode
			this.$http.get('/api/articles/new').then((result) => {

				if(result.status === 200 && result.data.success){

					app.form = Object.assign({}, app.form, result.data.record);

					app.$refs['datum-form'].reset();

					$editor.summernote('code', app.form.content);
					
					app.bus.$emit('set.form.user_id', app.form.user_id);
					app.bus.$emit('set.form.category_id', app.form.category_id);

				}else{
					toastr(result.message, this.$t("message.error"), 'error');
					app.$router.back();
				}

			}, (error) => {
				console.error('/api/articles/new', error);
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
			panorama_modal_title: this.$t("message.panorama"),
			panorama_form: {
			},
			marco_modal_title: this.$t("message.marcomarco"),
			marcomarco_form: {
			},
			placeholders: {
				start_time: this.$t("message.start_time")
			},
			bus: new Vue(),
			activeItem: 'add_article',
			messages:[],
			notifications:[],
			tasks:[],
			userprofile: null,
			showToggleButton: true,
			upload_pano_params: {},
			upload_2020_params: {},
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