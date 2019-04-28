module.exports = (function(ioObj, data) {
    let ZR_IO = ioObj,
        self;

    let cattleService = function(data) {
        ZR_IO = ioObj, self = this;
        this.init(data);
    }
    let playerId;
    let curplexperience;
    function getRandom(min, max) {
        var range = max - min;
        var numb = min + Math.round(Math.random() * range);
        return numb;
    }

    cattleService.prototype.init = function(data) {
        //业务数据都放在data， 此处初始化data
        this.data = { token: data.token, gameRoomKey: null };
        this.__onGameEvent();
    }

    //该方法在初始化后都会被调用
    cattleService.prototype.__setPlayerInfo = function(info) {
        this.data.playerId = info.playerId;
        this.data.playerInfo = info;
    }

    //响应游戏事件
    cattleService.prototype.__onGameEvent = function() {
        //在另一个地方进行房间匹配->停止匹配->提供返回操作
        ZR_IO.on('match_other', (data, status) => {
            self.__destroy();
        });
        //匹配时间到了，没匹配成功->停止匹配->提供返回、继续匹配操作
        ZR_IO.on('match_end', (data, status) => {
            self.__destroy();
        });
        //在其他房间玩，且为结束->停止匹配->提供返回、继续匹配操作
        ZR_IO.on('game_unfinish', (data, status) => {
            self.__destroy();
        });

        //通知谁可以进入房间->通知服务端进入
        ZR_IO.on('game_ready', (data, status) => { //房间匹配成功的事件
            if (status) {
                if (data.playerIds && data.playerIds.indexOf(self.data.playerId) != -1) {
                    ZR_IO.gameRoomKey = data.roomKey;
                    self.data.playerIds = data.playerIds;
                    ZR_IO.emit('entering_room', { roomKey: data.roomKey });
                }
            } else {
                self.__destroy();
            }
        });

        ZR_IO.on('game_begin', (data, status) => {
            if (status) {
            	// for(var s in this.data){
            	// 	console.log("获取当前用户的id："+s+this.data.playerId);
            	// }
                // let currentplayer = self.playerId;
                // let curplayerindex = self.data.playerIds.indexOf(currentplayer);
                // let temp = self.data.playerIds[curplayerindex];
                // playerIds[curplayerindex] = self.data.playerIds[0];
                // self.data.playerIds[0] = temp;
            } else {
                self.__destroy();
            }

        });
        ZR_IO.on('banker_roll', (data, status) => {
            if (status) {
                var BANKER_ODDS = [0, 2, 3, 4];
                let clockindex = this.data.playerIds.indexOf(this.data.playerId);
                console.log(clockindex);
                // for(var key in data.playersInfo){
                //     var o = data.playersInfo[key];
                //     for(var s in o){
                //         console.log("获取玩家的金币数："+o[s]);
                //     }
                // }
                // console.log(self.playerId);
                curplexperience = data.playersInfo[this.data.playerId].experience.toFixed(1);
                if (curplexperience < 480) {
                    setTimeout(function() {
                        ZR_IO.emit('banker_choose', {odds: BANKER_ODDS[0]});
                    },getRandom(clockindex*3+1,clockindex*3+4)*1000);
                } else if (curplexperience < 720) {
                    setTimeout(function() {
                        ZR_IO.emit('banker_choose', {odds: BANKER_ODDS[0,1]});
                    },getRandom(clockindex*3+1,clockindex*3+4)*1000);
                } else if (curplexperience < 960) {
                    setTimeout(function() {
                        ZR_IO.emit('banker_choose', { odds: BANKER_ODDS[0,2]});
                    },getRandom(clockindex*3+1,clockindex*3+4)*1000);
                } else {
                    //金币大于960不禁用按钮
                    setTimeout(function() {
                        ZR_IO.emit('banker_choose', {odds: BANKER_ODDS[0,3]});
                    },getRandom(clockindex*3+1,clockindex*3+4)*1000);
                }

                // console.log("据此获取第几次轮到当前玩家："+data);
            } else {
                self.__destroy();
            }

        });
        ZR_IO.on('player_roll', (data, status) => {
            if (status) {
                // var PLAYER_ODDS = [2, 5, 8, 15];
                if (this.data.playerIds.indexOf(data.banker.playerId) == 0) { //如果庄家是玩家自己，不提交下注

                } else {
                    // 根据玩家金币多少提交下注倍数
                    if (curplexperience < 64) {
                        setTimeout(function() {
                            ZR_IO.emit('player_choose', { odds: getRandom(1,4)});
                        },getRandom(3,8)*1000);
                    } else if (curplexperience >= 64 && curplexperience < 128) {
                        setTimeout(function() {
                            ZR_IO.emit('player_choose', { odds: getRandom(5,8)});
                        },getRandom(3,8)*1000);
                    } else if (curplexperience >= 128 && curplexperience < 192) {
                        setTimeout(function() {
                            ZR_IO.emit('player_choose', { odds: getRandom(9,12)});
                        },getRandom(3,8)*1000);
                    } else if (curplexperience >= 192 && curplexperience < 256) {
                        setTimeout(function() {
                            ZR_IO.emit('player_choose', { odds: getRandom(13,16)});
                        },getRandom(3,8)*1000);
                    } else {
                        setTimeout(function() {
                            ZR_IO.emit('player_choose', { odds: getRandom(17,20)});
                        },getRandom(3,8)*1000);
                    }
                        // setTimeout(function() {
                        //     ZR_IO.emit('player_choose', { playerId: self.playerId, odds: getRandom(0,20)});
                        // },getRandom(3,8)*1000);
                }
            } else {
                self.__destroy();
            }

        });
        ZR_IO.on('deal', (data, status) => {
            if (status) {
                setTimeout(function() {
                    //推送有牛事件
                    ZR_IO.emit('choose_yn', {roomKey:data.roomKey});
                },getRandom(1,4)*1000);
            } else {
                self.__destroy();
            }

        });
    }

    //当机器人没有用了，需要调用此方法进行释放
    //情况：游戏异常、游戏结束
    cattleService.prototype.__destroy = function() {
        ZR_IO.destroy();
        ZR_IO = self = null;
    }

    return new cattleService(data);
});