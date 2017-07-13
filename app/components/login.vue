<template>
	<div class="login-form">
		<legend>ASD - {{title}}</legend>
	</div>
</template>

<script>
import axios  from 'axios';
import _      from 'lodash';

let component = {
	name: 'login-form',

	data() {
		return {
			title: component.name
		}
	},
	beforeMount(){
	},
	mounted() {
		console.info(component.name, 'loaded');
	},
	methods: {

	}
};//eo component 

export default component;
</script>

<style></style>