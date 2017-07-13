import Vue from 'vue';
import VueRouter from 'vue-router';
import VueI18n from 'vue-i18n'

import router from './router';
import moment from '../libs/moment';
import translationPot from '../langs';

Vue.use(VueRouter);
Vue.use(VueI18n)

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

let i18n = new VueI18n({
	locale: 'en',
	messages: translationPot
});

new Vue({
	router,
	i18n,
	el: '#app'
});