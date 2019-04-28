
function redisUtils(redisClient){
	this.redisClient = redisClient;
	global.redisUtils = this; 
}
redisUtils.prototype = {
	zrSet(key, val, cb){
		this._set(key, val, cb, 'cr_');
	},
	zrGet(key, cb){
		this._get(key, cb, 'cr_');
	},
	zrDel(key){
		this._del(key, 'cr_');
	},
	_get(key, cb, prefix){
		key = (prefix || '') + key;
		this.redisClient.get(key, (err, data)=>{
			if(!err){
				let rdata = new RegExp(/^[{|\[]/).test(data)==true? JSON.parse(data) : data;
				cb && cb(true, rdata);
			}else{
				cb && cb(false);
				
				_wslog.error('redis-读取失败 - ' + key, err);
				
				//退出进程
				process.exit();
			}
		});
	},
	_set(key, val, cb, prefix){
		key = (prefix || '') + key;
		val = JSON.stringify(val || {});
		this.redisClient.set(key, val, function(err) {
			if(err){
				_wslog.error('redis-保存失败 - ' + key, err);
				cb && cb(false);
			}else{
				cb && cb(true);
			}
		});	
	},
	_del(key, prefix){
		key = (prefix || '') + key;
		this.redisClient.del(key, (err, data)=>{
			if(err){
				_wslog.error('redis - 删除失败 - ' + key, err);
			}
		});
	}
};

module.exports = redisUtils;