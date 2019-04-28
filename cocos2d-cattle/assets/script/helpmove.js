cc.Class({
    extends: cc.Component,

    properties: {
        // block: {
        //     default: null,
        //     type: cc.Node
        // }
    },

    // LIFE-CYCLE CALLBACKS:
    clickbgmove(event, sign) {
        console.log(sign);        
    },
    onLoad () {
        let currentPosi = [{x:this.node.x,y:this.node.y}];
    },

    start () {

    },

    // update (dt) {},
});
