var express = require('express'), 
    app = express(),
    http = require('http'),
    socketIo = require('socket.io');

// start webserver on port 8080
var server =  http.createServer(app);
var io = socketIo.listen(server);
var port = process.env.PORT || 8080;
server.listen(port);
// add directory with our static files
app.use(express.static(__dirname + '/public'));
console.log("Server running on 127.0.0.1:8080");

// array of all lines drawn
var line_history = [];

// event-handler for new incoming connections
io.on('connection', function (socket) {

  socket.on('register',function(name){
  io.emit('start',{'jsonmsg':''+name+' is now CONNECTED. Say Hello!'});
  });
  socket.on('chat message', function(data){
    io.emit('chat message', {'name': data.name,'msg':data.msg});
  });
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
    io.emit('finish',{'jsonmsg':'1 of the users DISCONNECTED!!'});
  });
   // first send the history to the new client
   for (var i in line_history) {
      socket.emit('draw_line', { line: line_history[i] } );
   }

   // add handler for message type "draw_line".
   socket.on('draw_line', function (data) {
      // add received line to history 
      line_history.push(data.line);
      // send line to all clients
      io.emit('draw_line', { line: data.line });
   });
  // socket.on('clearit', function(){
  // 	line_history = [];
  // 	io.emit('clearit', true);
  // });
  socket.on('redraw', function (){
    for (var i in line_history) {
      socket.emit('draw_line', { line: line_history[i] } );
   }
 });
});