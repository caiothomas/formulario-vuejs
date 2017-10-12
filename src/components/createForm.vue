<template>
<div>
  <div class="page-header">
    <h2>Novo Formulario</h2>
  </div>  


    <div class="alert alert-danger" v-if="error">
        {{ error }}
    </div>  

        <vue-form-generator :schema="schema" :model="model" :options="formOptions" ></vue-form-generator>

<div class="panel panel-default">
	<div class="panel-heading">Perguntas</div>
	<div class="panel-body">
		<div  class="row subrow panel-heading" v-for="(row, i) in fields">								
			<div class="col-md-12">
				<div class="row">
					<div class="col-md-12">
						<div class="col-md-3">
							<select name="" id="" class="form-control" v-model="row.tipo">
								<option :value="option.value" v-for="option in options">{{ option.label }}</option>
							</select>
						</div>
						<div class="col-md-8 col-sm-12 col-xs-12 ">
							<input type="text" class="form-control" placeholder="Pergunta" v-model="row.pergunta" > 
						</div>
						<div class="col-md-1 col-sm-12 col-xs-12">							
							<button class="btn btn-block btn-danger" @click="deleteRow(row, i)"><span class="glyphicon glyphicon-trash"></span></button>
						</div>
					</div>
				</div>

				<div class="row" v-if="row.tipo == 'checkbox' || row.tipo == 'radio'">
					<div class="row subrow" v-for="(subrow, j) in row.subrows">
						<div class="col-md-12">
							<div class="col-md-1 col-sm-1 hidden-sm hidden-xs ">
								<div class="checkbox">
									<label v-if="row.tipo == 'checkbox'">
										<input  type="checkbox" style="cursor:default" disabled>                        
									</label>          
									<label v-if="row.tipo == 'radio'">
										<input  type="radio" style="cursor:default" disabled>                        
									</label>          											
								</div>          				
							</div>
							<div class="col-md-10 col-sm-10 col-xs-8">
								<input type="text" class="form-control" placeholder="Opção" v-model="subrow.answer" required>
							</div>
							<div class="col-md-1 col-sm-2 col-xs-4">
								<button class="btn btn-block btn-danger" @click="deleteSubrow(row,subrow, j)"><span class="glyphicon glyphicon-remove"></span></button>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-xs-12" style="margin:10px 0;">
							<button class="btn btn-default center-block" @click="addSubRow(row)"><span class="glyphicon glyphicon-plus"></span> Nova subrows</button>
						</div>
					</div>
				</div>
			</div>
		</div>							
	</div>

<div class="row">
<div class="col-xs-12">
    <div class= "form-group">						
		<button type="submit" class="btn  btn-info center-block" @click="addRow"><span class="glyphicon glyphicon-plus"></span>  Nova Pergunta</button>
	</div>
</div>					
</div>		
</div>

<div class="field-wrap">
	<input type="submit" value="Salvar" @click="save"/>
</div>
    	
</div>	
</template>

<script>
import VueFormGenerator from "vue-form-generator";
import _ from "underscore"
import auth from '../auth'

  export default {
  	components:{
    	"vue-form-generator": VueFormGenerator.component
  	},  	
    data(){
        return{
		error: false,
		fields: [],
	    model:{
	        titulo:"Form ",
	        email:"",
	        desc:"Vamos falar sobre..."
	    },
	    schema: {
	      fields: [{
	        type: "input",
	        inputType: "text",
	        label: "Titulo",
	        model: "titulo",
	        featured: true,
	        required: true,
	        validator: VueFormGenerator.validators.string        
	      },{
		    type: "textArea",
		    label: "Descricao",
		    model: "desc",
		    hint: "Max 200 characters",
		    max: 200,
		    rows: 2,
		    validator: VueFormGenerator.validators.string
	      },
	       {
	          type: "input",
	          inputType: "email",
	          label: "Digite E-mail com virgula para enviar o formulario.",
	          model: "email",
	          required: false,  
	          featured: true,                
	          validator: this.manyEmail        
	      }]
	    },      	   
	    formOptions: {
	      validateAfterLoad: true,
	      validateAfterChanged: true
	    },
      options: [
        { 'label': 'Texto', 'value': "text"},
        { 'label': 'Check box', 'value': "checkbox"},
        { 'label': 'Radio button', 'value': "radio"},
      ],
      fields: [
          {'tipo': 'text',  inputType: "text", pergunta: '', subrows: [{ answer: ''} ] }
      ] 
    }
    },
    methods: {
    	manyEmail(value) {
		  var re = /^([\w+-.%]+@[\w-.]+\.[A-Za-z]{2,4})(,[\w+-.%]+@[\w-.]+\.[A-Za-z]{2,4}){0,4}$/;

		  if (value && !re.test(value)) {
		    return ["Invalid e-mail address!"];
		  } else {
		    return []
		  }
		},
		addRow() {            
		this.fields.push({'tipo': "text", type: "input", inputType: "text", pergunta: '',   subrows: [{ answer: ''} ]});
		},
		deleteRow(row, index) { 
		this.fields.splice(index, 1);
		},
		addSubRow(row) {
		row.subrows.push({ answer: ''})
		},
		deleteSubrow(row, subrow, index) {            
		row.subrows.splice(index, 1);
		},
		save(){

		for(var key in this.fields){          		
			if(this.fields[key].tipo == "text"){
				this.fields[key].opcao = [];
			} else {
				this.fields[key].opcao = _.pluck(this.fields[key].subrows, 'answer');
			}
		}

		var form = {
			nome: this.model.titulo,
			desc: this.model.desc,
			email: this.model.email,
			perguntas: _.filter(this.fields, function(item){ return item.pergunta != ''; })
		}
        var uri = this.axios.defaults.baseURL + '/form/add';
		var config = {'authorization': auth.getAuthHeader()};	        
		this.axios.post(uri, form,  {headers: config}).then((response) => {
		  console.log("cadastro user", response)
		  this.$router.push({name: 'dashboard'})
		}).catch(error => {
		  this.error =  error.response.data.message;
		  console.log("impime", error.response.data.message)
		  console.log(error.response.data);
		  console.log(error.response.status);
		  console.log(error.response.headers);
		});

		console.log("save")	      	
		console.log("fields aux", this.fields)
		//var aux = VueFormGenerator.schema.mergeMultiObjectFields(this.schema.fields, this.fields);
		//console.log("save")
		}
		}
  }
</script>
