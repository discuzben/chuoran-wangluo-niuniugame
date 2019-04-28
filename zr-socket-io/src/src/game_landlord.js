
let socketEmit = require('./socket_utils').socketEmit;
let timerUtils = require('./timer_utils');
let commonUtils = require('./common_utils');
let getApiData = require('./api_utils');
let getApiJsonData = require('./api_json_utils');

global.___landlordService = null;

const landlordMultiple = ["不叫", "1", "2", "3"];//地主倍数选择
const outCardTimeout = 100;//出牌时间
const operationTimeout = 11;//操作时间

var self;

let landlordService = function (socket,parentService){
	if(global.___landlordService==null){ //单例模式
		global.___landlordService = this;
	}
	global.___landlordService.socket = socket;
	global.___landlordService.parentService = parentService;
	return global.___landlordService;
}
/*
*开始游戏
*/
landlordService.prototype.beginGame = function(params){
	console.log("begin game");
	self = this;
	let roomKey = params.roomKey;
	let roomDetail = global.roomsDetail[roomKey];
	roomDetail.step = 0;//0 停止, 1 发牌，2 生成一个叫地主， 3 下一个玩家抢地主,  4 出牌（不出，提示，出牌）
	for (var key in roomDetail.playersInfo) {
		roomDetail.playersInfo[key].experience = commonUtils.roundNum(roomDetail.playersInfo[key].experience);
		roomDetail.playersInfo[key].isCall = -1;//-1 未操作, 0 不叫, 1 1倍, 2 2倍, 3 3倍
		roomDetail.playersInfo[key].beginCall = false;//是否开始叫地主
		roomDetail.playersInfo[key].isLandlord = false;//是不是地主
		roomDetail.playersInfo[key].lastPokers = new Array();//上一轮出的牌
		roomDetail.playersInfo[key].lastPokersType = null;//上一轮出的牌型
		roomDetail.playersInfo[key].remainingPokers = new Array();//剩余的牌
		roomDetail.playersInfo[key].outPokersNumber = 0;//出牌次数
		roomDetail.playersInfo[key].isOutPoker = 0;//是否出牌 0 不能出牌 1 出牌中 2 不符合规则 3 可以出牌 4 不出
		roomDetail.playersInfo[key].isWin = false;//是否胜利
		roomDetail.playersInfo[key].winOrLoseMoney = 0;//输赢多少
		roomDetail.playersInfo[key].promptCards = new Array();//提示的牌
	}
	self.licensing(roomKey);
}

landlordService.prototype.dealOperate = function (emitName, params) {
	self = this;
	let roomDetail = global.roomsDetail[params.__gameRoomKey];
	var roomKey = params.__gameRoomKey;
	if (emitName == "calllandlordClick") {//叫地主按钮点击事件
		timerUtils.clearTimer("callLandlord" + params.__gameRoomKey);
		self.robLandlord(params);//抢地主去吧
	}
		//确认token
		var myToken = params.__token;
		var leftToken;
		var rightToken;
		var userArr = new Array();
        for (var key in roomDetail.playersInfo) {
            userArr.push(roomDetail.playersInfo[key]);
        }
        for (var i = 0; i < userArr.length; i ++){
            var info = userArr[i];
            if (myToken == info.token) {
                if (i == 0) {//自己在数组的第一个元素
                    rightToken = userArr[i+1].token;
                    leftToken = userArr[i+2].token;
                }else if (i == 1){//自己在数组的第二个元素
                    rightToken = userArr[i+1].token;
                    leftToken = userArr[i-1].token;
                }else if (i == 2){//自己在数组的第三个元素
                    rightToken = userArr[i-2].token;
                    leftToken = userArr[i-1].token;
                }
            }
		}
	//出牌
	if (emitName == "doPlayCards"){
		//自己想出的牌
		var outPokersArr = new Array();
		for (var i = 0; i < params.outPokers.length; i ++) {
			outPokersArr.push(params.outPokers[i].num);
		}
		var outPokersType = self.cardTypeJudge(outPokersArr);
		/**
		 * 	查看上一位玩家(左玩家)和上上一位玩家(右玩家)出的牌。
		 * */
		//取出上一轮出的牌
		var myLastPokers = new Array();
		var leftLastPokers = new Array();
		var rightLastPokers = new Array();
		var myLastPokersType = null;
		var leftLastPokersType = null;
		var rightLastPokersType = null;
		var myIsOutPoker = 0;
		var leftIsOutPoker = 0;
		var rightIsOutPoker = 0;
		for (var key in roomDetail.playersInfo){
			if (myToken == roomDetail.playersInfo[key].playerToken){
				myLastPokers = roomDetail.playersInfo[key].lastPokers;
				myLastPokersType = roomDetail.playersInfo[key].lastPokersType;
				myIsOutPoker = roomDetail.playersInfo[key].isOutPoker;
			}
			if (leftToken == roomDetail.playersInfo[key].playerToken){
				leftLastPokers = roomDetail.playersInfo[key].lastPokers;
				leftLastPokersType = roomDetail.playersInfo[key].lastPokersType;
				leftIsOutPoker = roomDetail.playersInfo[key].isOutPoker;
			}
			if (rightToken == roomDetail.playersInfo[key].playerToken){
				rightLastPokers = roomDetail.playersInfo[key].lastPokers;
				rightLastPokersType = roomDetail.playersInfo[key].lastPokersType;
				rightIsOutPoker = roomDetail.playersInfo[key].isOutPoker;
			}
		}
		var lastPokers = new Array();
		var lastPokersType = null;
		if (leftLastPokers.length == 0){
			if (rightLastPokers.length == 0){
				lastPokers = null;
				lastPokersType = null;
			}else {
				for (var i = 0; i < rightLastPokers.length; i ++){
					lastPokers.push(rightLastPokers[i].num);
				}
				lastPokersType = self.cardTypeJudge(lastPokers);
			}
		}else {
			for (var i = 0; i < leftLastPokers.length; i ++){
				lastPokers.push(leftLastPokers[i].num);
			}
			lastPokersType = self.cardTypeJudge(lastPokers);
		}
		if (self.isSelectCardCanPut(outPokersArr, outPokersType, lastPokers, lastPokersType)){
			for (var key in roomDetail.playersInfo) {
				if (myToken == roomDetail.playersInfo[key].playerToken){
					roomDetail.playersInfo[key].isOutPoker = 3;
					roomDetail.playersInfo[key].lastPokers = params.outPokers;
					roomDetail.playersInfo[key].lastPokersType = outPokersType;
					roomDetail.playersInfo[key].outPokersNumber ++;
					roomDetail.playersInfo[key].remainingPokers = params.remainingPokers;
					//自己就变成出牌者的左手边了
					leftLastPokers.splice(0, leftLastPokers.length);
					leftLastPokers = params.outPokers;
					leftLastPokersType = outPokersType;
					//有炸弹，倍数 x2
					if (outPokersType == "KING_BOMB" || outPokersType == "FOUR_BOMB"){
						roomDetail.mostMultiple = roomDetail.mostMultiple * 2;
					}
					if (roomDetail.playersInfo[key].remainingPokers.length == 0){//打完了
						self.gameOver(roomKey);
					}
				}
			}
			for (var key in roomDetail.playersInfo) {
				//右手边玩家开始出牌
				if (rightToken == roomDetail.playersInfo[key].playerToken){
					roomDetail.playersInfo[key].isOutPoker = 1;
					self.isPromptOutCards(roomKey);
					timerUtils.clearTimer("outpokers" + params.__gameRoomKey);
					//下一位玩家开始出牌倒计时	
					timerUtils.timeout("outpokers" + roomKey, outCardTimeout, () => {
					console.log("出牌时间到了");
					self.outPokersTimeout(roomKey);
				});	
				}
			}
		}else {
			for (var key in roomDetail.playersInfo) {
				if (myToken == roomDetail.playersInfo[key].playerToken){
					roomDetail.playersInfo[key].isOutPoker = 2;
				}
			}
		}
		console.log(roomDetail);
		socketEmit.call(self, self.socket, roomKey, 'isOutPoker', roomDetail, true);
	}
	//不出
	if (emitName == "dontOut"){
		var leftLastCards = new Array();
		var leftLastCardsType = null;
		for (var key in roomDetail.playersInfo) {
			if (myToken == roomDetail.playersInfo[key].playerToken){
				roomDetail.playersInfo[key].isOutPoker = 4;
				roomDetail.playersInfo[key].lastPokers = [];
				roomDetail.playersInfo[key].lastPokersType = null;
				roomDetail.playersInfo[key].outPokersNumber ++;
			}
			if (leftToken == roomDetail.playersInfo[key].playerToken){
				leftLastCards = roomDetail.playersInfo[key].lastPokers;
				leftLastCardsType = roomDetail.playersInfo[key].lastPokersType;
			}
		}
		for (var key in roomDetail.playersInfo) {
			//右手边玩家开始出牌
			if (rightToken == roomDetail.playersInfo[key].playerToken){
				roomDetail.playersInfo[key].isOutPoker = 1;
				self.isPromptOutCards(roomKey);
				timerUtils.clearTimer("outpokers" + params.__gameRoomKey);
				//下一位玩家开始出牌倒计时	
				timerUtils.timeout("outpokers" + roomKey, outCardTimeout, () => {
					console.log("出牌时间到了");
					self.outPokersTimeout(roomKey);
				});	
			}
		}
		socketEmit.call(self, self.socket, roomKey, 'isOutPoker', roomDetail, true);
	}
}

/*
 * step 1
 * 发牌
*/
landlordService.prototype.licensing = function (roomKey) {

	let roomDetail = global.roomsDetail[roomKey];

	roomDetail.step = 1;

	let tokens = [];

	for (var i = 0; i < roomDetail.playerIds.length; i++) {
        tokens.push(roomDetail.playersInfo[roomDetail.playerIds[i]].playerToken);
	}
	var requestBody = {};
    requestBody.roomId = roomDetail.roomInfo.roomId;
	requestBody.tokens = tokens;
	apiJSONUtils('/api/game/round/deal', 'POST', requestBody, function (state, data) {
		if (state){
			let param = {}
			param.roomInfo = roomDetail.roomInfo;
			param.playersInfo = roomDetail.playersInfo;
			param.timeout = operationTimeout;
			param.roomKey = roomKey;
			for (var key in data.pokes) {
				var pokes = data.pokes[key].pokes;
				for (var i = 0; i < pokes.length; i ++){
					var temp = pokes[i];
					temp.selected = false;
				}
			}
			param.pokes = data.pokes;
			roomDetail.pokes = data.pokes;
			//赋值剩余的牌
			for (var key in roomDetail.playersInfo) {
				for (var key1 in roomDetail.pokes) {
					if (roomDetail.playersInfo[key].token == key1){
						roomDetail.playersInfo[key].remainingPokers = roomDetail.pokes[key1].pokes;
						roomDetail.playersInfo[key].pokeId = roomDetail.pokes[key1].pokeId;
					}
				}
			}
			console.log("发牌");
			socketEmit.call(self, self.socket, roomKey, 'deal', param, true);
			//3秒后开始叫地主
			timerUtils.timeout("licensingend" + roomKey, 5, () => {
				self.callLandlord(roomDetail.roomKey, -1);
			});
		
		}
	});
}
/*
* step 2
* 叫地主
* playerTag 玩家标识，如果第一次调用此方法，传-1
*/
landlordService.prototype.callLandlord = function (roomKey, playerTag){

	self = this;
	let roomDetail = global.roomsDetail[roomKey];

	if (roomDetail.step > 1){//不是从step 1 正常流程过来的（防止定时器重复调用）
		return;
	}
	roomDetail.step = 2;

	var playersInfoArr = new Array();
	for (var key in roomDetail.playersInfo) {
		playersInfoArr.push(roomDetail.playersInfo[key]);
	}
	//第一次调用此方法，随机一个叫地主
	if(playerTag == -1){
		playerTag = Math.floor(Math.random()*3);
	}
	var playersInfoChoose = playersInfoArr[playerTag];

	if (playersInfoChoose.isCall == -1){
		playersInfoChoose.beginCall = true;
		var param = {};
		param.landlordMultiple = landlordMultiple;
		param.timeout = operationTimeout;
		param.playersInfo = roomDetail.playersInfo;
		console.log("开始叫地主");
		socketEmit.call(self, self.socket, roomKey, 'callLandlord', param, true);
		//时间到了，则为不叫，下一个玩家叫
		timerUtils.timeout("callLandlord" + roomKey, operationTimeout, () => {
			playersInfoChoose.isCall = 0;
			playersInfoChoose.beginCall = false;
			playerTag = playerTag == 2 ? 0 : playerTag + 1;
			console.log("时间到了不叫");
			roomDetail.step = 1;
			self.callLandlord(roomKey, playerTag);
		});	
	}else {
		roomDetail.step = 3;
		self.confirmLandlord(roomKey);
	}
	
}
/*
* step 3
* 下一个玩家抢地主
* 
*/
landlordService.prototype.robLandlord = function (param) {
	self = this;

	let roomDetail = global.roomsDetail[param.__gameRoomKey];

	if (roomDetail.step > 2){//不是从step 2 正常流程过来的（防止定时器重复调用）
		return;
	}
	
	roomDetail.playersInfo = param.playersInfo;
	
	var playersInfoArr = new Array();
	for (var key in param.playersInfo) {
		playersInfoArr.push(param.playersInfo[key]);
	}
	for ( var i = 0; i < playersInfoArr.length; i ++){
		var playersInfo = playersInfoArr[i];
		if (playersInfo.beginCall) {//刚刚是他叫的地主
			playersInfo.beginCall = false;//关闭叫地主
			if (playersInfo.isCall == 3) {//已经叫了最高倍了，去确认地主
				roomDetail.step = 3;
				self.confirmLandlord(param.__gameRoomKey);
			}else {//不是最高倍
				//取出下一个玩家的信息
				var playerTag = i == 2 ? 0 : i + 1;
				var tempInfo = playersInfoArr[playerTag];
				if (tempInfo.isCall == -1) {//说明下一个玩家没操作过
					//回到叫地主环节
					roomDetail.step = 1;
					self.callLandlord(param.__gameRoomKey, playerTag);
				}else {//下一个玩家操作过了，去确认地主
					roomDetail.step = 3;
					self.confirmLandlord(param.__gameRoomKey);
				}
			}
			return;
		}
	}
}
/*
* step 4
* 确认地主且开始出牌
* 
*/
landlordService.prototype.confirmLandlord = function (roomKey) {
	self = this;
	let roomDetail = global.roomsDetail[roomKey];

	if (roomDetail.step > 3){//不是从step 3 正常流程过来的（防止定时器重复调用）
		return;
	}
	roomDetail.step = 4;

	var playersInfoArr = new Array();
	for (var key in roomDetail.playersInfo) {
		roomDetail.playersInfo[key].beginCall = false;
		playersInfoArr.push(roomDetail.playersInfo[key]);
	}
	var tempMultiple = 0;//预设默认倍数为0
	var isLandlord = -1;
	for (var i = 0; i < playersInfoArr.length; i ++){
		var playerInfo = playersInfoArr[i];
		if (playerInfo.isCall > tempMultiple) {//叫的倍数比默认倍数大
			tempMultiple = playerInfo.isCall;
			isLandlord = i;
		}
	}
	//如果倍数为0，说明三个都没叫地主，游戏结束重新匹配
	if (tempMultiple == 0) {
		socketEmit.call(self, self.socket, roomKey, 'againMatch', {}, true);
	}
	//确认地主
	if (isLandlord != -1) {
		var playerInfo = playersInfoArr[isLandlord];
		playerInfo.isLandlord = true;
		playerInfo.isOutPoker = 1;
		playerInfo.remainingPokers = self.pokerSorting(playerInfo.remainingPokers ,roomDetail.pokes.extends.pokes);
		roomDetail.outCardTimeout = outCardTimeout;
		tempMultiple = landlordMultiple[playerInfo.isCall];
		roomDetail.mostMultiple = (tempMultiple*roomDetail.roomInfo.hall.bottom).toFixed(1);
		socketEmit.call(self, self.socket, roomKey, 'confirmLandlord', roomDetail, true);
		//下一位玩家开始出牌倒计时
		timerUtils.timeout("outpokers" + roomKey, outCardTimeout, () => {
			console.log("出牌时间到了");
			self.outPokersTimeout(roomKey);
		});	
	}

}

//把牌进行排序
landlordService.prototype.pokerSorting = function(pokesArr, extendsArr){
	for (var i = 0; i < extendsArr.length; i ++){
		pokesArr.push(extendsArr[i]);
	}
	extendsArr = null;
	for (var i = 0; i < pokesArr.length - 1; i ++){
		for (var j = 0; j < pokesArr.length - i - 1; j ++){
			if (pokesArr[j].num < pokesArr[j + 1].num) {
				var temp = pokesArr[j];
				pokesArr[j] = pokesArr[j + 1];
				pokesArr[j + 1] = temp;
			}
		} 
	}
	return pokesArr;
}
/**
 * 出牌时间到了，默认出牌或不出
*/
landlordService.prototype.outPokersTimeout = function(roomKey){
	self = this;
	let roomDetail = global.roomsDetail[roomKey];
	//确认出牌中的人和其他玩家的token
	var outPokersToken;
	var leftToken;
	var rightToken;
	for (var key in roomDetail.playersInfo) {
		if (roomDetail.playersInfo[key].isOutPoker == 1){//出牌中
			outPokersToken = roomDetail.playersInfo[key].token;
		}
	}
	var userArr = new Array();
	for (var key in roomDetail.playersInfo) {
		userArr.push(roomDetail.playersInfo[key]);
	}
	for (var i = 0; i < userArr.length; i ++){
		var info = userArr[i];
		if (outPokersToken == info.token) {
			if (i == 0) {//出牌玩家在数组的第一个元素
				rightToken = userArr[i+1].token;
				leftToken = userArr[i+2].token;
			}else if (i == 1){//出牌玩家在数组的第二个元素
				rightToken = userArr[i+1].token;
				leftToken = userArr[i-1].token;
			}else if (i == 2){//出牌玩家在数组的第三个元素
				rightToken = userArr[i-2].token;
				leftToken = userArr[i-1].token;
			}
		}
	}
	//玩家信息
	var outPokersUser, leftOutPokersUser, rightOutPokersUser;
	for (var key in roomDetail.playersInfo) {
		if (roomDetail.playersInfo[key].token == outPokersToken){
			outPokersUser = roomDetail.playersInfo[key];
		}
		if (roomDetail.playersInfo[key].token == leftToken){
			leftOutPokersUser = roomDetail.playersInfo[key];
		}
		if (roomDetail.playersInfo[key].token == rightToken){
			rightOutPokersUser = roomDetail.playersInfo[key];
		}
	}
	//开始判断是否出牌
	var leftIsOut = leftOutPokersUser.isOutPoker;
	var rightIsOut = rightOutPokersUser.isOutPoker;
	//说明其他玩家都没出过牌，或者都不出，默认出第一张牌即数组的最后一个元素
	if (leftIsOut == 0 && rightIsOut == 0 || leftIsOut == 4 && rightIsOut == 4){
		var outpokersArr = new Array();
		outpokersArr.push(outPokersUser.remainingPokers[outPokersUser.remainingPokers.length-1]);
		outPokersUser.lastPokers = outpokersArr;
		outPokersUser.lastPokersType = self.cardTypeJudge(outpokersArr);
		outPokersUser.remainingPokers.splice(outPokersUser.remainingPokers.length-1, 1);
		outPokersUser.isOutPoker = 3;//可以出牌
		rightOutPokersUser.isOutPoker = 1;//下一个玩家出牌中
		//赋值提示的牌
		self.isPromptOutCards(roomKey);
		socketEmit.call(self, self.socket, roomKey, 'isOutPoker', roomDetail, true);
		timerUtils.clearTimer("outpokers" + roomKey);
		//下一位玩家开始出牌倒计时
		timerUtils.timeout("outpokers" + roomKey, outCardTimeout, () => {
			console.log("出牌时间到了");
			self.outPokersTimeout(roomKey);
		});
	}else{
		outPokersUser.lastPokers = new Array();
		outPokersUser.lastPokersType = null;
		outPokersUser.isOutPoker = 4;//不出
		rightOutPokersUser.isOutPoker = 1;//下一个玩家出牌中
		//赋值提示的牌
		self.isPromptOutCards(roomKey);
		socketEmit.call(self, self.socket, roomKey, 'isOutPoker', roomDetail, true);
		timerUtils.clearTimer("outpokers" + roomKey);
		//下一位玩家开始出牌倒计时
		timerUtils.timeout("outpokers" + roomKey, outCardTimeout, () => {
			console.log("出牌时间到了");
			self.outPokersTimeout(roomKey);
		});
	}

}

/**
 * 游戏结束进行结算
*/
landlordService.prototype.gameOver = function(roomKey){
	self = this;
	let roomDetail = global.roomsDetail[roomKey];
	var landlordToken, leftToken, rightToken;
	var landlordMoney, leftMoney, rightMoney;
	var landlordAccounts, leftAccounts, rightAccounts;
	var userArr = new Array();
	for (var key in roomDetail.playersInfo) {
		userArr.push(roomDetail.playersInfo[key]);
	}
	var isLandlordWin;
	for (var i = 0; i < userArr.length; i ++){
		var info = userArr[i];
		//token及余额的赋值
		if (info.isLandlord) {//地主
			landlordToken = info.token;
			landlordMoney = info.experience;
			landlordAccounts = info.winOrLoseMoney;
			if (i == 0) {//地主在数组的第一个元素
				rightToken = userArr[i+1].token;
				leftToken = userArr[i+2].token;
				rightMoney = userArr[i+1].experience;
				leftMoney = userArr[i+2].experience;
				rightAccounts = userArr[i+1].winOrLoseMoney;
				leftAccounts = userArr[i+2].winOrLoseMoney;
			}else if (i == 1){//地主在数组的第二个元素
				rightToken = userArr[i+1].token;
				leftToken = userArr[i-1].token;
				rightMoney = userArr[i+1].experience;
				leftMoney = userArr[i-1].experience;
				rightAccounts = userArr[i+1].winOrLoseMoney;
				leftAccounts = userArr[i-1].winOrLoseMoney;
			}else if (i == 2){//地主在数组的第三个元素
				rightToken = userArr[i-2].token;
				leftToken = userArr[i-1].token;
				rightMoney = userArr[i-2].experience;
				leftMoney = userArr[i-1].experience;
				rightAccounts = userArr[i-2].winOrLoseMoney;
				leftAccounts = userArr[i-1].winOrLoseMoney;
			}
			if (info.remainingPokers.length == 0){
				isLandlordWin = true;
			}else {
				isLandlordWin = false;
			}
		}
	}
	for (var key in roomDetail.playersInfo) {
		if (roomDetail.playersInfo[key].isLandlord) {//地主
			if (isLandlordWin){
				roomDetail.playersInfo[key].isWin = true;
			}else {
				roomDetail.playersInfo[key].isWin = false;
			}
		}else {//农民
			if (isLandlordWin){
				roomDetail.playersInfo[key].isWin = false;
			}else{
				roomDetail.playersInfo[key].isWin = true;
			}
		}
	}
	/**
	 * 输赢赋值
	*/
	for (var key in roomDetail.playersInfo) {
		if (roomDetail.playersInfo[key].isLandlord){//是地主，进来算钱
			if (landlordMoney >= roomDetail.mostMultiple){//地主的钱多于或者等于要结算的钱
				//每个农民要输地主要结算的钱的一半
				leftAccounts = roomDetail.mostMultiple/2.0;
				rightAccounts = roomDetail.mostMultiple/2.0;
				//如果农民的钱比要结算的钱少，就输农民全部的钱
				if (leftMoney < leftAccounts){
					leftAccounts = leftMoney;
				}
				if (rightMoney < rightAccounts){
					rightAccounts = rightMoney;
				}
			}
			landlordAccounts = leftAccounts + rightAccounts;
			//地主赢了
			if (roomDetail.playersInfo[key].isWin){
				leftAccounts *= -1;
				rightAccounts *= -1;
			}else {
				landlordAccounts *= -1;
			}
			roomDetail.playersInfo[key].winOrLoseMoney = landlordAccounts;
		}
	}
	for (var key in roomDetail.playersInfo) {
		if (roomDetail.playersInfo[key].token == leftToken){
			roomDetail.playersInfo[key].winOrLoseMoney = leftAccounts;
		}
		if (roomDetail.playersInfo[key].token == rightToken){
			roomDetail.playersInfo[key].winOrLoseMoney = rightAccounts;
		}
	}
	var players = new Array();
	for (var key in roomDetail.playersInfo) {
		var param = {};
		var info = roomDetail.playersInfo[key];
		param.playerId = roomDetail.playersInfo[key].playerId;
		param.bet = roomDetail.mostMultiple;
		param.token = roomDetail.playersInfo[key].token;
		param.pokeId = roomDetail.playersInfo[key].pokeId;
		if (roomDetail.playersInfo[key].winOrLoseMoney > 0){//赢钱了
			if (roomDetail.playersInfo[key].winOrLoseMoney*roomDetail.roomInfo.hall.tax < 0.01) {
				param.tax = 0.01;
				param.win = roomDetail.playersInfo[key].winOrLoseMoney-0.01;
			}else {
				param.win = roomDetail.playersInfo[key].winOrLoseMoney*(1-roomDetail.roomInfo.hall.tax);
				param.tax = roomDetail.roomInfo.hall.tax*roomDetail.playersInfo[key].winOrLoseMoney;
			}
			param.vaildBet = roomDetail.playersInfo[key].winOrLoseMoney;
		}else{
			param.vaildBet = -roomDetail.playersInfo[key].winOrLoseMoney;
			param.win = roomDetail.playersInfo[key].winOrLoseMoney;
			param.tax = 0;
		}
		param.iswinner = roomDetail.playersInfo[key].isWin;
		players.push(param);
	}
	var recordValue = {roomId: roomDetail.roomInfo.roomId, players: players};

	let recordKey = "record_" + roomDetail.roomInfo.roomId;
	this.parentService.redisUtils._set(recordKey, recordValue, (status)=>{
		if(status){
			apiUtils('/api/game/round/record','POST', {recordKey: recordKey},(status,data)=>{
				let isSuccess = false;
				if(status){
					//移除房间数据
					delete global.roomsDetail[roomKey];
					isSuccess = true;			
				}
				socketEmit.call(self, self.socket, roomKey, 'gameOver', roomDetail, true);
			});			
		}else{
			socketEmit.call(self, self.socket, roomKey, 'gameOver', roomDetail, true);
		}
		timerUtils.clearTimer("outpokers" + roomKey);
	});
}
/**
 * 是否可以提示出牌
*/
landlordService.prototype.isPromptOutCards = function(roomKey){
	let roomDetail = global.roomsDetail[roomKey];
	//确认出牌中的人和其他玩家的token
	var outPokersToken;
	var leftToken;
	var rightToken;
	for (var key in roomDetail.playersInfo) {
		if (roomDetail.playersInfo[key].isOutPoker == 1){//出牌中
			outPokersToken = roomDetail.playersInfo[key].token;
		}
	}
	var userArr = new Array();
	for (var key in roomDetail.playersInfo) {
		userArr.push(roomDetail.playersInfo[key]);
	}
	for (var i = 0; i < userArr.length; i ++){
		var info = userArr[i];
		if (outPokersToken == info.token) {
			if (i == 0) {//出牌玩家在数组的第一个元素
				rightToken = userArr[i+1].token;
				leftToken = userArr[i+2].token;
			}else if (i == 1){//出牌玩家在数组的第二个元素
				rightToken = userArr[i+1].token;
				leftToken = userArr[i-1].token;
			}else if (i == 2){//出牌玩家在数组的第三个元素
				rightToken = userArr[i-2].token;
				leftToken = userArr[i-1].token;
			}
		}
	}
	var leftLastPokers = new Array();
	var leftLastPokersType = null;
	var rightLastPokers = new Array();
	var rightLastPokersType = null;
	for (var key in roomDetail.playersInfo) {
		if (leftToken == roomDetail.playersInfo[key].playerToken){
			leftLastPokers = roomDetail.playersInfo[key].lastPokers;
			leftLastPokersType = roomDetail.playersInfo[key].lastPokersType;
		}
		if (rightToken == roomDetail.playersInfo[key].playerToken){
			rightLastPokers = roomDetail.playersInfo[key].lastPokers;
			rightLastPokersType = roomDetail.playersInfo[key].lastPokersType;
		}
	}		
	for (var key in roomDetail.playersInfo) {
		if (outPokersToken == roomDetail.playersInfo[key].playerToken){
			//赋值提示的牌
			var promptCards = new Array();
			if (leftLastPokersType == null){//左手边不出
				if(rightLastPokersType == null){//右手边不出
					console.log("因为其他人都不出提示按钮不可点击，所以理论上不会出现这种情况");
				}else{
					promptCards = self.promptCards(roomDetail.playersInfo[key].remainingPokers, rightLastPokers, rightLastPokersType);
				}
			}else{
				promptCards = self.promptCards(roomDetail.playersInfo[key].remainingPokers, leftLastPokers, leftLastPokersType);
			}
			roomDetail.playersInfo[key].promptCards = promptCards;
			console.log("。。。。。。。。。");
			console.log(roomDetail.playersInfo[key].promptCards);
		}
	}
}
/**
 * 提示Ai
*/
landlordService.prototype.promptCards = function(myCards, lastCards, lastCardsType){
	//上一手牌
	var lastCardsSize = lastCards.length;
	var lastCardsArr = new Array();
	for (var i = 0; i < lastCards.length; i ++){
		lastCardsArr.push(lastCards[i].num);
	}
	//集中判断是否是王炸，免得多次判断
	if (lastCardsType == "KING_BOMB"){
		console.log("王炸肯定没有");
		return null;
	}
	/**
	 * 比较两家的牌，两种情况
	 * 1.我出的牌和上家是同一种类型的牌
	 * 2，我出炸弹，此时和上家的牌型可能不同
	 * */
	
	//上家出单
	if (lastCardsType == "ONE_POKER"){
		var cardsArr = new Array();
		for (var i = 0; i < myCards.length; i ++){
			cardsArr.push(myCards[i]);
		}
		//数组去重
		var length = cardsArr.length;
		for (var i = 0;i < length; i ++){
			for (var j = i + 1; j < length; j ++){
				if (cardsArr[i].num == cardsArr[j].num){
					cardsArr.splice(j,1);
					length --;
					j--;
				}
			}
		}
		//存到对象里
		var promptCards = {};
		for (var i = 0; i < cardsArr.length; i ++){
			var newArr = new Array();
			newArr.push(cardsArr[i].num);
			if (self.isSelectCardCanPut(newArr, self.cardTypeJudge(newArr), lastCardsArr, lastCardsType)){
				promptCards[i] = cardsArr[i];
			}
		}
		var promptCardsArr = new Array();
		//将对象转成数组
		for (var key in promptCards) {
			promptCardsArr.push(promptCards[key]);
		}
		return promptCardsArr;
	}
	//统计剩余的牌，分别还有几张，返回key是牌数，value是数量
	var statistical = self.statisticalArr(myCards);
	//上家出对子
	if (lastCardsType == "PAIRS"){
		//过滤掉不可能成为对子的元素
		var filterArr = new Array();
		for (var key in statistical) {
			if (statistical[key] >= 2){
				filterArr.push(key);
			}
		}
		if (filterArr.length == 0){
			return new Array();
		}
		//去掉比上家小的牌
		var promptCardsArr = new Array();
		for (var i = 0; i < filterArr.length; i ++){
			promptCardsArr.push(self.backSamePokers(myCards, filterArr[i], 2));
		}
		var tempLength = promptCardsArr.length;
		for (var i = 0; i < tempLength; i ++){
			var arr = new Array();
			arr.push(promptCardsArr[i][0].num);
			arr.push(promptCardsArr[i][1].num);
			if (!self.isSelectCardCanPut(arr, self.cardTypeJudge(arr), lastCardsArr, lastCardsType)){
				promptCardsArr.splice(i,1);
				i--;
				tempLength--;
			}
		}
		return promptCardsArr;
	}
	//上家出三不带
	if (lastCardsType == "THREE_DONT_WITH"){
		//过滤掉不可能成为三不带的元素
		var filterArr = new Array();
		for (var key in statistical) {
			if (statistical[key] >= 3){
				filterArr.push(key);
			}
		}
		if (filterArr.length == 0){
			return new Array();
		}
		//去掉比上家小的牌
		var promptCardsArr = new Array();
		for (var i = 0; i < filterArr.length; i ++){
			promptCardsArr.push(self.backSamePokers(myCards, filterArr[i], 3));
		}
		var tempLength = promptCardsArr.length;
		for (var i = 0; i < tempLength; i ++){
			var arr = new Array();
			arr.push(promptCardsArr[i][0].num);
			arr.push(promptCardsArr[i][1].num);
			arr.push(promptCardsArr[i][2].num);
			if (!self.isSelectCardCanPut(arr, self.cardTypeJudge(arr), lastCardsArr, lastCardsType)){
				promptCardsArr.splice(i,1);
				i--;
				tempLength--;
			}
		}
		return promptCardsArr;
	}
	//上家三带一
	if (lastCardsType == "THREE_WITH_ONE"){
		//过滤掉不可能成为三带一的元素
		var filterArr = new Array();
		var onePokerArr = new Array();
		for (var key in statistical) {
			if (statistical[key] >= 3){
				filterArr.push(key);
			}
			if (statistical[key] == 1){
				onePokerArr.push(key);
			}
		}
		if (onePokerArr.length == 0 || filterArr.length == 0){
			return new Array();
		}
		//去掉比上家小的牌
		var promptCardsArr = new Array();
		for (var i = 0; i < filterArr.length; i ++){
			promptCardsArr.push(self.backSamePokers(myCards, filterArr[i], 3));
		}
		//将单牌加入到三牌后面，组成三带一
		for (var i = 0; i < promptCardsArr.length; i ++){
			var arr = promptCardsArr[i];
			arr.push(self.backSamePokers(myCards, onePokerArr[0], 1)[0]);
		}
		var tempLength = promptCardsArr.length;
		for (var i = 0; i < tempLength; i ++){
			var arr = new Array();
			arr.push(promptCardsArr[i][0].num);
			arr.push(promptCardsArr[i][1].num);
			arr.push(promptCardsArr[i][2].num);
			arr.push(promptCardsArr[i][3].num);
			if (!self.isSelectCardCanPut(arr, self.cardTypeJudge(arr), lastCardsArr, lastCardsType)){
				promptCardsArr.splice(i,1);
				i--;
				tempLength--;
			}
		}
		return promptCardsArr;
	}
	//上家炸弹
	if (lastCardsType == "FOUR_BOMB"){
		//过滤掉不可能成为炸弹的元素
		var filterArr = new Array();
		for (var key in statistical) {
			if (statistical[key] == 4){
				filterArr.push(key);
			}
		}
		if (filterArr.length == 0){
			return new Array();
		}
		//去掉比上家小的牌
		var promptCardsArr = new Array();
		for (var i = 0; i < filterArr.length; i ++){
			promptCardsArr.push(self.backSamePokers(myCards, filterArr[i], 4));
		}
		var tempLength = promptCardsArr.length;
		for (var i = 0; i < tempLength; i ++){
			var arr = new Array();
			arr.push(promptCardsArr[i][0].num);
			arr.push(promptCardsArr[i][1].num);
			arr.push(promptCardsArr[i][2].num);
			arr.push(promptCardsArr[i][3].num);
			if (!self.isSelectCardCanPut(arr, self.cardTypeJudge(arr), lastCardsArr, lastCardsType)){
				promptCardsArr.splice(i,1);
				i--;
				tempLength--;
			}
		}
		return promptCardsArr;
	}
	//上家三带一对
	if (lastCardsType == "THREE_WITH_TWO"){
		//过滤掉不可能成为三带二的元素
		var filterArr = new Array();
		var twoPokerArr = new Array();
		for (var key in statistical) {
			if (statistical[key] >= 3){
				filterArr.push(key);
			}
			if (statistical[key] == 2){
				twoPokerArr.push(key);
			}
		}
		if (twoPokerArr.length == 0 || filterArr.length == 0){
			return new Array();
		}
		//去掉比上家小的牌
		var promptCardsArr = new Array();
		for (var i = 0; i < filterArr.length; i ++){
			promptCardsArr.push(self.backSamePokers(myCards, filterArr[i], 3));
		}
		var twoArr = self.backSamePokers(myCards, twoPokerArr[0], 2);
		//将对子加入到三牌后面，组成三带一
		for (var i = 0; i < promptCardsArr.length; i ++){
			var arr = promptCardsArr[i];
			arr.push(twoArr[0]);
			arr.push(twoArr[1]);
		}
		var tempLength = promptCardsArr.length;
		for (var i = 0; i < tempLength; i ++){
			var arr = new Array();
			arr.push(promptCardsArr[i][0].num);
			arr.push(promptCardsArr[i][1].num);
			arr.push(promptCardsArr[i][2].num);
			arr.push(promptCardsArr[i][3].num);
			arr.push(promptCardsArr[i][4].num);
			if (!self.isSelectCardCanPut(arr, self.cardTypeJudge(arr), lastCardsArr, lastCardsType)){
				promptCardsArr.splice(i,1);
				i--;
				tempLength--;
			}
		}
		return promptCardsArr;
	}
	//上家顺子
	if (lastCardsType == "STRAIGHT"){
		var keyArr = Object.keys(statistical);
		if (keyArr.length < lastCards.length){
			return new Array();
		}
		var newArr = new Array();
		for (var i = keyArr.length-1; i >= lastCardsArr.length-1; i --){
			var cards = new Array();
			for (var j = 0; j < lastCards.length; j ++){
				cards.push(keyArr[keyArr.length-1-i+j]*1);
			}
			cards = self.oneArrSorting(cards);
			if (self.isSelectCardCanPut(cards, self.cardTypeJudge(cards), lastCardsArr, lastCardsType)){
				newArr.push(cards);
			}
		}
		var promptCardsArr = new Array();
		for (var i = 0; i < newArr.length; i ++){
			var tempArr = new Array();
			for (var j = 0; j < newArr[i].length; j ++){
				tempArr.push(self.backSamePokers(myCards, newArr[i][j], 1)[0]);
			}
			promptCardsArr.push(tempArr);
		}
		return promptCardsArr;
	}
	//上家连对
	if (lastCardsType == "DOUBLE_STRAIGHT"){
		//过滤掉不是对子的元素
		var filterArr = new Array();
		for (var key in statistical) {
			if (statistical[key] == 2){
				filterArr.push(key);
			}
		}
		//如果对子的数量比上家连对的数量少就是没有
		if (filterArr.length < lastCardsArr.length/2){
			return new Array();
		}

		var newArr = new Array();
		for (var i = keyArr.length-1; i >= lastCardsArr.length-1; i --){
			var cards = new Array();
			for (var j = 0; j < lastCards.length; j ++){
				cards.push(keyArr[keyArr.length-1-i+j]*1);
			}
			cards = self.oneArrSorting(cards);
			if (self.isSelectCardCanPut(cards, self.cardTypeJudge(cards), lastCardsArr, lastCardsType)){
				newArr.push(cards);
			}
		}
	}
	//上家飞机不带
	if (lastCardsType == "TRIPLE_STRAIGHT"){

	}
	//上家飞机带单
	if (lastCardsType == "PLANE_WITH_SINGLE"){

	}
	//上家飞机带双
	if (lastCardsType == "PLANE_WITH_TWO"){

	}
	//上家四带二
	if (lastCardsType == "FOUR_WITH_TWO"){
		//过滤掉不可能成为四带二的元素
		var filterArr = new Array();
		var onePokerArr = new Array();
		for (var key in statistical) {
			if (statistical[key] == 4){
				filterArr.push(key);
			}
			if (statistical[key] == 1){
				onePokerArr.push(key);
			}
		}
		if (onePokerArr.length < 2 || filterArr.length == 0){
			return new Array();
		}
		//去掉比上家小的牌
		var promptCardsArr = new Array();
		for (var i = 0; i < filterArr.length; i ++){
			promptCardsArr.push(self.backSamePokers(myCards, filterArr[i], 4));
		}
		//将单牌加入到四张牌后面，组成四带二
		for (var i = 0; i < promptCardsArr.length; i ++){
			var arr = promptCardsArr[i];
			arr.push(self.backSamePokers(myCards, onePokerArr[0], 1)[0]);
			arr.push(self.backSamePokers(myCards, onePokerArr[1], 1)[0]);
		}
		var tempLength = promptCardsArr.length;
		for (var i = 0; i < tempLength; i ++){
			var arr = new Array();
			arr.push(promptCardsArr[i][0].num);
			arr.push(promptCardsArr[i][1].num);
			arr.push(promptCardsArr[i][2].num);
			arr.push(promptCardsArr[i][3].num);
			arr.push(promptCardsArr[i][4].num);
			arr.push(promptCardsArr[i][5].num);
			if (!self.isSelectCardCanPut(arr, self.cardTypeJudge(arr), lastCardsArr, lastCardsType)){
				promptCardsArr.splice(i,1);
				i--;
				tempLength--;
			}
		}
		return promptCardsArr;
	}
	//上家四带二对
	if (lastCardsType == "FOUR_WITH_TWO_PAIRS"){
		//过滤掉不可能成为四带二对的元素
		var filterArr = new Array();
		var twoPokerArr = new Array();
		for (var key in statistical) {
			if (statistical[key] == 4){
				filterArr.push(key);
			}
			if (statistical[key] == 2){
				twoPokerArr.push(key);
			}
		}
		if (twoPokerArr.length < 2 || filterArr.length == 0){
			return new Array();
		}
		//去掉比上家小的牌
		var promptCardsArr = new Array();
		for (var i = 0; i < filterArr.length; i ++){
			promptCardsArr.push(self.backSamePokers(myCards, filterArr[i], 4));
		}
		var pokersArr1 = self.backSamePokers(myCards, twoPokerArr[0], 2);
		var pokersArr2 = self.backSamePokers(myCards, twoPokerArr[1], 2);
		//将单牌加入到四张牌后面，组成四带二
		for (var i = 0; i < promptCardsArr.length; i ++){
			var arr = promptCardsArr[i];
			arr.push(pokersArr1[0]);
			arr.push(pokersArr1[1]);
			arr.push(pokersArr2[0]);
			arr.push(pokersArr2[1]);
		}
		var tempLength = promptCardsArr.length;
		for (var i = 0; i < tempLength; i ++){
			var arr = new Array();
			arr.push(promptCardsArr[i][0].num);
			arr.push(promptCardsArr[i][1].num);
			arr.push(promptCardsArr[i][2].num);
			arr.push(promptCardsArr[i][3].num);
			arr.push(promptCardsArr[i][4].num);
			arr.push(promptCardsArr[i][5].num);
			arr.push(promptCardsArr[i][6].num);
			arr.push(promptCardsArr[i][7].num);
			if (!self.isSelectCardCanPut(arr, self.cardTypeJudge(arr), lastCardsArr, lastCardsType)){
				promptCardsArr.splice(i,1);
				i--;
				tempLength--;
			}
		}
		return promptCardsArr;
	}
}
//单个数组排序
landlordService.prototype.oneArrSorting = function(cards){
	for (var i = 0; i < cards.length - 1; i ++){
		for (var j = 0; j < cards.length - i - 1; j ++){
			if (cards[j] < cards[j + 1]) {
				var temp = cards[j];
				cards[j] = cards[j + 1];
				cards[j + 1] = temp;
			}
		} 
	}
	return cards;
}
//返回手牌中相同的牌
landlordService.prototype.backSamePokers = function(myCards, pokersNum, num){
	var newArr = new Array();
	for (var i = 0; i < myCards.length; i ++){
		if (pokersNum == myCards[i].num){
			if (num == 1){
				newArr.push(myCards[i]);
			}
			if (num == 2){
				newArr.push(myCards[i]);
				newArr.push(myCards[i+1]);
			}
			if (num == 3){
				newArr.push(myCards[i]);
				newArr.push(myCards[i+1]);
				newArr.push(myCards[i+2]);
			}
			if (num == 4){
				newArr.push(myCards[i]);
				newArr.push(myCards[i+1]);
				newArr.push(myCards[i+2]);
				newArr.push(myCards[i+3]);
			}
			return newArr;
		}
	}
}
//返回各个手牌的数量
landlordService.prototype.statisticalArr = function(myCards){
	var temp = {};
	for (var key in myCards){
		if (temp.hasOwnProperty(myCards[key].num)){
			temp[myCards[key].num] = temp[myCards[key].num]+1;
		}else{
			temp[myCards[key].num] = 1;
		}
	}
	return temp;
}


/**
 * 牌型大小比较
*/
landlordService.prototype.isSelectCardCanPut = function(myPokers, myPokersType, lastPokers, lastPokersType){
	var self = this;
	if (myPokers == null || myPokersType == null){
		return false;
	}
	//自己先出牌 或 上家没有出牌
	if (myPokers.length != 0 && myPokersType.length != 0 && lastPokers == null && lastPokersType == null){
		return true;
	}
	var lastPokesCount = lastPokers.length;
	var myPokersCount = myPokers.length;
	//集中判断是否是王炸，免得多次判断
	if (lastPokersType == "KING_BOMB"){
		return false;
	}else if (myPokersType == "KING_BOMB"){
		return true;
	}
	//集中判断对方不是出炸弹，我出炸弹的情况
	if (lastPokersType != "FOUR_BOMB" && myPokersType == "FOUR_BOMB"){
		return true;
	}
	//单
	if (lastPokersType == "ONE_POKER" && myPokersType == "ONE_POKER"){
		if (myPokers[0] > lastPokers[0]){
			return true;
		}
	}
	//对子
	if (lastPokersType == "PAIRS" && myPokersType == "PAIRS"){
		if (myPokers[0] > lastPokers[0]){
			return true;
		}
	}
	//三张不带
	if (lastPokersType == "THREE_DONT_WITH" && myPokersType == "THREE_DONT_WITH"){
		if (myPokers[0] > lastPokers[0]){
			return true;
		}
	}
	//三带一
	if (lastPokersType == "THREE_WITH_ONE" && myPokersType == "THREE_WITH_ONE"){
		if (self.returnThree(myPokers)[0] > self.returnThree(lastPokers)[0]){
			return true;
		}
	}
	//炸弹
	if (lastPokersType == "FOUR_BOMB" && myPokersType == "FOUR_BOMB"){
		if (myPokers[0] > lastPokers[0]){
			return true;
		}
	}
	//三带二
	if (lastPokersType == "THREE_WITH_TWO" && myPokersType == "THREE_WITH_TWO"){
		if (self.returnThree(myPokers)[0] > self.returnThree(lastPokers)[0]){
			return true;
		}
	}
	//四带二
	if (lastPokersType == "FOUR_WITH_TWO" && myPokersType == "FOUR_WITH_TWO"){
		if (self.returnFour(myPokers)[0] > self.returnFour(lastPokers)[0]){
			return true;
		}
	}
	//四带二对
	if (lastPokersType == "FOUR_WITH_TWO_PAIRS" && myPokersType == "FOUR_WITH_TWO_PAIRS"){
		if (self.returnFour(myPokers)[0] > self.returnFour(lastPokers)[0]){
			return true;
		}
	}
	//顺子
	if (lastPokersType == "STRAIGHT" && myPokersType == "STRAIGHT"){
		// 顺子只需比较最大的1张牌的大小 
		if (myPokersCount == lastPokesCount){//数量必须相等
			if (myPokers[0] > lastPokers[0]){
				return true;
			}
		}
	}
	//连对
	if (lastPokersType == "DOUBLE_STRAIGHT" && myPokersType == "DOUBLE_STRAIGHT"){
		// 连对只需比较最大的1张牌的大小 
		if (myPokersCount == lastPokesCount){//数量必须相等
			if (myPokers[0] > lastPokers[0]){
				return true;
			}
		}
	}
	//飞机不带 
	if (lastPokersType == "TRIPLE_STRAIGHT" && myPokersType == "TRIPLE_STRAIGHT"){
		if (myPokersCount == lastPokesCount){//数量必须相等
			if (myPokers[0] > lastPokers[0]){
				return true;
			}
		}
	}
	//飞机带单 
	if (lastPokersType == "PLANE_WITH_SINGLE" && myPokersType == "PLANE_WITH_SINGLE"){
		if (myPokersCount == lastPokesCount){//数量必须相等
			if (self.returnThree(myPokers)[0] > self.returnThree(lastPokers)[0]){
				return true;
			}
		}
	}
	//飞机带双
	if (lastPokersType == "PLANE_WITH_TWO" && myPokersType == "PLANE_WITH_TWO"){
		if (myPokersCount == lastPokesCount){//数量必须相等
			if (self.returnThree(myPokers)[0] > self.returnThree(lastPokers)[0]){
				return true;
			}
		}
	}
	//默认不能出牌
	return false;
}
//返回三个的数组
landlordService.prototype.returnThree = function (pokersArr){
	var threeArr = new Array();
	for (var i = 0; i < pokersArr.length; i ++) {
		var tempNum = 0;
		for (var j = 0; j < pokersArr.length; j ++){
			if (pokersArr[i] == pokersArr[j]){
				tempNum ++;
			}
		}
		if (tempNum == 3){
			if (threeArr.length){
				if (threeArr[0] != pokersArr[i]){
					threeArr.push(pokersArr[i]);
				}
			}else {
				threeArr.push(pokersArr[i]);
			}
		}
	}
	return threeArr;
}
//返回四个的数组
landlordService.prototype.returnFour = function (pokersArr){
	var fourArr = new Array();
	for (var i = 0; i < pokersArr.length; i ++) {
		var tempNum = 0;
		for (var j = 0; j < pokersArr.length; j ++){
			if (pokersArr[i] == pokersArr[j]){
				tempNum ++;
			}
		}
		if (tempNum == 4){
			if (fourArr.length){
				if (fourArr[0] != pokersArr[i]){
					fourArr.push(pokersArr[i]);
				}
			}else {
				fourArr.push(pokersArr[i]);
			}
		}
	}
	return fourArr;
}


/**
 * 牌型判断
*/
landlordService.prototype.cardTypeJudge = function(pokersArr){
	self = this;
	if (!pokersArr.length) {
		return null;
	}
	var length = pokersArr.length;
	if (length < 5){//小于5张牌
		if (length == 1){
			console.log("单牌");
			return "ONE_POKER";
		}
		if (length == 2){
			if (pokersArr[0] == pokersArr[1]){
				console.log("对子");
				return "PAIRS";
			}
			if (pokersArr[0] == 99 && pokersArr[1] == 98){
				console.log("王炸");
				return "KING_BOMB";
			}
		}
		if (length == 3){
			if (pokersArr[0] == pokersArr[1] && pokersArr[1] == pokersArr[2]){
				console.log("三不带");
				return "THREE_DONT_WITH";
			}
		}
		if (length == 4){
			if (self.isHaveFour(pokersArr)){
				console.log("炸弹");
				return "FOUR_BOMB";
			}
			if (self.isThreeWithOne(pokersArr)) {
				console.log("三带一");
				return "THREE_WITH_ONE";
			}
		}
	}
	if (length >= 5){//大于等于五张牌
		if (self.isThreeWithPairs(pokersArr)){
			console.log("三带二");
			return "THREE_WITH_TWO";
		}
		if (self.isStraight(pokersArr)){
			console.log("顺子");
			return "STRAIGHT"
		}
		if (self.isDoubleStraight(pokersArr)){
			console.log("连对");
			return "DOUBLE_STRAIGHT";
		}
		if (self.isTripleStraight(pokersArr)){
			console.log("飞机不带");
			return "TRIPLE_STRAIGHT";
		}
		if (self.isPlaneWithSingle(pokersArr)){
			console.log("飞机带单");
			return "PLANE_WITH_SINGLE";
		}
		if (self.isPlaneWithTwo(pokersArr)){
			console.log("飞机带双");
			return "PLANE_WITH_TWO";
		}
		if (self.isFourWithTwo(pokersArr)){
			console.log("四带二");
			return "FOUR_WITH_TWO";
		}
		if (self.isFourWithTwoPairs(pokersArr)){
			console.log("四带二对");
			return "FOUR_WITH_TWO_PAIRS";
		}
	}
	return false;
}
//判断是否是三带一
landlordService.prototype.isThreeWithOne = function (pokersArr){
	for (var i = 0; i < 2; i ++){
		var poker1 = pokersArr[i];
		var poker2 = pokersArr[i + 1];
		var poker3 = pokersArr[i + 2];
		if (poker1 == poker2 && poker2 == poker3) {
			return true;
		}
	}
	return false;
}
//判断是否三带二
landlordService.prototype.isThreeWithPairs = function(pokersArr){
	if (pokersArr.length == 5){
		var tempThreeArr = new Array();
		var tempTwoArr = new Array();
		for (var i = 0; i < pokersArr.length; i ++){
			var tempNum = 0;
			for (var j = 0; j < pokersArr.length; j ++){
				if (pokersArr[i] == pokersArr[j]){
					tempNum ++;
				}
			}
			if (tempNum == 2){
				tempTwoArr.push(pokersArr[i]);
			}
			if (tempNum == 3){
				tempThreeArr.push(pokersArr[i]);
			}
		}
		if (tempThreeArr.length/3 == 1 && tempTwoArr.length/2 == 1){
			return true;
		}
	}
	return false;
}
//判断是否是顺子
landlordService.prototype.isStraight = function (pokersArr){
	if (pokersArr.length > 12){//顺子最多12张
		return false;
	}
	for (var i = 0; i < pokersArr.length-1; i ++){
		//相邻两个必须连续
		if (pokersArr[i] - pokersArr[i+1] != 1){
			return false;
		}
		//A = 14，不能超过A
		if (pokersArr[i] > 14 || pokersArr[i + 1] > 14){
			return false;
		}
	}
	return true;
}
//判断是否是连对
landlordService.prototype.isDoubleStraight = function (pokersArr){
	if (pokersArr.length < 6 || pokersArr.length%2 != 0){//小于6张或者数量不为2的倍数一定不是连对
		return false;
	}
	for (var i = 0; i < pokersArr.length; i += 2){//每次加两张
		//由于每次i+2,故相邻两张不相等一定不是连对
		if (pokersArr[i + 1] != pokersArr[i]){
			return false;
		}
		if (i < pokersArr.length - 2){//从0开始到倒数第二张
			//中间隔一张必须是连续的
			if (pokersArr[i] - pokersArr[i + 2] != 1){
				return false;
			}
			//A = 14，不能超过A
			if (pokersArr[i] > 14 || pokersArr[i + 2] > 14){
				return false;
			}
		}
	}
	return true;
}
//判断是否是飞机不带
landlordService.prototype.isTripleStraight = function (pokersArr){
	if (pokersArr.length < 6 || pokersArr.length%3 != 0) {//小于6张或者数量不为3的倍数一定不是飞机不带
		return false;
	}
	for (var i = 0; i < pokersArr.length; i += 3){//每次加三张
		//由于每次i+3，故相邻三张不一样一定不是飞机
		var poker1 = pokersArr[i];
		var poker2 = pokersArr[i + 1];
		var poker3 = pokersArr[i + 2];
		if (poker1 != poker2 || poker2 != poker3 || poker1 != poker3){
			return false;
		}
		if (i < pokersArr.length - 3){//从0开始到倒数第三张
			//中间隔两张必须是连续的
			if (pokersArr[i] - pokersArr[i + 3] != 1){
				return false;
			}
			//A = 14，不能超过A
			if (pokersArr[i] > 14 || pokersArr[i + 3] > 14){
				return false;
			}
		}
	}
	return true;
}
//判断是否是飞机带单
landlordService.prototype.isPlaneWithSingle = function (pokersArr){
	self = this;
	if (!self.isHaveFour(pokersArr)) {//不含炸弹
		var tempThreeArr = new Array();
		for (var i = 0; i < pokersArr.length; i ++){
			var tempNum = 0;
			for (var j = 0; j < pokersArr.length; j ++){
				if (pokersArr[i] == pokersArr[j]){
					tempNum ++;
				}
			}
			if (tempNum == 3){
				tempThreeArr.push(pokersArr[i]);
			}
		}
		if (tempThreeArr.length%3 == pokersArr.length%4){
			if (self.isTripleStraight(tempThreeArr)){
				return true;
			}
		}
	}
	return false;
}
//判断是否是飞机带对子
landlordService.prototype.isPlaneWithTwo = function (pokersArr){
	self = this;
	if (!self.isHaveFour(pokersArr)) {//不含炸弹
		var tempThreeArr = new Array();
		var tempTwoArr = new Array();
		for (var i = 0; i < pokersArr.length; i ++){
			var tempNum = 0;
			for (var j = 0; j < pokersArr.length; j ++){
				if (pokersArr[i] == pokersArr[j]){
					tempNum ++;
				}
			}
			if (tempNum == 2){
				tempTwoArr.push(pokersArr[i]);
			}
			if (tempNum == 3){
				tempThreeArr.push(pokersArr[i]);
			}
		}
		if (tempThreeArr.length%3 != pokersArr.length%5 && tempTwoArr%2 != pokersArr.length%5){
			return false;
		}else {
			if (self.isTripleStraight(tempThreeArr)){
				if(self.isAllPairs(tempTwoArr)){
					return true;
				}
			}
		}
	}
	return false;
}
//判断是否含有炸弹
landlordService.prototype.isHaveFour = function (pokersArr){
	for (var i = 0; i < pokersArr.length; i ++) {
		var tempNum = 0;
		for (var j = 0; j < pokersArr.length; j ++){
			if (pokersArr[i] == pokersArr[j]){
				tempNum ++;
			}
		}
		if (tempNum == 4){
			return true;
		}
	}
	return false;
}
//判断是否全为对子
landlordService.prototype.isAllPairs = function (pokersArr){
	for (var i = 0; i < pokersArr.length%2; i += 2){
		if (pokersArr[i] != pokersArr[i + 1]){
			return false;
		}
	}
	return true;
}
//判断是否是四带二
landlordService.prototype.isFourWithTwo = function (pokersArr){
	if (pokersArr.length == 6){//不为6张一定不是四带二
		for (var i = 0; i < 3; i ++){
			var poker1 = pokersArr[i];
			var poker2 = pokersArr[i + 1];
			var poker3 = pokersArr[i + 2];
			var poker4 = pokersArr[i + 3];
			if (poker1 == poker2 && poker2 == poker3 && poker3 == poker4){
				return true;
			}
		}
	}
	return false;
}
//判定是否是四带二对
landlordService.prototype.isFourWithTwoPairs = function (pokersArr){
	if (pokersArr.length == 8){//不为8张一定不是四带二对
		var tempFourArr = new Array();
		var tempTwoArr = new Array();
		for (var i = 0; i < pokersArr.length; i ++){
			var tempNum = 0;
			for (var j = 0; j < pokersArr.length; j ++){
				if (pokersArr[i] == pokersArr[j]) {
					tempNum ++;
				}
			}
			if (tempNum == 2) {
				tempTwoArr.push(pokersArr[i]);
			}
			if (tempNum == 4){
				tempFourArr.push(pokersArr[i]);
			}
		}
		if (tempFourArr.length/4 == 1 && tempTwoArr.length/2 == 2) {
			return true;
		}
	}
	return false;
}


module.exports = landlordService;