var cattleGlobal = require("cattleGlobal");

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if (cattleGlobal.ismove == true) {
            var randX = cattleGlobal.clickindexX +cc.randomMinus1To1()*60;
            var randY = cattleGlobal.clickindexY + cc.randomMinus1To1()*50+15;
            var moveTo = cc.moveTo(0.3,cc.p(randX,randY));
            this.node.runAction(moveTo);
            cattleGlobal.ismove = false;
        }else{

        }
    },
    start () {

    },

    // update (dt) {},
});
