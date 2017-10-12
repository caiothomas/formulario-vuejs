var mongoose = require('mongoose'),    
    Schema = mongoose.Schema,
    Resposta = require('../models/FormResposta');

//db.respostas.createIndex( { form:1, email: 1 }, { unique: true } )
var respostasSchemas = new mongoose.Schema({
    form: {
    	type: Schema.Types.ObjectId, 
    	ref: 'Form',
      //unique : true      
    },
    email: {
      type: String,
      //unique: true,
      lowercase: true,
      trim: true,
      required: true      
    },
    resposta: [{
      type: String,
      trim: true,
      required: true
    }],
    created: {type: Date, default:Date.now}

});

respostasSchemas.index( { form:1, email: 1 }, { unique: true } );

module.exports = mongoose.model('Resposta', respostasSchemas);