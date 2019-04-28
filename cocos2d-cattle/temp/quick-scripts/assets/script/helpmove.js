(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/helpmove.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '1fe06Taa5VBqbiU5xEbui3l', 'helpmove', __filename);
// script/helpmove.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        // block: {
        //     default: null,
        //     type: cc.Node
        // }
    },

    // LIFE-CYCLE CALLBACKS:
    clickbgmove: function clickbgmove(event, sign) {
        console.log(sign);
    },
    onLoad: function onLoad() {
        var currentPosi = [{ x: this.node.x, y: this.node.y }];
    },
    start: function start() {}
}

// update (dt) {},
);

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
        //# sourceMappingURL=helpmove.js.map
        