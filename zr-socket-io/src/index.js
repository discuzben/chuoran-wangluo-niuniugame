
//全局参数
global.config = require('./config');


//初始化全局游戏数据
global.playersInfo = {'@':''}; //玩家信息，从redis更新
global.roomsData = {'@':''};
global.roomsDetail = {'@':''};
global.hallsData = {'@':''};
global.roomsClients = {'@':''};
global.playerIdSocketObj = {'@':''}; //玩家id对应socketId
global.tokenSocketObj = {'@':''}; //玩家token对应socketId
global.socketsInfo = {'@':''};  //当前socket关联信息
global.playersRoomKey = {'@':''};  //玩家房间信息

global.robotHeadImgArr = [];  //机器人头像列表
global.robotNameList = {};  //机器人名称列表，key为agent_id

//game_id对应gameType，跟数据库对应
global.gameTypes = {
    30: {type: 1, maxPersons: 5, minPersons: 2},    //炸金花
    50: {type: 2, maxPersons: 4, minPersons: 2},    //抢庄牛牛
    70: {type: 3, maxPersons: 7, minPersons: 3},    //德州扑克
    170: {type: 4, maxPersons: 3, minPersons: 3},   //斗地主
    171: {type: 4, maxPersons: 3, minPersons: 3}    //斗地主
};

//主机器人socket列表
global.robotSockets = {};

//日志级别
global.wslog_level = 'debug';

require('./src/server')();