import {router} from './main'
var  jsonwebtoken = require("jsonwebtoken");

export default {

  user: {
    authenticated: false
  },

  login(context, creds, redirect) {
        console.log("item" , context);
        var uri = context.axios.defaults.baseURL + '/auth/sign_in';

        context.axios.post(uri, creds).then((response) => {
          if(response.data.token){
            
            console.log("token ", response.data.token)
            localStorage.setItem('token', response.data.token);            
            this.user.authenticated = true;

            if(redirect) {
              context.$router.push({name: redirect});
            }

          }
        }).catch(error => {
          console.log("error", error.response.data.message)
          context.error =  error.response.data.message;
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
      }); 
  },

  logout(context, redirect) {
    localStorage.removeItem('token')
    this.user.authenticated = false;
    
    if(redirect) {
        context.$router.push({name: redirect});
    }    
  },

  checkAuth() {
    var jwt = localStorage.getItem('token')
    var session = { authenticated:false };    
    if(jwt) {
      console.log("jwt", jwt)
      jsonwebtoken.verify(jwt, 'RESTFULAPIs', function(err, decode) {
        console.log("verificando token ")
        
        if (err){
          localStorage.removeItem('token')          
          console.log("err", err)    
        }

        if(decode) {
          console.log("decode", decode)                          
          session = decode;
          session.authenticated = true;
        }
      });
    }

    this.user = session;
    console.log("this.user", this.user)                          
    
    return session.authenticated;
  },

  checkUserAuth() {
    checkAuth();
    return this.user;
  },

  getAuthHeader() {
    return localStorage.getItem('token');
  }
}