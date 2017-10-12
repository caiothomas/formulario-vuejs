<template>           
  <div class="col-sm-5 col-md-offset-4">      
  <div class="row">  
  <div class="panel-body">
  <div class="page-header">
    <h2>Login</h2>
  </div>  
      
    <div style="margin:20px 0;">
      <span class="psw">Novo Usuário? <router-link :to="{ name: 'cadastro-usuario'}">Faça seu cadastro</router-link>.</span>
      </div>

    <div class="alert alert-danger" v-if="error">
        {{ error }}
    </div>  
    <vue-form-generator :schema="schema" :model="model" :options="formOptions" ></vue-form-generator>
  </div>
  </div>
  </div>
</template>

<script>
import VueFormGenerator from "vue-form-generator";
import auth from '../auth'

export default {
  components:{
    "vue-form-generator": VueFormGenerator.component
  },
  data() {
  	return {
      error: false,
      model:{
          email:"caio@thomas.com",
          password:"123456789"
      },
    schema: {
      fields: [{
          type: "input",
          inputType: "email",
          label: "E-mail",
          model: "email",
          required: true,  
          featured: true,                
          validator: VueFormGenerator.validators.email        
      },{
        type: "input",
        inputType: "password",
        label: "Senha",
        model: "password",
        min: 6,
        required: true,
        validator: VueFormGenerator.validators.string
      },
      {
          type: "submit",
          buttonText: "Login",
          onSubmit: this.onValidated,
          validateBeforeSubmit: true
        }]
    },      	   
    formOptions: {
      validateAfterLoad: true,
      validateAfterChanged: true
    }
  }
  },
  methods: {
      onValidated(isValid, errors) {
        auth.login(this, isValid, 'dashboard');
      }
  }  
}
</script>