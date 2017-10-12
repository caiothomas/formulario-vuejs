var express = require('express'),
    app = express(),
    jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),
    userRouter = express.Router(),
    User = require('../models/User');

userRouter.route('/cadastro').post(function (req, res) {
  try{
    console.log("res", req.body)
    if(req.body.password && req.body.password.length < 6){
        return res.status(400).send({
          message: "Senha deve ser maior que 6 caracteres." 
        });
    }
    var newUser = new User(req.body);

    newUser.hash_password = bcrypt.hashSync(req.body.password, 10);  
    
    newUser.save(function(err, user) {
      if (err) {
        return res.status(400).send({
          message: err.errmsg 
        });
      } else {
        user.hash_password = undefined;
        return res.json(user);
      }
    });
  } catch(e){
    console.log("Erro ao registrar usuario:" + e);
    return res.status(400).json({ message: 'Erro ao registrar usuario.' });
  }  
});


userRouter.route('/sign_in').post(function (req, res) {
  try{
    if(req.body && req.body.email && req.body.password){
      User.findOne({
        email: req.body.email
      }, function(err, user) {
        if (err) throw err;
        
        if (!user || !user.comparePassword(req.body.password)) {
          return res.status(401).json({ message: 'Falha na autenticacao. E-mail e/ou senha incorretos. ' });
        }
        
        return res.json({ token: jwt.sign({ email: user.email, name: user.name, _id: user._id,  iat: Math.floor(Date.now() / 1000) - 30 }, 'RESTFULAPIs', { expiresIn: '1h' }) });
      });    
    }
  }catch(e){
    console.log("Erro na autenticacao.");
    return res.status(400).json({ message: 'Erro na autenticacao.' });    
  }  
});


module.exports = userRouter;