
var _wslog_level = global.wslog_level || 'debug';
var _wslog = { level: _wslog_level };

_wslog.debug = function (msg, msg2) {
	if (_wslog.level == 'debug') {
		console.log(_getNowFormatDate(), '[DEBUG]', msg, msg2 || '');
	}
};

_wslog.info = function (msg, msg2) {
	console.log(_getNowFormatDate(), '[INFO]', msg, msg2 || '');
};

_wslog.warn = function (msg, msg2) {
	console.log(_getNowFormatDate(), '[WARN]', msg, msg2 || '');
};

_wslog.error = function (msg, msg2) {
	console.log(_getNowFormatDate(), '[ERROR]', msg, msg2 || '');
};

function _getNowFormatDate() {
	var date = new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if (month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = year + seperator1 + month + seperator1 + strDate
		+ " " + date.getHours() + seperator2 + date.getMinutes()
		+ seperator2 + date.getSeconds();
	return currentdate;
}

module.exports = _wslog;