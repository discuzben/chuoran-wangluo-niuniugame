"use strict";
cc._RF.push(module, '1e4be0Hj/FHG40VipGgc1z7', 'EventAudio');
// resources/script/EventAudio.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad: function onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, function (e) {
            window.AudioCtrl.resumeAudio();
        });
        this.node.on(cc.Node.EventType.MOUSE_ENTER, function (e) {
            window.AudioCtrl.resumeAudio();
        });
        this.node.on(cc.Node.EventType.MOUSE_DOWN, function (e) {
            window.AudioCtrl.resumeAudio();
        });
    }

});

cc._RF.pop();