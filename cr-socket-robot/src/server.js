var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var port = 9003;
var ejs = require('ejs');
var path = require('path');
var redis = require('redis');
var socket_client = require('socket.io-client');

let main_service = require('./service/main_service');
let redis_utils = require('./utils/redis_utils');
let _wslog = require('./utils/wslog_utils');

module.exports = (function(){
	
	//全局redis
	global.redisUtils = new redis_utils(redis.createClient(global.config.redis.port, global.config.redis));

	//业务加载(init)
	let	MainService = new main_service();

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


	let mainSocket = socket_client.connect(global.config.socketServer.url, {path:'/robots'});

	mainSocket.on('connect',()=>{
		console.log('mainSocket - connect');

		mainSocket.emit('join_main_robot');
	});

	mainSocket.on('reconnect_attempt', () => {
		console.log('mainSocket - reconnect_attempt');
	});
	
	mainSocket.on('disconnect',(data)=>{
		console.log('mainSocket - disconnect');
	});
	
	mainSocket.on('gen_robots',(data)=>{
		console.log('mainSocket - gen_robots', data);
		MainService.startRobots(data);
	});
});

