var cattleGlobal = require("cattleGlobal");

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var xx = cattleGlobal.gtoposiX+cc.randomMinus1To1()*60;
        var yy = cattleGlobal.gtoposiY+cc.randomMinus1To1()*60;
        if (cattleGlobal.gtoposiX != null) {
                var moveTo = cc.sequence(cc.spawn(
                    cc.moveTo(0.3,cc.p(xx,yy)),
                    cc.repeatForever(
                        cc.sequence(
                            cc.scaleTo(0.1,1.4,1.4),
                            cc.scaleTo(0.1,1,1)
                        )
                    )
                ),cc.hide());
                this.node.runAction(moveTo);
        }
    },

    start () {

    },

    // update (dt) {},
});
