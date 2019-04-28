(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/api/config.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '517208fb8pEIqlPCTMr0neV', 'config', __filename);
// api/config.js

'use strict';

/**
*  配置
*/
window.configData = {
    isDebug: true,
    apiServerUrl: 'http://api.qisq.top',
    socketServer: { url: 'http://socket.qisq.top' }
};

if (CC_DEBUG) {
    window.configData.socketServer.url = 'http://localhost:3003';
}

module.exports = null;

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
        //# sourceMappingURL=config.js.map
        