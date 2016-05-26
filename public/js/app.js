$(document).ready(function(){
  wx.ready(function(){
    $("#btn").click(function(){
      wx.getLocation({
        success:function(res){
          alert(JSON.stringify(res));
        },
        cancle:function(res){
          alert('用于拒绝授权地理位置');
        }
      });
    });
  });

  wx.error(function(res){
    console.log('error:'+res);
  });
});
