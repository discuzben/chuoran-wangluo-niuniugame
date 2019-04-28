"use strict";
cc._RF.push(module, '517208fb8pEIqlPCTMr0neV', 'config');
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