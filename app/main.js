import Vue from 'vue';
import VueRouter from 'vue-router';

import router from './router';
import moment from '../libs/moment';

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

	Vue.prototype.$moment = moment;
};

Vue.use(MyPi);

new Vue({
	router,
	el: '#app'
});