var cattleGlobal = require("cattleGlobal");

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad () {
        if (cattleGlobal.pokerPosiX != null) {
            if (cattleGlobal.needscale == 1) {
                var moveTo = cc.spawn(cc.moveTo(0.5,cc.p(cattleGlobal.pokerPosiX,cattleGlobal.pokerPosiY)),cc.scaleTo(0.5,1.2,1.2));
                this.node.runAction(moveTo);
            }else{
                var moveTo = cc.moveTo(0.5,cc.p(cattleGlobal.pokerPosiX,cattleGlobal.pokerPosiY));
                this.node.runAction(moveTo);
            }
        }
    },

    start () {

    },

    // update (dt) {},
});
