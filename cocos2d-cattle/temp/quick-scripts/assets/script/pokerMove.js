(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/pokerMove.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '47111dPaKdF1pXV3NMxdyWY', 'pokerMove', __filename);
// script/pokerMove.js

"use strict";

var cattleGlobal = require("cattleGlobal");

cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad: function onLoad() {
        if (cattleGlobal.pokerPosiX != null) {
            if (cattleGlobal.needscale == 1) {
                var moveTo = cc.spawn(cc.moveTo(0.5, cc.p(cattleGlobal.pokerPosiX, cattleGlobal.pokerPosiY)), cc.scaleTo(0.5, 1.2, 1.2));
                this.node.runAction(moveTo);
            } else {
                var moveTo = cc.moveTo(0.5, cc.p(cattleGlobal.pokerPosiX, cattleGlobal.pokerPosiY));
                this.node.runAction(moveTo);
            }
        }
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
        //# sourceMappingURL=pokerMove.js.map
        