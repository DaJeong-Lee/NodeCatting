
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , fs = require('fs');

var app = express();

// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);
app.get('/', function(req, res){
	res.render('chat');
});

app.get('/users', user.list);

var httpServer = http.createServer(app);

var io = require('socket.io').listen(httpServer);


httpServer.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var roomList = [];
var i = 0;

io.sockets.on('connection', function(socket){
	var roomName;
	console.log('client connect...'+ i++);
	
	if(roomList.length > 0){
		socket.emit('welcome', roomList);
	}
	
	var joinFn = function(room){ //join이벤트 발생시 
		console.log('roomList : ', roomList);
		console.log('room : ', room);
		
		socket.join(room); //방번호로 조인(방이름이 같은 client를 묶음)
		
		roomName = room;
		
	};
	
	socket.on('rmessage', function(obj){ //rmessage 이벤트 발생 시
		console.log(obj);
		io.to(roomName).emit('rmessage', obj); //방번호 r1에 모든 참여자한테 message보냄
	});
	
	socket.on('removeRoom', function(data){ 
		removeArr(roomList, data);
	});
	
	
	socket.on('createRoom', function(room){ 
		var flag = true; 
		
		for(var i in roomList){
			if(room===roomList[i]||room === ''|| room === null){
				flag = false; //기존에 roomList에 같은 room이 있다면 flag = false
			}
		}
		
		if(flag){
			roomList.push(room); //같은 방이 없을 때만 roomList에 추가
		}
	});
	
	socket.on('join', joinFn); //join 이벤트 발생시 



	function removeArr(arr, value) {
		  var i, len;
		  if (arr.indexOf) { // IE9+,  다른 모든 브라우져
		    i = arr.indexOf(value);
		    if(i !== -1) {
		      arr.splice(i, 1);
		    }
		  } else { // IE8 이하
		    len = arr.length;
		    for (i = 0; i < arr.len; i++) {
		      if (arr[i] === value) {
		        arr.splice(i, 1);
		        return;
		      }
		    }
		  }
	}
	
	
});

