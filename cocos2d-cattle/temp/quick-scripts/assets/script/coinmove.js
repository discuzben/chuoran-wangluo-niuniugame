(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/coinmove.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'db8b44v4KpIfYAuITaYzU3a', 'coinmove', __filename);
// script/coinmove.js

"use strict";

var cattleGlobal = require("cattleGlobal");

cc.Class({
    extends: cc.Component,

    properties: {},

    // LIFE-CYCLE CALLBACKS:

    onLoad: function onLoad() {
        if (cattleGlobal.cointoposiX != null) {
            var moveTo = cc.sequence(cc.moveTo(0.5, cc.p(cattleGlobal.cointoposiX, cattleGlobal.cointoposiY)), cc.hide());
            this.node.runAction(moveTo);
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
        //# sourceMappingURL=coinmove.js.map
        