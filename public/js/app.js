$(document).ready(function(){
  wx.ready(function(){
    $("#btn_water_ok").click(function(){
      
    });
  });

  wx.error(function(res){
    console.log('error:'+res);
  });
});
