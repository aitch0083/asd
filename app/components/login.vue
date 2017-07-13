<template>
	<div class="login-form">
		<legend>ASD - {{title}}</legend>
		<time>{{time}}</time>
	</div>
</template>

<script>
import axios  from 'axios';
import _      from 'lodash';

let component = {
	name: 'login-form',
	data() {
		return {
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

<style></style>