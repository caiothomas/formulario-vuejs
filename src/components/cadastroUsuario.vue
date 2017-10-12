<template>            
  <div class="panel-body">
  <div class="page-header">
    <h2>Cadastro de Usuario</h2>
  </div>  

    <div class="alert alert-danger" v-if="error">
        {{ error }}
    </div>  
    <vue-form-generator :schema="schema" :model="model" :options="formOptions" ></vue-form-generator>
  </div>
</template>

<script>
import VueFormGenerator from "vue-form-generator";


export default {
  components:{
    "vue-form-generator": VueFormGenerator.component
  },
  props: ['errors'],
  data() {
  	return {
      error: false,
      model:{
          nome:"caiothomas",
          email:"caio@thomas.com",
          password:"123456789"
      },
    schema: {
      fields: [{
        type: "input",
        inputType: "text",
        label: "Nome",
        model: "nome",
        featured: true,
        required: true,
        validator: VueFormGenerator.validators.string        
      },{
        type: "input",
        inputType: "password",
        label: "Senha",
        model: "password",
        min: 6,
        required: true,
        hint: "Pelo menos 6 caracteres",
        validator: VueFormGenerator.validators.string
      },
        {
          type: "input",
          inputType: "email",
          label: "E-mail",
          model: "email",
          required: true,  
          featured: true,                
          validator: VueFormGenerator.validators.email        
      },{
          type: "submit",
          buttonText: "Registrar",
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
        console.log("item" , isValid);
        var uri = this.axios.defaults.baseURL + '/auth/cadastro';
        this.axios.post(uri, isValid).then((response) => {
          console.log("cadastro user", response)
          this.error = false;
          this.$router.push({name: 'home'})
        }).catch(error => {
          this.error =  error.response.data.message;
          console.log("impime", error.response.data.message)
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
      });
    }
  }  
}
</script>