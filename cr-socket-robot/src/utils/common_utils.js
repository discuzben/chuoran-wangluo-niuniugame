
module.exports = {
	roundNum(num,pos){
		pos = pos || 2; //默认2位小数
		let sc = Math.pow(10,pos); //放大倍数
		return Math.round(num * sc) / sc;
	},
	floorNum(num,pos){
		pos = pos || 2; //默认2位小数
		let sc = Math.pow(10,pos); //放大倍数
		return Math.floor(num * sc) / sc;
	},
	ceilNum(num,pos){
		pos = pos || 2; //默认2位小数
		let sc = Math.pow(10,pos); //放大倍数
		return Math.ceil(num * sc) / sc;
	},
	fixedNum(num,pos){
		return numm.toFixed(pos || 2);
	}
}