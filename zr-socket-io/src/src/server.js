var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
//var port = process.env.PORT || 3000;
var port = 3003;
var ejs = require('ejs');
var path = require('path');
var sio_redis = require('socket.io-redis');
let game_service = require('./game_service');
let redis_utils = require('./redis_utils');
let _wslog = require('./wslog_utils');

module.exports = (function(){
	//socket适配redis
	var socketRedis = sio_redis(global.config.redis);
	io.adapter(socketRedis);

	//全局redis
	global.redisUtils = new redis_utils(socketRedis.pubClient);
	global.io = io;

	let RobotMainIO = global.RobotMainIO = require('socket.io')(server, {
		path: '/robots'
	});
	
	//业务加载(init)
	let	GameService = new game_service();

	server.listen(port, function () {
		_wslog.info('Server listening at port ' + port);
	});
	app.set('views', __dirname + '/web_pages');
	app.engine('.html', ejs.__express);
	app.set('view engine', 'html');
	app.use('/static', express.static(path.join(__dirname, '/static')));

	app.get('/', function (req, res) {
		var id = Math.floor(Math.random() * 1000);
		res.render('test', { id: id });
	});
    app.get('/niuniu', function (req, res) {
        var id = Math.floor(Math.random() * 1000);
        res.render('niuniu', { id: id });
    });
    app.get('/niuniu2', function (req, res) {
        var id = Math.floor(Math.random() * 1000);
        res.render('niuniu2', { id: id });
    });
	//进入德州游戏页面
	app.get('/texasHoldem',function(req, res){
		res.render('texasHoldem');	
	});
	app.get('/texasHoldem1',function(req, res){
		res.render('texasHoldem1');	
	});
	app.get('/texasHoldem2',function(req, res){
		res.render('texasHoldem2');	
	});
	// io域名限制
	// io.origins(['foo.example.com:443']);

	// io.origins((origin, callback) => {
	// 	if (origin !== 'https://foo.example.com') {
	// 		return callback('origin not allowed', false);
	// 	}
	// 	callback(null, true);
	// });

	RobotMainIO.on('connection', (socket)=>{
		_wslog.info('robots - connect: ', socket.id);

		socket.on('disconnect', () => {
			_wslog.info('robots - disconnect: ', socket.id);
			delete global.robotSockets[socket.id];
		});

		//机器人主socket
		socket.on('join_main_robot', (data)=>{
			_wslog.debug('robots - join_main_robot', data);

			socket.join('robot_main_room', (error)=>{
				if(error){
					_wslog.error('加组失败：'+roomKey, playerId);
				}else{
					global.robotSockets[socket.id] = {};
				}
			});
		})
	});

	io.on('connection', (socket) => {
		_wslog.info('connect: ', socket.id);

		let sInfo = global.socketsInfo[socket.id] = {isConnect: true, needDel: false, token: null, data: null};

		socket.on('disconnect', () => {
			_wslog.info('disconnect: ', socket.id);

			sInfo.isConnect = false;
			if(sInfo.token == null || sInfo.needDel == true){
				delete global.socketsInfo[socket.id];
			}
		});

		socket.on('socket.io', (data)=>{
			_wslog.debug('传递的数据', data);

			if(!data || !data.emitName){
				_wslog.error('socket.io数据错误');
				return;
			}

			let emitName = data.emitName; //必须
			let params = data.data;

			try{
				if(emitName == 'matching_room'){ //匹配房间
					GameService.matchingRoom(socket, params);
				}else if(emitName == 'entering_room'){ //进入房间
					GameService.enteringRoom(socket, params);
				}else if(emitName == 'player_info'){ //请求用户信息
					GameService.getPlayerInfo(socket, params);
				}else{
					GameService.dealGameOperate(socket, emitName, params); //处理游戏操作
				}
			}catch(e){
				console.error('>>> 糟糕！！代码报错了！！', e);
			}
		});
	});
});

