
var socket_client = require('socket.io-client');

module.exports = (function(token, hallItem){
    let self;

    let robotClient = function(token,hallItem){
        self = this;

        console.log('robotClient - new - ' + token);

        this.token = token;
        this.hallItem = hallItem;
        this.initSocketIo();
    };

    robotClient.prototype = {
        initSocketIo() {
            let ioIsConnected = true; //1：可用，0不可用

            let socketIo = socket_client.connect(global.config.socketServer.url, {reconnection: false, forceNew: true});

            let socketEventList = {};

            socketIo.eventCb = (eventName, eventCall) => {
                if(eventCall){
                    socketEventList['event_' + eventName] = eventCall;
                }else{
                    delete socketEventList['event_' + eventName];
                }
            };
            socketIo.myEmit = function (emitName, data) {
                if (!data || data.constructor != Object) {
                    alert('ERROR-传递的数据类型必须为Object');
                    return;
                }
                let sData = { emitName: emitName, data: data };
                socketIo.emit('socket.io', sData);
            };
            socketIo.on('socket.io-data', data => {
                console.log('socket.io-data', self.token, data);

                if (data.eventName && socketEventList['event_' + data.eventName]) {
                    let result = data.data;
                    // if (result && new RegExp(/^[{|\[]/).test(result)) {
                    //     result = JSON.parse(result);
                    // }
                    socketEventList['event_' + data.eventName].call(null, result, result.__success);
                }
            });

            socketIo.on('connect', () => {
                console.log('connect', self.token, self.reConnectFrom, ioIsConnected, typeof self.reconnectCb);
                if(self.reConnectFrom == 'local'){
                    //由业务处理
                    self.reConnectFrom == null;
                }else{
                    if(ioIsConnected == false){
                        ioIsConnected = true;

                        if (self.reconnectCb) {
                            self.reconnectCb(true);
                        }
                    }
                }
            });

            socketIo.on('reconnect_attempt', () => {
                console.log('reconnect_attempt', self.token, self.reConnectFrom, ioIsConnected);
                if(self.reConnectFrom == 'local'){
                    //由业务处理

                }else{
                    if(ioIsConnected == true){
                        ioIsConnected = false;
        
                        // ccUtil.modalLoading('socket服务连接断开');
                    }
                }
            });

            // socketIo.on('reconnect', () => {
            //     console.log('reconnect');
            // });
            // socketIo.on('reconnecting', () => {
            //     console.log('reconnecting');
            // });
            // socketIo.on('reconnect_error', () => {
            //     console.log('reconnect_error');
            // });
            // socketIo.on('reconnect_failed', () => {
            //     console.log('reconnect_failed');
            // });
            // socketIo.on('ping', () => {
            //     console.log('ping', self.token);
            // });
            // socketIo.on('pong', () => {
            //     console.log('pong', self.token);
            // });

            this.socketIo = socketIo;
        },

        onReconnectCb(reconnectCb) {
            this.reconnectCb = reconnectCb;
        },

        joinRoom(params, cb) {
            var eventCb = cb || function (data) {
                console.log('join_room_done', data);
            };
            this.__emit('join_room', params, eventCb, true);
        },
        
        __emit(emitEventName, data, emitCb, isJoinRoom){ //处理推送过滤
            console.info('socket-emit', emitEventName);

            //加入房间时间控制
            if(emitEventName=='join_room' && !isJoinRoom){
                console.error('join_room事件已作为为系统加入房间,请更换名称！！');
                return;
            }

            if (emitEventName) { //使用全局用户id，当前所在的游戏房间
                if(data == null){
                    data = {};
                }
                if(typeof data == 'function'){
                    emitCb = data;
                    data = {};
                }

                data.__token = self.token;
                data.playerId = self.playerId;
                data.__hallItem = self.hallItem;
                data.__gameRoomKey = self.gameRoomKey;

                if(emitCb){ //默认接受当前的回调
                    let cbEventName = emitEventName + '_' + Math.floor(Math.random()*10000);
                    data.cbEventName = cbEventName;
                    this.socketIo.eventCb(cbEventName, emitCb);
                }
                
                this.socketIo.myEmit(emitEventName, data);
            }
        },
        
        emit(emitEventName, data, emitCb) {
            this.__emit.apply(this,arguments);
        },

        on(onEventName, cb) {
            console.info('socket-on', self.token, onEventName);

            if (onEventName) {
                this.socketIo.eventCb(onEventName, cb);
            }
        },

        reConnect() {
            // this.reConnectFrom = 'local';
            // this.socketIo.disconnect();
            // this.socketIo.connect();
        },

        destroy() {
            console.log('robotClient - destroy - ' + token);
            this.socketIo.destroy();
        }
    };

    return new robotClient(token, hallItem);
});
