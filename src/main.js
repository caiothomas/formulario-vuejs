import Vue from 'vue';
import VueRouter from 'vue-router'
Vue.use(VueRouter)

import VueAxios from 'vue-axios';
import axios from 'axios';
Vue.use(VueAxios, axios);


axios.defaults.baseURL = 'http://localhost:4000/api';


import auth from './auth'

axios.defaults.headers.common['authorization'] = auth.getAuthHeader();

// Check the user's auth status when the app starts
auth.checkAuth()

//axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
//axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

import App from './App.vue';

import cadastroUsuario from './components/cadastroUsuario.vue'
import login from './components/login.vue'
import dashboard from './components/displayForm.vue';
import viewForm from './components/viewForm.vue';
import relatorio from './components/relatorio.vue';
import grafico from './components/graficos.vue';
import CreateForm from './components/createForm.vue';

function requireAuth (to, from, next) {
  if (!auth.checkAuth()) {
    next({
      path: '/',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
}

const routes = [
	{
		path: '*',
		redirect: { name: 'login' }
	},
	{
		name: 'cadastro-usuario',
		path: '/cadastro-usuario',
		component: cadastroUsuario
	},
	{
		name: 'login',
		path: '/',
		component: login,
	},	
	{
		name: 'dashboard',
		path: '/dashboard',
		component: dashboard,
        beforeEnter: requireAuth		
	},
	{
		name: 'create-form',
		path: '/create-form',
		component: CreateForm,
        beforeEnter: requireAuth		
	},		
	{
		name: 'view-form',
		path: '/view-form',
		component: viewForm
	},	
	{
		name: 'relatorio',
		path: '/relatorio',
		component: relatorio,
        beforeEnter: requireAuth				
	},			
	{
		name: 'grafico',
		path: '/grafico',
		component: grafico,
        beforeEnter: requireAuth				
	}	
];


// fallback route
const router = new VueRouter({ routes: routes });
new Vue(Vue.util.extend({router}, App)).$mount('#app');

//https://stackoverflow.com/questions/41364891/load-form-data-via-rest-into-vue-form-generator