<template>
<div id="wrapper">
  <nav class="navbar navbar-default">
    <div class="container">
      <a class="navbar-brand">
        Questionario
        <i class="glyphicon glyphicon-question-sign"></i>          
      </a>
      <ul class="nav navbar-nav">
        <li v-if="!user.authenticated"><router-link :to="{ name: 'login'}">Login</router-link></li>
        <li v-if="!user.authenticated"><router-link :to="{ name: 'cadastro-usuario'}">Cadastro de Usuario</router-link></li>                

        <li v-if="user.authenticated"><router-link :to="{ name: 'dashboard'}">Todos Formularios</router-link></li>
        <li v-if="user.authenticated"><router-link :to="{ name: 'create-form'}">Criar Formulario</router-link></li>        

        <li v-if="user.authenticated"><router-link :to="{ name: 'login' }"><span @click="logout()">Logout</span></router-link></li>

        <!--<li v-if="user.authenticated"><a v-link="'login'" @click="logout()">Logout</a></li>-->
      </ul>
    </div> 
  </nav>
  <div class="container">
    <div class="col-sm-12">      
      <div class="row">            
        <router-view></router-view>
      </div>
    </div>
  </div>  
<div class="footer"></div>
</div>

</template>

<style>
@import url(https://unpkg.com/vue-form-generator@2.0.0/dist/vfg.css);
.footer {
  padding-bottom: 150px;
}
.form-row {
  border:  1px solid #e2e2e2;
  margin:  10px;
  padding: 20px;
  background: #f2f2f2;
}
.subrow {
  margin: 5px;
  padding:  5px;
}

pre {
  overflow: auto;
}
  pre .string { color: #885800; }
  pre .number { color: blue; }
  pre .boolean { color: magenta; }
  pre .null { color: red; }
  pre .key { color: green; }    

h1 {
  text-align: center;
  font-size: 36px;
  margin-top: 20px;
  margin-bottom: 10px;
  font-weight: 500;
}

fieldset {
  border: 0;
}

.panel {
  margin-bottom: 20;
  background-color: #fff;
  border: 1px solid transparent;
  border-radius: 4px;
  -webkit-box-shadow: 0 1px 1px rgba(0, 0, 0, .05);
  box-shadow: 0 1px 1px rgba(0, 0, 0, .05);
  border-color: #ddd; 
}

.panel-heading {
  color: #333;
  background-color: #f5f5f5;
  border-color: #ddd;

  padding: 10px 15px;
  border-bottom: 1px solid transparent;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;        
}

.panel-body {
  padding: 15px;
}       

.field-checklist .wrapper {
  width: 100%;
}    

input[type=submit] {
  color: #fff;
  background-color: #337ab7;
  border: 0px;
  display: inline-block;
  padding: 6px 12px;
  margin-bottom: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.42857143;
  text-align: center;
  vertical-align: middle;    
  user-select: none;
  border-radius: 4px;  
} 
</style>
<script>
import auth from './auth.js'

export default {  
  data() {
    return {
      user: auth.user
    }
  },
  methods: {
    logout() {
      auth.logout(this, 'login')
    }
  }
}
</script>