
let getApiData = require('./api_utils');
let getApiJsonData = require('./api_json_utils');
let socketEmit = require('./socket_utils').socketEmit;
let socketError = require('./socket_utils').socketError;
let timerUtils = require('./timer_utils');
let commonUtils = require('./common_utils');

let zhajinhuaService = require('./game_zhajinhua');
let niuniuService = require('./game_niuniu');
let holdemService = require('./game_holdem');
let landlordService = require('./game_landlord');
let _wslog = require('./wslog_utils');

function gameService(){
	this.init();
}
gameService.prototype.init = function(){
	this.redisUtils = global.redisUtils;
	
	//测试Redis
	this.setRedisVal('test',{name:'haha',age:12});
	this.getRedisVal('test');
	this.setRedisVal('debug',{name:'haha',age:12});
	this.delRedisVal('debug');

	//记录大厅运行的服务
	this.matchingRunArr = [];

	this.getRobotImgArr();
};

gameService.prototype.getRedisVal = function(key,cb){
	this.redisUtils.zrGet.apply(this.redisUtils,arguments);
};
gameService.prototype.setRedisVal = function(key,value,cb){
	this.redisUtils.zrSet.apply(this.redisUtils,arguments);
};
gameService.prototype.delRedisVal = function(key,value,cb){
	this.redisUtils.zrDel.apply(this.redisUtils,arguments);
};

gameService.prototype._loadPlayerInfoByToken = function(playerToken, cb){
	let self = this;
	if(playerToken){
		this.redisUtils._get(playerToken, (status,info)=>{
			if(status && info && info.playerId){
				//更新信息
				self._freshPlayerInfo(info);

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

gameService.prototype.getPlayerInfo = function(socket, params){
	let playerToken = params.__token;
	let cbEventName = params.cbEventName;

	this._loadPlayerInfoByToken(playerToken,(status, playerInfo)=>{
		if(status){
			socketEmit(socket,null,cbEventName, {playerInfo: playerInfo}, true);
		}else{
			_wslog.error('用户信息读取失败');
			socketEmit(socket, null, cbEventName, null, false);
		}
	});
}

gameService.prototype.updatePlayerCoinsById = function(playerId, useCoins){
	if(isNaN(useCoins) || useCoins == null){
		console.error('更新用户金额出错 - ', useCoins);
		return;
	}

	let self = this;

	global.playersInfo[playerId].experience = commonUtils.roundNum(global.playersInfo[playerId].experience + useCoins);
	
	let playerToken = global.playersInfo[playerId].token;

	this._loadPlayerInfoByToken(playerToken, (status, playersInfo)=>{
		if(status){
			global.playersInfo[playerId].experience = commonUtils.roundNum(global.playersInfo[playerId].experience + useCoins);

			self.redisUtils._set(playerToken, global.playersInfo[playerId], null, '');
		}
	});
}

gameService.prototype.getRobotImgArr = function(){
	//获取机器人头像列表
	this.redisUtils._get('robot_head_img', (status,data)=>{
		if(status && data){
			global.robotHeadImgArr = data;
		}
	}, '');
}

//更新代理机器人名称列表
gameService.prototype.getRobotNamesByAgentId = function(agentId){
	//获取机器人头像列表
	this.redisUtils._get('robot_names_' + agentId, (status,data)=>{
		if(status && data){
			global.robotNameList[agentId] = data;
		}
	}, '');
}

//处理机器人名字头像
gameService.prototype._freshPlayerInfo = function(playerInfo){
	let _oldInfo = global.playersInfo[playerInfo.playerId];
	
	//更新机器人名字
	if(playerInfo.encoding === true){
		let agentId = playerInfo.agentId;

		let nameList = global.robotNameList[agentId];
		if(nameList && nameList.length){
			playerInfo.username = nameList[ Math.floor(Math.random()*nameList.length) ];
		}

		//机器人带入金额
		//TODO

		let imgList = global.robotHeadImgArr;
		if(imgList && imgList.length){
			playerInfo.headimg = imgList[ Math.floor(Math.random()*imgList.length) ];
		}
	}

	delete playerInfo.encoding; //移除该字段，不显示到客户端
}

//玩家房间开始处理
gameService.prototype._roomBeginDeal = function(playerId, gameRoomKey){
	if(global.playersRoomKey[playerId] == null){
		global.playersRoomKey[playerId] = {};
	}
	global.playersRoomKey[playerId][gameRoomKey] = {};
}

//玩家房间退出处理
gameService.prototype._roomEndDeal = function(playerId, gameRoomKey){
	//清楚玩家房间信息
	delete global.playersRoomKey[playerId];
}

gameService.prototype._checkPlayerToken = function(socket, params){
	let playerToken = params.__token;

	if(!playerToken){
		let text = '无token信息';
		console.error(text);
		socketError(socket, text, 'token_error');
		return false;
	}

	let playerInfo = global.playersInfo[playerToken];

	if(!playerInfo || !playerInfo.playerId){
		let text = '无token对应信息';
		console.error(text, playerInfo);
		socketError(socket, text, 'token_error');
		return false;
	}

	//返回当前玩家id
	params.playerId = playerInfo.playerId;

	//玩家token关联socket 一对多
	if(global.tokenSocketObj[playerToken] == null){
		global.tokenSocketObj[playerToken] = [];
	}
	if(global.tokenSocketObj[playerToken].indexOf(socket.id) == -1){
		global.tokenSocketObj[playerToken].push(socket.id);
	}
	
	//一对多
	global.playerIdSocketObj[playerInfo.playerId] = global.tokenSocketObj[playerToken];

	global.socketsInfo[socket.id].token = playerToken; //一对一
	global.socketsInfo[socket.id].playerId = playerInfo.playerId; //一对一
	return true;
}

gameService.prototype._checkPlayerAndRoom = function(socket, params){
	if(this._checkPlayerToken(socket, params) == false){
		return false;
	}
	
	let gameRoomKey = params.__gameRoomKey; //当前所在的房间key, 重连则尝试加入该房间
	if(!gameRoomKey){
		console.error('缺少房间gameRoomKey', gameRoomKey);
		return false;
	}

	let roomDetail = global.roomsDetail[gameRoomKey];

	if(!roomDetail){
		console.error('房间信息不存在', roomDetail);
		return false;
	}

	let paiPlayers = roomDetail.paiPlayers;

	// if(!paiPlayers){
	// 	console.error('房间无玩家信息', paiPlayers);
	// 	return false;
	// }

	if(paiPlayers){
		let seatNum;
		for(let p in paiPlayers){
			if(paiPlayers[p].playerId == params.playerId){
				seatNum = p;
				break;
			}
		}
	
		if(!seatNum){
			console.error('当前玩家未进行此次房间游戏', params.playerId, paiPlayers);
			return false;
		}
	
		//返回当前玩家座位号
		params.__seatNum = seatNum;
	}
	
	
	let gameId = roomDetail.roomInfo.gameId;
	let gameRoomType = global.gameTypes[gameId].type;
	if(gameRoomType == null){
		console.error('未能识别gameId', gameId);
		return false;
	}

	//返回当前游戏类别
	params.__gameRoomType = gameRoomType; //1：炸金花 2：牛牛 3：德州 4：斗地主

	return true;
}

gameService.prototype.matchingRoom = function(socket, params){
	if(this._checkPlayerToken(socket, params) == false){
		return;
	}

	let playerId = params.playerId;
	let gameHallItem = params.__hallItem;
	let cbEventName = params.cbEventName;
	let __agentId = global.playersInfo[playerId].agentId || '';

	//获取机器人名字列表
	this.getRobotNamesByAgentId(__agentId);
	
	//参数过滤
	if(!gameHallItem){
		let text = '加入房间失败，参数缺少：'+ gameHallItem + '-' + playerId;
		_wslog.error(text, params);
		socketError(socket, text);
		return;
	}

	let __gameId = gameHallItem.gameId;
	let __hallId = gameHallItem.hallId;

	let _gameType = global.gameTypes[__gameId];
	if(_gameType == null){
		let text = '无效gameId - ' + __gameId + ' - ' + playerId;
		_wslog.error(text, params);
		socketError(socket, text);
		return;
	}

	let gameType = _gameType.type;

	let hallKey = 'hall_' + __gameId + '_' + __hallId + '_' + __agentId;

	if(gameType == 1){ //TODO: 为不影响开发,只限制炸金花
		//当前玩的游戏判断处理
		if(global.playersRoomKey[playerId] && JSON.stringify(global.playersRoomKey[playerId]) != '{}' ){
			console.log('上局游戏未结束, 请等待', global.playersRoomKey, playerId);
			// socketEmit(socket, null, 'game_unfinish', {msg: '上局游戏未结束, 请等待'}, true);
			// return;
		}
	}

	//匹配房间前的业务数据 - 带入金额
	// enterData[hdItem.playerId] = {enterCoins: hdItem.enterCoins, isAutoEnter: hdItem.enterCoins};
	let _coins;
	if(gameType == 3){
		let playerInfo = global.playersInfo[playerId];
		let enterData = params.enterData;
		let minEnterCoins = 10, maxEnterCoins = 2000;
		if(enterData == null || enterData.coins == null || enterData.coins < minEnterCoins || enterData.coins > maxEnterCoins){
			let text = '参数无效 - enterData';
			_wslog.error(text, params);
			socketError(socket, text);
			return;
		}
		if(playerInfo.experience < minEnterCoins){
			let text = '带入金额不足 - ' + playerInfo.experience + ' - ' + minEnterCoins;
			_wslog.error(text, params);
			socketError(socket, text);
			return;
		}
		_coins = enterData.coins;
		if(enterData.coins > playerInfo.experience){
			_coins = playerInfo.experience;
		}
	}

	let hallData = global.hallsData[hallKey];
	if(hallData == null){
		hallData = global.hallsData[hallKey] = [];
	}

	//是否在匹配中...
	let isInHall = false, before_socketId;
	for(let i=0;i<hallData.length;i++){
		if(hallData[i].playerId == playerId){
			isInHall = true;
			break;
		}
	}

	//默认加入大厅组
	socket.join(hallKey,(error)=>{
		if(error){
			_wslog.error('加组失败：'+hallKey, playerId);
		}else{
			//异步在判断
			isInHall = false;
			for(let i=0;i<hallData.length;i++){
				if(hallData[i].playerId == playerId){
					before_socketId = hallData[i].socketId;
					hallData[i].socketId = socket.id; //放入socketId
					isInHall = true;
					break;
				}
			}
			if(isInHall == false){
				hallData.push({playerId:playerId, coins: _coins, socketId: socket.id, joinTime: new Date().getTime()}); //放入大厅
			}else{
				console.error('你已在匹配中...');
				//通知之前的socketId
				let bfSockerObj = global.io.sockets.sockets[before_socketId];
				if(bfSockerObj){
					bfSockerObj.leave(hallKey);
					socketEmit(null, before_socketId, 'match_other', {msg: '已在另一地方继续匹配'});
				}
			}
		}
	});

	if(this.matchingRunArr[hallKey] !== true){
		this.matchingRunArr[hallKey] = true;  //标记运行
		this._matchingTimer(gameHallItem, __agentId, null);
	}
}

gameService.prototype._matchingTimer = function(gameHallItem, agentId, times){
	let self = this;
	
	let gameId = gameHallItem.gameId, hallId = gameHallItem.hallId;

	let hallKey = 'hall_' + gameId + '_' + hallId + '_' + agentId;

	let matchMaxtime = 25; //玩家最大匹配时间
	let maxSeconds = 5; //匹配时间间隔，每5s
	let maxPersons = global.gameTypes[gameHallItem.gameId].maxPersons; //最多人数
	let minPersons = global.gameTypes[gameHallItem.gameId].minPersons; //至少人数
	
	let hallData = global.hallsData[hallKey];

	//通知机器人，需要的数量
	if(hallData.length < minPersons){
		//在最多人数跟已有至少人数之间随机
		let needNums =  Math.floor(Math.random()*(maxPersons - minPersons + hallData.length)) + (minPersons - hallData.length);
		_wslog.debug('通知机器人个数：' + needNums, hallKey);
		global.RobotMainIO.in('robot_main_room').emit('gen_robots',{
			eventData: {gameType: global.gameTypes[gameHallItem.gameId].type, __hallItem: gameHallItem},
			agentId: agentId, 
			needNums: needNums
		});
	}

	times==null && (times=maxSeconds);
	timerUtils.timeout(hallKey+'_match', 1, ()=>{
		hallData = global.hallsData[hallKey];

		//检查房间人数
		self._checkRoomClients(hallKey);
		//房间没人达到一定次数
		if(global.roomsClients[hallKey]){
			let roomEmptyCount = global.roomsClients[hallKey].emptyCount;
			if(roomEmptyCount > 10){ //10次轮询
				console.debug('大厅无客户端连接超过10s,取消定时器 - ' + hallKey);
				global.roomsClients[hallKey].emptyCount = 0;
				hallData = global.hallsData[hallKey] = []; //清空人数
			}
		}

		//移除掉线，跟超时的
		let _now = new Date().getTime();
		for(let z=hallData.length-1;z >=0; z--){
			let item = hallData[z];

			let sk = global.io.sockets.sockets[hallData[z].socketId];
			if(sk == null){
				hallData.splice(z,1); //移除
			}else{
				if(_now - item.joinTime >= matchMaxtime*1000){
					//通知当前玩家匹配失败
					socketEmit(null, hallData[z].socketId, 'match_end', {msg: '未匹配到人数'});
					
					hallData.splice(z,1); //移除
				}
			}
		}


		let personNums = 0
		if(hallData.length >= maxPersons){ //最多人数
			personNums = maxPersons;
		}else if(hallData.length >= minPersons){ //至少人数
			if(times <= 1){ //执行匹配开始
				personNums = hallData.length;
			}
		}
		
		if(personNums > 0){
			let roomPlayerIds = [], roomTokens = [], leaveSocketIds = [], enterData = {};
			for(let i=0;i<personNums;i++){
				let hdItem = hallData[i];

				leaveSocketIds.push(hdItem.socketId);
				roomPlayerIds.push(hdItem.playerId);
				if(hdItem.coins){
					enterData[hdItem.playerId] = {coins: hdItem.coins};
				}
			}
			hallData.splice(0, personNums); //移除已加入的玩家

			//分配房间号
			self.getGameRoom({gameId: gameId, hallId: hallId}, (state, data)=>{
				if(state){
					let playersInfo = {};
					
					roomPlayerIds.forEach((item)=>{
						playersInfo[item] = global.playersInfo[item];
						roomTokens.push(global.playersInfo[item].token || global.playersInfo[item].playerToken);
					});

					//通知已加入的玩家
					let roomInfo = data.room;
					let roomKey = 'room_' + gameId + '_' + hallId + '#' + roomInfo.roomId;
					let hallKey = 'hall_' + gameId + '_' + hallId+ '_' + agentId;

					let roomsDetail = {};
					roomsDetail.roomKey = roomKey;
					roomsDetail.playerIds = roomPlayerIds;
					roomsDetail.playerTokens = roomTokens;
					roomsDetail.playersInfo = playersInfo;
					roomsDetail.roomInfo = roomInfo;
					roomsDetail.enterStatus = {};
					roomsDetail.enterData = enterData;
					roomsDetail.gameStatus = 0;

					global.roomsDetail[roomKey] = roomsDetail; //初始化房间详情

					socketEmit(null, hallKey, 'game_ready', {playerIds: roomPlayerIds, roomKey: roomKey}, true);
				}else{
					socketEmit(null, hallKey, 'game_ready', {playerIds: roomPlayerIds}, false);
				}

				//离开大厅组
				leaveSocketIds.forEach((item)=>{
					let bfSockerObj = global.io.sockets.sockets[item];
					if(bfSockerObj){
						bfSockerObj.leave(hallKey);
					}
				});
				
			});
		}

		if(hallData.length > 0){
			if(times <= 1){ //重置秒数
				times = null;
			}else{
				times --;
			}
			self._matchingTimer(gameHallItem, agentId, times);
		}else{
			console.log('匹配调度结束 - ' + hallKey);
			delete self.matchingRunArr[hallKey];
		}
	});
}

gameService.prototype.getGameRoom = function(params, cb){
	getApiData('/api/game/room/joinHallRoom', 'POST', params, function (state, data) {
		cb && cb(state, data);
	});
}

gameService.prototype.enteringRoom = function(socket,params){
	if(this._checkPlayerToken(socket, params) == false){
		return;
	}

	let self = this;
	let playerId = params.playerId;
	let cbEventName = params.cbEventName;
	let roomKey = params.roomKey;

	if(!roomKey){
		let text = '进入房间失败，参数缺少：'+roomKey;
		_wslog.error(text, params);
		socketEmit(socket, null, cbEventName, {msg: text}, false);
		return;
	}

	let roomDatail = global.roomsDetail[roomKey];
	
	if(!roomDatail){
		let text = '房间信息不存在！';
		_wslog.error(text, params);
		socketEmit(socket, null, cbEventName, {msg: text}, false);
		return;
	}

	if(roomDatail.playerIds.indexOf(playerId) == -1){
		let text = '不是当前房间用户 - ' + playerId;
		_wslog.error(text, params, roomDatail.playerIds);
		socketEmit(socket, null, cbEventName, {msg: text}, false);
		return;
	}

	let joinCb = (socket)=>{
		roomDatail.enterStatus[playerId] = {playerId: playerId, isEnter: true, socketId: socket.id};

		let canBeginGame = true;
		roomDatail.playerIds.forEach((item)=>{
			if(roomDatail.enterStatus[item] == null || roomDatail.enterStatus[item].isEnter != true){
				canBeginGame = false;
			}
		});
	
		if(canBeginGame){ //通知开始游戏，发牌等操作事件，再对应业务代码里处理
			let roomBeginSv = {};
			roomBeginSv[roomKey] = {roomKey: roomKey};
			roomDatail.playerIds.forEach((item)=>{
				self._roomBeginDeal(item, roomBeginSv);
			});
			
			//记录玩家在玩的游戏
			global.playersRoomKey[playerId] = roomKey;

			let gameRoomType = global.gameTypes[roomDatail.roomInfo.gameId].type;

			if(gameRoomType <= 2){
				let _gameTypeServices = ['',zhajinhuaService,niuniuService,holdemService,landlordService];
				new _gameTypeServices[gameRoomType](this).beginGame(socket,params);
			}else if(gameRoomType == 3){
				new holdemService(socket,this).beginGame(params);
			}else if(gameRoomType == 4){
				new landlordService(socket,this).beginGame(params);
			}
		}
	};

	//加入游戏房间组
	socket.join(roomKey,(error)=>{
		if(error){
			_wslog.error('加组失败：'+roomKey, playerId);
		}else{
			joinCb(socket);
		}
	});
}

gameService.prototype.dealGameOperate = function(socket, emitName, params){
	if(this._checkPlayerAndRoom(socket, params) == false){
		return;
	}

	let gameRoomType = params.__gameRoomType;
	if(gameRoomType <= 2){
		let _gameTypeServices = ['',zhajinhuaService,niuniuService,holdemService,landlordService];
		new _gameTypeServices[gameRoomType](this).dealOperate(socket, emitName, params);
	}else if(gameRoomType == 3){ //德州扑克
		new holdemService(socket,this).dealOperate(emitName,params);
	}else if(gameRoomType == 4){ //斗地主
		new landlordService(socket,this).dealOperate(emitName,params);
	}
	
	// if(params.cbEventName){ //对当前socket回调
	// 	socketEmit(socket, null, params.cbEventName, {}, true);
	// }
}

/**
 * 检验房间有木有人的方法
 * @param {*} roomKey 
 */
gameService.prototype._checkRoomClients = function(roomKey){
	global.io.of('/').adapter.clients([roomKey], (err, clients) => {
		if(global.roomsClients[roomKey] == null){
			global.roomsClients[roomKey] = {roomKey: roomKey};
		}
		if(clients && clients.length > 0){
			global.roomsClients[roomKey].clients = clients;
			global.roomsClients[roomKey].emptyCount = 0;
		}else{
			global.roomsClients[roomKey].clients = [];
			global.roomsClients[roomKey].emptyCount += 1;
		}
	});
}

module.exports = gameService;