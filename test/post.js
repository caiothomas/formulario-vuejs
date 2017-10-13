process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Form = require('../models/Form.js');
let User = require('../models/User.js');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
chai.use(chaiHttp);
let token;
let user = {
          nome: "tester ",
          email: "mteste@gmaiilllasd.com",
          password: "123456789"
      }

describe('/POST User', () => {
    it('it should not POST', (done) => {
      
      chai.request(server)
          .post('/api/auth/cadastro')
          .send(user)
          .end((err, res) => {
              res.should.have.status(200);
              //res.body.should.be.a('object');
              //res.body.should.have.property('message');
            done();
          });
    });
});

describe('/POST user', () => {
    it('it should not POST', (done) => {

      chai.request(server)
          .post('/api/auth/sign_in')
          .send(user)
          .end((err, res) => {
              console.log("resposta")
              res.should.have.status(200);                
              res.should.have.be.a('object');
              res.body.should.have.property('token');
              token = res.body.token;
            done();
          });
    });
});

describe('Forms', () => {
    beforeEach((done) => {
        Form.remove({}, (err) => { 
           done();         
        });     
    });
  describe('/GET form', () => {    
      it('it should GET all the forms', (done) => {
  
        chai.request(server)        
            .get('/api/form/').set('authorization', token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(0);
              done();
            });
      });
  });
});

describe('/POST form', () => {
    it('it should not POST', (done) => {

      let form = {
          nome: "new form",
          user: "59dfca8425d4a357ecf52aef",
          desc: "descricao form",
          perguntas: [
            {tipo:"text", pergunta:"pergunta text", opcao:[]},
            {tipo:"checkbox", pergunta:"pergunta checkbox", opcao:["A","B","C"]},              
            {tipo:"radio", pergunta:"pergunta radio", opcao:["A","B","C"]}
          ]
      }
      chai.request(server)
          .post('/api/form/add').set('authorization', token)
          .send(form)
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('message');
            done();
          });
    });

});