<template>            
  <div class="panel-body">
  <div class="page-header">
    <h2>Relatório<small><span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span></small> {{nome}}</h2>
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
  
  <div class="form-group" v-if="email.length > 0">
    <label for="sel1">Selecione uma resposta a patir do e-mail:</label>

    <select  class="form-control"  v-on:change="onchange">
      <option value="">E-mail</option>
      <option v-for="(user, index) in email" :value="user">{{ user }}</option>
    </select>
  </div>
  
  <div v-if="email.length > 0">
    <vue-form-generator :schema="schema" :model="model" :options="formOptions" ></vue-form-generator>
  </div>

  <div v-if="email.length <= 0">
      <h1>Questionário ainda não foi respondido!</h1>    
      <div style="font-size:15em;text-align:center; color:#ccc">:(</div>
    </div>  


   <div class="panel panel-default">
      <div class="panel-heading">Model</div>
      <div class="panel-body">
        <pre v-if="model" v-html="prettyJSON(model)"></pre>
      </div>
    </div>

  </div>
</template>

<script>
  import VueFormGenerator from "vue-form-generator";
  import auth from '../auth'
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
      email: [],
      desc: "",  
      elems: [],
      model:{},
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

      createText(node) {
        this.model = _.clone(_.extend(this.model,  {[node._id]: ""})); 
        
        return {
            type: "textArea",
            label: node.pergunta,
            model: node._id,
            disabled: true,
            featured: true,                            
        };
      },

      createRadio(node) {
        this.model = _.clone(_.extend(this.model,  {[node._id]: ""})); 
        
        return {
              type: "radios",
              label: node.pergunta,
              model: node._id,
              disabled: true,
              featured: true,                                          
              values: node.opcao,
          };
      },

      createCheckbox(node) {
        this.model = _.clone(_.extend(this.model,  {[node._id]: ""})); 
        
        return {
          type: "checklist",
          listBox: true,          
          disabled: true,
          featured: true,                                      
          label: node.pergunta,
          model: node._id,
          values: function() {
            return node.opcao
          },
        }
      },

      fetchData () {
        console.log("execute fetchData")
        
        var id = this.$route.query.id || this.$route.params.id;        
        var uri = this.axios.defaults.baseURL + '/form/relatorio/';

        if(id){
          var config = {'authorization': auth.getAuthHeader()};

          this.axios.get(uri+id,  {headers: config}).then((response) => {
              console.log("cadastro user", response.data)  
              
              this.nome = response.data.nome;            
              this.desc = response.data.desc;            
              var itemsForm = response.data.perguntas;
              var email;

              if(response.data.respostas){                            
                this.email = _.pluck(response.data.respostas, 'email');
                this.elems = response.data.respostas;                
              }

              if(itemsForm){

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
              } else {
                this.error = "Formulario nao encontrado!";
                this.schema.fields = null;
              }
              


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
            var config = {'authorization': auth.getAuthHeader()};         
    
            this.axios.post(uri, json,  {headers: config}).then((response) => {
              console.log("cadastro resposta", response)
              if(response.status == 200)
                this.showForm = false;
              else
                this.error =  error.response.data.message;            
            }).catch(error => {
              this.error =  error.response.data.message;
              console.log("impime", error.response.data.message)
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response.headers);
          }); 
      },
      onchange(event){
        var value = event.srcElement.value;

        console.log("event.srcElement.value", event.srcElement.value)
              for(var i=0; i< this.elems.length; i++){
                if(this.elems[i] && this.elems[i].resposta){
                  
                  if(this.elems[i].email == value){
                    var json = JSON.parse(this.elems[i].resposta);                    
                    for(var key in json){
                      if(json[key] && json[key]._id && json[key].resp){                        
                        _.extend(this.model, {[json[key]._id]: json[key].resp}); 
                        this.model = _.clone(this.model);                               
                      }
                    }
                    console.log("json", this.model)

                  }
                  
                }
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
  }  
}
</script>