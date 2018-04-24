document.addEventListener("DOMContentLoaded", function() {
      var mouse = { 
      click: false,
      move: false,
      pos: {x:0, y:0},
      pos_prev: false
   };
   // get canvas element and create context
   var board = document.getElementById('board');
   var canvas  = document.getElementById('drawing');
   var context = canvas.getContext('2d');
   var width   = window.innerWidth;
   var height  = window.innerHeight;
   var chatWidth = width*0.45;
   var socket  = io.connect();
   var color   = getRandomColor();
   var touchIdentifier;
   // Setting drawing style

   var clearBut = document.getElementById('clear');
   var chatDiv = document.getElementById('chat');
   // set canvas to board-div browser width/height
   canvas.width = board.offsetWidth;
   canvas.height = board.offsetHeight;
   window.onfocus = function () { document.title = 'DrawingBoard'; }

   // register mouse event handlers
   canvas.onmousedown = function(e){ console.log("mouseClick"); mouse.click = true; };
   canvas.onmouseup = function(e){ mouse.click = false; };

   canvas.onmousemove = function(e) {
      // normalize mouse position to range 0.0 - 1.0
     console.log("mouseMove");
      mouse.pos.x = (e.clientX-chatWidth) / width;
      mouse.pos.y = e.clientY / height;
      mouse.move = true;
      console.log(mouse);
   };

   canvas.ontouchstart = function(e){ 
      e.preventDefault();
      var touch = e.changedTouches[0];
      touchIdentifier = touch.identifier;
      console.log("touch start");  mouse.click = true; 
      mouse.pos.x= (touch.pageX-chatWidth) / width;
      mouse.pos.y= touch.pageY / height;
      mouse.pos_prev = mouse.pos;
   };
   canvas.ontouchend = function(e){ console.log("touch end"); mouse.click = false; };
   canvas.ontouchmove = function(e) {
      // normalize mouse position to range 0.0 - 1.0
     // mouse.click = true;
      var movTouch = e.changedTouches[0];
      console.log("concernedTouch = ",movTouch);
      mouse.pos.x = (movTouch.pageX-chatWidth) / width;
      mouse.pos.y = movTouch.pageY / height;
      mouse.move = true;
      console.log(mouse);
   };

   clearBut.onclick =  function(e){
      console.log("clear is clicked");
		socket.emit('clearit', true);
	}
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

   socket.on('redraw_line', function (data) {
      var line = data.line;
      console.log(line);
      var color = data.color;
      console.log(color);
      for(i=0; i<line.length; i+=1){
         context.beginPath();
         context.strokeStyle = color[i];
         context.lineCap = 'round';
         context.lineJoin = 'round';
         context.lineWidth =  8;
         context.moveTo(line[i][0].x * width , line[i][0].y * height);
         context.lineTo(line[i][1].x * width, line[i][1].y * height);
         context.stroke();
      }
   })
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
      chatDiv.scrollTop = chatDiv.scrollHeight;
   });
   socket.on('finish', function(data){
      $('#messages').append($('<li>').text(data.jsonmsg));
      chatDiv.scrollTop = chatDiv.scrollHeight;
   });
   socket.on('chat message', function(data){
      //$('#messages').css('color', data.color);
       $('#messages').append($('<li>')
         .text(data.name+" : "+data.msg)
         .css('color', data.color));
       chatDiv.scrollTop = chatDiv.scrollHeight;
       if(!document.hasFocus()){
         document.title = ""+ data.name + " has messaged";  
       }
   });
   while (name == '') {
               name = prompt("What's your name?","");
               socket.emit('register', { 'name': name, 'color': color } );
            }


	socket.on('clearit', function(){
			context.clearRect(0,0,width, height);
			console.log("client clearit");
	});
   $(window).resize(function() {
//  location.reload();
   width   = window.innerWidth;
   height  = window.innerHeight;
   chatWidth = width*0.45;
   canvas.width = board.offsetWidth;
   canvas.height = board.offsetHeight;
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
         socket.emit('draw_line', { line: [ mouse.pos_prev, mouse.pos ], color: [ color ] });
         mouse.move = false;
         //draw line on same client
         context.beginPath();
         context.strokeStyle = color;
         context.lineCap = 'round';
         context.lineJoin = 'round';
         context.lineWidth =  8;
         context.moveTo(mouse.pos_prev.x * width , mouse.pos_prev.y * height);
         context.lineTo(mouse.pos.x * width, mouse.pos.y * height);
         context.stroke();
         
      }
      mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
      setTimeout(mainLoop, 25);
   }
   mainLoop();
});