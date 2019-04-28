/**
*  配置
*/
window.configData = {
    isDebug: true,
    apiServerUrl: 'http://api.qisq.top',
    socketServer: {url: 'http://socket.qisq.top'}
}

if(CC_DEBUG){
    window.configData.socketServer.url = 'http://localhost:3003';
}