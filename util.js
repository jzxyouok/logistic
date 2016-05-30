var https = require('https');
var fs = require('fs');
var settings = require('./config').settings;

function Util(){

}
Util.prototype = {
  constructor:Util,
  //保存数据
  saveData:function(path,data){
      fs.writeFileSync(path,JSON.stringify(data,null,4));
  },
  //读取数据
  readData:function(path){
    var data = fs.readFileSync(path,{encoding:'utf-8'});
    return JSON.parse(data);
  },
  //sha1加密
  sha1:function(text){
    var sha1 = require('crypto').createHash('sha1');
    sha1.update(text);
    return sha1.digest('hex');
  },
  //生成随机字符串
  createNonceStr:function(len){
    len = len||32;
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var str = "";
    for(i = 0; i<len; i++){
      str += chars[Math.floor(Math.random()*62)];
    }
    return str;
    //return Math.random().toString(36).substr(2, 15);
  },
  //生成时间戳
  createTimestamp:function(){
    return parseInt(new Date().getTime() / 1000) + '';
  },
  //从微信服务器获取AccessToken并写入本地文件
  getAccessToken:function(next){
    var APPID = settings.APPID;
    var APPSECRET = settings.APPSECRET;
    var LINK = "https://api.weixin.qq.com/cgi-bin/token"+
    "?grant_type=client_credential&appid="+APPID+"&secret="+APPSECRET;
    var util = this;
    https.get(encodeURI(LINK),function(res){
      var data = "";
      res.on('data',function(chunk){
          data += chunk;
      });
      res.on('end',function(){
        var result = JSON.parse(data);
        result.timeout = Date.now() + 7000000;
        util.saveData("access_token.json",result);
        next(result.access_token);
      });
    }).on('err',function(err){
      console.log("获取AccessToken出错"+err);
      return;
    });
  },
  //获取本地的AccessToken
  getLocalAccessToken:function(next){
    var token;
    if(fs.existsSync('access_token.json')){
      token = this.readData('access_token.json');
    }
    if(!token||token.timeout<Date.now()){//不存在或者已过期
      this.getAccessToken(next);
    }else{
      next(token.access_token);
    }
  },
  //创建菜单
  createMenu:function(){
    this.getLocalAccessToken(function(token){
      console.log('创建菜单');
      var menu = {
        "button":[
          {
            "type": "view",
            "name": "故障报修",
            "url": "http://121.42.50.44:9527/"
          }
        ]
        };
      var post_str = new Buffer(JSON.stringify(menu));
      var access_token = token;
      var opt = {
      host: 'api.weixin.qq.com',
      path: '/cgi-bin/menu/create?access_token=' + access_token,
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': post_str.length
       }
      };
      var req = https.request(opt, function (response) {
      var responseText = [];
      response.setEncoding('utf8');
      response.on('data', function (data) {
          responseText.push(data);
      });
      response.on('end', function () {
          console.log(responseText);
      });
     });
     req.write(post_str);
     req.end();
    });
  },

  /**
* 生成js-sdk签名
*
* @param jsapi_ticket 用于签名的 jsapi_ticket
* @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
*
* @returns
*/
sign:function(jsapi_ticket, url){
    var ret = {
      jsapi_ticket: jsapi_ticket,
      nonceStr: this.createNonceStr(16),
      timestamp: this.createTimestamp(),
      url: url
    };
    var keys = Object.keys(ret);
    keys = keys.sort();
    var newArgs = {};
    keys.forEach(function (key) {
      newArgs[key.toLowerCase()] = ret[key];
    });

    var str = '';
    for (var k in newArgs) {
      str += '&' + k + '=' + newArgs[k];
    }
    str = str.substr(1);
    ret.signature = this.sha1(str);
    return ret;
  },
  /**
  *从微信服务器获取jsapi_ticket
  *@param next 回调函数
  */
  getJsApiTicket:function(next){
    var util = this;
    this.getLocalAccessToken(function(token){
      var LINK = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token="+token+"&type=jsapi";
      https.get(encodeURI(LINK),function(res){
        var data = "";
        res.on('data',function(chunk){
          data += chunk;
        });
        res.on('end',function(){
          var result = JSON.parse(data);
          result.timeout = Date.now() + 7000000;
          util.saveData("jsapi_ticket.json",result);
          next(result.ticket);
        });
      }).on('err',function(err){
        console.log("获取jsapi_ticket出错"+err);
        return;
      });
    });
  },
  /**
  *获取jsapi_ticket
  *@param next 回调函数
  */
  getLoaclJsApiTicket:function(next){
    var jsapi_ticket;
    if(fs.existsSync('jsapi_ticket.json')){
      jsapi_ticket = this.readData('jsapi_ticket.json');
    }
    if(!jsapi_ticket||jsapi_ticket.timeout<Date.now()){//不存在或者已过期
      this.getJsApiTicket(next);
    }else{
      next(jsapi_ticket.ticket);
    }
  }
};


module.exports = {
  util:new Util()
};
