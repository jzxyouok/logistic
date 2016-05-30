var express = require('express');
var path = require('path');
var wxprocessor = require('./wxprocessor');
var app = express();
var xmlparser = require('express-xml-bodyparser');
var util = require('./util').util;
var settings = require('./config').settings;
var processor = new wxprocessor();

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,'public')));

util.createMenu();

app.get('/',function(req,res){
  var query = require('url').parse(req.url).query;
  var params = require('qs').parse(query);
  var signature = params.signature||"";
  var timestamp = params.timestamp||"";
  var nonce = params.nonce||"";
  var echostr = params.echostr||"";
  if(signature!==""&&timestamp!==""&&nonce!==""&&echostr!==""){
    console.log('验证签名');
    if(!processor.checkSignature(params, settings.TOKEN)){//签名错误
      res.end('signature fail');
    }else{
      res.end(params.echostr);
    }
  }else{
    var data = {
      appId:settings.APPID,
      title:'故障保修',
    };
    util.getLoaclJsApiTicket(function(jsapi_ticket){
      if(jsapi_ticket){
        var sign = util.sign(jsapi_ticket,'http://121.42.50.44:9527'+req.url);
        data.timestamp = sign.timestamp||'';
        data.nonceStr = sign.nonceStr||'';
        data.signature = sign.signature||'';
      }
      res.render('index',data);
    });
  }
});

app.get('/water',function(req,res,next){
  var data = {
    title:'送水'
  };
  res.render('water',data);
});

app.get('/repair',function(req,res,next){
  var data = {
    title:'故障保修'
  };
  res.render('repair',data);
});

app.post('/',xmlparser({trim: false, explicitArray: false}),function(req,res,next){
  console.log(req.body);
  res.end("");
});

app.listen(settings.PORT,function(req,res){
  console.log("Server runing at port: " + settings.PORT);
});
