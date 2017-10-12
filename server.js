const express = require('express'),
      path = require('path'),
      bodyParser = require('body-parser'),
      cors = require('cors'),
      mongoose = require('mongoose'),
      config = require('./config/DB'),
      morgan = require('morgan'),
      jwt = require('jsonwebtoken'),
      _ = require('underscore'),
      //itemRoutes = require('./expressRoutes/itemRoutes'),
      formRoutes = require('./expressRoutes/formRoutes'),      
      userRoutes = require('./expressRoutes/userRoutes');

require('dotenv').config();
mongoose.Promise = global.Promise;
mongoose.connect(config.DB).then(
 () => {console.log('Database is connected') },
 err => { console.log('Can not connect to the database'+ err)}
);

const app = express();

app.use(express.static('src'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));      
app.set('port', process.env.PORT || 4000);
app.use(morgan('dev'));

app.use(cors());

app.use(checkAuth);

app.use('/api/auth', userRoutes);
app.use('/api/form', formRoutes);

app.get('/version', function (req, res) {
  res.send({status:"ok", version: 1.0});
})

function acceptable(path){
    var allow =  [
    "^\/api/auth/cadastro$",
    "^\/api/auth/sign_in$",
    "^\/version$",
    "^\/api/form/view/[0-9a-fA-F]{24}$",
    "^\/api/form/resposta$",    
    ];
    
    var re = new RegExp(allow.join("|"), "i");
    return re.test(path);
}

function checkAuth(req, resp, next){
  console.log("checkAuth")
  console.log("regg ", acceptable(req.path));

  if (acceptable(req.path)) {
    console.log("reg OK ", acceptable(req.path));
    next();
  } else if(req.headers['authorization']){  
  console.log("req.headers['authorization']", req.headers['authorization'])         
        jwt.verify(req.headers['authorization'], 'RESTFULAPIs', function(err, decode) {                  
          
          if (err){
              console.log("err", err)    
              resp.status(401).send({ message: 'Token Invalido!' })          
          } else if(decode) {
              req.decode = decode;              
              //console.log("decode", req.decode)                                                    
              next();                
          } else {
              resp.status(401).send({ message: 'Token invalido!' })
          }
        });     
  } else {
        resp.status(401).send({ message: 'Autenticação é necessária!' })
  } 
}

//app.use(express.static(__dirname + '/public'));


app.listen(app.get('port'), function () {
 console.log("Server started on port", app.get('port'));  
 console.log("Carregando dados de email [" + process.env['EMAIL'] + "]")
 console.log("Carregando endereco API ", process.env['BASEHOSTAPI'])
 console.log("Carregando endereco WEB ", process.env['BASEHOST'])

});
