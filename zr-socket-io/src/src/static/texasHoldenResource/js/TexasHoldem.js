function TexasHoldem(){
    //当前登陆用户相关
    this.currentPlayer={};
    this.socket;
    this.cards;
    //当前登陆用户相关结束
	this.players={};
	this.seatsInfo={};
	this.info={};
	this.banker;
    this.playerTotalNum;
    this.livePlayerTotalNum;
    this.bottom;
    this.gameStatus;
    this.maxTotalBetNum=0;
    this.totalBetNum=0;
    this.winSeats=[];
};
// data.playerId = GD.playerId;
// data.__hallItem = GD.current.hallItem; //场次信息
// data.__gameRoomKey = GD.gameRoomKey;
// data.__gameRoomType = GD.gameRoomType;
// data.__seatNum = GD.roomSeatNum;
// data.__token = GD.token;
// data.__exchangeRoomKey = GD.exchangeRoomKey;
TexasHoldem.prototype={
    setCurrentPlayer:function(player){
        this.currentPlayer=player;
        GD.token=player.token;
        
    },
    initData:function(data){
        var  me=this;
        if(data===undefined)return ;
        if(data.players!==undefined){
            this.players=data.players;
        }
        if(data.seatsInfo!==undefined){
            this.seatsInfo=data.seatsInfo;
            //确定当前页面登陆玩家的座位号。
            if(me.currentPlayer===undefined){
                console.log('当前用户未连接到socket!');
                return ;
            }
            var currentPlayerId=me.currentPlayer.playerId;
            Object.keys(this.seatsInfo).forEach(function(seatNumber){
               if(me.seatsInfo[seatNumber].playerId==currentPlayerId){
                    me.currentPlayer.seatNumber=seatNumber;
                    GD.roomSeatNum=seatNumber;
               }
            });
        }
        if(data.info!==undefined){
            this.info=data.info;
            GD.gameRoomKey=this.info.roomKey;
        }
        if(data.banker!==undefined){
            this.banker=data.banker;
        }
        if(data.playerTotalNum!==undefined){
            this.playerTotalNum=data.playerTotalNum;
        }
        if(data.livePlayerTotalNum!==undefined){
            this.livePlayerTotalNum=data.livePlayerTotalNum;
        }
        if(data.bottom!==undefined){
            this.bottom=data.bottom;
        }
        if(data.gameStatus!==undefined){
            this.gameStatus=data.gameStatus;
        }
        if(data.maxTotalBetNum!==undefined){
            this.maxTotalBetNum=data.maxTotalBetNum;
        }
        if(data.totalBetNum!==undefined){
            this.totalBetNum=data.totalBetNum;
        }
        if(data.winSeats!==undefined){
            this.winSeats=data.winSeats;
        }
    },
    getPlayerInfo:function(playerId){
        return this.players[playerId];
    },
    getSbSeat:function(){
		let perflopSeatNum=this.banker.seatNumber+1;
		if(perflopSeatNum>this.playerTotalNum){
			perflopSeatNum=1;
		}
		return this.seatsInfo[perflopSeatNum];
	},
    pass:function(){
        this.emit('pass');
        domUtil.clearTimer();
        domUtil.clearManipulatePanel();
    },
    call:function(){
        this.emit('call');
        domUtil.clearTimer();
        domUtil.clearManipulatePanel();
    },
    raise:function(betNum){
        this.emit('raise',{'betNum':betNum});
        domUtil.clearTimer();
        domUtil.clearManipulatePanel();
    },
    allIn:function(){
        this.emit('allIn');
        domUtil.clearTimer();
        domUtil.clearManipulatePanel();
    },
    fold:function(){
        this.emit('fold');
        domUtil.clearTimer();
        domUtil.clearManipulatePanel();
    },
    check:function(){
        this.emit('check');
    },
    autoCall:function(){
        this.emit('autoCall');
        domUtil.clearTimer();
        domUtil.clearManipulatePanel();
    },
    emit:function(eventName,data){
        ZR_IO.emit(eventName,data);
    },
    getAccurateLeftTime:function(leftTime,timeStamp){
        var now=(new Date()).getTime();
        var diff=now-timeStamp;
        return (((leftTime-diff)/1000).toFixed(0))*1000;
    }
};