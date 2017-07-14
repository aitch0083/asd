import Vue from 'vue';
import VueRouter from 'vue-router';
import VueI18n from 'vue-i18n'
import VueResource from 'vue-resource';
import cookie from 'browser-cookies';

import router from './router';
import moment from '../libs/moment';
import config from '../configs/global.config';
import translationPot from '../langs';

Vue.use(VueRouter);
Vue.use(VueI18n);
Vue.use(VueResource);

let Store = () => {

	let type_mapping = {};

	return {
		'$get': (name) => {

			var _t = type_mapping[name] || 'string';
			var _v = cookie.get(name);

			if(_t === 'object'){
				_v = JSON.parse(_v);
			}

			return _v;
		},
		'$set': (name, value) => {

			var _t = typeof value;
			
			type_mapping[name] = _t;

			if(_t === 'object'){
				value = JSON.stringify(value);
			}

			cookie.set(name, value);
		},
		'$del': (name) => {
			cookie.erase(name);
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

	Vue.filter('capitalize', function (value) {
		if (!value) return ''
		value = value.toString()
		return value.charAt(0).toUpperCase() + value.slice(1)
	});

	Vue.prototype.$moment = moment;
	Vue.prototype.$config = config;
	Vue.prototype.$state  = $state;
};

Vue.use(MyPi);

let i18n = new VueI18n({
	locale: config.locale,
	messages: translationPot
});

new Vue({
	router,
	i18n,
	el: '#app'
});