var express = require('express'),
    app = express(),
    jwt = require('jsonwebtoken'),    
    ObjectId = require('mongodb').ObjectID,    
    formRoutes = express.Router(),
    Form = require('../models/Form'),
    email = require('./email'),
    async = require('async'),
    apply = async.apply,    
    _ = require('underscore'),          
    Resposta = require('../models/FormResposta');

formRoutes.route('/add').post(function (req, res, next) {
  try{    
    var user = null;    
    if(req.decode){
          user = req.decode._id;
          console.log("decode", req.decode)                                    
          console.log("body", req.body);  
          req.body.respostas = null;  
          req.body.user = req.decode._id;
          var form = new Form(req.body);
              form.save().then(form => {

                if(req.body.email){
                  var emails = req.body.email.split(",");
                  var link = process.env['BASEHOST']+"/?#/view-form?id="+form.id;
                  var msg = "<p>Olá, voce recebeu um formulario. Acesse o link <a href="+link+">"+link+"</a>.</p>"
                  for(var e in emails){
                    email.sendEmail("Formulario", msg, emails[e], function(err, info){
                      if(err){
                        console.log("Erro ao enviar email" + err);
                      }
                    });
                  }
                }
                res.status(200).json({message: 'Formulario adicionado com sucesso!'});
          }).catch(err => {
              console.log("Error Form", err);
              res.status(400).send({message: "Error ao salvar no banco de dados: "+ err._message});
          });        
      }    
  } catch(e){
      console.log("Error Form", e)
      res.status(400).send({message: "Error ao salvar no banco de dados."});
  }
});

formRoutes.route('/').get(function (req, res) {
  try{    
    var user = null;
    if(req.decode){
          Form.find({ user: req.decode._id }, function (err, forms){
            if(err){
              console.log(err);
            } else {
              res.json(forms);
            }
          });       
      }
    
  } catch(e){
      console.log("Error Form", e)
      res.status(400).send({message: "Error ao salvar no banco de dados."});
  }    
});

formRoutes.route('/resposta').post(function (req, res, next) {
  try{    
      var resp = new Resposta(req.body);
      console.log("form resposta", resp)

      Form.findOne({ _id: req.body.form }, function (err, formulario){
        if(err){
          console.log(err);
        } else {
          console.log("forms view id", formulario.perguntas)

          resp.save().then(resposta => {      
              
            var msg = "Recebemos suas respostas, obrigado!";
                            
            async.waterfall([
              async.apply(generateHTML, formulario.perguntas, resp.resposta, resp.email),
              async.apply(email.sendEmail, "Resposta Formulario")
            ], function (err, result) {
                if (err) {
                  console.log("Erro ao enviar email", err)
                }            
            });
            res.status(200).json({message: 'Formulario adicionado com sucesso!'});                            
          }).catch(err => {
            console.log("Error Form", err);
            if(err.code == 11000)
              res.status(400).send({message: "Este formulario ja foi repondido por este e-mail."});
            else
              res.status(400).send({message: "Error ao salvar no banco de dados: "+ err.message});          
          });           
        }
      });

  } catch(e){
      console.log("Error Form", e)
      res.status(400).send({message: "Error ao salvar no banco de dados."});
  }
});


formRoutes.route('/relatorio/:id').get(function (req, res, next) {
  try{    
    var user = null;
    if(req.decode) {
          var id = req.params.id;        
          console.log("decode", req.decode)                          
          console.log("id", id)
          Form.aggregate([
              { $match:{$and: [{_id:  ObjectId(id)},{user: ObjectId(req.decode._id)}]}},
              {
                $lookup:
                {
                  from: "respostas",
                  localField: "_id",
                  foreignField: "form",
                  as: "respostas"
                },
              },
            ],function(err, form) {
              if(form[0])
                  res.json(form[0]);
              else
                  res.json({});                
          });
      }    
  } catch(e){
      console.log("Error Form", e)
      res.status(400).send({message: "Error ao salvar no banco de dados."});
  }  
});

formRoutes.route('/graficos/:id').get(function (req, res, next) {
  try{    
    var user = null;
    if(req.decode) {
          var id = req.params.id;        
          console.log("decode", req.decode)                          
          console.log("id", id)
          Form.aggregate([
              { $match:{$and: [{_id:  ObjectId(id)},{user: ObjectId(req.decode._id)}]}},
              {
                $lookup:
                {
                  from: "respostas",
                  localField: "_id",
                  foreignField: "form",
                  as: "respostas"
                },
              },
            ],function(err, form) {
              var elem = form[0];
              if(elem){
                for(var i in elem.perguntas){
                  console.log("perguntas", elem.perguntas[i])
                  elem.perguntas[i]['respostas'] = [];
                  for(var j in elem.respostas){
                      var r = JSON.parse(elem.respostas[j].resposta)
                      var item = _.findWhere(r, {_id: ''+elem.perguntas[i]._id+''});
                      console.log("resp",   r)
                      if(elem.perguntas[i].tipo == 'text' && item && item.resp){
                        elem.perguntas[i].respostas.push(item.resp);
                      }

                      if(elem.perguntas[i].tipo == 'radio' && item && item.resp){                      
                        if(elem.perguntas[i].respostas.length == 0){
                          elem.perguntas[i].respostas = _.map(elem.perguntas[i].opcao, function(val, key) { return {val: val, total: 0}; });
                        }
                        var k = _.findWhere(elem.perguntas[i].respostas, {val: ''+item.resp+''});
                        k.total++;
                      }

                      if(elem.perguntas[i].tipo == 'checkbox' && item && item.resp){                      
                        if(elem.perguntas[i].respostas.length == 0){
                          elem.perguntas[i].respostas = _.map(elem.perguntas[i].opcao, function(val, key) { return {val: val, total: 0}; });
                        }
                        console.log("item", item)
                        item.resp.forEach( function(element, index) {
                          var k = _.findWhere(elem.perguntas[i].respostas, {val: ''+element+''});
                          k.total++;
                        });
                      }                      
                  }
                }
                delete elem.respostas;                              
                res.json(elem);                                
              } else {
                res.json({});                                
              }
          });
      }    
  } catch(e){
      console.log("Error Form", e)
      res.status(400).send({message: "Error ao salvar no banco de dados."});
  }  
});


formRoutes.route('/view/:id').get(function (req, res) {
  try{    
      var id = req.params.id;
      Form.findOne({ _id: id }, function (err, forms){
        if(err){
          console.log(err);
        } else {
          console.log("forms view id", forms)
          if(forms)
            res.json(forms);
          else 
            res.json({});            
        }
      });    
  } catch(e){
      console.log("Error Form", e)
      res.status(400).send({message: "Error ao salvar no banco de dados."});
  }    
});



function generateHTML(perguntas, resposta, email, callback){

  var html = "<html><h1>Recebemos seu formulario.</h1>";

  if(perguntas && resposta && email){
    try{
      html += "<p>E-mail: "+email+"</p>";
      html +="<ol>";    
      for(var i=0; i< perguntas.length; i++){
        html += "<li><p>"+perguntas[i].pergunta+"<p>";
        var result = _.findWhere(JSON.parse(resposta),  {_id: perguntas[i].id});                              
        console.log("elem", result)
        if(perguntas[i].tipo == "text" && result.resp){
            html += "<p>Resposta: "+result.resp+"</p>"              
        }
        
        if(perguntas[i].tipo == "checkbox"){
            for(var j=0; j< perguntas[i].opcao.length; j++){
              if(_.contains(result.resp, perguntas[i].opcao[j]))
                html += '<input type="checkbox" name="'+perguntas[i]._id+'" value="'+perguntas[i].opcao[j]+'" checked disabled/>'+perguntas[i].opcao[j]+'<br>';
              else
                html += '<input type="checkbox" name="'+perguntas[i]._id+'" value="'+perguntas[i].opcao[j]+'"disabled/>'+perguntas[i].opcao[j]+'<br>';                    
            }
        }

        if(perguntas[i].tipo == "radio"){
            for(var j=0; j< perguntas[i].opcao.length; j++){
              if(perguntas[i].opcao[j] == result.resp)
                html += '<input type="radio" name="'+perguntas[i]._id+'" value="'+perguntas[i].opcao[j]+'" checked="checked" />'+perguntas[i].opcao[j]+'<br>';
              else
                html += '<input type="radio" name="'+perguntas[i]._id+'" value="'+perguntas[i].opcao[j]+'" disabled/>'+perguntas[i].opcao[j]+'<br>';                    
            }
        }
        
        html += "</li>"
      }
        html += "</ol>"
    } catch(e){
      console.log("Erro ao gerar HTML para email!", e);
      callback("Erro ao gerar HTML.");      
    }
  } 
    html += "</html>";

  callback(null, html, email);
}


module.exports = formRoutes;
