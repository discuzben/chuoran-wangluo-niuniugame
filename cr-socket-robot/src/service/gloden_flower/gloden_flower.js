
module.exports = (function(ioObj, data){
    let ZR_IO = ioObj, self;

    let gfService = function(data){
        self = this;
        this.init(data);
    }

    gfService.prototype.init = function (data){
        //业务数据都放在data， 此处初始化data
        this.data = {token: data.token, playerId: null, playerInfo: null, isSeePai: false, playStatus: 0, roomSeatNum: null, roomLocalPlayers: {}};
        this.__onGameEvent();
    }

    //该方法在初始化后都会被调用
    gfService.prototype.__setPlayerInfo = function(info){
        this.data.playerId = info.playerId;
        this.data.playerInfo = info;
    } 

    /**
    * 当前操作的UI座位号 = 本人固定座位号 + （当前要操作的系统座位号 - 本人的系统座位号）
    * 不足则补满5个
    * @param {*} seatNum 
    */
    gfService.prototype._seatNumMatch = function(seatNum){
       let num = 3 + (seatNum - this.data.roomSeatNum);
       if(num < 0){
           num = 5 + num;
       }else if(num > 5){
           num = num - 5;
       }
       return num;
    }

    //响应游戏事件
    gfService.prototype.__onGameEvent = function(){
        //在另一个地方进行房间匹配->停止匹配->提供返回操作
        ZR_IO.on('match_other', (data, status)=>{
            self.__destroy();
        });
        //匹配时间到了，没匹配成功->停止匹配->提供返回、继续匹配操作
        ZR_IO.on('match_end', (data, status)=>{
            self.__destroy();
        });
        //在其他房间玩，且为结束->停止匹配->提供返回、继续匹配操作
        ZR_IO.on('game_unfinish', (data, status)=>{
            self.__destroy();
        });

        //socket请求错误提示
        ZR_IO.on('io-error', (data)=>{
            self.__destroy();
        });

        //通知谁可以进入房间->通知服务端进入
        ZR_IO.on('game_ready', (data, status) => { //房间匹配成功的事件
            if (status) {
                if (data.playerIds && data.playerIds.indexOf(self.data.playerId) != -1) {
                    ZR_IO.gameRoomKey = data.roomKey;
                    self.data.playerIds = data.playerIds;
                    ZR_IO.emit('entering_room', {roomKey: data.roomKey});
                }
            }else{
                self.__destroy();
            }
        });
        
        ZR_IO.on('game_fapai', (data,status)=>{
            if(status){
                self.data.playStatus = 1;
                self.data.gameStatus = data.gameStatus;

                let paiPlayers = data.paiPlayers;
                let playersInfo = data.playersInfo;
                let gameInfo = data.gameInfo;


                let roomSeatNum;
                for(let m in paiPlayers){
                    let item = paiPlayers[m];
                    if(item.playerId == self.data.playerId){
                        roomSeatNum = item.seatNum;
                    }
                    playersInfo[item.playerId].seatNum = item.seatNum;
                    playersInfo[item.playerId].playStatus = item.playStatus;
                }

                self.data.roomSeatNum = roomSeatNum;
                self.data.gameInfo = gameInfo;

                //保留用户信息至本地，按位置
                //需要放在roomSeatNum赋值后
                for(let m in paiPlayers){
                    let item = paiPlayers[m];
                    self.data.roomLocalPlayers[self._seatNumMatch(item.seatNum)] = playersInfo[item.playerId];
                }
            }else{
                self.__destroy();
            }
        });

        ZR_IO.on('game_lundao', (data,status)=>{ //轮到谁操作
            if(status){
                let gameInfo = data.gameInfo;

                if(self.data.isSeePai != true){
                    //概率选择看不看牌
                    Math.random()>0.5 && (setTimeout(()=>{self && self.gameControl('kanpai')}, Math.floor(Math.random()*3*1000)));
                }

                if(data.seatNum == self.data.roomSeatNum){ //是我
					if(data.currOperate == 'bipai'){
						// setTimeout(()=>{
							self && self.autoOperate();
						// }, data.bipaiSeconds*1000);
					}else{
						self.autoOperate();
					}
                }

                self.data.gameInfo = gameInfo;
            }
        });

        ZR_IO.on('kanpai', (data,status)=>{
            if(status){
                if(data.seatNum == self.data.roomSeatNum){
                    self.data.isSeePai = true;
                    self.data.paiData = data.paiData;
                }else if(self.data.isSeePai != true){ //有人看牌，我也看牌
                    //概率选择看不看牌
                    Math.random()>0.2 && (setTimeout(()=>{self && self.gameControl('kanpai')}, Math.floor((Math.random()*3+2)*1000)));
                }

                self.data.roomLocalPlayers[self._seatNumMatch(data.seatNum)].isSee = true;
            }
        });

        // ZR_IO.on('genzhu', (data,status)=>{});
        ZR_IO.on('jiazhu', (data,status)=>{
            data.gameInfo != null && (self.data.gameInfo = data.gameInfo);
        });

        ZR_IO.on('bipai', (data,status)=>{
            if(status){
                let roomLocalPlayers = self.data.roomLocalPlayers;

                let bipaiResult = data.bipaiResult;
                let winSeatNum = bipaiResult.winSeatNum;
                let loseSeatNum = bipaiResult.loseSeatNum;

                let loseSn = self._seatNumMatch(loseSeatNum);

                roomLocalPlayers[loseSn].playStatus = 3; //败了
                if(loseSn == 3){
                    self.data.playStatus = 3;

                    self.__destroy(); //结束销毁
                }
            }
        });

        ZR_IO.on('qipai', (data,status)=>{
            if(status){
                self.data.roomLocalPlayers[self._seatNumMatch(data.seatNum)].playStatus = data.playStatus;
            }
        });

        ZR_IO.on('game_over', (data,status)=>{
            self.__destroy();
        });
    }

    gfService.prototype.autoOperate = function(){
        let playStatus = this.data.playStatus;
        let gameStatus = this.data.gameStatus;
        if(gameStatus !=1 || playStatus != 1){ //只有游戏中状态才能操作
            return;
        }

        let action; //默认跟注
        let jiazhuCtrls = ['jiazhu1','jiazhu2','jiazhu3','jiazhu4','jiazhu5','jiazhu6'];

        let currBeishu = this.data.gameInfo.currBeishu;
        let currLoopTimes = this.data.gameInfo.currLoopTimes;
        let roomLocalPlayers = this.data.roomLocalPlayers;
        let paiData = self.data.paiData;

        //选择性弃牌
        let isQipai = false;
        if(paiData){ //190：单牌以下牌型
            if(paiData.priority < 240){
                isQipai = true;
            }
        }

        if(isQipai){
            action = 'qipai';
        }else{
            action = 'genzhu'; //默认跟注

            //判断当前倍数
            let jiazhuPercent; //概率加注
            if(currBeishu >= 6){
                jiazhuPercent = 0;
                jiazhuCtrls.splice(0,6);
            }else if(currBeishu >= 5){
                jiazhuPercent = 0.2;
                jiazhuCtrls.splice(0,5);
            }else if(currBeishu >= 4){
                jiazhuPercent = 0.3;
                jiazhuCtrls.splice(0,4);
            }else if(currBeishu >= 3){
                jiazhuPercent = 0.35;
                jiazhuCtrls.splice(0,3);
            }else if(currBeishu >= 2){
                jiazhuPercent = 0.35;
                jiazhuCtrls.splice(0,2);
            }else if(currBeishu >= 1){
                jiazhuPercent = 0.35;
                jiazhuCtrls.splice(0,1);
            }else{
                jiazhuPercent = 0.4;
            }

            if(jiazhuCtrls.length > 0){
                //是否加注 - 概率确定
                Math.random() < jiazhuPercent  && (action = jiazhuCtrls[0]); //默认第一个加注
            }

            //看牌后，执行过加注后，允许比牌
            if(currLoopTimes >= 2 && jiazhuCtrls.length < 6){
                if(Math.random() < 0.6){ //50%概率比牌
                    let canBipaiSeatArr = [];

                    for(let sn in roomLocalPlayers){
                        let player = roomLocalPlayers[sn];
        
                        if(player && player.playStatus==1 && player.seatNum != this.data.roomSeatNum){
                            canBipaiSeatArr.push(player.seatNum);
                        }
                    }
        
                    self.data.bipaiPlayerSeatNum = canBipaiSeatArr[Math.floor(Math.random()*canBipaiSeatArr.length)];
        
                    action = 'bipai';
                }
            }
        }

        setTimeout(()=>{
            self && self.gameControl(action);
        }, Math.floor(Math.random()*3+2)*1000);
    }

    gfService.prototype.gameControl = function(sign){
        if(!sign){
            return;
        }

        let params = {}, cb;

        let emitFunc = ()=>{
            ZR_IO.emit(sign, params, cb || function(result,status){
                cc.info(sign, status, result);
            });
        };

        if(sign == 'kanpai'){ //看牌
        }else if(sign == 'genzhu'){ //跟注
        }else if(sign == 'qipai'){ //弃牌
        }else if(sign == 'jiazhu1'){
            sign = 'jiazhu', params.jiazhuSign = 1;
        }else if(sign == 'jiazhu2'){
            sign = 'jiazhu', params.jiazhuSign = 2;
        }else if(sign == 'jiazhu3'){
            sign = 'jiazhu', params.jiazhuSign = 3;
        }else if(sign == 'jiazhu4'){
            sign = 'jiazhu', params.jiazhuSign = 4;
        }else if(sign == 'jiazhu5'){
            sign = 'jiazhu', params.jiazhuSign = 5;
        }else if(sign == 'jiazhu6'){
            sign = 'jiazhu', params.jiazhuSign = 6;
        }else if(sign == 'bipai'){ //比牌
            params.bipaiSeatNum = self.data.bipaiPlayerSeatNum;
        }else{
            return;
        }

        emitFunc();
    }

    //当机器人没有用了，需要调用此方法进行释放
    //情况：游戏异常、游戏结束
    gfService.prototype.__destroy = function(){
        //对象销毁
        ZR_IO.destroy();
        ZR_IO = self = null;
    }

    return new gfService(data);
});