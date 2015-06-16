function getPlayers(){
  $.getJSON("/players", function( data){
    $.tmpl($("#playerTemplate"), data).appendTo($("#players"));
  })
}

function getPlayer(id){
  $.getJSON("/players/" + id, function( data ){
    $.tmpl($("#playerTemplate"), data).appendTo($("#players"));
  })
}

function parseName(name){
  var f, l;
  f = name.substring(0, name.indexOf(' '));
  l = name.substring(name.indexOf(' ') + 1);
  var parsed = l + "_" + f;
  console.log(parsed);
  return parsed;
}
