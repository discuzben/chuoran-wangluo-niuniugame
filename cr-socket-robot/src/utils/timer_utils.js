
let later = require('later');
let _wslog = require('./wslog_utils');

var schedSecond = later.parse.recur().every().second();

let laterTimer = function(){
	this.scheds = {}; //存放所有调度
};

laterTimer.prototype = {
	execNext(timerName){
		if(this.scheds[timerName]){
			this.scheds[timerName].next();
		}
	},
	clearTimer(timerName){
		this.scheds[timerName] && this.scheds[timerName].clear();
	},
	timeout(timerName, seconds, cb){
		let self = this;

		_wslog.debug('timeout-start-'+timerName+'：'+ new Date().getTime());

		this.scheds[timerName] = {
			type: 'timeout',
			func: cb,
			timer: setTimeout(()=>{
				if(self.scheds[timerName]){
					self.scheds[timerName].clear();

					_wslog.debug('timeout-doing-'+timerName+'：'+ new Date().getTime());
					cb && cb();
				}
			}, seconds*1000),
			next(){
				if(self.scheds[timerName]){
					self.scheds[timerName].clear();

					_wslog.debug('timeout-next-'+timerName+'：'+ new Date().getTime());
					cb && cb();
				}
			},
			clear(){
				if(self.scheds[timerName]){
					clearTimeout(self.scheds[timerName].timer);
					delete self.scheds[timerName];
					_wslog.debug('timeout-clear-'+timerName+'：'+ new Date().getTime());
				}
			}
		};
	},
	interval(timerName, seconds, cb){
		let self = this;

		_wslog.debug('interval-start-'+timerName+'：'+ new Date().getTime());

		this.scheds[timerName] = {
			type: 'interval',
			timer: setInterval(()=>{
				_wslog.debug('interval-doing-'+timerName+'：'+ new Date().getTime());	
				cb && cb();
			}, seconds*1000),
			clear(){
				if(self.scheds[timerName]){
					clearInterval(self.scheds[timerName]);
					delete self.scheds[timerName];
					_wslog.debug('interval-clear-'+timerName+'：'+ new Date().getTime());					
				}
			}
		};
	},
	crond(){
		this.scheds[roomName] = later.setInterval(function () {
			roomData = roomsData[roomName];
		}, schedSecond);
	},
	test(seconds){
		console.log('later - start',new Date().getTime());
		var sched = later.parse.recur().every(seconds).second(),
		t = later.setInterval(()=>{
			console.log('later - end',new Date().getTime());
		}, sched);
	},

};


//--遍历房间
// function roomSched(roomName, schedType) {	//schedType指定不同的调度
// 	//房间业务
// 	var roomData = roomsData[roomName];
// 	if (roomData.type == 1) { //炸金花
// 		scheds[roomName] = later.setInterval(function () {
// 			roomData = roomsData[roomName];

// 		}, schedSecond);
// 	} else if (roomData.type == 2) {

// 	}
// }
//数据业务 - E


//##
// later.setInterval(function () {
// 	io.of('/').adapter.allRooms((err,rooms)=>{
// 		if (rooms.length < 10) {
// 			_wslog.debug(`房间数 - ${rooms.length}`, rooms);
// 		} else {
// 			_wslog.debug(`房间数 - ${rooms.length}`);
// 		}
// 	});
	
// 	io.in('room123').emit('socket.io-data', { eventName: 'emit-test', data: { id: Math.random() } });
// }, later.parse.recur().every().second());

module.exports = new laterTimer();