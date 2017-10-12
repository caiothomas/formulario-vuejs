var mongoose = require('mongoose'),    
    Schema = mongoose.Schema;

var perguntasSchemas = new mongoose.Schema({
    tipo: {
      type:String,
      enum: ['text', 'checkbox', 'radio'],
    },
    pergunta: {
      type: String,      
      trim: true,
    },
    opcao: [{
      type: String,      
      trim: true
    }]
});

  
var FormSchema = new Schema({
  nome: {
    type: String,
    trim: true,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId, 
    ref: 'User'
  },
  desc: {
    type: String,
    trim: true,
  },  
  perguntas: [perguntasSchemas],
  //respostas: [respostasSchemas],    
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Form', FormSchema);
