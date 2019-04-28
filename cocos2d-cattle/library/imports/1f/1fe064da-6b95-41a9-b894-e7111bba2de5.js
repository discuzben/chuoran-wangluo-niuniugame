"use strict";
cc._RF.push(module, '1fe06Taa5VBqbiU5xEbui3l', 'helpmove');
// script/helpmove.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        // block: {
        //     default: null,
        //     type: cc.Node
        // }
    },

    // LIFE-CYCLE CALLBACKS:
    clickbgmove: function clickbgmove(event, sign) {
        console.log(sign);
    },
    onLoad: function onLoad() {
        var currentPosi = [{ x: this.node.x, y: this.node.y }];
    },
    start: function start() {}
}

// update (dt) {},
);

cc._RF.pop();