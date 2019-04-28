
let socketEmit = require('./socket_utils').socketEmit;;
let timerUtils = require('./timer_utils');
let commonUtils = require('./common_utils');
let getApiData = require('./api_utils');
let getApiJsonData = require('./api_json_utils');

global.___holdemService = null;


let holdemService = function (socket,parentService){
	if(global.___holdemService==null){ //单例模式
		global.___holdemService = this;
	}
	global.___holdemService.socket = socket;
	
	global.___holdemService.parentService = parentService;
	return global.___holdemService;
}
//param

holdemService.prototype.beginGame = function(params){
	console.log('beginGame');
	console.dir(params);
	let self = this;
	console.log('this对象');
	console.log(self);
	let roomKey = params.roomKey;
	let cbEventName = params.cbEventName;
	let socket=this.socket;
	let roomDetailData = global.roomsDetail[roomKey];
	console.log('roomDetailData');
	console.dir(roomDetailData);
	if(roomDetailData.texasHoldem===undefined){
		roomDetailData.texasHoldem=new TexasHoldem();
		roomDetailData.texasHoldem.init(roomDetailData);
	}

	//确定各位玩家的座位号，并填充每个座位号的信息。
	let texasHoldem=roomDetailData.texasHoldem;
	let seatsInfo=texasHoldem.seatsInfo;
	let seatNumIndex = 1;
	let playersTokens = {};
	for(let pid in roomDetailData.enterStatus){
		let pinfo = global.playersInfo[pid];
		seatsInfo[seatNumIndex]=new Seat(seatNumIndex,true,pinfo.playerToken,false,pid);
		playersTokens[pinfo.playerToken] = seatNumIndex;
		seatNumIndex ++;
	}
	//随机确定庄家
	texasHoldem.chooseBanker();
	//texasHoldem.beginGame(data);
	//根据房间id,和所有进入房间的玩家的tokens,请求牌信息
	let paiParams = {roomId: texasHoldem.info.roomId, tokens: Object.keys(playersTokens)};
	this.getPokes(paiParams,function(status,data){
		if(status){
			//开始游戏。
			texasHoldem.beginGame(data);
			texasHoldem.deal();
			texasHoldem.sb();
			texasHoldem.bb();
			texasHoldem.turnTo(texasHoldem.nextSeat());
		}
	});
	return;
};
holdemService.prototype.dealOperate = function (emitName, params) {
	let me=this;
	console.log("params:");
	console.dir(params);
	let roomKey=params.__gameRoomKey;
	let roomDetailData=global.roomsDetail[roomKey];
	let texasHoldem=roomDetailData.texasHoldem;
	// let seatNumber=Number(params.__seatNum);
	let playerId=Number(params.playerId);
	if(isNaN(playerId))return ;
	let seat=texasHoldem.getSeatInfoByPlayerId(playerId);
	let seatNumber=seat.seatNumber;
	texasHoldem.addSocket(this.socket);
	if(emitName!==texasHoldem.actionMap.check){
		if(seatNumber!==texasHoldem.activeSeat.seatNumber){
			return;
		}
	}
	let result=null;
	switch(emitName){
		//过牌
		case 'pass':
			result=texasHoldem.checkPassAction();
			if(result.success!==true){
				return texasHoldem.emitError(texasHoldem.getCurrentSocket(),result.message);
			}
			texasHoldem.clearTimer();
			texasHoldem.pass();
			break;
		//跟注
		case 'call':
			result=texasHoldem.checkCallAction();
			if(result.success!==true){
				return texasHoldem.emitError(texasHoldem.getCurrentSocket(),result.message);
			}
			texasHoldem.clearTimer();
			texasHoldem.call();
			break;
		//加注
		case 'raise':
			let betNum=Number(params.betNum);
			if(isNaN(betNum))return ;
			result=texasHoldem.checkRaiseAction();
			if(result.success!==true){
				return texasHoldem.emitError(texasHoldem.getCurrentSocket(),result.message);
			}
			texasHoldem.clearTimer();
			texasHoldem.raise(betNum);
			break;
		//弃牌
		case 'fold':
			texasHoldem.clearTimer();
			texasHoldem.fold();
			break;
		/*//看牌
		case 'check':
			result=texasHoldem.checkCheckAction(seatNumber);
			if(result.success!==true){
				return texasHoldem.emitError(texasHoldem.getCurrentSocket(),result.message);
			}
			texasHoldem.check(seatNumber);
			break;*/
		//allIn
		case 'allIn':
			result=texasHoldem.checkAllInAction();
			if(result.success!==true){
				return texasHoldem.emitError(texasHoldem.getCurrentSocket(),result.message);
			}
			texasHoldem.clearTimer();
			texasHoldem.allIn();
			break;
		case 'autoCall':
			result=texasHoldem.checkCallAction();
			if(result.success!==true){
				return texasHoldem.emitError(texasHoldem.getCurrentSocket(),result.message);
			}
			texasHoldem.clearTimer();
			texasHoldem.autoCall();
			break;
		//客户端获取开始的两张牌
		/*case 'kanpai':
			result=texasHoldem.checkCheckAction(seatNumber);
			if(result.success!==true){
				return texasHoldem.emitError(texasHoldem.getCurrentSocket(),result.message);
			}
			texasHoldem.check(seatNumber);
			if(texasHoldem.gameStatus===texasHoldem.gameStatusMap.beginGame){
				texasHoldem.gameStatus=texasHoldem.gameStatusMap.preFlop;
				texasHoldem.sb();
				texasHoldem.bb();
				texasHoldem.turnTo(texasHoldem.nextSeat());
			}
			break;*/
	}
	texasHoldem.removeSocket();
	return ;
};


holdemService.prototype.getPokes = function(params, cb){ 
	getApiJsonData('/api/game/round/deal', 'POST', {
		roomId: params.roomId,
		tokens: params.tokens
	}, function (state, data) {
		cb && cb(state, data);
	});
};
function TexasHoldem(){
	this.gameType=3;
	this.gameName='texasHoldem';
	this.players={};
	this.seatsInfo={};
	this.info={};
	this.pokes;
	this.banker;
	this.playerTotalNum=0;
	this.livePlayerTotalNum;
	this.lastSeat;
	this.activeSeat;
	this.bottom;
	this.timer;
	this.gameStatus;
	this.maxTotalBetNum=0;
	this.sockets=[];
	this.totalBetNum=0;
	this.winSeats=[];
	this.fee=0;//该字段仅在最后结算时用到，仅用于存储抽成
};
TexasHoldem.prototype={
	turnTime:15000,
	gameStatusMap:{
		beginGame:0,
		preFlop:1,
		flop:2,
		turn:3,
		river:4,
		headsUp:5
	},
	actionMap:{
		beginGame:'beginGame',
		deal:'deal',//第一轮
		sb:'sb',//下小盲注
		bb:'bb',//下大盲注
		flop:'flop',//第二轮
		turn:'turn',//第三轮
		river:'river',//第四轮
		dealLeftPokes:'dealLeftPokes',//进入allIn阶段时如果还有公共牌未发出，
		//会通过该接口发出剩余的所有公共牌，可能的数量值：5，2，1
		headsUp:'headsUp',//比牌
		gameOver:'gameOver',//游戏结束
		balanceAccount:'balanceAccount',//结算
		turnTo:'turnTo',//轮到谁
		pass:'pass',//过牌
		raise:'raise',//加注
		call:'call',//跟注
		fold:'fold',//弃牌
		allIn:'allIn',//allIn
		check:'kanpai',//看牌
		autoCall:'autoCall',//自动跟注,
		//oneCheck:'oneCheck',//广播某人看牌了
		error:'error'//接收错误消息
	},
	init:function(roomDetailData){
		this.info=roomDetailData.roomInfo;
		this.info.roomKey=roomDetailData.roomKey;
		this.bottom=this.info.hall.bottom;
		this.players=roomDetailData.playersInfo;
		let len=Object.keys(this.players).length;
		this.playerTotalNum=len;
		this.livePlayerTotalNum=len;
	},
	chooseBanker:function(){
		//随机确定庄家，得出庄家的座位号
		let bankerSeatNumber=Math.floor(1+Math.random()*(this.playerTotalNum-1));
		this.banker=this.seatsInfo[bankerSeatNumber];
		this.banker.isBanker=true;
	},
	addSocket:function(socket){
		this.sockets.push(socket);
	},
	removeSocket:function(){
		this.sockets.shift();
	},
	getCurrentSocket:function(){
		return this.sockets[0];
	},
	getPlayerBudget:function(player){
		return player.fortune;
	},
	getPlayerInfo:function(playerId){
        return this.players[playerId];
	},
	getPlayerByToken:function(token){
		let array=this.objectToArray(this.players);
		let len=array.length;
		for(let i=0;i<len;i++){
			if(array[i].value.token===token){
				return array[i].value;
			}
		}
		return null;
	},
	getSeatInfo:function(seatNumber){
		return this.seatsInfo[seatNumber];
	},
	getSeatInfoByPlayerId:function(playerId){
		let array=this.objectToArray(this.seatsInfo);
		let len=array.length;
		for(let i=0;i<len;i++){
			if(array[i].value.playerId===playerId){
				return array[i].value;
			}
		}
		return null;
	},
	getSeatInfoByToken:function(token){
		let array=this.objectToArray(this.seatsInfo);
		let len=array.length;
		for(let i=0;i<len;i++){
			if(array[i].value.token===token){
				return array[i].value;
			}
		}
		return null;
	},
	pickUpCards:function(pokes){
		this.pokes=pokes;
		let me=this;
		Object.keys(this.pokes).forEach(function(key){
			if(key!=='extends'){
				let title=me.pokes[key].title;
				let array=JSON.parse(title);
				me.pokes[key].title=array;
			}
		});
	},
	getCardTitle:function(seat){
		let player=this.getPlayerInfo(seat.playerId);
		let cards=this.pokes[player.token].pokes;
		let title=this.pokes[player.token].title;
		return title;
	},
	beginGame:function(data){
		this.pickUpCards(data.pokes);
		this.broadcast(this.actionMap.beginGame,{});
		this.gameStatus=this.gameStatusMap.beginGame;
	},
	deal:function(){
		this.gameStatus=this.gameStatusMap.preFlop;
		//this.broadcast(this.actionMap.deal,{});
		this.sendCardsToSeat(this.actionMap.check,{},0);
		return 
	},
	//给各玩家发送需要高亮的牌信息
	sendCardsToSeat:function(eventName,data,index){
		let me=this;
		Object.keys(this.seatsInfo).forEach(function(key){
			let seat=me.seatsInfo[key];
			if(seat.playStatus===true){
				let title=me.getCardTitle(seat);
				data.title=title[index];
				let playerId=seat.playerId;
				me.emitToPlayer(playerId,eventName,data);
			}
		});
	},
	/*deal:function(data){
		this.pokes=data.pokes;
		this.gameStatus=this.gameStatusMap.preFlop;
		this.broadcast(this.actionMap.deal,{});
	},*/
	getSbSeat:function(){
		let perflopSeatNum=this.banker.seatNumber+1;
		if(perflopSeatNum>this.playerTotalNum){
			perflopSeatNum=1;
		}
		return this.seatsInfo[perflopSeatNum];
	},
	//广播轮到下小盲注的座位
	//广播下小盲注消息
	sb:function(socket){
		let seat=this.getSbSeat();
		seat.leftTime=0;
		this.turnTo(seat,true);
		seat.leftTime=this.turnTime;
		this.bet(seat,this.bottom);
		this.broadcast(this.actionMap.sb,{'seat':seat});
	},
	//广播轮到下大盲注的座位
	//广播下大盲注消息
	bb:function(){
		let seat=this.nextSeat();
		seat.leftTime=0;
		this.turnTo(seat,true);
		seat.leftTime=this.turnTime;
		seat.action=this.actionMap.raise;
		this.bet(seat,this.lastSeat.bet*2);
		this.broadcast(this.actionMap.bb,{'seat':seat});
	},
	bet:function(seat,betNum){
		seat.bet=betNum;
		this.totalBetNum=this.totalBetNum+betNum;
		this.totalBetNum=Number(this.totalBetNum.toFixed(1));
		seat.totalBetNum=seat.totalBetNum+seat.bet;
		seat.totalBetNum=Number(seat.totalBetNum.toFixed(1));
		if(this.maxTotalBetNum<seat.totalBetNum){
			this.maxTotalBetNum=seat.totalBetNum;
		}
		return seat;
	},
	turnToStartSeat:function(){
		let seat=this.getSbSeat();
		if(seat.playStatus===true){
			this.turnTo(seat);
		}else{
			this.turnTo(seat,true);
			this.turnTo(this.nextSeat());
		}
	},
	turn:function(){
		let me=this;
		let extendPokes=this.pokes.extends.pokes;
		let data={publicPokes:extendPokes.slice(0,3)};
		//this.broadcast(this.actionMap.turn,{pokes:extendPokes.slice(0,3)});
		this.sendCardsToSeat(this.actionMap.turn,data,1);
		this.setTimer(3000,this.turnToStartSeat,this);
	},
	flop:function(){
		let me=this;
		let extendPokes=this.pokes.extends.pokes;
		let data={publicPokes:extendPokes.slice(0,3)};
		//this.broadcast(this.actionMap.flop,{publicPokes:extendPokes.slice(3,4)});
		this.sendCardsToSeat(this.actionMap.flop,data,2);
		this.setTimer(3000,this.turnToStartSeat,this);
	},
	river:function(){
		let extendPokes=this.pokes.extends.pokes;
		let data={publicPokes:extendPokes.slice(4,5)};
		//this.broadcast(this.actionMap.river,{publicPokes:extendPokes.slice(4,5)});
		this.sendCardsToSeat(this.actionMap.river,data,3);
		this.setTimer(3000,this.turnToStartSeat,this);
	},
	headsUp:function(){
		let clone=JSON.parse(JSON.stringify(this.pokes));
		delete clone.extends;
		let pokes=this.objectToArray(clone);
		let sortedPokes=pokes.sort(function(a,b){
			if(a.value.priority>=b.value.priority){
				return false;
			};
			return true;
		});
		let winSeats=[];
		let index=0;
		let winSeat=this.getSeatInfoByToken(sortedPokes[index].key);
		while(winSeat.playStatus!==true){
			index++;
			winSeat=this.getSeatInfoByToken(sortedPokes[index].key);
		}
		winSeats.push(winSeat);
		//考虑平局的情况
		while(index+1<sortedPokes.length && sortedPokes[index].value.priority===sortedPokes[index+1].value.priority){
			index++;
			winSeats.push(this.getSeatInfoByToken(sortedPokes[index].key));
		}
		let seats=this.objectToArray(this.seatsInfo);
		let len=seats.length;
		let aliveSeats=[];
		for(let i=0;i<len;i++){
			if(seats[i].value.playStatus===true){
				aliveSeats.push(seats[i].value);
				if(!this.hasItem(winSeats,seats[i].value,'seatNumber')){
					seats[i].value.playStatus=false;
				}
			}
		}
		this.winSeats=winSeats;
		this.broadcast(this.actionMap.headsUp,{winSeats:winSeats,
			'aliveSeats':aliveSeats}
		);
		this.gameOver();
	},
	gameOver:function(){
		if(this.winSeats.length===0){
			let seats=this.objectToArray(this.seatsInfo);
			let len=seats.length;
			for(let i=0;i<len;i++){
				if(seats[i].value.playStatus===true){
					this.winSeats.push(seats[i].value);
					break;
				}
			}
		}
		this.broadcast(this.actionMap.gameOver,{winSeats:this.winSeats});
		this.balanceAccount();
	},
	balanceAccount:function(){
		let seats=this.objectToArray(this.seatsInfo);
		let len=seats.length;
		let tempTotal=0;
		for(let i=0;i<len;i++){
			tempTotal=tempTotal+seats[i].value.totalBetNum;
		}
		console.log('汇总的金额：'+Number(tempTotal.toFixed(2)));
		console.log('累计的金额：'+this.totalBetNum);
		if(Number(tempTotal.toFixed(2))===this.totalBetNum){
			this.allocateBetNum();
			this.broadcast(this.actionMap.balanceAccount,{});
		}else{
			this.broadcastError('游戏发生异常错误了。游戏过程中结算汇总金额不一致！');
		}
	},
	allocateBetNum:function(){
		let len=this.winSeats.length;
		let tax=this.info.hall.tax;
	 	let leftBetNum=this.totalBetNum;
		//this.fee=this.totalBetNum*tax;
		//var leftBetNum=this.totalBetNum-this.fee;
		let winNum=0;
		let fee=0;
		if(len===1){
			let seat=this.winSeats[0];
			winNum=leftBetNum-seat.totalBetNum;
			fee=Number((winNum*tax).toFixed(4));
			if(fee<0.01){
				fee=0.01;
			}
			seat.winBetNum=Number((winNum-fee).toFixed(4));
			this.fee=this.fee+winNum-seat.winBetNum;
		}else{
			let winTotalBetNum=0;
			for(let i=0;i<len;i++){
				winTotalBetNum=winTotalBetNum+this.winSeats[i].totalBetNum;
			}
			for(let i=0;i<len;i++){
				let seat=this.winSeats[i];
				let partition=(seat.totalBetNum/winTotalBetNum);
				winNum=Number((partition*leftBetNum-seat.totalBetNum).toFixed(4));
				fee=Number((winNum*tax).toFixed(4));
				if(fee<0.01){
					fee=0.01;
				}
				seat.winBetNum=Number((winNum-fee).toFixed(4));
				this.fee=this.fee+winNum-seat.winBetNum;
			}
		}
	},
	isEnterNewStatus:function(){
		if(this.livePlayerTotalNum<=1){
			return true;
		}
		let me=this;
		let keys=Object.keys(this.seatsInfo);
		let len=keys.length;
		let seat;
		for(let i=0;i<len;i++){
			seat=me.seatsInfo[keys[i]];
			if(seat.playStatus===true){
				if((seat.totalBetNum!==me.maxTotalBetNum && seat.action!==me.actionMap.allIn)
				||seat.action===null){
					return false;
				}
			}
		}
		return true;
	},
	clearLastAction:function(){
		let me =this;
		Object.keys(this.seatsInfo).forEach(function(key){
			if(me.seatsInfo[key].playStatus===true){
				me.seatsInfo[key].action=null;
			}
		});
	},
	hasAllInAction:function(){
		let keys=Object.keys(this.seatsInfo);
		let len=keys.length;
		for(let i=0;i<len;i++){
			if(this.seatsInfo[keys[i]].action===this.actionMap.allIn){
				return true;
			}
		}
		return false;
	},
	enterNewStatus:function(){
		if(this.hasAllInAction()){
			this.enterAllInStatus();
			return ;
		}
		this.clearLastAction();
		if(this.livePlayerTotalNum<=1){
			this.gameOver();
			return;
		}
		if(this.gameStatus===this.gameStatusMap.preFlop){
			this.gameStatus=this.gameStatusMap.turn;
			this.turn();
		}else if(this.gameStatus===this.gameStatusMap.turn){
			this.gameStatus=this.gameStatusMap.flop;
			this.flop();
		}else if(this.gameStatus===this.gameStatusMap.flop){
			this.gameStatus=this.gameStatusMap.river;
			this.river();
		}else if(this.gameStatus===this.gameStatusMap.river){
			this.gameStatus=this.gameStatusMap.headsUp;
			this.headsUp();
		}
	},
	enterAllInStatus:function(){
		let extendPokes=this.pokes.extends.pokes;
		let data;
		if(this.gameStatus===this.gameStatusMap.preFlop){
			data={publicPokes:extendPokes.slice(0,5)}
			this.sendCardsToSeat(this.actionMap.dealLeftPokes,data,3);
		}else if(this.gameStatus===this.gameStatusMap.turn){
			//this.broadcast(this.actionMap.dealLeftPokes,{pokes:extendPokes.slice(3,5)});
			data={publicPokes:extendPokes.slice(3,5)}
			this.sendCardsToSeat(this.actionMap.dealLeftPokes,data,3);
		}else if(this.gameStatus===this.gameStatusMap.flop){
			//this.broadcast(this.actionMap.dealLeftPokes,{pokes:extendPokes.slice(4,5)});
			data={publicPokes:extendPokes.slice(4,5)}
			this.sendCardsToSeat(this.actionMap.dealLeftPokes,data,3);
		}
		this.gameStatus=this.gameStatusMap.headsUp;
		this.setTimer(3000,this.headsUp,this);
	},
	nextSeat:function(incre){
		if(incre===undefined)incre=1;
		let currentNum=this.activeSeat.seatNumber;
		let next=currentNum+incre;
		while(this.seatsInfo[next]===undefined||
			this.seatsInfo[next].playStatus===false){
			if(next+1>this.playerTotalNum){
				next=1;
			}else{
				next++;
			}	
		}
		return this.seatsInfo[next];
	},
	//会调用这个方法的情况有，过牌时，加注时验证当前座位的累计投注金额
	checkQualification:function(betNum){
		let totalBetNum;
		if(betNum!==undefined){
			totalBetNum=this.activeSeat.totalBetNum+betNum;
		}else{
			totalBetNum=this.activeSeat.totalBetNum;
		}
		if(totalBetNum<this.maxTotalBetNum){
			return false;
		}
		return true;
	},
	//只有两种情况会调用这个方法：跟注时不传入betNum，加注时传入betNum
	checkFortune:function(betNum){
		let totalBetNum;
		let player=this.getPlayerInfo(this.activeSeat.playerId);
		if(betNum===undefined){
			totalBetNum=this.maxTotalBetNum;
		}else{
			totalBetNum=seat.totalBetNum+betNum;
		}
		if(this.getPlayerBudget(player)>=totalBetNum){
			return true;
		}
		return false;
	},
	hasChoice:function(){
		let me=this;
		let player=this.getPlayerInfo(this.activeSeat.playerId);
		let choice=[];
		/*if(this.activeSeat.isChecked!==true){
			choice.push(new Action(this.actionMap.check));
		}*/
		choice.push(new Action(this.actionMap.fold));
		if(this.activeSeat.totalBetNum<=this.maxTotalBetNum){
			if(this.checkFortune()){
				if(this.activeSeat.totalBetNum<this.maxTotalBetNum){
					choice.push(new Action(this.actionMap.call));
				}else{
					choice.push(new Action(this.actionMap.pass));
				}
				if(this.getPlayerBudget(player)>this.maxTotalBetNum){
					choice.push(new Action(this.actionMap.raise));
				}
				if(this.activeSeat.autoCall!==true){
					choice.push(new Action(this.actionMap.autoCall));
				}
			}else{
				choice.push(new Action(this.actionMap.fold));
			}
			if(this.activeSeat.isAllIned!==true){
				choice.push(new Action(this.actionMap.allIn));
			}
		}
		this.activeSeat.choice=choice;
		return this;
	},
	//广播轮到某个座位,如果传入notBroadCast为true,则只是转换下当前的在操作的座位
	//而不广播
	turnTo:function(seat,notBroadCast){
		let me=this;
		this.lastSeat=this.activeSeat;
		this.activeSeat=seat;
		if(notBroadCast!==true){
			if(this.activeSeat.autoCall===true){
				if(this.activeSeat.totalBetNum<this.maxTotalBetNum){
					if(this.checkFortune()){
						this.call();
						return;
					}
				}else{
					this.pass();
					return;
				}
			}
			this.hasChoice();
			this.broadcast(this.actionMap.turnTo,{'seat':seat});
			this.setTimer(this.turnTime+1000,this.defaultAction,this);
		}
	},
	checkPassAction:function(){
		if(this.checkQualification()){
			return this.bornCheckResult(true);
		}else{
			return this.bornCheckResult(false,'非法操作，不能过牌，只能跟注或加注！');
		}
	},
	checkCallAction:function(){
		if(this.checkFortune()){
			return this.bornCheckResult(true);
		}else{
			return this.bornCheckResult(false,'非法操作，您本局剩余的筹码不够所跟注的金额！');
		}
	},
	checkRaiseAction:function(betNum){
		let player=this.getPlayerInfo(this.activeSeat.seatNumber);
		let totalBetNum=betNum+this.activeSeat.totalBetNum;
		if(this.getPlayerBudget(player)<totalBetNum){
			return this.bornCheckResult(false,'非法操作，您本局剩余的筹码不够所加注的金额！');
		}else if(totalBetNum<this.maxTotalBetNum){
			return this.bornCheckResult(false,'非法操作，您所加注的金额低于本局玩家所投注的最大金额！');
		}else{
			return this.bornCheckResult(true);
		}
	},
	checkAllInAction:function(){
		if(this.activeSeat.actionMap===this.actionMap.allIn){
			return this.bornCheckResult(false,'非法操作，您已经allIn过一次了！');
		}
		return this.bornCheckResult(true);
	},
	checkCheckAction:function(seatNumber){
		if(this.getSeatInfo(seatNumber).isChecked===true){
			return this.bornCheckResult(false,'非法操作，您已经看过牌了！');
		}
		return this.bornCheckResult(true);
	},
	//当前玩家过牌
	pass:function(){
		this.activeSeat.action=this.actionMap.pass;
		this.oneBroadcast(this.getCurrentSocket(),this.actionMap.pass,
			{'seat':this.activeSeat});
		if(this.isEnterNewStatus()){
			this.enterNewStatus();
		}else{
			this.turnTo(this.nextSeat());
		}
	},
	//当前玩家跟注
	call:function(){
		let totalBetNum=this.maxTotalBetNum;
		let add=totalBetNum-this.activeSeat.totalBetNum;
		this.bet(this.activeSeat,add);
		this.activeSeat.action=this.actionMap.call;
		this.oneBroadcast(this.getCurrentSocket(),this.actionMap.call,
			{'seat':this.activeSeat});
		if(this.isEnterNewStatus()){
			this.enterNewStatus();
		}else{
			this.turnTo(this.nextSeat());
		}
	},
	//当前玩家加注
	raise:function(betNum){
		this.bet(this.activeSeat,betNum);
		this.activeSeat.action=this.actionMap.raise;
		this.oneBroadcast(this.getCurrentSocket(),this.actionMap.raise,
			{'seat':this.activeSeat});
		this.turnTo(this.nextSeat());
	},
	//当前玩家allIn
	allIn:function(){
		let player=this.getPlayerInfo(this.activeSeat.playerId);
		let add=this.getPlayerBudget(player)-this.activeSeat.totalBetNum;
		this.bet(this.activeSeat,add);
		this.activeSeat.action=this.actionMap.allIn;
		this.oneBroadcast(this.getCurrentSocket(),this.actionMap.allIn,
			{'seat':this.activeSeat});
		this.turnTo(this.nextSeat());
	},
	//当前玩家弃牌
	fold:function(){
		this.activeSeat.playStatus=false;
		this.livePlayerTotalNum=this.livePlayerTotalNum-1;
		this.oneBroadcast(this.getCurrentSocket(),this.actionMap.fold,
			{'seat':this.activeSeat});
		this.activeSeat=this.lastSeat;
		if(this.isEnterNewStatus()){
			this.enterNewStatus();
		}else{
			this.turnTo(this.nextSeat());
		}
	},
	//第一次发牌2张
	/*check:function(seatNumber){
		let seat=this.getSeatInfo(seatNumber);
		let player=this.getPlayerInfo(seat.playerId);
		let cards=this.pokes[player.token].pokes;
		let title=this.pokes[player.token].title[0];
		this.emitSolo(this.getCurrentSocket(),this.actionMap.check,{'title':title,'pokes':cards});
	},*/
	//看牌
	/*check:function(seatNumber){
		let seat=this.getSeatInfo(seatNumber);
		let player=this.getPlayerInfo(seat.playerId);
		let cards=this.pokes[player.token].pokes;
		let title=this.pokes[player.token].title[0];
		this.emitSolo(this.getCurrentSocket(),this.actionMap.check,{'title':title,'pokes':cards});
		this.oneBroadcast(this.getCurrentSocket(),this.actionMap.oneCheck,{"seat":seat});
	},*/
	autoCall:function(){
		this.activeSeat.autoCall=true;
		this.activeSeat.action=this.actionMap.autoCall;
		this.oneBroadcast(this.getCurrentSocket(),this.actionMap.autoCall,{"seat":this.activeSeat});
		if(this.activeSeat.totalBetNum<this.maxTotalBetNum){
			this.call();
		}else{
			this.pass();
		}
	},
	defaultAction:function(){
		if(this.checkQualification()){
			this.pass();
		}else{
			this.fold();
		}
	},
	setTimer:function(time,method,context){
		let me=this;
		if(time===undefined)time=0;
		this.timeStamp=(new Date()).getTime();
		console.log(this.timeStamp);
		this.timer=setTimeout(function(){
			let time=(new Date()).getTime();
			console.log("度过的时间：");
			console.log(time-me.timeStamp);
			method.call(context);
		},time);
	},
	clearTimer:function(){
		if(this.timer!=null){
			clearTimeout(this.timer);
			this.timer=null;
		}
	},
	bornCheckResult:function(isSuccess,msg){
		if(isSuccess==true&&msg===undefined){
			return {'success':isSuccess,'message':'校验成功！'};
		}
		return {'success':isSuccess,'message':msg};
		
	},
	//某个座位向房间广播消息
	oneBroadcast:function(socket,eventName,data){
		data.timeStamp=(new Date()).getTime();
		socketEmit(socket,this.info.roomKey,eventName,data,false);
	},
	/*
		向房间广播消息
	*/
	broadcast:function(eventName,data){
		data.game=this.toFrontPublicMsg();
		data.timeStamp=(new Date()).getTime();
		socketEmit(null,this.info.roomKey,eventName,data,true);
	},
	broadcastError:function(msg){
		socketEmit(null,this.info.roomKey,this.actionMap.error,{'error':msg},true);
	},
	getAllRoomSockets:function(){
		console.dir(global.io.in(this.info.roomKey));
		console.dir(global.io.in(this.info.roomKey).clients());
		return global.io.in(this.info.roomKey).sockets;
	},
	getSocketByPlayerId:function(playerId){
		let  socketsArray=global.playerIdSocketObj[playerId];
		let len=socketsArray.length;
		let sockets=[]
		let roomSockets=this.getAllRoomSockets();
		for(let i=0;i<len;i++){
			let socket=roomSockets[socketsArray[i]];
			if(socket!==undefined){
				return socket;
			}
		}
		return null;
	},
	emitToPlayer:function(playerId,eventName,data){
		let soket=this.getSocketByPlayerId(playerId);
		this.emitSolo(soket,eventName,data);
	},
	//只发给当前传入的socket
	emitSolo:function(socket,eventName,data){
		socketEmit(socket,null,eventName,data,true);
	},
	emitError:function(socket,msg){
		socketEmit(socket,null,this.actionMap.error,{'error':msg},true);
	},
	toFrontPublicMsg:function(){
		console.log('toFrontPublicMsg');
		console.log(this);
		let clone={};
		clone.gameType=this.gameType;
		clone.gameName=this.gameName;
		clone.players=this.players;
		clone.seatsInfo=this.seatsInfo;
		clone.info=this.info;
		clone.banker=this.banker;
		clone.playerTotalNum=this.playerTotalNum;
		clone.livePlayerTotalNum=this.livePlayerTotalNum;
		clone.lastSeat=this.lastSeat;
		clone.activeSeat=this.activeSeat;
		clone.bottom=this.bottom;
		clone.gameStatus=this.gameStatus;
		clone.maxTotalBetNum=this.maxTotalBetNum;
		clone.totalBetNum=this.totalBetNum;
		return clone;
	},
	objectToArray:function(object){
		let array=[];
		if(typeof object ==='object'){
			Object.keys(object).forEach(function(key){
				let o={'key':key,'value':object[key]};
				array.push(o);
			});
		}
		return array;
	},
	hasItem:function(array,item,key){
		let len=array.length;
		for(var i=0;i<len;i++){
			if(array[i][key]===item[key]){
				return true;
			}
		}
		return false;
	}
};
function Seat(seatNumber,playStatus,token,isChecked,playerId){
	this.seatNumber=seatNumber;
	//true或false
	this.playStatus=playStatus;
	this.token=token;
	this.isChecked=isChecked;
	this.playerId=Number(playerId);
	this.totalBetNum=0;
	this.bet=0;
	this.choice=[];
	this.isAllIned=false;
	this.leftTime=TexasHoldem.prototype.turnTime;//milisecond
	//只有pass,call,raise,fold四种
	this.action=null;
	this.autoCall=false;
	this.budget=0;
	this.winBetNum=0;//该字段仅在最后结算阶段才会用到；
}
function Action(key){
	this.key=key;
	switch(key){
		case 'pass':this.label='过牌';break;
		case 'call':this.label='跟注';break;
		case 'fold':this.label='弃牌';break;
		case 'raise':this.label='加注';break;
		//case 'check':this.label='看牌';break;
		case 'allIn':this.label='allIn';break;
		case 'autoCall':this.label='自动跟注';break;
	}
	return this;
}
module.exports = holdemService;