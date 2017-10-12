var nodemailer = require('nodemailer');
require('dotenv').config();

function create(){
	return nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env['EMAIL'],
    pass: process.env['SENHA']
  }
});
};

function sendEmail(assunto, msg, email, callback){
  var config = {
    from: 'Formularios <contato@formularioss.com.br>',
    to: email + ' <' + email + '>',
    subject: assunto, 
    html: msg
  };
  
  create().sendMail(config, function(err, info){
    callback(err, info);
  });
};

module.exports.sendEmail =  sendEmail;