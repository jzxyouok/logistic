$(document).ready(function(){
  wx.ready(function(){
    $("#btn_water_ok").click(function(){
      var domId = $("#water_domId").val().trim()||"";
      var brand = $("#water_brand").val().trim()||"";
      if(domId===""||brand==="")return;
      var extra = $("#water_extra").val().trim()||"";
      console.log(domId+" "+brand+" "+extra);
      $.post('/getWater',{
        domId:domId,
        brand:brand,
        extra:extra
      },function(res){
        if(res==="ok"){
        }else{
          $("#water_opt_res").text('服务出现异常，请稍后再试！');
        }
        $("#water_opt_info").show();
      });
    });

    $("#commitfix").click(function(){
        var sushehao = $("#sushehao").val().trim()||"";
        var fixreason = $("#fixreason").val().trim()||"";
        if(sushehao===""||fixreason==="")return;
        var beizhu = $("#beizhu").val().trim()||"";
        var content = "";
        if(beizhu==="")
            content=sushehao+'宿舍'+'需要水电维修'+'，详情如下：'+fixreason+'，请及时前往修理';
        else
            content=sushehao+'宿舍'+'需要水电维修'+'，详情如下：'+fixreason+'（'+beizhu+'）'+'，请及时前往修理';
        $.post('/getfix',{
            sushehao:sushehao,
            fixreason:fixreason,
            beizhu:beizhu,
            content:content
        },function(res){
            if(res==="ok"){
                $("#1").text("故障报修成功");
                $("#2").text("请耐心等待维修人员");
                $("#alertinfo").show();
            }
            else{
                $("#1").text("故障报修失败");
                $("#2").text("请稍等后重新尝试");
                $("#alertinfo").show();
            }
        });
    });
  });

  wx.error(function(res){
    console.log('error:'+res);
  });
});
