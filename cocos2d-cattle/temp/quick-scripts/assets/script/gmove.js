(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/gmove.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '7da0fEHM2RJWoQLxcmcd+uN', 'gmove', __filename);
// script/gmove.js

"use strict";

var cattleGlobal = require("cattleGlobal");

cc.Class({
    extends: cc.Component,

    properties: {},

    // LIFE-CYCLE CALLBACKS:

    onLoad: function onLoad() {
        var xx = cattleGlobal.gtoposiX + cc.randomMinus1To1() * 60;
        var yy = cattleGlobal.gtoposiY + cc.randomMinus1To1() * 60;
        if (cattleGlobal.gtoposiX != null) {
            var moveTo = cc.sequence(cc.spawn(cc.moveTo(0.3, cc.p(xx, yy)), cc.repeatForever(cc.sequence(cc.scaleTo(0.1, 1.4, 1.4), cc.scaleTo(0.1, 1, 1)))), cc.hide());
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
        //# sourceMappingURL=gmove.js.map
        