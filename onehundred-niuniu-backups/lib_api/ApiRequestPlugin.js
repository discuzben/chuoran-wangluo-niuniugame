/**
*  请求API组件
*/
window.__apiRequestPlugin__INSTANCE = null;


let apiRequestPlugin = function () {
    if (window.__apiRequestPlugin__INSTANCE == null) {
        window.__apiRequestPlugin__INSTANCE = this;
    }
    return window.__apiRequestPlugin__INSTANCE;
};
apiRequestPlugin.prototype = {
    // post请求
    // 格式化post 传递的数据
    _postDataFormat(obj,method) {
        if (!obj || typeof obj != "object") {
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

    _requestData(method, url, params, isSync, responseHandler) {
        //请求数据
        //设置token参数
        params ? params.token = GD.token : params = { token: GD.token };

        let requestData = this._postDataFormat(params);
        if(method.toUpperCase() == 'GET'){
            url += (url.indexOf('?')!=-1 ? '&' : '?') + requestData;
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

        if(method.toUpperCase() == 'GET'){
            xhr.send();
        }else{
            xhr.send(requestData);
        }
    },

    _streamXHREventsToLabel(xhr, responseHandler) {
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
                    let result;
                    try {
                        result = JSON.parse(xhr.responseText);
                    } catch (error) {
                    }
                    if(result.status == 200){
                        handler(true, result.result);
                    }else{
                        handler(false, result.result);
                    }
                } else {
                    handler(false, "statusCode=" + xhr.status);
                }
            }
        };
    },

    _dealPath(path) {
        if (path.indexOf('http://') == -1 && path.indexOf('https://') == -1) {
            path = window.configData.apiServerUrl + path;
        }
        return path;
    },

    get(path, params, isSync, cb) {
        let url = this._dealPath(path);
        this._requestData('GET', url, params, isSync, cb);
    },

    put(path, params, isSync, cb) {
        let url = this._dealPath(path);
        this._requestData('PUT', url, params, isSync, cb);
    },

    post(path, params, isSync, cb) {
        let url = this._dealPath(path);
        this._requestData('POST', url, params, isSync, cb);
    },

    test_get() {
        this.get('/api/hello/getHello', null, (status, data) => {
            if (status == true) {
                console.log('请求成功：', data);
            } else {
                console.log('请求失败：', data);
            }
        });
    },
    test_post() {
        this.get('/api/hello/getHello2');
    }
};

window.apiRequestPlugin = apiRequestPlugin;
window.API = new apiRequestPlugin();