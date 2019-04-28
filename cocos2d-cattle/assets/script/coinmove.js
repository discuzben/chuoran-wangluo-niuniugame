var cattleGlobal = require("cattleGlobal");

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if (cattleGlobal.cointoposiX != null) {
                var moveTo = cc.sequence(cc.moveTo(0.5,cc.p(cattleGlobal.cointoposiX,cattleGlobal.cointoposiY)),cc.hide());
                this.node.runAction(moveTo);
        }
    },

    start () {

    },

    // update (dt) {},
});
