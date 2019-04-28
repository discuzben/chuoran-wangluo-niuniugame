    window.cc =window.console;

//初始socket,并加入游戏房间
function initIO() {
        let self = this;
        //实例化全局socket.io
        let roomParams = {};
        let socketCb = (connectStatus, roomData, isJoinRoomOk) => {
            console.log('连接结果 - ', connectStatus, isJoinRoomOk, roomData);

        };
        window.initSocketIo(roomParams, socketCb);

        ZR_IO.emit('player_info', {}, (info) => {
            console.info(info);
            GD.player = info.playerInfo;
            GD.playerId = info.playerInfo.playerId;
            domUtil.writeNode({tagName:'h3'},"欢迎来到德州扑克",info.playerInfo.username);
            domUtil.write("当前玩家信息：",info.playerInfo);
            texasHoldem.setCurrentPlayer(info.playerInfo);
            matchingRoom();
        });
    }

    initIO();

    //匹配房间
    function matchingRoom() {
        ZR_IO.emit('matching_room', {});
    }

    //进来就匹配房间处理

    //################事件处理区#########################


    ZR_IO.on('game_ready', (data, status) => { //房间匹配成功的事件
        if (status) {
            if (data.playerIds && data.playerIds.indexOf(GD.playerId) != -1) {
                playerIds = data.playerIds;
                domUtil.write("房间匹配成功！匹配的房间的roomKey为："+data.roomKey);   
                domUtil.write("进入房间...");   
                ZR_IO.emit('entering_room', {roomKey: data.roomKey},function(data){
                    console.log(data);
                    domUtil.write("进入房间房间成功！，返回消息：",data);    
                });
            }
        }
    });

   