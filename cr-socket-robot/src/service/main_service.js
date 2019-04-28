
let apiUtils = require('../utils/api_utils');
let apiJsonUtils = require('../utils/api_json_utils');
let timerUtils = require('../utils/timer_utils');
let _wslog = require('../utils/wslog_utils');

let glodenFlowerService = require('./gloden_flower/gloden_flower');
let cattleService = require('./cattle/cattle');
let holdemService = require('./holdem/holdem');
let landlordService = require('./landlord/landlord');

var socket_client = require('socket.io-client');
var robot_client = require('./robot_client');

function mainService(){
	this.init();
}

mainService.prototype.init = function(){
	this.redisUtils = global.redisUtils;
	
	//测试Redis
	this.setRedisVal('test_robot',{name:'haha',age:12});
	this.getRedisVal('test_robot');
	this.setRedisVal('debug_robot',{name:'haha',age:12});
	this.delRedisVal('debug_robot');

	this.initRobots();
};

mainService.prototype.getRedisVal = function(key,cb){
	this.redisUtils.zrGet.apply(this.redisUtils,arguments);
};
mainService.prototype.setRedisVal = function(key,value,cb){
	this.redisUtils.zrSet.apply(this.redisUtils,arguments);
};
mainService.prototype.delRedisVal = function(key,value,cb){
	this.redisUtils.zrDel.apply(this.redisUtils,arguments);
};

mainService.prototype._loadPlayerInfoByToken = function(playerToken, cb){
	if(playerToken){
		this.redisUtils._get(playerToken, (status,info)=>{
			if(status && info && info.playerId){
				info.playerToken = playerToken;
				global.playersInfo[info.playerId] = info;
				global.playersInfo[playerToken] = info;
				cb && cb(true, info);
			}else{
				cb && cb(false);
			}
		}, '');
	}
}

//初始化所有机器人
mainService.prototype.initRobots = function(socket, params){
	let self = this;
	this.robotPlayers = {};

	this.redisUtils._get('robot_token_list', (status,data)=>{
		if(status && data && data.length){
			let robotPlayers = {}
			data.forEach((item)=>{
				robotPlayers[item] = {gameStatus: 0};
				self._loadPlayerInfoByToken(item);
			});
			self.robotPlayers = robotPlayers;	
		}else{
			_wslog.warn('redis - 未找到机器人');
		}
	}, '');
}

// mainService.prototype.getPlayerInfo = function(socket, params){
// 	let playerToken = params.__token;
// 	let cbEventName = params.cbEventName;

// 	this._loadPlayerInfoByToken(playerToken,(status, playerInfo)=>{
// 		if(status){
// 		}else{
// 			_wslog.error('用户信息读取失败');
// 		}
// 	});
// }

mainService.prototype.startRobots = function(params){
	let eventData = params.eventData;
	let gameType = eventData.gameType; //对应不同游戏
	let hallItem = eventData.__hallItem; //对应不同游戏
	let agentId = params.agentId;
	
	let robotsList = []; //可用机器人列表

	//可用机器人
	for(let i in this.robotPlayers){
		let item = this.robotPlayers[i];
		let playerInfo = global.playersInfo[i];
		if(playerInfo && (playerInfo.agentId == agentId) && (playerInfo.experience >= hallItem.less) && (item.gameStatus == 0 || (item.hallId != hallItem.hallId)) ){
			robotsList.push(i);
		}
	}

	if(robotsList.length == 0){
		console.log('无可用机器人');
		return;
	}

	let needNums = params.needNums;
	if(needNums > robotsList.length){
		needNums = robotsList.length;
	}

	//取随机机器人列表
	let selectRobots = [];
	for(let i =0;i < needNums; i ++){
		let _i = Math.floor(Math.random()*robotsList.length);
		robotsList.splice(_i, 1);
		selectRobots.push(robotsList[_i]);
	}
	
	for(let i =0;i < selectRobots.length; i ++){
		let token = selectRobots[i];

		// //修改机器人状态
		// this.robotPlayers[token].gameStatus = 2; //0：空闲，1：游戏中，2：准备游戏
		// this.robotPlayers[token].hallId = hallItem.hallId;
		// this.robotPlayers[token].gameType = gameType;

		let services = ['',glodenFlowerService,cattleService,holdemService,landlordService];

		//new socket客户端
		let ZR_IO = robot_client(token,hallItem);

		//初始化业务
		let robotService = (services[gameType])(ZR_IO, {token: token});

		ZR_IO.emit('player_info', {}, (data, status) => {
			if(status){
				//更新用户信息
				let  playerInfo = data.playerInfo;
				global.playersInfo[playerInfo.playerId] = playerInfo;
				global.playersInfo[playerInfo.token] = playerInfo;

				//入场余额判断
				if(playerInfo.experience < hallItem.less){
					robotService.__destroy();
				}else{
					robotService.__setPlayerInfo(playerInfo);

					ZR_IO.playerId = playerInfo.playerId;
					
					ZR_IO.emit('matching_room', {});
				}
			}
		});
	}
}

module.exports = mainService;