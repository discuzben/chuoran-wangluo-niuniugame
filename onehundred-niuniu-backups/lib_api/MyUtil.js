/**
*  自定义工具方法
*/
let myUtil = {
    checkIsLogin() {
        if (STORE.get('USER') === undefined) {
            return false;
        }
        return true;
    },

    compareUp(data, propertyName) {
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

    compareDown(data, propertyName) {
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

    uuid(len, radix) { //生成uuid
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = [], i;
        radix = radix || chars.length;
        
        if (len) {
            // Compact form
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
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
                    r = 0 | Math.random()*16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }
        
        return uuid.join('');
    },

    //获取url参数
    getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var reg_rewrite = new RegExp("(^|/)" + name + "/([^/]*)(/|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        var q = window.location.pathname.substr(1).match(reg_rewrite);
        if(r != null){
            return unescape(r[2]);
        }else if(q != null){
            return unescape(q[2]);
        }else{
            return null;
        }
    }

};

window.MyUtil = myUtil;
