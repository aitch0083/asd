import Vue from 'vue';
import VueRouter from 'vue-router';

import router from './router';

Vue.use(VueRouter);

let Store = () => {

	let _states = {};

	return {
		'$get': (name) => {
			return _states[name] ? _states[name] : null;
		},
		'$set': (name, value) => {
			_states[name] = value;
		}
	};

};

let $state = Store();

let MyPi = (Vue, options) => {
	Vue.directive('focus', {
		inserted: (el) => {
			el.focus();
		}
	});

	Vue.prototype.$getState = () => {
		return $state;
	};
};

Vue.use(MyPi);

new Vue({
	router,
	el: '#app'
});