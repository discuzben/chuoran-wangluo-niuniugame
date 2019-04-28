var cattleGlobal = require("cattleGlobal");

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad () {
        if (cattleGlobal.pokerPositonX != null) {
            var moveTo = cc.moveTo(0.5,cc.p(cattleGlobal.pokerPositonX,cattleGlobal.pokerPositonY));
            this.node.runAction(moveTo);
        }
    },

    start () {

    },

    // update (dt) {},
});
