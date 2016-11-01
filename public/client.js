document.addEventListener("DOMContentLoaded", function() {
      var mouse = { 
      click: false,
      move: false,
      pos: {x:0, y:0},
      pos_prev: false
   };
   // get canvas element and create context
   var canvas  = document.getElementById('drawing');
   var context = canvas.getContext('2d');
   var width   = window.innerWidth;
   var height  = window.innerHeight;
   var chatWidth = width*0.45;
   var socket  = io.connect();
   var color   = getRandomColor();
   // Setting drawing style
   

 //  var but = document.getElementById('clear');
   // set canvas to full browser width/height
   canvas.width = width;
   canvas.height = height;

   // register mouse event handlers
   canvas.onmousedown = function(e){ mouse.click = true; };
   canvas.onmouseup = function(e){ mouse.click = false; };

   canvas.onmousemove = function(e) {
      // normalize mouse position to range 0.0 - 1.0
     
      mouse.pos.x = (e.clientX-chatWidth) / width;
      mouse.pos.y = e.clientY / height;
      mouse.move = true;
   };

  // but.onclick =  function(e){
	//	socket.emit('clearit', true);
//	}
   // draw line received from server
	socket.on('draw_line', function (data) {
      var line = data.line;
      
      context.beginPath();
      context.strokeStyle = data.color;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth =  8;
      context.moveTo(line[0].x * width , line[0].y * height);
      context.lineTo(line[1].x * width, line[1].y * height);
      context.stroke();
   });
   var name = '';
   $('form').submit(function(){
      socket.emit('chat message',{'name': name,
         'color': color, 
         'msg':$('#m').val()});
   // socket.emit('chat message', $('#m').val());
      $('#m').val('');
      return false;
   });
   socket.on('start', function(data){
      //$('#messages').css('color', data.color);

      $('#messages').append($('<li>')
         .text(data.jsonmsg)
         .css('color', data.color));
   });
   socket.on('finish', function(data){
      $('#messages').append($('<li>').text(data.jsonmsg));
   });
   socket.on('chat message', function(data){
      //$('#messages').css('color', data.color);
       $('#messages').append($('<li>')
         .text(data.name+" : "+data.msg)
         .css('color', data.color));
   });
   while (name == '') {
               name = prompt("What's your name?","");
               socket.emit('register', { 'name': name, 'color': color } );
            }


//	socket.on('clearit', function(){
//			context.clearRect(0,0,width, height);
//			console.log("client clearit");
//	});
   $(window).resize(function() {
//  location.reload();
   width   = window.innerWidth;
   height  = window.innerHeight;
   chatWidth = width*0.45;
   canvas.width = width;
   canvas.height = height;
   context.clearRect(0,0,width, height);
//   console.log("client clearit");
   socket.emit('redraw');
});
	
   // function to generate random color
   function getRandomColor() {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i=0; i<6; i++){
         color += letters[Math.floor(Math.random()*16)];
      }
      return color;
   }
   
   // main loop, running every 25ms
   function mainLoop() {
      // check if the user is drawing
      if (mouse.click && mouse.move && mouse.pos_prev) {
         // send line to to the server
         socket.emit('draw_line', { line: [ mouse.pos, mouse.pos_prev ], color: [ color ] });
         mouse.move = false;
      }
      mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
      setTimeout(mainLoop, 25);
   }
   mainLoop();
});