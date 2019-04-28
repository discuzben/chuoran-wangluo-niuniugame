
module.exports = (function(ioObj, data){
    let ZR_IO = ioObj, self;

    let xxxService = function(data){
        self = this;
        this.init(data);
    }

    xxxService.prototype.init = function (data){
        //业务数据都放在data， 此处初始化data
        this.data = {token: data.token, playStatus: 0};
        this.__onGameEvent();
    }

    //该方法在初始化后都会被调用
    xxxService.prototype.__setPlayerInfo = function(info){
        this.data.playerId = info.playerId;
        this.data.playerInfo = info;
    } 

    //响应游戏事件
    xxxService.prototype.__onGameEvent = function(){
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
        
        ZR_IO.on('begin_game', (data,status)=>{ //房间开始游戏入口
            if(!status){
                self.__destroy();
                return;
            }
                
            console.log('房间返回信息：', data);
            //TODO:


        });


        ZR_IO.on('game_over', (data,status)=>{
            self.__destroy();
        });
    }

    //当机器人没有用了，需要调用此方法进行释放
    //情况：游戏异常、游戏结束
    xxxService.prototype.__destroy = function(){
        //对象销毁
        ZR_IO.destroy();
        ZR_IO = self = null;
    }

    return new xxxService(data);
});