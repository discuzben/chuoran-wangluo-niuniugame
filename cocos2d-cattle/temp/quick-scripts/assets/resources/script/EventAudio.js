(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/resources/script/EventAudio.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '1e4be0Hj/FHG40VipGgc1z7', 'EventAudio', __filename);
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
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=EventAudio.js.map
        