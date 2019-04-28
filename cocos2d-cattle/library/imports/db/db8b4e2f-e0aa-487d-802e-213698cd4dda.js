"use strict";
cc._RF.push(module, 'db8b44v4KpIfYAuITaYzU3a', 'coinmove');
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