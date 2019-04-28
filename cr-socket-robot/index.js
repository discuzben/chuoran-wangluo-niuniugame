
//全局参数
global.config = require('./config');

//初始化全局游戏数据
global.playersInfo = {'@':''}; //玩家信息，从redis更新

//game_id对应gameType，跟数据库对应
global.gameTypes = {30: 1, 50: 2, 70: 3, 170: 4};

require('./src/server')();