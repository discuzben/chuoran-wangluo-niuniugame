
var http = require('http');
// var iconv = require('iconv-lite');
//var BufferHelper = require('bufferhelper');
var querystring = require('querystring');
var _wslog = require('./wslog_utils');

function getApiData(path, method, params, cb) {
    var self = this;

	const postData = JSON.stringify(params);

	const options = {
        hostname: global.config.apiServerHostname,
        port: global.config.apiServerPort,
        path: path,
        method: method,
        body: postData,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
	};

	const req = http.request(options, (res) => {
		_wslog.debug(`状态码: ${res.statusCode}`);
		_wslog.debug(`响应头: ${JSON.stringify(res.headers)}`);

		var bufferHelper = [];

		res.setEncoding('utf8');
		res.on('data', (chunk) => {
			bufferHelper.push(chunk);

			_wslog.debug(`响应主体: ${chunk}`);
		});
		res.on('end', () => {
			//_wslog.debug('响应中已无数据。');

			let result = bufferHelper.join('');
			
			if(result && new RegExp(/^[{|\]]/).test(result)){
				result = JSON.parse(result);
			}

			if(result.status == 200){
				cb && cb(true, result.result);
			}else{
				cb && cb(false, result);
			}
		});
	});

	req.on('error', (e) => {
		cb && cb(false);
		_wslog.error(`请求遇到问题: ${e.message}`);
	});

	// 写入数据到请求主体
	_wslog.debug('请求API参数：', postData);
	req.write(postData);
	req.end();
}

module.exports = getApiData;