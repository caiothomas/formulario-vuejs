<template>            
  <div class="panel-body">
  <div class="page-header">
    <h2>Responda o Questionário<small><span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span></small> {{nome}}</h2>
  </div>

    <div class="alert alert-danger" v-if="error">
        {{ error }}
    </div>  

    <div class="panel panel-default" v-if="desc">
      <div class="panel-heading">Descricao</div>
      <div class="panel-body">
        {{desc}}
      </div>
    </div>

    <div v-if="!showForm">
      <h1>Questionário respondido com sucesso</h1>    
      <div style="font-size:15em;text-align:center; color:#ccc">:)</div>
    </div>  


    <div class="panel panel-default" v-if="showForm">
      <div class="panel-heading">Formulario</div>
      <div class="panel-body">
            <vue-form-generator :schema="schema" :model="model" :options="formOptions" ></vue-form-generator>
      </div>
    </div>


   <div class="panel panel-default">
      <div class="panel-heading">Model</div>
      <div class="panel-body">
        <pre v-if="model" v-html="prettyJSON(model)"></pre>
      </div>
    </div>

    <div class="panel panel-default">
      <div class="panel-heading">Schema</div>
      <div class="panel-body">
        <pre v-if="model" v-html="prettyJSON(schema)"></pre>
      </div>
    </div> 

  </div>
</template>

<script>
import VueFormGenerator from "vue-form-generator";
import _ from "underscore"

export default {
  components:{
    "vue-form-generator": VueFormGenerator.component
  },
  data() {
  	return {
      error: false,
      showForm: true,
      nome:"",
      desc: "",      
      model:{
          email:"caio.thomas@hotmail.com",
      },
    schema: {
      fields: []
      },      	   
      formOptions: {
        validateAfterLoad: true,
        validateAfterChanged: true
      }
    }
  },
  created: function()
  {
      this.fetchData();
  },  
  methods: {

      createEmail(){
        return {
          type: "input",
          inputType: "email",
          label: "E-mail",
          model: "email",
          required: true,  
          featured: true,                
          validator: VueFormGenerator.validators.email        
        };
      },

      createSubmit(){
        return {
          type: "submit",
          buttonText: "Enviar",
          onSubmit: this.onValidated,
          validateBeforeSubmit: true
        };
      },

      createText(node) {
        this.model = _.clone(_.extend(this.model,  {[node._id]: ""})); 
        return {
            type: "textArea",
            label: node.pergunta,
            model: node._id,
            required: true,              
            featured: true,                            
            hint: "No maximo 200 caracteres.",
            max: 200,
            rows: 2,
            validator: VueFormGenerator.validators.string
        };
      },

      createRadio(node) {
        this.model = _.clone(_.extend(this.model,  {[node._id]: ""})); 
        return {
              type: "radios",
              label: node.pergunta,
              model: node._id,
              required: true,     
              featured: true,                           
              values: node.opcao,
              validator: VueFormGenerator.validators.required             
          };
      },

      createCheckbox(node) {
        this.model = _.clone(_.extend(this.model,  {[node._id]: ""})); 
        return {
          type: "checklist",
          listBox: true,          
          required: true,            
          featured: true,                          
          label: node.pergunta,
          validator: VueFormGenerator.validators.required,          
          model: node._id,
          values: function() {
            return node.opcao
          },
        }
      },

      fetchData () {
        console.log("execute fetchData")
        var id = this.$route.query.id || this.$route.params.id;        
        var uri = this.axios.defaults.baseURL + '/form/view/';

        if(id){
          this.axios.get(uri+id).then((response) => {
              console.log("cadastro user", response.data)  
              this.nome = response.data.nome;            
              this.desc = response.data.desc;            
              var itemsForm = response.data.perguntas;
              if(itemsForm){
                this.schema.fields.push(this.createEmail());

                for(var i=0; i<itemsForm.length; i++){
                  if(itemsForm[i].tipo == 'text'){
                    console.log("items", itemsForm[i])                    
                    //console.log("items", itemsForm[i])
                    console.log("set ", this.createText(itemsForm[i]))
                    this.schema.fields.push(this.createText(itemsForm[i]))
                  } else if(itemsForm[i].tipo == 'radio'){
                    this.schema.fields.push(this.createRadio(itemsForm[i]))                                        
                  } else if(itemsForm[i].tipo == 'checkbox'){
                    this.schema.fields.push(this.createCheckbox(itemsForm[i]))                                        
                  }
                }
                this.schema.fields.push(this.createSubmit());
              } else {
                this.error = "Formulario nao encontrado!";
                this.schema.fields = null;
              }
              //this.$router.push({name: 'home'})
            }).catch(error => {
              this.error =  error.response.data.message;
          });
        } else {
            this.error =  "Erro ao recuperar o parametro de ID";
        }
      },
      prettyJSON: function(json) {
                if (json) {
                    json = JSON.stringify(json, undefined, 4);
                    json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
                    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
                        var cls = 'number';
                        if (/^"/.test(match)) {
                            if (/:$/.test(match)) {
                                cls = 'key';
                            } else {
                                cls = 'string';
                            }
                        } else if (/true|false/.test(match)) {
                            cls = 'boolean';
                        } else if (/null/.test(match)) {
                            cls = 'null';
                        }
                        return '<span class="' + cls + '">' + match + '</span>';
                    });
                }
      },

      onValidated(isValid, errors) {
          console.log("Validation result: ", isValid, ", Errors:", errors);
            var uri = this.axios.defaults.baseURL + '/form/resposta';
            var id = this.$route.query.id || this.$route.params.id            
            var json = {form: id,  resposta: []};
            var resp = [];

            for (var key in isValid) {
              if(key == "email"){
                json.email = isValid[key];                
              } else {
                var aux = {
                  _id : key,
                  resp : isValid[key]
                }
                resp.push(aux);
              }
            }
            
            json.resposta = JSON.stringify(resp);
            console.log(json);

            this.axios.post(uri, json).then((response) => {
              console.log("cadastro resposta", response)
              if(response.status == 200){
                this.showForm = false;
                this.error = false;
              }else
                this.error =  error.response.data.message;            
            }).catch(error => {
              this.error =  error.response.data.message;
              console.log("impime", error.response.data.message)
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response.headers);
          }); 
      },
      addResposta(){
        
        /*
       console.log("param ", this.$route.query.id)
        var id = this.$route.query.id;
        if(id){
            var uri = this.axios.defaults.baseURL + 'api/form/view/';
            this.axios.post(uri, this.model).then((response) => {
              console.log("cadastro user", response)
              this.$router.push({name: 'home'})
            }).catch(error => {
              this.error =  error.response.data.message;
              console.log("impime", error.response.data.message)
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response.headers);
          });
        } */
      }
  }  
}
</script>