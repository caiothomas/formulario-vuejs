<template>
        <div class="col-md-12">
            <div class="page-header">
                <h2>Questionário <small><span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span></small> Todos</h2>
            </div>
            
        <table class="table table-hover">
            <thead>
            <tr>
                <td>ID</td>
                <td>Nome</td>
                <td>Descrião</td>
                <td>Ação</td>
            </tr>
            </thead>

            <tbody>
                <tr v-for="item in items">
                    <td>{{ item._id }}</td>
                    <td>{{ item.nome }}</td>
                    <td>{{ item.desc }}</td>
                    <td><router-link :to="{name: 'view-form', params: { id: item._id }}" class="btn btn-primary">Ver</router-link></td>
                    <td><router-link :to="{name: 'relatorio', params: { id: item._id }}" class="btn btn-success">Relatorio</router-link></td>
                    <td><router-link :to="{name: 'grafico', params: { id: item._id }}" class="btn btn-success">Grafico</router-link></td>                    
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
  import auth from '../auth'

    export default {        
        data(){
            return{
                items: []
            }
        },

        created: function()
        {
            this.fetchItems();
        },

        methods: {
            fetchItems()
            {
              let uri = this.axios.defaults.baseURL +'/form';
              let config = {'authorization': auth.getAuthHeader()};
              this.axios.get(uri, {headers: config}).then((response) => {
                  this.items = response.data;
              });
            },
            deleteItem(id)
            {
              let uri = 'http://localhost:4000/items/delete/'+id;
              this.items.splice(id, 1);
              this.axios.get(uri);
            }
        }
    }
</script>
