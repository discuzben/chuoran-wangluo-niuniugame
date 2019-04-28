/**
*  本地存储工具类
*/
window.__localStoreUtil__INSTANCE__ = null;

let localStoreUtil = function () {
    if (window.__localStoreUtil__INSTANCE__ == null) {
        this.storeKey = 'CR_';
        this.init();
        window.__localStoreUtil__INSTANCE__ = this;
    }
    return window.__localStoreUtil__INSTANCE__;
};
localStoreUtil.prototype = {
    init() {
        this.localStorage = cc.sys.localStorage;
    },
    set(key, value) {
        if (value && typeof value == 'object') {
            try {
                value = JSON.stringify(value);
            } catch (error) {
                return false;
            }
        }
        this.localStorage.setItem(this.storeKey + key, value);
        return true;
    },
    get(key) {
        //获取失败，返回===undefined，处理
        let value = this.localStorage.getItem(this.storeKey + key);
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