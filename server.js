var express = require('express'), 
    app = express(),
    http = require('http'),
    socketIo = require('socket.io');

// start webserver on port 8080
var server =  http.createServer(app);
// io will handle all the clients connected to the server.
var io = socketIo.listen(server);
var port = process.env.PORT || 8080;
server.listen(port);
// add directory with our static files
app.use(express.static(__dirname + '/public'));
console.log("Server running on 127.0.0.1:8080");

// array of all lines drawn
var line_history = [];
// array of colors of lines
var color_history = [];

// event-handler for new incoming connections
io.on('connection', function (socket) {
  socket.emit('chat message', {'name': 'Server', 'msg': 'You Are Welcome !'});
  socket.on('register',function(data){
  io.emit('start',{'jsonmsg':''+data.name+' is now CONNECTED. Say Hello!', 'color': data.color});
  });
  socket.on('chat message', function(data){
    if(!data.msg == ''){
      io.emit('chat message', {'name': data.name,'msg':data.msg, 'color':data.color });
    }
    
  });
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
    io.emit('finish',{'jsonmsg':'1 of the users DISCONNECTED!!'});
  });
   // first send the history to the new client
   for (var i in line_history) {
      socket.emit('draw_line', { line: line_history[i], color: color_history[i] } );
   }

   // add handler for message type "draw_line".
   socket.on('draw_line', function (data) {
      // add received line to history 
      line_history.push(data.line);
      color_history.push(data.color);
      // send line to all clients
      io.emit('draw_line', { line: data.line, color: data.color });
   });
   socket.on('clearit', function(){
    console.log("server clearit");
   	line_history = [];
   	io.emit('clearit', true);
   });
  socket.on('redraw', function (){
    for (var i in line_history) {
      socket.emit('draw_line', { line: line_history[i], color: color_history[i] } );
   }
 });
});