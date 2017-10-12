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
    
    <ol>  
    <div v-for="(row, i) in fields">
  		<li v-if="row.tipo == 'text'">
  			<b>{{row.pergunta}} </b>
  			<ul v-for="(texto, i) in row.respostas">
  				<li>{{texto}}</li>
  			</ul>
  	   </li>
  		<li v-if="row.tipo == 'checkbox' || row.tipo == 'radio'">
  			<b>{{row.pergunta}} </b>
  				<bar-chart :chart-data="row.collection"   :options="{responsive: false, maintainAspectRatio: false}" :width="900" :height="200"></bar-chart>
  		</li>	    
    </div>
      </ol>

<!--    <pie-chart :chartData="datacollection2" ></pie-chart>-->

  </div>
</template>
<script>
  import BarChart from './bar.js'
  import PieChart from './pie.js'
  import auth from '../auth'
  import _ from "underscore"

  export default {
    components: {
      BarChart,
      PieChart
    },
  	data () {
    	return {
    		datacollection: null,
    		nome: "",
    		desc: "",
    		error: false,
    		fields: null
    	}
  	},
    created(){
     	this.fillData();
     	this.fetchData();
    },

    methods: {
		getRandomColor() {
		    var letters = '0123456789ABCDEF'.split('');
		    var color = '#';
		    for (var i = 0; i < 6; i++ ) {
		        color += letters[Math.floor(Math.random() * 16)];
		    }
		    return color;
		},
		poolColors(a) {
        	var pool = [];
        	for(var i=0;i<a;i++){
            	pool.push(this.getRandomColor());
        	}
        	return pool;
    	},		
      fetchData() {
        console.log("execute fetchData")
        
        var id = this.$route.query.id || this.$route.params.id;        
        var uri = this.axios.defaults.baseURL + '/form/graficos/';

        if(id){
          var config = {'authorization': auth.getAuthHeader()};

          this.axios.get(uri+id,  {headers: config}).then((response) => {
              console.log("cadastro user", response.data)  
              
              this.nome = response.data.nome;            
              this.desc = response.data.desc;            
              var itemsForm = response.data.perguntas;
              var email;

              
              if(itemsForm){
              	for(var i=0; i<itemsForm.length; i++){

              		if(itemsForm[i].tipo == 'checkbox' || itemsForm[i].tipo == 'radio'){
                  		console.log("_.pluck(itemsForm[i].respostas, 'key')", _.pluck(itemsForm[i].respostas, 'total'))
				      	itemsForm[i].collection = {
				        labels: _.pluck(itemsForm[i].respostas, 'val'),
				        datasets: [
				          {
	            			label: 'Grafico',
				            data: _.pluck(itemsForm[i].respostas, 'total'),
				          	backgroundColor: this.poolColors(itemsForm[i].opcao.length)
				          }
				        ]
				      };
                  }
                }
				this.fields = itemsForm;
				

               console.log("item ", itemsForm)
              } else {
                this.error = "Formulario nao encontrado!";
              }             

            }).catch(error => {
              this.error =  error.response.data.message;
          });
        } else {
            this.error =  "Erro ao recuperar o parametro de ID";
        }
      },    	
      fillData () {	     
			this.datacollection2 = {
				labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
				datasets: [
				        {  
				          data: [40, 20, 80, 10],
				          backgroundColor: this.poolColors(4)
				        }				                  
				      ]
			}	      
	  }    		      	    
    }
  }
</script>

<style>
  .small {
    max-width: 600px;
    margin:  150px auto;
  }
</style>