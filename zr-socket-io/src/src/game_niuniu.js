socketEmit = require('./socket_utils').socketEmit;
timerUtils = require('./timer_utils');
apiUtils = require('./api_utils');
apiJSONUtils = require('./api_json_utils');

global.___niuniuService = null;

const BANKER_ODDS = [{ 0: '不抢', 2: '2倍', 3: '3倍', 4: '4倍' }];
const PLAYER_ODDS = [
    { 1: '1倍', 2: '2倍', 3: '3倍', 4: '4倍' },
    { 5: '5倍', 6: '6倍', 7: '7倍', 8: '8倍' },
    { 9: '9倍', 10: '10倍', 11: '11倍', 12: '12倍' },
    { 13: '13倍', 14: '14倍', 15: '15倍', 16: '16倍' },
    { 17: '17倍', 18: '18倍', 19: '19倍', 20: '20倍' }
];
const TIMEOUT = 10;
const BANKER_TIMEOUT = 12;


var self;

var niuniuService = function(parentService) {
    if (global.___niuniuService == null) { //单例模式
        global.___niuniuService = this;
    }
    global.___niuniuService.parentService = parentService;
    return global.___niuniuService;
}

/**
 * 玩家都已就绪，执行开始游戏
 * @param {*} params
 */
niuniuService.prototype.beginGame = function(socket, params) {
    console.log("begin game"+params);
    self = this;
    var roomKey = params.roomKey;
    //cbEventName = params.cbEventName;
    let roomDetail = global.roomsDetail[roomKey];
    roomDetail.step = 0; //0 停止, 1 抢庄, 2 闲家定倍, 3 发牌
    socketEmit(socket, roomKey, 'game_begin', roomDetail, true);

    roomDetail.bankerChoose = {};
    roomDetail.playerChoose = {};
    roomDetail.banker = {};
    roomDetail.banker.playerId = 0;
    roomDetail.banker.odds = 0;
    roomDetail.banker.experience = 0;
    roomDetail.banker.token = null;
    roomDetail.roomKey = roomKey;

    //缓冲5秒开始抢庄（防止先后进入）
    timerUtils.timeout("banker_roll_" + roomKey, 3, () => {
        // self.player_roll(roomKey);
        self.banker_roll(socket, roomKey);
    });

}

/**
 *
 * @param emitName
 * @param params (hallId,roomId)
 */
niuniuService.prototype.dealOperate = function(socket, emitName, params) {
    let roomDetail = global.roomsDetail[params.__gameRoomKey];

    if (emitName == "banker_choose") {
        if (roomDetail.step == 1) {
            console.log("收到抢庄信息");
            console.log(params);

            timerUtils.timeout("one_choosebanker" + params.__gameRoomKey, 0, () => {
                self.one_choosebanker(socket,params.__gameRoomKey);
            });
            niuniuService.prototype.one_choosebanker = function(socket,roomKey) {
                    let param = {};
                    param.playerId = params.playerId;
                    param.roomKey = roomKey;
                    param.odds = params.odds;
                    console.log(param);
                    socketEmit(socket, roomKey, 'one_choosebanker', param, true);
                }
                // }
            }
            //playerId,odds字段存在 并且playerId在房间组内
            if (params.playerId && params.odds && roomDetail.playerIds.indexOf(params.playerId) != -1) {

                //把账户金额放进去
                params.experience = roomDetail.playersInfo[params.playerId].experience;
                params.token = roomDetail.playersInfo[params.playerId].playerToken;
                roomDetail.bankerChoose[params.playerId] = params;

                if (Object.keys(roomDetail.bankerChoose).length >= roomDetail.playerIds.length) {
                    console.log("Next step");
                    self.player_roll(params.__gameRoomKey);
                }
            }

        }
     else if (emitName == "player_choose") {
        if (roomDetail.step == 2) {
            console.log("收到闲家选择倍数信息");
            console.log(params);
            timerUtils.timeout("one_chooseplayer" + params.__gameRoomKey, 0, () => {
                self.one_chooseplayer(socket,params.__gameRoomKey);
            });
            niuniuService.prototype.one_chooseplayer = function(socket,roomKey) {
                    let param = {};
                    param.playerId = params.playerId;
                    param.roomKey = roomKey;
                    param.odds = params.odds;
                    console.log(param);
                    socketEmit(socket, roomKey, 'one_chooseplayer', param, true);
                }

            //playerId,odds字段存在 并且playerId在房间组内
            if (params.playerId && params.odds && roomDetail.playerIds.indexOf(params.playerId) != -1) {

                if (params.playerId == roomDetail.banker.playerId) {
                    return; //庄家不能提交
                }

                //把账户金额放进去
                params.experience = roomDetail.playersInfo[params.playerId].experience;
                params.token = roomDetail.playersInfo[params.playerId].playerToken;
                roomDetail.playerChoose[params.playerId] = params;

                if (Object.keys(roomDetail.playerChoose).length >= roomDetail.playerIds.length - 1) {
                    console.log("Next step");
                    self.deal(socket, params.__gameRoomKey);
                }
            }
        }
    } else if (emitName == "choose_yn") {
        // if (roomsDetail.step == 3) {
        //playerId字段存在
        console.log("收到玩家点击有牛");
        timerUtils.timeout("choose_yn" + params.roomKey, 0, () => {
            self.choose_yn(params.roomKey);
        });
        niuniuService.prototype.choose_yn = function(roomKey) {
            if (params.playerId) {
                let param = {};
                param.playerId = params.playerId;
                param.roomKey = roomKey;
                console.log(param);
                socketEmit(socket, roomKey, 'choose_yn', param, true);
            }
            // }
        }
    } else if (emitName == "choose_mn") {
        // if (roomsDetail.step == 3) {
        //playerId字段存在
        console.log("收到玩家点击没牛");
        timerUtils.timeout("choose_mn" + params.roomKey, 0, () => {
            self.choose_mn(params.roomKey);
        });
        niuniuService.prototype.choose_mn = function(roomKey) {
            if (params.playerId) {
                let param = {};
                param.playerId = params.playerId;
                param.roomKey = roomKey;
                console.log(param);

                socketEmit(socket, roomKey, 'choose_mn', param, true);
            }
        }
        // }
    }


}

/**
 * step 1
 * 抢庄
 */
niuniuService.prototype.banker_roll = function(socket, roomKey) {

    let param = {}
    let roomDetail = global.roomsDetail[roomKey];

    roomDetail.step = 1;
    param.roomInfo = roomDetail.roomInfo;
    param.playersInfo = roomDetail.playersInfo;
    param.choose = BANKER_ODDS;
    param.timeout = 4;
    param.roomKey = roomKey;
    // let arr = Object.keys(param.playersInfo);
    console.log("抢庄");
    socketEmit(socket, roomKey, 'banker_roll', param, true);
    timerUtils.timeout("player_roll_" + roomKey, param.timeout * Object.keys(param.playersInfo).length, () => {
        self.player_roll(socket, roomKey);
    });

}

/**
 * step 2
 * 闲家定倍
 */
niuniuService.prototype.player_roll = function(socket, roomKey) {

    let roomDetail = global.roomsDetail[roomKey];

    if(roomDetail == null){
        console.warn('TODO：roomDetail会为null');
        return;
    }
    if (roomDetail.step > 1) { //不是从step 1 正常流程过来的（防止定时器重复调用）
        return;
    }

    roomDetail.step = 2;

    //如果有没人选庄家倍数，默认让他都选1倍
    if (Object.keys(roomDetail.bankerChoose).length < roomDetail.playerIds.length) {
        for (var i = 0; i < roomDetail.playerIds.length; i++) {
            if (!roomDetail.bankerChoose[roomDetail.playerIds[i]]) {
                roomDetail.bankerChoose[roomDetail.playerIds[i]] = {
                    playerId: roomDetail.playerIds[i],
                    odds: 0,
                    experience: roomDetail.playersInfo[roomDetail.playerIds[i]].experience,
                    token: roomDetail.playersInfo[roomDetail.playerIds[i]].playerToken
                };
            }
        }
    }

    //找最有钱的
    for (var key in roomDetail.bankerChoose) {
        if (roomDetail.banker.playerId == 0) {
            roomDetail.banker.playerId = roomDetail.bankerChoose[key].playerId;
            roomDetail.banker.experience = roomDetail.bankerChoose[key].experience;
            roomDetail.banker.odds = roomDetail.bankerChoose[key].odds;
            roomDetail.banker.token = roomDetail.bankerChoose[key].token;
        } else if (roomDetail.bankerChoose[key].experience > roomDetail.banker.experience) {
            roomDetail.banker.playerId = roomDetail.bankerChoose[key].playerId;
            roomDetail.banker.experience = roomDetail.bankerChoose[key].experience;
            roomDetail.banker.odds = roomDetail.bankerChoose[key].odds;
            roomDetail.banker.token = roomDetail.bankerChoose[key].token;
        }
    }

    //找更大倍的覆盖最有钱的（所以同倍的情况，有钱的上庄）
    for (var key in roomDetail.bankerChoose) {

        if (roomDetail.bankerChoose[key].odds > roomDetail.banker.odds) {
            roomDetail.banker.playerId = roomDetail.bankerChoose[key].playerId;
            roomDetail.banker.odds = roomDetail.bankerChoose[key].odds;
            roomDetail.banker.odds = roomDetail.bankerChoose[key].odds;
            roomDetail.banker.token = roomDetail.bankerChoose[key].token;
        }
    }

    //防止0倍的出现
    if (roomDetail.banker.odds < 1) {
        roomDetail.banker.odds = 1;
    }

    var param = {};
    param.banker = roomDetail.banker;
    param.choose = PLAYER_ODDS;
    param.timeout = TIMEOUT;
    param.bankerChoose = roomDetail.bankerChoose;
    param.roomKey = roomKey;

    // for (var key in roomDetail) {
    //     console.log("闲家定倍");

    // }
    socketEmit(socket, roomKey, 'player_roll', param, true);
    timerUtils.timeout("deal_" + roomKey, TIMEOUT, () => {
        self.deal(socket, roomKey);
    });
}

/**
 * step 3
 * 发牌
 */

niuniuService.prototype.deal = function(socket, roomKey) {

    let roomDetail = global.roomsDetail[roomKey];
    let tokens = [];
    if(roomDetail == null){
        console.log(roomKey);
    }

    if (roomDetail.step > 2) { //不是从step 2 正常流程过来的（防止定时器重复调用）
        return;
    }


    roomDetail.step = 3;

    //如果有人不选，就帮忙默认为1倍
    for (var i = 0; i < roomDetail.playerIds.length; i++) {
        this.parentService._roomEndDeal(roomDetail.playerIds[i].playerId, roomKey);

        tokens.push(roomDetail.playersInfo[roomDetail.playerIds[i]].playerToken);
        if (Object.keys(roomDetail.playerChoose).length < roomDetail.playerIds.length - 1) {
            if (roomDetail.playerIds[i] != roomDetail.banker.playerId) {
                if (!roomDetail.playerChoose[roomDetail.playerIds[i]]) {
                    roomDetail.playerChoose[roomDetail.playerIds[i]] = {
                        playerId: roomDetail.playerIds[i],
                        odds: 1,
                        experience: roomDetail.playersInfo[roomDetail.playerIds[i]].experience,
                        token: roomDetail.playersInfo[roomDetail.playerIds[i]].playerToken
                    }
                }
            }
        }
    }

    var requestBody = {};
    requestBody.roomId = roomDetail.roomInfo.roomId;
    requestBody.tokens = tokens;

    apiJSONUtils('/api/game/round/deal', 'POST', requestBody, function(state, data) {

        let poke = data.pokes;
        let bankerPokesId = poke[roomDetail.banker.token].pokeId;
        let playerChoose = roomDetail.playerChoose;
        roomDetail.banker.amount = 0;

        for (var key in poke) {

            let pId = -1;

            for (var tempId in roomDetail.playerChoose) {
                if (roomDetail.playerChoose[tempId].token == key) {
                    pId = tempId;
                    break;
                }
            }

            if (pId == -1) {
                continue;
            }

            let bet = roomDetail.banker.odds * playerChoose[pId].odds * poke[key].odds;
            let validBet = roomDetail.banker.odds * playerChoose[pId].odds * poke[key].odds;

            //实际投注不能高于账户余额，防止以小博大
            if (playerChoose[pId].experience < bet) {
                validBet = playerChoose[pId].experience;
            }

            let amount = validBet;

            //这个用户输
            if (poke[key].pokeId < bankerPokesId) {
                roomDetail.banker.amount += amount;
                amount = amount * -1;
            } else {
                roomDetail.banker.amount -= amount;
            }

            playerChoose[pId].amount = amount;
            playerChoose[pId].validBet = validBet;
            playerChoose[pId].tax = 0;

        }

        // playerChoose[pid].tax = 0;

        //庄家钱不够的时候（把庄家现有的钱，按实际投注额平均分）
        if (roomDetail.banker.amount < 0 && roomDetail.banker.experience + roomDetail.banker.amount < 0) {
            let share = 0;
            for (var pid in playerChoose) {
                if (playerChoose[pid].amount > 0) {
                    share += playerChoose[pid].validBet;
                }
            }

            for (var pid in playerChoose) {
                if (playerChoose[pid].amount > 0) {
                    playerChoose[pid].amount = roomDetail.banker.experience / share * playerChoose[pid].validBet;
                    playerChoose[pid].validBet = playerChoose[pid].amount;
                }
            }

            roomDetail.banker.amount = roomDetail.banker.experience * -1;
            roomDetail.banker.validBet = roomDetail.banker.experience;
        }

        //庄家扣水
        if (roomDetail.banker.amount > 0) {
            roomDetail.banker.tax = roomDetail.banker.amount * roomDetail.roomInfo.hall.tax;
            roomDetail.banker.amount = roomDetail.banker.amount - roomDetail.banker.tax;
        }

        //闲家扣水
        for (var pid in playerChoose) {
            if (playerChoose[pid].amount > 0) {
                playerChoose[pid].tax = playerChoose[pid].amount * roomDetail.roomInfo.hall.tax;
                playerChoose[pid].amount = playerChoose[pid].amount - playerChoose[pid].tax;
            }
        }

        var param = {};
        param.pokes = data.pokes;
        param.plasyer = playerChoose;
        param.banker = roomDetail.banker;
        param.timeout = TIMEOUT;
        param.roomKey = roomKey;
        pokesinfo = data.pokes;
        bankerinfo = roomDetail.banker;
        plasyerinfo = playerChoose;
        socketEmit(socket, roomKey, 'deal', param, true);
        timerUtils.timeout("record" + roomKey, TIMEOUT + 3 +roomDetail.playerIds.length, () => {
            self.record(socket, roomKey);
        });
    });

    console.log("发牌");

}
let pokesinfo;
let bankerinfo;
let plasyerinfo;
niuniuService.prototype._gameDealToApi = function(recordKey, cb){
	apiUtils('/api/game/round/record','POST', {recordKey:recordKey},(status,data)=>{
		cb && cb(status,data);
	});
}
niuniuService.prototype.record = function(socket, roomKey) {
    let roomDetail = global.roomsDetail[roomKey];

    let roomInfo = roomDetail.roomInfo;
    console.log(roomInfo);
    // let requestBody = {};
    let _recordKey = "record_" + roomInfo.roomId;
    let _recodeData = {
    	"players": [],
		"roomId": roomInfo.roomId
    }
    // for(i = 0;i<roomDetail.playerIds.length;i++){

    // }
    let userinfo = [];
    // userinfo.push(bankerinfo);
    // userinfo.push(plasyerinfo);
    // console.log(userinfo);
    let bankerisWin = true;
    let bankertax = 0;
    let curbottom = roomInfo.hall.bottom;
    if(bankerinfo.amount > 0){
        bankerisWin = true;
        bankertax = bankerinfo.tax;
    }else{
        bankerisWin = false;
    }
        userinfo.push({"playerId":bankerinfo.playerId,"experience":(bankerinfo.experience + bankerinfo.amount*curbottom)});
        console.log("sss"+bankerinfo.experience,bankerinfo.amount*curbottom);
        _recodeData["players"].push({"token":bankerinfo.token,"playerId":bankerinfo.playerId,"pokeId":pokesinfo[bankerinfo.token].pokeId,
        "win":bankerinfo.amount,"isWinner":bankerisWin,"bet":bankerinfo.odds,"vaildBet":bankerinfo.odds,"tax":bankertax});
        let playerIdss = roomDetail.playerIds;
        let index = playerIdss.indexOf(bankerinfo.playerId);
        playerIdss.splice(index,1);
        for(i = 0;i<playerIdss.length;i++){
            let psyisWin = true;
            let psytax = 0;
            if(plasyerinfo[playerIdss[i]].amount > 0){
                psyisWin = true;
                psytax = plasyerinfo[playerIdss[i]].tax;
            }else{
                psyisWin = false;
            }
            userinfo.push({"playerId":playerIdss[i],"experience":(plasyerinfo[playerIdss[i]].experience + plasyerinfo[playerIdss[i]].amount)*curbottom});
            _recodeData["players"].push({"token":plasyerinfo[playerIdss[i]].token,"playerId":playerIdss[i],
            "bet":plasyerinfo[playerIdss[i]].odds,"pokeId":pokesinfo[plasyerinfo[playerIdss[i]].token].pokeId,"isWinner":psyisWin,
            "tax":psytax,"win":plasyerinfo[playerIdss[i]].amount,"vaildBet":plasyerinfo[playerIdss[i]].validBet});
        }
        console.log(userinfo,plasyerinfo[playerIdss[0]].experience);
        // for(var key  in userinfo){
        //     this.parentService.updatePlayerCoinsById(userinfo[key].playerId, userinfo[key].amount);
        // }
        // console.log(_recodeData);
        this.parentService.redisUtils._set(_recordKey, _recodeData, (status)=>{
            if(status){
                this._gameDealToApi(_recordKey, (status,data)=>{
                    console.log(data);
                    let isSuccess = false;
                    if(status){
                        //移除房间数据
                        // delete global.roomsDetail[roomKey];
    
                        isSuccess = true;
                    }
                    socketEmit(socket, roomKey, 'game_over', {userinfo: userinfo}, isSuccess);
                },'');
            }else{
                socketEmit(socket, roomKey, 'game_over', {userinfo: userinfo}, false);
                
                // socketEmit(socket, roomKey, 'game_over', {winSeatNum: winSeatNum, players: _recodeData.players}, false);
            }
        });
}

module.exports = niuniuService;