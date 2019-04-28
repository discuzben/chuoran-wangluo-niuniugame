'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
*  配置
*/
window.configData = {
    isDebug: true,
    apiServerUrl: 'http://api.qisq.top',
    socketServer: { url: 'http://socket.qisq.top' }
};

if (CC_DEBUG) {
    window.configData.socketServer.url = 'http://192.168.0.102:3003';
}

/**
 * 全局数据都存放当前参数下
 */
window.GD = window.GlobalData = {
    token: null,
    playerId: null,
    player: null, //登录用户信息
    loginParams: null, //用户登录参数
    exchangeRoomKey: null, //标记换桌
    current: {//存放场景跳转的参数

    }
};

/**
 * 常量数据都存放当前参数下
 */
window.CD = window.ConstantData = {
    gameTypes: {
        '1': { name: '炸金花', gameId: 30, gameSceneName: 'glodenFlower', roomListScene: 'glodenFlowerRoomList.fire' },
        '2': { name: '百人牛牛', gameId: 50, gameSceneName: 'cattleGame', roomListScene: 'cattle.fire' },
        '3': { name: '德州扑克', gameId: 70, gameSceneName: 'game_xxxx', roomListScene: '' }
    }
};
/**
*  本地存储工具类
*/
window.__localStoreUtil__INSTANCE__ = null;

var localStoreUtil = function localStoreUtil() {
    if (window.__localStoreUtil__INSTANCE__ == null) {
        this.storeKey = 'CR_';
        this.init();
        window.__localStoreUtil__INSTANCE__ = this;
    }
    return window.__localStoreUtil__INSTANCE__;
};
localStoreUtil.prototype = {
    init: function init() {
        this.localStorage = cc.sys.localStorage;
    },
    set: function set(key, value) {
        if (value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object') {
            try {
                value = JSON.stringify(value);
            } catch (error) {
                return false;
            }
        }
        this.localStorage.setItem(this.storeKey + key, value);
        return true;
    },
    get: function get(key) {
        //获取失败，返回===undefined，处理
        var value = this.localStorage.getItem(this.storeKey + key);
        if (value == 'null' || value == 'undefined') {
            value = null;
        } else if (new RegExp('^[{|\[]').test(value)) {
            try {
                value = JSON.parse(value);
            } catch (error) {
                value = undefined;
            }
        }

        return value;
    }
};

window.STORE = new localStoreUtil();
/**
*  自定义工具方法
*/
var myUtil = {
    checkIsLogin: function checkIsLogin() {
        if (STORE.get('USER') === undefined) {
            return false;
        }
        return true;
    },
    compareUp: function compareUp(data, propertyName) {
        // 升序排序  
        if (typeof data[0][propertyName] != "number") {
            // 属性值为非数字  
            return function (object1, object2) {
                var value1 = object1[propertyName];
                var value2 = object2[propertyName];
                return value1.localeCompare(value2);
            };
        } else {
            return function (object1, object2) {
                // 属性值为数字  
                var value1 = object1[propertyName];
                var value2 = object2[propertyName];
                return value1 - value2;
            };
        }
    },
    compareDown: function compareDown(data, propertyName) {
        // 降序排序  
        if (typeof data[0][propertyName] != "number") {
            // 属性值为非数字  
            return function (object1, object2) {
                var value1 = object1[propertyName];
                var value2 = object2[propertyName];
                return value2.localeCompare(value1);
            };
        } else {
            return function (object1, object2) {
                // 属性值为数字  
                var value1 = object1[propertyName];
                var value2 = object2[propertyName];
                return value2 - value1;
            };
        }
    },
    uuid: function uuid(len, radix) {
        //生成uuid
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = [],
            i;
        radix = radix || chars.length;

        if (len) {
            // Compact form
            for (i = 0; i < len; i++) {
                uuid[i] = chars[0 | Math.random() * radix];
            }
        } else {
            // rfc4122, version 4 form
            var r;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            // Fill in random data. At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[i == 19 ? r & 0x3 | 0x8 : r];
                }
            }
        }

        return uuid.join('');
    },


    //获取url参数
    getQueryString: function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var reg_rewrite = new RegExp("(^|/)" + name + "/([^/]*)(/|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        var q = window.location.pathname.substr(1).match(reg_rewrite);
        if (r != null) {
            return unescape(r[2]);
        } else if (q != null) {
            return unescape(q[2]);
        } else {
            return null;
        }
    }
};

window.MyUtil = myUtil;

window.__ccModal = null;
var ccModal = function ccModal() {
    if (window.__ccModal) {
        return window.__ccModal;
    } else {
        window.__ccModal = this;
    }
};

ccModal.prototype._modal = function (msg, cb, seconds) {
    var self = this;
    this.close();

    var setCb = function setCb() {
        var node = cc.instantiate(window.__modalPrefab);

        ccUtil.setLabelString(node, 'container/text', msg || '');

        node.parent = cc.director.getScene();
        node.active = true;

        window.__modalNode = node;

        if (seconds != null) {
            var scheNode = node.children[0]._components[0];
            scheNode.schedule(function () {
                if (--seconds <= 0) {
                    scheNode.unscheduleAllCallbacks();
                    self.close();
                    cb && cb();
                }
            }, 1);
        } else {
            cb && cb();
        }
    };
    if (window.__modalPrefab) {
        setCb();
    } else {
        cc.loader.loadRes('public/modal', function (err, prefab) {
            if (err) {
                cc.error('loadRes - modal 失败', err.message || err);
                return;
            }
            if (prefab instanceof cc.Prefab) {
                window.__modalPrefab = prefab;
                setCb();
            }
        });
    }
};

ccModal.prototype.close = function () {
    window.__modalNode && window.__modalNode.destroy();
};

ccModal.prototype.loading = function (msg) {
    this._modal.apply(this, [msg]);
};

ccModal.prototype.tip = function (msg, cb, seconds) {
    this._modal.apply(this, [msg, cb, seconds || 2]);
};

var ccUtil = {
    setLabelString: function setLabelString(targetNode, childName, text) {
        if (childName) {
            var arr = childName.split('/').forEach(function (item) {
                targetNode = targetNode.getChildByName(item);
            });
        }
        if (targetNode) {
            targetNode.getComponent(cc.Label).string = text == null ? '' : text;
        }
    },
    labelInterval: function labelInterval(targetNode, childName, seconds, cb) {
        if (childName) {
            var arr = childName.split('/').forEach(function (item) {
                targetNode = targetNode.getChildByName(item);
            });
        }

        var labelCom = targetNode.getComponent(cc.Label);

        cb && cb(labelCom, seconds);
        var sched = labelCom.schedule(function () {
            if (--seconds <= 0) {
                labelCom.unscheduleAllCallbacks();
            }
            cb && cb(labelCom, seconds);
        }, 1);
    },
    modalLoading: function modalLoading(msg) {
        new ccModal().loading(msg);
    },
    modalTip: function modalTip(msg, cb, seconds) {
        new ccModal().tip(msg, cb, seconds);
    },
    closeModal: function closeModal() {
        new ccModal().close();
    }
};

window.ccUtil = ccUtil;
/**
*  请求API组件
*/
window.__apiRequestPlugin__INSTANCE = null;

var apiRequestPlugin = function apiRequestPlugin() {
    if (window.__apiRequestPlugin__INSTANCE == null) {
        window.__apiRequestPlugin__INSTANCE = this;
    }
    return window.__apiRequestPlugin__INSTANCE;
};
apiRequestPlugin.prototype = {
    // post请求
    // 格式化post 传递的数据
    _postDataFormat: function _postDataFormat(obj, method) {
        if (!obj || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) != "object") {
            return;
        }

        // 支持有FormData的浏览器（Firefox 4+ , Safari 5+, Chrome和Android 3+版的Webkit）
        if (typeof FormData == "functionXXXX") {
            var data = new FormData();
            for (var attr in obj) {
                data.append(attr, obj[attr]);
            }
            return data;
        } else {
            // 不支持FormData的浏览器的处理 
            var arr = new Array();
            var i = 0;
            for (var attr in obj) {
                arr[i] = encodeURIComponent(attr) + "=" + encodeURIComponent(obj[attr]);
                i++;
            }
            return arr.join("&");
        }
    },
    _requestData: function _requestData(method, url, params, isSync, responseHandler) {
        //请求数据
        //设置token参数
        params ? params.token = GD.token : params = { token: GD.token };

        var requestData = this._postDataFormat(params);
        if (method.toUpperCase() == 'GET') {
            url += (url.indexOf('?') != -1 ? '&' : '?') + requestData;
        }

        var xhr = cc.loader.getXMLHttpRequest();

        if (typeof isSync == 'function') {
            responseHandler = isSync;
            isSync = null;
        }

        if (isSync == null) {
            isSync = true;
        }

        this._streamXHREventsToLabel(xhr, responseHandler);

        xhr.open(method, url, isSync);

        if (cc.sys.isNative) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
        }

        //xhr.withCredentials = true; //设置传递cookie，如果不需要直接注释就好
        //xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest"); //请求头部，需要服务端同时设置

        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); //post请求增加的
        //xhr.setRequestHeader("Content-Type", "application/json;");

        // note: In Internet Explorer, the timeout property may be set only after calling the open()
        // method and before calling the send() method.
        xhr.timeout = 5000; // 30 seconds for timeout

        if (method.toUpperCase() == 'GET') {
            xhr.send();
        } else {
            xhr.send(requestData);
        }
    },
    _streamXHREventsToLabel: function _streamXHREventsToLabel(xhr, responseHandler) {
        var handler = responseHandler || function (status, response, readyState) {
            console.log('请求结果：', response);
        };

        // Simple events
        ['loadstart', 'abort', 'error', 'load', 'loadend', 'timeout'].forEach(function (eventname) {
            xhr["on" + eventname] = function () {
                //console.log("Event : " + eventname, arguments);
            };
        });

        // Special event
        xhr.onreadystatechange = function () {
            //console.log('onreadystatechange', xhr.readyState, xhr.status);
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    var result = void 0;
                    try {
                        result = JSON.parse(xhr.responseText);
                    } catch (error) {}
                    if (result.status == 200) {
                        handler(true, result.result);
                    } else {
                        handler(false, result.result);
                    }
                } else {
                    handler(false, "statusCode=" + xhr.status);
                }
            }
        };
    },
    _dealPath: function _dealPath(path) {
        if (path.indexOf('http://') == -1 && path.indexOf('https://') == -1) {
            path = window.configData.apiServerUrl + path;
        }
        return path;
    },
    get: function get(path, params, isSync, cb) {
        var url = this._dealPath(path);
        this._requestData('GET', url, params, isSync, cb);
    },
    put: function put(path, params, isSync, cb) {
        var url = this._dealPath(path);
        this._requestData('PUT', url, params, isSync, cb);
    },
    post: function post(path, params, isSync, cb) {
        var url = this._dealPath(path);
        this._requestData('POST', url, params, isSync, cb);
    },
    test_get: function test_get() {
        this.get('/api/hello/getHello', null, function (status, data) {
            if (status == true) {
                console.log('请求成功：', data);
            } else {
                console.log('请求失败：', data);
            }
        });
    },
    test_post: function test_post() {
        this.get('/api/hello/getHello2');
    }
};

window.apiRequestPlugin = apiRequestPlugin;
window.API = new apiRequestPlugin();
/**
*  socket.io组件
*  先实例化new socketIoPlugin(), 再通过 ZR_IO 调用
*/
window._SocketIO_INSTANCE = window.ZR_IO = null;
window.currentSocketRoomParams = null; //默认加入房间的参数

var socketIoPlugin = function socketIoPlugin(roomParams, socketCb) {
    if (window._SocketIO_INSTANCE == null) {
        this.initSocketIo({ url: window.configData.socketServer.url });
        window._SocketIO_INSTANCE = this;
        window.currentSocketRoomParams = null;
    }

    window.currentSocketRoomParams = roomParams;
    window._SocketIO_INSTANCE.onReconnectCb(socketCb);

    window.ZR_IO = window._SocketIO_INSTANCE;
    return window._SocketIO_INSTANCE;
};

socketIoPlugin.prototype = {
    initSocketIo: function initSocketIo(socketOpts) {
        var _arguments = arguments;

        var self = this;

        var ioIsConnected = false; //1：可用，0不可用
        var socketIo = io.connect(socketOpts.url);
        var socketEventList = {};

        socketIo.eventCb = function (eventName, eventCall) {
            if (eventCall) {
                socketEventList['event_' + eventName] = eventCall;
            } else {
                delete socketEventList['event_' + eventName];
            }
        };
        socketIo.myEmit = function (emitName, data) {
            if (!data || data.constructor != Object) {
                alert('ERROR-传递的数据类型必须为Object');
                return;
            }
            var sData = { emitName: emitName, data: data };
            socketIo.emit('socket.io', sData);
        };
        socketIo.on('socket.io-data', function (data) {
            console.log('socket.io-data', data);

            if (data.eventName && socketEventList['event_' + data.eventName]) {
                var result = data.data;
                // if (result && new RegExp(/^[{|\[]/).test(result)) {
                //     result = JSON.parse(result);
                // }
                socketEventList['event_' + data.eventName].call(null, result, result.__success);
            }
        });

        socketIo.on('connect', function () {
            //加组在此处理
            ioIsConnected = true;

            var roomParams = window.currentSocketRoomParams;

            console.log('connect', roomParams, _typeof(self.reconnectCb));

            // if (roomParams) {
            //     self.joinRoom(roomParams, (result,status) => {
            //         cc.info('加入房间：', result);
            //         self.reconnectCb && self.reconnectCb(true, result, status);
            //     });
            // } else {
            //     self.reconnectCb && self.reconnectCb(true);
            // }
        });

        socketIo.on('reconnect_attempt', function () {
            ioIsConnected = false;
            console.log('reconnect_attempt');

            if (self.reconnectCb) {
                self.reconnectCb(false);
            }
        });

        socketIo.on('reconnect', function () {
            console.log('reconnect');
        });
        socketIo.on('reconnecting', function () {
            console.log('reconnecting', _arguments);
        });
        socketIo.on('reconnect_error', function () {
            console.log('reconnect_error');
        });
        socketIo.on('reconnect_failed', function () {
            console.log('reconnect_failed');
        });
        socketIo.on('ping', function () {
            console.log('ping', new Date());
        });
        socketIo.on('pong', function () {
            console.log('pong', new Date());
        });

        this.socketIo = socketIo;
    },
    onReconnectCb: function onReconnectCb(reconnectCb) {
        this.reconnectCb = reconnectCb;
    },
    joinRoom: function joinRoom(params, cb) {
        var eventCb = cb || function (data) {
            console.log('join_room_done', data);
        };
        this.__emit('join_room', params, eventCb, true);
    },
    __emit: function __emit(emitEventName, data, emitCb, isJoinRoom) {
        //处理推送过滤
        cc.info('socket-emit', emitEventName);

        //加入房间时间控制
        if (emitEventName == 'join_room' && !isJoinRoom) {
            cc.error('join_room事件已作为为系统加入房间,请更换名称！！');
            return;
        }

        if (emitEventName) {
            //使用全局用户id，当前所在的游戏房间
            if (data == null) {
                data = {};
            }
            if (typeof data == 'function') {
                emitCb = data;
                data = {};
            }

            data.playerId = GD.playerId;
            data.__hallItem = GD.current.hallItem; //场次信息
            data.__gameRoomKey = GD.gameRoomKey;
            data.__gameRoomType = GD.gameRoomType;
            data.__seatNum = GD.roomSeatNum;
            data.__token = GD.token;
            data.__exchangeRoomKey = GD.exchangeRoomKey;

            if (emitCb) {
                //默认接受当前的回调
                var cbEventName = emitEventName + '_' + Math.floor(Math.random() * 10000);
                data.cbEventName = cbEventName;
                this.socketIo.eventCb(cbEventName, emitCb);
            }

            this.socketIo.myEmit(emitEventName, data);
        }
    },
    emit: function emit(emitEventName, data, emitCb) {
        this.__emit.apply(this, arguments);
    },
    on: function on(onEventName, cb) {
        cc.info('socket-on', onEventName);

        if (onEventName) {
            this.socketIo.eventCb(onEventName, cb);
        }
    },
    destroy: function destroy() {
        window._SocketIO_INSTANCE = window.ZR_IO = null;
        this.socketIo.destroy();
    },
    test_on: function test_on() {
        this.on('emit-test', function (data) {
            console.log(data);
        });
    }
};

window.socketIoPlugin = socketIoPlugin;
window.initSocketIo = function (roomParams, socketCb) {
    new socketIoPlugin(roomParams, socketCb);
};
