
let _wslog = require('./wslog_utils');

/*
* 定义socket发送操作
* 默认给组成员发，包括当前socket
*/
function socketEmit(socket, roomName, cbEventName, data, isSuccess, hasMe){
	if(!cbEventName){
		_wslog.warn('socketEmit - cbEventName未定义');
		return;
	}
	if(data == null){
		data = {};
	}
	if(typeof data == 'object'){
		data.__success = (isSuccess==null || isSuccess==true)?true:false;
	}

	let targetSK;
	if(roomName != null){ //发给房间
		if(hasMe !== false){ //有我
			targetSK = global.io.in(roomName);
		}else{ //没有我
			targetSK = socket.to(roomName);
		}
	}else{ //发给自己
		targetSK = socket;
	}

	targetSK.emit('socket.io-data', {eventName: cbEventName, data: data});
}

function socketError(socket, msg, type){
	socket.emit('socket.io-data', {eventName: 'io-error', data: {type: type, msg: msg, __success: true}});
}

function socketTip(socket, msg, type){
	socket.emit('socket.io-data', {eventName: 'io-tip', data: {type: type, msg: msg, __success: true}});
}

module.exports = {socketEmit: socketEmit, socketError: socketError, socketTip: socketTip};