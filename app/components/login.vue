<template>
	<div class="login-module">
		<AdminHeader 
			:messages="messages" 
			:notifications="notifications" 
			:tasks="tasks" />
		<div class="content-wrapper">

			<div class="box box-info login-form">
			    <div class="box-header with-border">
			        <h3 class="box-title">{{$t("message.login_form_title")}}</h3>
			    </div>
			    <!-- /.box-header -->
			    <!-- form start -->
			    <form ref="login-form" class="form-horizontal" v-model="form">
			        <div class="box-body">
			            <div class="form-group" :class="{ 'has-error':form.emailerror }">
			                <label for="inputEmail" class="col-sm-2 control-label">{{$t("message.email_field")}}</label>
			                <div class="col-sm-10">
			                    <input type="email" class="form-control" id="inputEmail" v-model="form.email">
			                    <span class="help-block" v-if="form.emailerror">{{form.emailerror}}</span>
			                </div>
			            </div>
			            <div class="form-group" :class="{ 'has-error':form.passworderror }">
			                <label for="inputPassword" class="col-sm-2 control-label">{{$t("message.password_field")}}</label>
			                <div class="col-sm-10">
			                    <input type="password" class="form-control" id="inputPassword" v-model="form.password">
			                    <span class="help-block" v-if="form.passworderror">{{form.passworderror}}</span>
			                </div>
			            </div>
			        </div>
			        <!-- /.box-body -->
			        <div class="box-footer">
			            <button type="button" class="btn btn-default pull-right" @click="resetForm">{{$t("message.cancel_btn")}}</button>
			            <button type="button" class="btn btn-info pull-right" @click="submitForm">{{$t("message.submit_btn")}}</button>
			        </div>
			        <!-- /.box-footer -->
			    </form>
			</div><!-- EO box-info --> 
			
        </div><!-- EO content-wrapper -->
	</div>
</template>

<script>
import axios  from 'axios';
import _      from 'lodash';
import anchorme from 'anchorme';

import AdminHeader from './admin.header.vue';

let component = {
	name: 'login-form',
	components: {
		AdminHeader
	},
	methods: {

		submitForm(event) {

			let email    = this.form.email;
			let password = this.form.password;
			let isOkay   = true;

			this.form.emailerror    = null;
			this.form.passworderror = null;

			if(!anchorme.validate.email(email)){
				this.form.emailerror = this.$t("message.invalid_email");
				isOkay = false;
			}

			if(!password.length){
				this.form.passworderror = this.$t("message.invalid_password");
				isOkay = false;
			}

			event.preventDefault();
		},//eo submitForm

		resetForm(event) {
			this.$refs['login-form'].reset();
			event.preventDefault();
		}//eo resetForm

	},//eo methods
	data() {
		return {
			form: {
				email: '',
				password: '',
				emailerror: null,
				passworderror: null
			},
			messages: [],
			tasks: [],
			notifications: [],
			title: component.name,
			time: this.$moment.format('YYYY MMMM DD, hh:mm:ss')
		}
	},//eo data
	beforeMount() {
	},//eo beforeMount
	mounted() {
	},//eo mounted
};//eo component 

export default component;
</script>

<style>
.btn{
	margin-right: 0.5rem;
}
.wrapper{
	background-color: #ECF0F5 !important;
}
.content-wrapper{
	width: 100%;
	margin-left: 0px; 
}
.login-form{
	width: 40%;
	margin: 7% auto;
}
</style>