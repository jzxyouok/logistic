var express = require('express');
var path = require('path');
var wxprocessor = require('./wxprocessor');
var app = express();
var xmlparser = require('express-xml-bodyparser');
var bodyParser = require('body-parser');
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
    appId:settings.APPID,
    title:'送水'
  };
  util.getLoaclJsApiTicket(function(jsapi_ticket){
    if(jsapi_ticket){
      var sign = util.sign(jsapi_ticket,'http://121.42.50.44:9527'+req.url);
      data.timestamp = sign.timestamp||'';
      data.nonceStr = sign.nonceStr||'';
      data.signature = sign.signature||'';
    }
    res.render('water',data);
  });
});

app.get('/fix',function(req,res){
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
    res.render('fix',data);
  });
});

app.post('/',xmlparser({trim: false, explicitArray: false}),function(req,res,next){
  console.log(req.body);
  var openId = req.body.xml.fromusername;
  console.log(openId);
  res.end("");
});

app.use('/getWater',bodyParser.json());
app.use('/getWater',bodyParser.urlencoded({ extended: true }));
app.post('/getWater',function(req,res,next){
  console.log(req.body);
  var extra = req.body.extra||"。";
  if(extra!=="。"){
    extra = "("+extra+")";
  }
  var msg = "收到新的送水请求！"+"宿舍"+req.body.domId+"需要一桶"+req.body.brand+extra;
  console.log(msg);
  util.sendMessage("o4dVnv25i0-84bJVc3sDbEUUhQcE",msg,function(err){
    if(err){
      res.end(err);
    }else{
      res.end("ok");
    }
  });
});

app.use('/getfix',bodyParser.json());
app.use('/getfix',bodyParser.urlencoded({ extended: true }));
app.post('/getfix',function(req,res,next){
    console.log(req.body);
    var content = req.body.content;
    util.sendMessage("o4dVnv3PwQSjm6q6NoPkjRJ7Z68o",content,function(err){
      if(err){
        res.end(err);
      }else{
        res.end("ok");
      }
    });
});

app.listen(settings.PORT,function(req,res){
  console.log("Server runing at port: " + settings.PORT);
});
