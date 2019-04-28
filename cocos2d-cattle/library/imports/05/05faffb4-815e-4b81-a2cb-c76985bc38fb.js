"use strict";
cc._RF.push(module, '05faf+0gV5LgaLLx2mFvDj7', 'EventStop');
// resources/script/EventStop.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad: function onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, function (e) {
            e.stopPropagation();
        });
        this.node.on(cc.Node.EventType.MOUSE_ENTER, function (e) {
            e.stopPropagation();
        });
        this.node.on(cc.Node.EventType.MOUSE_DOWN, function (e) {
            e.stopPropagation();
        });
    }

});

cc._RF.pop();