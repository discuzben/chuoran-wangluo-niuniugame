(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/api/build_main.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '627951+gx5EUYwR5fmwkGj8', 'build_main', __filename);
// api/build_main.js

'use strict';

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
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
require('config');

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

    },
    setting: { //全局设置
        musicVolume: 1, //音乐音量
        effectVolume: 1, //音效音量
        isMusicMute: false,
        isEffectMute: false
    }
};

(function () {
    //读取缓存数据至全局变量
    var _musicVolume = STORE.get('musicVolume');
    _musicVolume != null && (GD.setting.musicVolume = _musicVolume * 1);
    var _effectVolume = STORE.get('effectVolume');
    _effectVolume != null && (GD.setting.effectVolume = _effectVolume * 1);

    var _isMusicMute = STORE.get('isMusicMute') === 'true';
    _isMusicMute != null && (GD.setting.isMusicMute = _isMusicMute);
    var _isEffectMute = STORE.get('isEffectMute') === 'true';
    _isEffectMute != null && (GD.setting.isEffectMute = _isEffectMute);
})();

/**
 * 常量数据都存放当前参数下
 */
window.CD = window.ConstantData = {
    gameTypes: {
        '1': { name: '炸金花', gameId: 30, gameSceneName: 'glodenFlower', roomListScene: 'roomList' },
        '2': { name: '牛牛', gameId: 50, gameSceneName: 'cattle', roomListScene: 'cattleChooseRoom' },
        '3': { name: '德州扑克', gameId: 70, gameSceneName: 'holdem', roomListScene: 'roomList' },
        '4': { name: '斗地主', gameId: 170, gameSceneName: 'landload', roomListScene: 'landloadRoomList' }
    }
};
/**
*  自定义工具方法
*/
var myUtil = {
    //获得字符串实际长度，中文2，英文1
    getLength: function getLength(str) {
        if (str == null || str == '') {
            return 0;
        }
        var realLength = 0,
            len = str.length,
            charCode = -1;
        for (var i = 0; i < len; i++) {
            charCode = str.charCodeAt(i);
            if (charCode >= 0 && charCode <= 128) realLength += 1;else realLength += 2;
        }
        return realLength;
    },
    substr: function substr(str, maxLength, needDot) {
        var _result = str || '';
        if (myUtil.getLength(str) > maxLength) {
            var realLength = 0,
                len = str.length,
                charCode = -1,
                _subIndex;
            for (var i = 0; i < len; i++) {
                if (realLength >= maxLength) {
                    _subIndex = i;
                    break;
                }
                charCode = str.charCodeAt(i);
                if (charCode >= 0 && charCode <= 128) realLength += 1;else realLength += 2;
            }

            _result = str.substr(0, _subIndex);
            if (needDot === true) _result += '...';
        }
        return _result;
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

ccModal.prototype._addButtons = function (options) {
    var btnsNode = this.modalNode.getChildByName('btns');

    var btnsArr = {};
    if (options && btnsNode) {
        btnsNode.children.forEach(function (item, index) {
            btnsArr[item.name] = item;
        });

        if (options.buttons) {
            var btnNodes = [];
            options.buttons.forEach(function (item, index) {
                // item.name, item.handler;

                if (!item.name || btnsArr[item.name] == null) {
                    return;
                }

                var node = btnsArr[item.name];

                delete btnsArr[item.name];

                node.active = true;

                ccUtil.setLabelString(node, 'text', item.text || '');

                var btnComp = node.getComponent(cc.Button);

                if (item.handler) {
                    btnComp.clickEvents = [item.handler];
                } else {
                    btnComp.clickEvents = [];
                }
            });
        }
    }

    for (var i in btnsArr) {
        btnsArr[i].active = false;
    }
};

ccModal.prototype._modal = function (msg, cb, seconds, options) {
    var _this = this;

    var self = this;

    if (this.modalNode == null || this.modalNode && this.modalNode.isValid == false) {
        this.modalNode = cc.find('modal');
    }

    if (this.modalNode && this.modalNode.isValid == false) {
        this.modalNode = null;
    }

    this.modalloadCb = function () {
        var node = _this.modalNode;

        ccUtil.setLabelString(node, 'size/bg/container/text', msg || '');

        node.active = true;

        _this._addButtons(options);

        var scheNode = node.children[0]._components[0];

        scheNode.unscheduleAllCallbacks();

        if (seconds != null && seconds > 0) {
            scheNode.schedule(function () {
                if (--seconds <= 0) {
                    scheNode.unscheduleAllCallbacks();
                    node.active = false;

                    cb && cb();
                }
            }, 1);
        } else {
            cb && cb();
        }
    };

    if (this.modalNode != null) {
        self.modalloadCb();
    } else {
        if (self.isModalloading != true) {
            self.isModalloading = true;

            cc.loader.loadRes('public/modal', function (err, prefab) {
                if (err) {
                    cc.error('loadRes - modal 失败', err.message || err);
                    return;
                }
                if (prefab instanceof cc.Prefab) {
                    var modalNode = cc.instantiate(prefab);
                    modalNode.parent = cc.director.getScene();

                    self.modalNode = modalNode;
                    self.isModalloading = false;

                    self.modalloadCb();
                }
            });
        }
    }
};

ccModal.prototype.close = function (isInit) {
    if (this.modalNode) {
        this.modalNode.active = false;
    }
};

ccModal.prototype.loading = function (msg, options) {
    window.AudioCtrl.playWindowopen();
    this._modal.apply(this, [msg, null, null, options]);
};

ccModal.prototype.tip = function (msg, cb, seconds, options) {
    window.AudioCtrl.playWindowopen();
    this._modal.apply(this, [msg, cb, seconds || 2, options]);
};

var ccUtil = {
    setSpriteFrame: function setSpriteFrame(targetNode, spriteAltas, spriteName) {
        var sprComp = targetNode.getComponent(cc.Sprite);
        if (sprComp == null) {
            sprComp = targetNode.addComponent(cc.Sprite);
        }
        sprComp.spriteFrame = spriteAltas.getSpriteFrame(spriteName);
    },
    setLabelString: function setLabelString(targetNode, childName, text) {
        if (childName) {
            var arr = childName.split('/').forEach(function (item) {
                targetNode != null && (targetNode = targetNode.getChildByName(item));
            });
        }
        if (targetNode) {
            targetNode.getComponent(cc.Label).string = text == null ? '' : text;
        }
    },
    labelTimeout: function labelTimeout(targetNode, childName, seconds, cb) {
        if (childName) {
            var arr = childName.split('/').forEach(function (item) {
                targetNode = targetNode.getChildByName(item);
            });
        }

        var labelCom = targetNode.getComponent(cc.Label);
        if (!labelCom) {
            labelCom = targetNode.addComponent(cc.Label);
            labelCom.string = '';
        }

        labelCom.unscheduleAllCallbacks();

        var sched = labelCom.scheduleOnce(function () {
            labelCom.unscheduleAllCallbacks();
            //targetNode.removeComponent(labelCom);
            cb && cb();
        }, seconds || 1);
    },
    labelInterval: function labelInterval(targetNode, childName, seconds, cb) {
        if (childName) {
            var arr = childName.split('/').forEach(function (item) {
                targetNode = targetNode.getChildByName(item);
            });
        }

        var labelCom = targetNode.getComponent(cc.Label);
        if (!labelCom) {
            labelCom = targetNode.addComponent(cc.Label);
            labelCom.string = '';
        }

        labelCom.unscheduleAllCallbacks();

        cb && cb(seconds);

        var sched = labelCom.schedule(function () {
            if (--seconds <= 0) {
                labelCom.unscheduleAllCallbacks();
                //targetNode.removeComponent(labelCom);
            }
            cb && cb(seconds);
        }, 1);
    },
    modalLoading: function modalLoading(msg, options) {
        new ccModal().loading(msg, options);
    },
    modalTip: function modalTip(msg, cb, seconds, options) {
        new ccModal().tip(msg, cb, seconds, options);
    },
    closeModal: function closeModal() {
        new ccModal().close();
    }
};

window.ccUtil = ccUtil;

(function () {
    var self = void 0;

    var audioCtrl = function audioCtrl() {
        self = this;
    };

    audioCtrl.prototype.playSelect = function (data) {
        this.playResAudio('public/audio/select.mp3');
    };

    audioCtrl.prototype.playWindowopen = function (data) {
        this.playResAudio('public/audio/window_open.mp3');
    };

    audioCtrl.prototype.playBGM = function (data) {
        var audioUrl = cc.url.raw('resources/' + data);
        this.playNodeAudioBGM(audioUrl);
    };

    audioCtrl.prototype.playResAudio = function (data) {
        if (GD.setting.isEffectMute !== true) {
            var audioUrl = cc.url.raw('resources/' + data);
            cc.audioEngine.play(audioUrl, false, GD.setting.effectVolume);
        }
    };

    audioCtrl.prototype.playNodeAudio = function (audioUrl) {
        if (GD.setting.isEffectMute !== true) {
            cc.audioEngine.play(audioUrl, false, GD.setting.effectVolume);
        }
    };

    audioCtrl.prototype.playNodeAudioBGM = function (audioUrl) {
        self._bgmSource = audioUrl; //保存当前背景音乐
        if (audioUrl) {
            self._musicAudioId = cc.audioEngine.play(audioUrl, true, GD.setting.musicVolume);
            if (GD.setting.isMusicMute == true) {
                //静音
                cc.audioEngine.pause(self._musicAudioId);
            }
        }
    };

    audioCtrl.prototype.stopBGM = function () {
        if (self._musicAudioId >= 0) {
            cc.audioEngine.stop(self._musicAudioId);
            self._musicAudioId = null;
        }
    };

    audioCtrl.prototype.setMusicVolume = function (volume) {
        if (volume < 0) {
            volume = 0;
        } else if (volume > 1) {
            volume = 1;
        }

        GD.setting.musicVolume = volume;
        if (this._musicAudioId >= 0) {
            cc.audioEngine.setVolume(this._musicAudioId, GD.setting.musicVolume);
        }

        STORE.set('musicVolume', volume);
    };

    audioCtrl.prototype.setEffectVolume = function (volume) {
        if (volume < 0) {
            volume = 0;
        } else if (volume > 1) {
            volume = 1;
        }

        GD.setting.effectVolume = volume;
        STORE.set('effectVolume', volume);
    };

    audioCtrl.prototype.muteMusic = function (status) {
        GD.setting.isMusicMute = !!status;

        if (this._musicAudioId >= 0) {
            if (GD.setting.isMusicMute !== true) {
                //考虑重新播放背景音乐
                cc.audioEngine.resume(this._musicAudioId);
                cc.audioEngine.setVolume(this._musicAudioId, GD.setting.musicVolume);
            } else {
                //暂停当前背景音乐
                cc.audioEngine.pause(this._musicAudioId);
            }
        } else {
            this.playNodeAudioBGM(self._bgmSource);
        }

        STORE.set('isMusicMute', GD.setting.isMusicMute);
    };

    audioCtrl.prototype.muteEffect = function (status) {
        GD.setting.isEffectMute = !!status;
        STORE.set('isEffectMute', GD.setting.isEffectMute);
    };

    //恢复声音
    audioCtrl.prototype.resumeAudio = function (status) {
        var context = cc.sys.__audioSupport.context;
        if (context.state === 'suspended') {
            context.resume();
        }
    };

    window.AudioCtrl = new audioCtrl();
})();

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
            cc.log('请求结果：', response);
        };

        // Simple events
        ['loadstart', 'abort', 'error', 'load', 'loadend', 'timeout'].forEach(function (eventname) {
            xhr["on" + eventname] = function () {
                //cc.log("Event : " + eventname, arguments);
            };
        });

        // Special event
        xhr.onreadystatechange = function () {
            //cc.log('onreadystatechange', xhr.readyState, xhr.status);
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
                cc.log('请求成功：', data);
            } else {
                cc.log('请求失败：', data);
            }
        });
    },
    test_post: function test_post() {
        this.get('/api/hello/getHello2');
    }
};

window.apiRequestPlugin = apiRequestPlugin;
window.API = new apiRequestPlugin();

if (cc.Button.prototype.touchEndedClone == null) {
    cc.Button.prototype.touchEndedClone = cc.Button.prototype._onTouchEnded;
    cc.Button.prototype._soundOn = true;
    cc.Button.prototype.setSoundEffect = function (on) {
        this._soundOn = on;
    };
    cc.Button.prototype._onTouchEnded = function (event, isSrc) {
        if (isSrc !== true) {
            if (this.interactable && this.enabledInHierarchy && this._pressed && this._soundOn == true) {
                window.AudioCtrl.playSelect();
            }

            this.touchEndedClone(event, true);
        }
    };
}
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

        var ioIsConnected = true; //1：可用，0不可用
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
            cc.log('socket.io-data', data);

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
            cc.log('connect', self.reConnectFrom, ioIsConnected, _typeof(self.reconnectCb));
            if (self.reConnectFrom == 'local') {
                //由业务处理
                self.reConnectFrom == null;
            } else {
                if (ioIsConnected == false) {
                    ioIsConnected = true;

                    if (self.reconnectCb) {
                        self.reconnectCb(true);
                    }
                }
            }
        });

        socketIo.on('reconnect_attempt', function () {
            cc.log('reconnect_attempt', self.reConnectFrom, ioIsConnected);
            if (self.reConnectFrom == 'local') {
                //由业务处理

            } else {
                if (ioIsConnected == true) {
                    ioIsConnected = false;

                    ccUtil.modalLoading('socket服务连接断开');
                }
            }
        });

        socketIo.on('reconnect', function () {
            cc.log('reconnect');
        });
        socketIo.on('reconnecting', function () {
            cc.log('reconnecting', _arguments);
        });
        socketIo.on('reconnect_error', function () {
            cc.log('reconnect_error');
        });
        socketIo.on('reconnect_failed', function () {
            cc.log('reconnect_failed');
        });
        socketIo.on('ping', function () {
            cc.log('ping', new Date());
        });
        socketIo.on('pong', function () {
            cc.log('pong', new Date());
        });

        this.socketIo = socketIo;
    },
    onReconnectCb: function onReconnectCb(reconnectCb) {
        this.reconnectCb = reconnectCb;
    },
    joinRoom: function joinRoom(params, cb) {
        var eventCb = cb || function (data) {
            cc.log('join_room_done', data);
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
    reConnect: function reConnect() {
        this.reConnectFrom = 'local';
        this.socketIo.disconnect();
        this.socketIo.connect();
    },
    destroy: function destroy() {
        window._SocketIO_INSTANCE = window.ZR_IO = null;
        this.socketIo.destroy();
    },
    test_on: function test_on() {
        this.on('emit-test', function (data) {
            cc.log(data);
        });
    }
};

window.socketIoPlugin = socketIoPlugin;
window.initSocketIo = function (roomParams, socketCb) {
    new socketIoPlugin(roomParams, socketCb);
};

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=build_main.js.map
        