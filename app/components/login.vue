<template>
	<div class="login-module">
		<AdminHeader 
			:messages="messages" 
			:notifications="notifications" 
			:tasks="tasks" />
		<div class="content-wrapper"></div>
	</div>
</template>

<script>
import axios  from 'axios';
import _      from 'lodash';

import AdminHeader from './admin.header.vue';

let component = {
	name: 'login-form',
	components: {
		AdminHeader
	},
	data() {
		return {
			messages: [],
			tasks: [],
			notifications: [],
			title: component.name,
			time: this.$moment.format('YYYY MMMM DD, hh:mm:ss')
		}
	},
	beforeMount() {
	},
	mounted() {
	},
	methods: {
	}
};//eo component 

export default component;
</script>

<style>
.content-wrapper{
	width: 100%;
	margin-left: 0px; 
}
</style>