
let socketEmit = require('./socket_utils').socketEmit;
let timerUtils = require('./timer_utils');
let commonUtils = require('./common_utils');
let getApiData = require('./api_utils');
let apiJsonUtils = require('./api_json_utils');

const __bipaiSeconds = 2; //比牌需要的时间
const __lundaoSeconds = 15; //每次轮流倒计时

global.___zhajinhuaService = null;

let zhajinhuaService = function (parentService){
	if(global.___zhajinhuaService==null){ //单例模式
		global.___zhajinhuaService = this;
	}
	global.___zhajinhuaService.parentService = parentService;
	return global.___zhajinhuaService;
}

zhajinhuaService.prototype.beginGame = function(socket, params){
	let self = this;
	let roomKey = params.roomKey;
	let cbEventName = params.cbEventName;
	let roomDetailData = global.roomsDetail[roomKey];

	let enterStatus = roomDetailData.enterStatus;
	
	let playersTokens = {};
	let seatNumIndex = 1, paiPlayers = {}, paiSeatNumArr = [];
	for(let pid in roomDetailData.enterStatus){
		let pinfo = global.playersInfo[pid];

		enterStatus[pid].seatNum = seatNumIndex;
		
		paiPlayers[seatNumIndex] = {
			seatNum: seatNumIndex,
			playStatus: 1, //playStatus => null：未加入 1：游戏中 2:弃牌，3：败了 4:赢了
			token: pinfo.playerToken,
			isSee: false,
			playerId: pid
		}
		paiSeatNumArr.push(seatNumIndex);
		playersTokens[pinfo.playerToken] = seatNumIndex;
		seatNumIndex ++;
	}

	paiSeatNumArr.sort((a,b)=>{return parseInt(a) > parseInt(b)});

	let zjSeatNum = paiSeatNumArr[Math.floor(Math.random()*paiSeatNumArr.length)]; //庄家座位号 //随机

	roomDetailData.zhuangjia = {seatNum: zjSeatNum};
	roomDetailData.paiPlayers = paiPlayers;
	roomDetailData.paiSeatNumArr = paiSeatNumArr;

	//请求牌信息
	let paiParams = {roomId: roomDetailData.roomInfo.roomId, tokens: Object.keys(playersTokens)};

	this._getPaiData(paiParams, (status,data)=>{
		if(status && data && data.pokes){
			roomDetailData = global.roomsDetail[roomKey];

			roomDetailData.gameStatus = 1; //1-已经发牌，开始了

			let seatPaiData = {};
			for(let x in data.pokes){
				seatPaiData[playersTokens[x]] = data.pokes[x];
			}

			roomDetailData.seatPaiData = seatPaiData;
			roomDetailData.pokes = data.pokes;
			roomDetailData.round = data.round;

			roomDetailData.currPlayerSeatNum = zjSeatNum;

			let hallItem = roomDetailData.roomInfo.hall;

			roomDetailData.gameInfo = {  //存放游戏信息
				currBeishu: 0, //初始倍数
				bottomCast: hallItem.bottom,
				singleCast: hallItem.bottom,
				currLoopTimes: 1,
				topCast: hallItem.top,
				maxLoopTimes: hallItem.round,
				sumCast: commonUtils.roundNum(hallItem.bottom * paiSeatNumArr.length)
			};

			//加注列表处理
			let _betStep = (hallItem.top/2 - hallItem.bottom)/6;
			if(hallItem.bottom < 1){
				_betStep = commonUtils.roundNum(_betStep,1);
			}else if(hallItem.bottom >=1 && hallItem.bottom < 10){
				_betStep = commonUtils.roundNum(_betStep,0);
			}else{
				_betStep = commonUtils.roundNum(_betStep/10,0)*10;
			}

			//加注列表
			let jiazhuList = [];
			let _sum = hallItem.bottom;
			for(let i=0;i<5;i++){
				_sum += _betStep;
				
				if(hallItem.bottom < 1){
					_sum = commonUtils.roundNum(_sum, 1);
				}else if(hallItem.bottom >=1 && hallItem.bottom < 10){
					_sum = commonUtils.roundNum(_sum,0);
				}else{
					_sum = commonUtils.roundNum(_sum/10,0)*10;
				}

				if(i==0 && _sum <= hallItem.bottom){
					_sum = hallItem.bottom + 0.1;
				}

				jiazhuList[i] = _sum;
			}
			jiazhuList.push(hallItem.top / 2); //顶注一半
			
			roomDetailData.gameInfo.jiazhuList = jiazhuList;

			//金币数据
			roomDetailData.coinsData = [];

			//用户金币、注数
			roomDetailData.playerCoinsInfo = {};

			//首次放注
			for(let k in paiPlayers){
				let pid = paiPlayers[k].playerId;
				//type: base-底注，genzhu-跟注，jiazhu2-加注，bipai-比牌
				//castNum：注数
				//count: 放上去的个数
				let _count = 1, _castNum = hallItem.bottom;
				let _useCoins = commonUtils.roundNum(_castNum*_count);
				roomDetailData.coinsData.push({seatNum: k, playerId: pid, castNum: _castNum, count: _count, coins: _useCoins, type: 'base' });

				//ownCoins: 剩余金币数， payCoins：已使用金币数
				let _experience = global.playersInfo[pid].experience; 
				let _payCoins = _useCoins;
				let _ownCoins = commonUtils.roundNum(_experience - _payCoins);

				//更新用户金额
				self.parentService.updatePlayerCoinsById(pid, -_payCoins);
				
				roomDetailData.playerCoinsInfo[k] = {seatNum: k, playerId: pid, ownCoins: _ownCoins, payCoins: _payCoins};
			}

			socketEmit(socket, roomKey, 'game_fapai', { //过滤数据，数据安全性
				roomKey: roomDetailData.roomKey,
				gameStatus: roomDetailData.gameStatus,
				playersInfo: roomDetailData.playersInfo,
				paiSeatNumArr: roomDetailData.paiSeatNumArr,
				paiPlayers: roomDetailData.paiPlayers,
				currPlayerSeatNum: roomDetailData.currPlayerSeatNum,
				gameInfo: roomDetailData.gameInfo,
				playerCoinsInfo: roomDetailData.playerCoinsInfo,
				coinsData: roomDetailData.coinsData,
				zhuangjia: roomDetailData.zhuangjia,
			}, true);

			//发牌后及时
			setTimeout(()=>{
				self._gameDoingByFirstSeat(socket, roomKey, true);
			}, 1500);
		}else{
			socketEmit(socket, roomKey, 'game_fapai', null, false);
		}
	});
}

zhajinhuaService.prototype._getPaiData = function(params, cb){ 
	apiJsonUtils('/api/game/round/deal', 'POST', {
		roomId: params.roomId,
		tokens: params.tokens
	}, function (state, data) {
		cb && cb(state, data);
	});
}

/**
 * 判断房间在玩的人数
 * 返回 ： 结束参数数组
 */
zhajinhuaService.prototype._gameOverCheck = function(socket, gameRoomKey){
	let self = this;

	let roomDetailData = global.roomsDetail[gameRoomKey];

	//计算有效玩家 - s
	let effectiveSeatNumArr = [];

	let paiPlayers = roomDetailData.paiPlayers;
	
	for(let k in paiPlayers){
		if(paiPlayers[k].playStatus == 1){  //playStatus => null：未加入 1：游戏中 2:弃牌，3：败了 4:赢了
			effectiveSeatNumArr.push(k+'');
		}
	}

	//是否可以结束
	if(effectiveSeatNumArr.length == 0){ //结束了
		return [socket, gameRoomKey, 'over'];
	}

	if(effectiveSeatNumArr.length == 1){
		return [socket, gameRoomKey, 'balance', effectiveSeatNumArr];
	}
}

/**
 * 单例模式，需要引入当前socket
 */
zhajinhuaService.prototype._gameDoingByFirstSeat = function(socket, gameRoomKey, isFirst){
	console.log('game_lundao', gameRoomKey, isFirst);

	let self = this;
	let lundaoSeconds = __lundaoSeconds;
	
	//检查房间人数
	this.parentService._checkRoomClients(gameRoomKey);

	//房间没人达到一定次数
	if(global.roomsClients[gameRoomKey]){
		let roomEmptyCount = global.roomsClients[gameRoomKey].emptyCount;
		if(roomEmptyCount > 1){ //3次轮询
			console.debug('游戏房间没人了，进行清算 - ', gameRoomKey);
			global.roomsClients[gameRoomKey].emptyCount = 0;
			this._gameOverDeal(socket, gameRoomKey, 'empty');
			return;
		}
	}

	let roomDetailData = global.roomsDetail[gameRoomKey];
	let paiPlayers = roomDetailData.paiPlayers;

	//计算当前发牌者(起始是庄家，开始是庄家的下一个人)
	let preSeatNum = roomDetailData.currPlayerSeatNum;

	//轮到
	let lundaoSeatNum;

	let isCurrRepeat = false;
	//上个玩家是否跟注，没跟注就弃牌操作
	if(roomDetailData.currPlayerOperatSign == null){
		if(!isFirst && paiPlayers[preSeatNum].playStatus == 1){ //不是第一次，玩家还在玩
			paiPlayers[preSeatNum].playStatus = 2;
			//判断是否结束
			socketEmit(socket, gameRoomKey, 'qipai', {
				seatNum: preSeatNum, playStatus: paiPlayers[preSeatNum].playStatus
			}, true); 
		}
	}else if(roomDetailData.currPlayerOperatSign == 'bipai'){ //上个玩家是提出比牌，比牌计时
		if(roomDetailData.isBipaiSuccess){ //比牌胜了
			// isCurrRepeat = true;  //取消连续比牌
			// lundaoSeconds = lundaoSeconds + __bipaiSeconds; //比牌时间控制
		}
	}

	//计算有效玩家 - s
	let effectiveSeatNumArr = [];

	for(let sn in paiPlayers){
		if(paiPlayers[sn].playStatus == 1){  //playStatus => null：未加入 1：游戏中 2:弃牌，3：败了 4:赢了
			effectiveSeatNumArr.push(sn+'');
		}
	}

	//是否可以结束
	if(effectiveSeatNumArr.length == 0){ //结束了
		this._gameOverDeal(socket, gameRoomKey, 'over');
		return;
	}

	if(effectiveSeatNumArr.length == 1){
		this._gameOverDeal(socket, gameRoomKey, 'balance', effectiveSeatNumArr);
		return;
	}

	effectiveSeatNumArr.sort((a,b)=>{return parseInt(a) > parseInt(b)});
	//计算有效玩家 - e

	if(isCurrRepeat){
		lundaoSeatNum = preSeatNum;
	}else{
		//上个玩家位置
		let _curIx = effectiveSeatNumArr.indexOf(preSeatNum+'') + 1; //下一个

		if(_curIx > effectiveSeatNumArr.length - 1){ //是否是最后一个
			_curIx = 0;
		}
		
		lundaoSeatNum = effectiveSeatNumArr[_curIx];
		
		//记录每个玩家的次数
		if(!roomDetailData._operaTimes){
			roomDetailData._operaTimes = {};
		}
		if(!roomDetailData._operaTimes[lundaoSeatNum]){
			roomDetailData._operaTimes[lundaoSeatNum] = 0;
		}
		roomDetailData._operaTimes[lundaoSeatNum] ++; //次数累加

		//更新轮次
		for(let kk in roomDetailData._operaTimes){
			if(roomDetailData._operaTimes[kk] > roomDetailData.gameInfo.currLoopTimes){
				roomDetailData.gameInfo.currLoopTimes = roomDetailData._operaTimes[kk];
			}
		}

		if(roomDetailData.gameInfo.currLoopTimes > roomDetailData.gameInfo.maxLoopTimes){
			this._gameOverDeal(socket, gameRoomKey, 'loop_end', effectiveSeatNumArr);
			return;
		}
	}

	roomDetailData.currPlayerSeatNum = lundaoSeatNum;
	roomDetailData.currPlayerOperatSign = null;

	socketEmit.call(self, socket, gameRoomKey, 'game_lundao', { //轮到谁操作，及操作倒计时; 同时通知其他人的操作选项
		// bipaiSeconds: __bipaiSeconds,
		// currOperate: roomDetailData.currPlayerOperatSign,
		seatNum: lundaoSeatNum,
		gameInfo: roomDetailData.gameInfo,
		timerSeconds: lundaoSeconds
	}, true);

	let timerName = 'game_lundao_' + gameRoomKey;
	timerUtils.timeout(timerName, lundaoSeconds + 3, ()=>{ //多3秒
		self._gameDoingByFirstSeat(socket, gameRoomKey, false);
	});
};

zhajinhuaService.prototype._gameDealToApi = function(recordKey, cb){
	apiUtils('/api/game/round/record','POST', {recordKey:recordKey},(status,data)=>{
		cb && cb(status,data);
	});
}

zhajinhuaService.prototype._gameOverDeal = function(socket, gameRoomKey, overSign, effectiveSeatNumArr){
	console.log('>>> gameOverDeal - '+ gameRoomKey + ' - ' + overSign);

	let self = this;

	//做结算
	let roomDetail = global.roomsDetail[gameRoomKey];
	
	//记录已结算状态
	if(roomDetail == null){
		console.log('>>>> 房间数据已经移除');
		return;
	}
	
	if(roomDetail.hasGameOverDeal === true){
		console.log('>>>> 房间结算已经处理');
		return;
	}

	//记录游戏结束状态
	roomDetail.hasGameOverDeal = true;

	let seatPaiData = roomDetail.seatPaiData;

	let winSeatNum;

	//overSign: empty、loop_end、over、balance
	if(overSign == 'empty'){ //都失去连接

	}else if(overSign == 'over'){ //没有在玩状态的人

	}else if(overSign == 'loop_end'){ //循环结束 - 比牌

	}else if(overSign == 'balance'){ //剩余最后一个玩家了，结算
		winSeatNum = effectiveSeatNumArr[0];
	}

	let params = {players:[]};

	if(effectiveSeatNumArr){
		winSeatNum = effectiveSeatNumArr[0];

		effectiveSeatNumArr.forEach((itemSeatNum,index)=>{
			if(index > 0 && seatPaiData[itemSeatNum].priority > seatPaiData[winSeatNum].priority){
				winSeatNum = itemSeatNum;
			}
		});
	}

	// {seatNum: k, playerId: pid, ownCoins: _ownCoins, payCoins: _payCoins, experience: _experience};

	let coinsData = roomDetail.coinsData;
	let playerCoinsInfo = roomDetail.playerCoinsInfo;
	let roomInfo = roomDetail.roomInfo;
	let paiPlayers = roomDetail.paiPlayers;

	let _recodeData = {
		"players": [],
		"roomId": roomInfo.roomId
	  }

	//   {
	// 	"bet": 0,
	// 	"playerId": 0,
	// 	"pokeId": 0,
	// 	"tax": 0,
	// 	"vaildBet": 0,
	// 	"win": 0
	//   }

	let _winnerCoins = 0, _win;

	for(let p in playerCoinsInfo){
		let item = playerCoinsInfo[p];
		let playerInfo = global.playersInfo[item.playerId];
		
		self.parentService._roomEndDeal(item.playerId, gameRoomKey);

		let _pdata = {
			"token": playerInfo.token,
			"playerId": item.playerId,
			"bet": item.payCoins,
			"pokeId": roomDetail.seatPaiData[item.seatNum].pokeId,
			// "vaildBet": 0,
			// "tax": 0,
			// "win": 0,
			// "isWinner": false
		};

		if(item.seatNum == winSeatNum){ //胜利者
			_pdata.vaildBet = item.payCoins;
			_pdata.isWinner = true;
		}else{
			_pdata.tax = 0;
			_pdata.isWinner = false;

			//计算实际扣掉的钱
			let usedCoins = item.payCoins;
			if(item.payCoins > item.experience){ //钱不够扣
				usedCoins = item.experience;
			}

			_pdata.win = -usedCoins;
			_winnerCoins += usedCoins;
			_pdata.vaildBet = usedCoins;
		}

		_pdata.seatNum = item.seatNum;

		_recodeData.players.push(_pdata);
	}

	_recodeData.players.forEach((item)=>{
		if(item.isWinner === true){
			let taxMoney = 0;
			if(roomInfo.hall.tax != null){ //收益者扣钱
				taxMoney = commonUtils.roundNum(roomInfo.hall.tax*_winnerCoins);

				if(taxMoney < 0.01){ //至少收0.01
					taxMoney = 0.01;
				}
			}

			item.tax = taxMoney;
			item.win = commonUtils.roundNum(_winnerCoins - taxMoney);

			//下注的钱加回来
			item.ownCoins = commonUtils.roundNum(global.playersInfo[item.playerId].experience + item.bet + item.win);

			//更新用户金额
			self.parentService.updatePlayerCoinsById(item.playerId, item.bet + item.win);

			let seatNum = roomDetail.enterStatus[item.playerId].seatNum;
			if(paiPlayers[seatNum].hasPK === true){
				socketEmit(null, gameRoomKey, 'show_pai', {seatNum: seatNum, paiData: roomDetail.seatPaiData[seatNum]});
			}
		}else{
			item.ownCoins = global.playersInfo[item.playerId].experience;
		}
	});

	let _recordKey = "record_" + roomInfo.roomId;

	this.parentService.redisUtils._set(_recordKey, _recodeData, (status)=>{
		if(status){
			self._gameDealToApi(_recordKey, (status,data)=>{
				let isSuccess = false;
				if(status){
					//移除房间数据
					delete global.roomsDetail[gameRoomKey];

					isSuccess = true;
				}
				socketEmit(socket, gameRoomKey, 'game_over', {winSeatNum: winSeatNum, players: _recodeData.players}, isSuccess);
			},'');
		}else{
			socketEmit(socket, gameRoomKey, 'game_over', {winSeatNum: winSeatNum, players: _recodeData.players}, false);
		}
	});
	
	//清除数据
	// delete global.roomsDetail[gameRoomKey];
};

zhajinhuaService.prototype._showPaiData = function(gameRoomKey, seatNum){
	let roomDetailData = global.roomsDetail[gameRoomKey];
	let playerId = roomDetailData.paiPlayers[seatNum].playerId;

	let socketId = roomDetailData.enterStatus[playerId].socketId;
	let paiData = roomDetailData.seatPaiData[seatNum];

	socketEmit(null, socketId, 'show_pai', {seatNum:seatNum, paiData: paiData}, true);
}

zhajinhuaService.prototype.dealOperate = function(socket, emitName, params){
	let self = this;
	let playerId = params.playerId;
	let gameRoomKey = params.__gameRoomKey;
	let roomSeatNum = params.__seatNum;
	let playerToken = params.__token;

	let roomDetailData = global.roomsDetail[gameRoomKey];

	if(roomDetailData == null){
		console.log('>>>> dealOperate - 房间数据不存在 - ' + emitName);
		return;
	}

	if(roomDetailData.hasGameOverDeal === true){
		console.log('>>>> dealOperate - 房间已进行结算处理 - ' + emitName);
		return;
	}

	let paiPlayers = roomDetailData.paiPlayers;
	let gameInfo = roomDetailData.gameInfo;
	//已开牌，跟注双倍; 单注不变
	let isSee = paiPlayers[roomSeatNum].isSee;
	let pcInfo = roomDetailData.playerCoinsInfo[roomSeatNum];
	//用户金币
	let _experience = global.playersInfo[playerId].experience;

	let seatPaiData = roomDetailData.seatPaiData;
	let jiazhuList = gameInfo.jiazhuList;
	
	//统一处理的操作
	let _operaEvents = ['genzhu','jiazhu','bipai'];

	if(paiPlayers[roomSeatNum].playStatus != 1){
		console.log('>>>> dealOperate - 玩家不能继续操作 - ' + paiPlayers[roomSeatNum].playStatus, emitName, playerId);
		return;
	}

	if(emitName == 'kanpai'){
		// if(gameInfo.currLoopTimes <= 1){
		// 	console.error('第一轮不能看牌', playerId, gameInfo.currLoopTimes);
		// 	return;
		// }
		
		if(paiPlayers[roomSeatNum].isSee == true){
			//已经看牌了
			return;
		}

		//获取牌data
		let paiData = seatPaiData[roomSeatNum];

		//标记已看牌
		paiPlayers[roomSeatNum].isSee = true;

		//通知其他人
		socketEmit(socket, gameRoomKey, 'kanpai', {
			seatNum: roomSeatNum, gameInfo: gameInfo
		}, true, false); //没有自己

		//牌展示给自己
		socketEmit(socket, null, 'kanpai', {
			seatNum: roomSeatNum, paiData: paiData, gameInfo: gameInfo
		}, true);

	}else if(_operaEvents.indexOf(emitName) != -1){
		let timerCb;
		if(emitName == 'bipai'){
			if(gameInfo.currLoopTimes <= 1){
				console.error('第一轮不能比牌', playerId, gameInfo.currLoopTimes);
				return;
			}

			timerCb = timerUtils.getTimerCb('game_lundao_'+gameRoomKey);
			timerUtils.clearTimer('game_lundao_'+gameRoomKey);

			// if(isSee == false){ //比牌前必须先看牌
			// 	console.error('还没看牌，不能进行比牌', playerId);
			// 	return;
			// }
		}

		if(roomDetailData.currPlayerOperatSign == null){ //记录操作状态
			roomDetailData.currPlayerOperatSign = emitName;
		}else{
			console.warn('每个玩家限制一次操作', playerId);
			return;
		}

		if(emitName == 'jiazhu'){
			let singleBeishu = parseInt(params.jiazhuSign);
			if(singleBeishu > jiazhuList.length){
				singleBeishu = jiazhuList.length;
			}
			if(singleBeishu > gameInfo.currBeishu){ //更高倍数
				gameInfo.currBeishu = singleBeishu;
			}else{
				emitName = 'genzhu';
			}
		}

		if(gameInfo.currBeishu > 0){
			gameInfo.singleCast = commonUtils.roundNum(jiazhuList[gameInfo.currBeishu - 1]);
		}else{
			gameInfo.singleCast = gameInfo.bottomCast;
		}

		let singleCast = gameInfo.singleCast;

		//加入金币数据
		let _count = (isSee?2:1), _castNum = singleCast;

		let bipaiResult;
		let bipaiPaiData, paiShowCb;
		
		if(emitName == 'bipai'){
			// _count *= 2; //比牌不用2倍

			//比牌结果处理
			let bipaiSeatNum = params.bipaiSeatNum;

			let winSeatNum = roomSeatNum, loseSeatNum = bipaiSeatNum;
			if(seatPaiData[roomSeatNum].priority < seatPaiData[bipaiSeatNum].priority){ //输了
				winSeatNum = bipaiSeatNum, loseSeatNum = roomSeatNum;
			}

			bipaiResult = {
				seatNumArr: [roomSeatNum, bipaiSeatNum],
				winSeatNum: winSeatNum,
				loseSeatNum: loseSeatNum
			}

			//标记比过牌
			paiPlayers[roomSeatNum].hasPK = true;
			paiPlayers[bipaiSeatNum].hasPK = true;

			//更改失败者状态
			paiPlayers[loseSeatNum].playStatus = 3; //3-败了

			//记录当前比牌胜负
			roomDetailData.isBipaiSuccess = (winSeatNum == roomSeatNum);

			//是否是最后比牌
			let _livePlayerIds = [];
			for(let z in paiPlayers){
				let item = paiPlayers[z];
				item.playStatus == 1 ? _livePlayerIds.push(item.seatNum) : '';
			}
			if(_livePlayerIds.length < 2){ //是最后比牌，显示比牌结果
				bipaiPaiData = {};
				bipaiPaiData[roomSeatNum] = seatPaiData[roomSeatNum];
				bipaiPaiData[bipaiSeatNum] = seatPaiData[bipaiSeatNum];
			}else{
				//显示失败者的牌
				paiShowCb = ()=>{self._showPaiData(gameRoomKey, loseSeatNum)};
			}
		}

		let _useCoins =  commonUtils.roundNum(_castNum*_count);
		let _coinsData = {seatNum: roomSeatNum, playerId: pcInfo.playerId, castNum: _castNum, count: _count, coins: _useCoins, beishu: gameInfo.currBeishu, type: emitName };
		roomDetailData.coinsData.push(_coinsData);
		
		pcInfo.payCoins = commonUtils.roundNum(pcInfo.payCoins + _useCoins);
		pcInfo.ownCoins = commonUtils.roundNum(_experience - _useCoins);
		gameInfo.sumCast = commonUtils.roundNum(gameInfo.sumCast + _useCoins);

		//更新用户金额
		this.parentService.updatePlayerCoinsById(playerId, -_useCoins);

		let _pcifD = {};
		_pcifD[roomSeatNum] = pcInfo;
		socketEmit(socket, gameRoomKey, emitName, {
			seatNum: roomSeatNum,
			bipaiSeconds: __bipaiSeconds,
			bipaiResult: bipaiResult,
			bipaiPaiData: bipaiPaiData,
			playerCoinsInfo: _pcifD,
			coinsData: [_coinsData],
			gameInfo: gameInfo
		}, true);

		//延时通知下一个循环
		if(emitName == 'bipai'){
			setTimeout(()=>{
				timerCb && timerCb();
				paiShowCb && paiShowCb();
			}, __bipaiSeconds*1000);
		}else{
			//下一个循环
			timerUtils.execNext('game_lundao_' + gameRoomKey);
		}
	}else if(emitName == 'qipai'){
		paiPlayers[roomSeatNum].playStatus = 2; //playStatus => null：未加入 1：游戏中 2:弃牌，3：败了

		//判断是否结束
		socketEmit(socket, gameRoomKey, 'qipai', {
			seatNum: roomSeatNum,
			playStatus: paiPlayers[roomSeatNum].playStatus
		}, true);

		this._showPaiData(gameRoomKey, roomSeatNum);
		
		let _endParams = this._gameOverCheck(socket, gameRoomKey);
		if(_endParams != null){
			timerUtils.clearTimer('game_lundao_'+gameRoomKey);
			self._gameOverDeal.apply(self, _endParams);
		}else{
			//下一个循环
			timerUtils.execNext('game_lundao_' + gameRoomKey);
		}
	}
};

module.exports = zhajinhuaService;