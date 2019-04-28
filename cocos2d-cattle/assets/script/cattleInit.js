// 引入全局变量文件
let cattleGlobal = require("cattleGlobal");

function getRandom(min, max) {
    var range = max - min;
    var numb = min + Math.round(Math.random() * range);
    return numb;
};

let odds = null;
// 扑克牌数字相对于扑克牌的坐标
let pokernumposi = [{ x: -42, y: 62 }];
//庄家倍数和玩家下注显示坐标
let userchooseposi = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
//扑克牌的坐标
let pokerposi = [
    { x: 515, y: -379 }, { x: 689, y: -379 }, { x: 863, y: -379 }, { x: 1037, y: -379 }, { x: 1211, y: -379 },
    { x: 0, y: 215 }, { x: 60, y: 215 }, { x: 120, y: 215 }, { x: 180, y: 215 }, { x: 240, y: 215 },
    { x: 796, y: 473 }, { x: 854, y: 473 }, { x: 912, y: 473 }, { x: 970, y: 473 }, { x: 1028, y: 473 },
    { x: 1490, y: 215 }, { x: 1549, y: 215 }, { x: 1607, y: 215 }, { x: 1665, y: 215 }, { x: 1722, y: 215 },
];
let sortpokerposi = [{ x: 664, y: -379 }, { x: 744, y: -379 }, { x: 824, y: -379 }, { x: 982, y: -379 }, { x: 1062, y: -379 },
    { x: 0, y: 215 }, { x: 80, y: 215 }, { x: 160, y: 215 }, { x: 292, y: 215 }, { x: 372, y: 215 },
    { x: 796, y: 473 }, { x: 876, y: 473 }, { x: 956, y: 473 }, { x: 1082, y: 473 }, { x: 1162, y: 473 },
    { x: 1350, y: 215 }, { x: 1430, y: 215 }, { x: 1510, y: 215 }, { x: 1642, y: 215 }, { x: 1722, y: 215 }
];
let mnsortpoker = [{ x: 703, y: -379 }, { x: 783, y: -379 }, { x: 863, y: -379 }, { x: 943, y: -379 }, { x: 1023, y: -379 },
    { x: 0, y: 215 }, { x: 80, y: 215 }, { x: 160, y: 215 }, { x: 240, y: 215 }, { x: 320, y: 215 },
    { x: 796, y: 473 }, { x: 876, y: 473 }, { x: 956, y: 473 }, { x: 1036, y: 473 }, { x: 1116, y: 473 },
    { x: 1402, y: 215 }, { x: 1482, y: 215 }, { x: 1562, y: 215 }, { x: 1642, y: 215 }, { x: 1722, y: 215 }
];
// 用于保存金币生成的位置
let coinposi = [{ x: -783, y: -361 }, { x: -771, y: 184 }, { x: -175, y: 373 }, { x: 773, y: 181 }];
//用于保存闹钟生成的位置
let clockposi = [{ x: 0, y: 0 }, { x: -426, y: 56 }, { x: -230, y: 268 }, { x: 411, y: 56 }];
//用于保存玩家信息
let playerIds = [];
//用于保存除庄家以外玩家的信息
let exceptbanker = [];
//用于保存玩家的token信息
let usertoken = [];
// 当前已创建扑克牌的数量
let pokerfacecount = 0;

let updatedata = null;
let updatePokerFacecount = 0;
//玩家选牌的数量
let pokerfaceclickcount = 0;
// 玩家选牌的类型
let clickpokertype = [];
// 用于控制倒计时
let allcount = 0;
//控制按钮显示隐藏
let istrue = false;
//设置金币的次数
let coinindex = 0;
//设置庄家在数据的位置
// var bankerindex = 0;
let alreadychoosepl = [];

let currentnum = null;

let poker = [];

let clock = 0;

let playersInfos = [];

let ispc_deal = false;

let bankerisclick = false;
// 当前玩家的金币数
let curplexperience = 0;

let step = null;

cc.Class({
    extends: cc.Component,

    properties: {
        userinfo: {
            default: [],
            type: cc.Node
        },
        roomKey: {
            default: null,
            type: cc.Node
        },
        chipinbtn: {
            default: null,
            type: cc.Node
        },
        snatchvillagebtn: {
            default: null,
            type: cc.Node
        },
        yxks: {
            default: null,
            type: cc.Node
        },
        ddk: {
            default: null,
            type: cc.Node
        },
        jsq01: {
            default: null,
            type: cc.Node
        },
        dxk: {
            default: null,
            type: cc.Node
        },
        countDown: {
            default: [],
            type: cc.Prefab
        },
        bankerOdds: {
            default: [],
            type: cc.Prefab
        },
        playerOdds: {
            default: [],
            type: cc.Prefab
        },
        pokerback: {
            default: null,
            type: cc.Prefab
        },
        pokers: {
            default: null,
            type: cc.Node
        },
        pokerchoose: { //扑克选择总节点
            default: null,
            type: cc.Node
        },
        jxyx: { //继续游戏按钮
            default: null,
            type: cc.Node
        },
        wc: { //完成提示
            default: null,
            type: cc.Node
        },
        jsk: { //用户选择的牌
            default: null,
            type: cc.Node
        },
        bull: { //显示牛几节点
            default: null,
            type: cc.Node
        },
        pokerface: { //扑克正面
            default: [],
            type: cc.Prefab
        },
        pokernumhei: { //扑克黑色数字
            default: [],
            type: cc.Prefab
        },
        pokernumhon: { //扑克红色数字
            default: [],
            type: cc.Prefab
        },
        bulltype: { //显示牛几
            default: [],
            type: cc.Prefab
        },
        winnum: { //显示输赢的数字
            default: [],
            type: cc.Prefab
        },
        failnum: { //显示输赢的数字
            default: [],
            type: cc.Prefab
        },
        ts: { //通杀
            default: null,
            type: cc.Node
        },
        tp: { //通赔
            default: null,
            type: cc.Node
        },
        audiosource: {
            default: null,
            type: cc.Node
        },
        coin: {
            default: null,
            type: cc.Prefab
        },
        coinani: {
            default: null,
            type: cc.Node
        },
        waitchipin: {
            default: null,
            type: cc.Node
        },
        mask: {
            default: [],
            type: cc.Node
        },
        g: {
            default: null,
            type: cc.Prefab
        },
        gani: {
            default: null,
            type: cc.Node
        },
        ymnpokerbacks: {
            default: null,
            type: cc.Prefab
        }
    },
    playAudio(name, isMan) {
        if (isMan == null) {

        } else {
            if (isMan === true) {
                name += '_man';
            } else {
                name += '_wom';
            }
        }
        // cc.audioEngine.play(this.audiosource.getComponent('audio_source')[name],false,1);
        window.AudioCtrl.playNodeAudio(this.audiosource.getComponent('audio_source')[name]);
    },


    defaultscene() {
        // 设置抢庄按钮默认隐藏
        this.snatchvillagebtn.active = false;
        //设置选择倍数按钮默认隐藏
        this.chipinbtn.active = false;
        //设置游戏开始节点默认隐藏
        this.yxks.active = false;
        // 设置选牌提示框默认隐藏
        this.dxk.active = false;
        // 设置等待抢庄提示框默认隐藏
        this.ddk.active = false;
        // 设置倒计时闹钟默认隐藏
        this.jsq01.active = false;
        //设置菊花圈默认隐藏
        // this.zr01.active = false;
        // 设置继续游戏按钮默认隐藏
        this.jxyx.active = false;
        this.jxyx.children[0].active = false;
        //设置选牌面板默认隐藏
        this.jsk.active = false;
        this.ts.active = false;
        this.tp.active = false;
        this.waitchipin.active = false;
        this.jsk.getChildByName('ynbk').active = false;
        this.jsk.getChildByName('mnbk').active = false;

        // 设置完成状态默认隐藏
        for (var i = 0; i < this.wc.children.length; i++) {
            this.wc.children[i].active = false;
        }
        //设置庄家专属头像默认隐藏
        for (var i = 0; i < this.userinfo.length; i++) {
            this.userinfo[i].getChildByName('ZJTX-01').active = false;
        }
        playerIds = [];
        //用于保存除庄家以外玩家的信息
        exceptbanker = [];
        //用于保存玩家的token信息
        usertoken = [];
        // 当前已创建扑克牌的数量
        pokerfacecount = 0;

        updatedata = null;
        updatePokerFacecount = 0;
        //玩家选牌的数量
        pokerfaceclickcount = 0;
        // 玩家选牌的类型
        clickpokertype = [];
        // 用于控制倒计时
        allcount = 0;
        //设置金币的次数
        coinindex = 0;
        //设置庄家在数据的位置
        // var bankerindex = 0;
        alreadychoosepl = [];

        currentnum = null;

        poker = [];

        clock = 0;
        //保存抢庄闹钟顺序
        playersInfos = [];

        ispc_deal = false;

        bankerisclick = false;

        curplexperience = 0;

        step = null;
    },
    //创建倒计时数字资源
    spawncountdown(count) {

        // if (this.jsq01.children.length != 0) {
        //        this.jsq01.children[0].destroy();
        //    }
        // var newnum = cc.instantiate(this.countDown[count]);
        //    this.jsq01.addChild(newnum);
        this.jsq01.getChildByName('number').getComponent(cc.Label).string = count;
    },
    //创建庄家倍数资源
    spawnbankerOdds(bankerindex, odds) {
        if (this.userinfo[bankerindex].getChildByName("chipinodd").children[0] != null) {
            this.userinfo[bankerindex].getChildByName("chipinodd").children[0].destroy();
        }
        let baodds;
        if (odds == 1 || odds == 0) {
            baodds = 0;
        } else if (odds == 2) {
            baodds = 1;
        } else if (odds == 3) {
            baodds = 2;
        } else if (odds == 4) {
            baodds = 3;
        }
        // console.log(baodds);
        var newbankerOdds = cc.instantiate(this.bankerOdds[baodds]);
        // newbankerOdds.anchorX = 0;
        // newbankerOdds.anchorY = 1;
        this.userinfo[bankerindex].getChildByName("chipinodd").addChild(newbankerOdds);
        if (bankerindex == 3 && (baodds == 1 || baodds == 0)) {
            this.userinfo[bankerindex].getChildByName("chipinodd").x = -185;
        }
    },
    //创建除庄家外其余玩家下注倍数资源
    spawnplayerOdds(indexof, odds) {
        if (this.userinfo[indexof].getChildByName("chipinodd").children[0] != null) {
            this.userinfo[indexof].getChildByName("chipinodd").children[0].destroy();
        }
        // console.log(indexof);
        if (indexof == 3 && odds >= 10) {
            var newplayerOdds = cc.instantiate(this.playerOdds[odds - 1]);
            newplayerOdds.setPosition(userchooseposi[indexof].x, userchooseposi[indexof].y);
            this.userinfo[indexof].getChildByName("chipinodd").addChild(newplayerOdds);
            this.userinfo[indexof].getChildByName("chipinodd").x = -230;
        } else if (indexof == 3 && odds < 10) {
            var newplayerOdds = cc.instantiate(this.playerOdds[odds - 1]);
            newplayerOdds.setPosition(userchooseposi[indexof].x, userchooseposi[indexof].y);
            this.userinfo[indexof].getChildByName("chipinodd").addChild(newplayerOdds);
            this.userinfo[indexof].getChildByName("chipinodd").x = -217;
        } else {
            var newplayerOdds = cc.instantiate(this.playerOdds[odds - 1]);
            newplayerOdds.setPosition(userchooseposi[indexof].x, userchooseposi[indexof].y);
            this.userinfo[indexof].getChildByName("chipinodd").addChild(newplayerOdds);
        }
    },
    // 创建扑克背面资源
    spawnpokerback() {
        var newpoker = cc.instantiate(this.pokerback);
        newpoker.setPosition(1451, 655);
        this.pokers.addChild(newpoker);
    },
    ymnpokerback(px, py) {
        var newpoker = cc.instantiate(this.ymnpokerbacks);
        newpoker.setPosition(px, py);
        newpoker.setScale(1.2, 1.2);
        this.pokers.addChild(newpoker);
    },
    // 创建扑克牌正面资源
    spawnpokerface(color, num, pX, pY, pfc, roomKey) {
        //spade pokerface[1],club pokerface[3],heart pokerface[2],diamond pokerface[0]
        var flowertypeindex = null;
        var pokernum = null;
        // 区分牌的花色和数字颜色
        if (color == 'spade') {
            flowertypeindex = 1;
            pokernum = this.pokernumhei;
        } else if (color == 'club') {
            flowertypeindex = 3;
            pokernum = this.pokernumhei;
        } else if (color == 'heart') {
            flowertypeindex = 2;
            pokernum = this.pokernumhon;
        } else if (color == 'diamond') {
            flowertypeindex = 0;
            pokernum = this.pokernumhon;
        } else {
            flowertypeindex = 1;
            pokernum = this.pokernumhei;
            console.log('扑克牌面数据错误');
        }
        var newpoker = cc.instantiate(this.pokerface[flowertypeindex]);
        //将前五张牌区分出来设置大小和绑定选牌事件
        if (pfc >= 0 && pfc <= 4) {
            newpoker.scaleX = 1.2;
            newpoker.scaleY = 1.2;
        } else {
            newpoker.scaleX = 1;
            newpoker.scaleY = 1;
        }
        var pokernumt = cc.instantiate(pokernum[num - 1]);
        pokernumt.setPosition(pokernumposi[0].x, pokernumposi[0].y);
        newpoker.addChild(pokernumt);
        newpoker.setPosition(pX, pY);
        newpoker.index = pfc;

        // 选牌三次后,取消选牌的绑定事件

        this.pokers.addChild(newpoker);
    },
    clickpokertype(type) {
        if (type == 'J') {
            clickpokertype.push(10);
        } else if (type == 'Q') {
            clickpokertype.push(10);
        } else if (type == 'K') {
            clickpokertype.push(10);
        } else {
            clickpokertype.push(type);
        }
    },
    //创建牛几资源
    spawnbulltype(posiindex, typeindex) {
        var newbulltype = cc.instantiate(this.bulltype[typeindex]);
        this.bull.children[posiindex].addChild(newbulltype);
        // var bullaction = cc.scaleTo(0.3,1,1);
        // this.bull.children[posiindex].runAction(bullaction);
    },
    //创建输赢数字
    spawnwinfailnum(firstsymbol, symbol, plindex, j) {
        var symbolindex = null;
        switch (symbol) {
            case "+":
                symbolindex = 10;
                break;
            case "-":
                symbolindex = 10;
                break;
            case ".":
                symbolindex = 11;
                break;
            case "0":
                symbolindex = 0;
                break;
            case "1":
                symbolindex = 1;
                break;
            case "2":
                symbolindex = 2;
                break;
            case "3":
                symbolindex = 3;
                break;
            case "4":
                symbolindex = 4;
                break;
            case "5":
                symbolindex = 5;
                break;
            case "6":
                symbolindex = 6;
                break;
            case "7":
                symbolindex = 7;
                break;
            case "8":
                symbolindex = 8;
                break;
            case "9":
                symbolindex = 9;
                break;
            default:
                symbolindex = 0;
        }
        if (firstsymbol == '+') {
            var newnumsym = cc.instantiate(this.winnum[symbolindex]);
            this.userinfo[plindex].getChildByName('amount').children[j].addChild(newnumsym);
        } else {
            var newnumsym = cc.instantiate(this.failnum[symbolindex]);
            this.userinfo[plindex].getChildByName('amount').children[j].addChild(newnumsym);
        }
    },
    spawng() {
        var newg = cc.instantiate(this.g);
        this.gani.addChild(newg);
    },
    // 发牌动画
    dealpoker() {
        var count = 0;
        var needscale = null;
        this.schedule(function() {
            // 这里的 this 指向 component
            cattleGlobal.pokerPosiX = pokerposi[count].x;
            cattleGlobal.pokerPosiY = pokerposi[count].y;
            if (count >= 0 && count <= 4) {
                cattleGlobal.needscale = 1;
            } else {
                cattleGlobal.needscale = null;
            }
            this.spawnpokerback();
            cc.audioEngine.play(this.audiosource.getComponent('audio').dealcard, false, 1);
            count++;
        }, 0.05, playerIds.length * 5 - 1, 0);
    },
    spawncoin(x, y) {
        var newcoin = cc.instantiate(this.coin);
        newcoin.setPosition(x, y);
        this.coinani.addChild(newcoin);
    },

    //设置抢庄，下注，选牌的倒计时
    updateTime: function() {
        allcount--;
        this.jsq01.active = true;
        let currentclock;
        // if (typeof playersInfos[clock] == 'string') {
        //     currentclock =eval('(' + playersInfos[clock] + ')');
        // }else{
        //     currentclock = playersInfos[clock];
        // }
        currentclock = (typeof playersInfos[clock] == 'string') ? eval('(' + playersInfos[clock] + ')') : playersInfos[clock];

        var clockindex = playerIds.indexOf(currentclock);
        // console.log(clockindex,clockindex == 0 && ispc_deal == false && bankerisclick == false);
        if (clockindex == 0 && ispc_deal == false && bankerisclick == false) {
            this.snatchvillagebtn.active = true;
        } else {
            this.snatchvillagebtn.active = false;
        }
        if (ispc_deal == true) {
            clockindex = 0;
        }
        this.jsq01.position = cc.v2(clockposi[clockindex].x, clockposi[clockindex].y);
        // 这里的 this 指向 component
        // this.jsq01.position = cc.v2(,);
        cc.audioEngine.play(this.audiosource.getComponent('audio').lampRun, false, 1);

        this.spawncountdown(allcount);
        //防止不出现1秒，延迟0.1秒再清除定时器
        if (allcount <= 1) {
            this.schedule(function() {
                this.unschedule(this.updateTime);
                this.jsq01.active = false;
                this.jsk.active = false;
                cc.audioEngine.play(this.audiosource.getComponent('audio').lampEnd, false, 1);
                if (step == 1) {
                    this.snatchvillagebtn.active = false;
                }else if(step == 2){
                    this.chipinbtn.active = false;
                }
            }, 0.1, 1, 0);
        }
    },
    //根据已选牌推送显示牌面
    updatePokerFace: function(pId, data) {
        updatePokerFacecount = 0;
        // console.log(data);
        alreadychoosepl.push(pId);
        var drawindex = playerIds.indexOf(pId);
        // console.log(drawindex);
        var updatePokerFacecount = (drawindex * 5);
        //清理牌背面

        // 创建已翻牌玩家牌正面
        //判断获取到的数据类型是否是string
        if (typeof usertoken[drawindex] !== 'string') {
            var ut = usertoken[drawindex].toString();
            data.pokes[ut].pokes.forEach((item, index) => {
                if (typeof item === 'string') {

                    var pf = eval('(' + item + ')');
                    this.spawnpokerface(pf.color, pf.num, pokerposi[updatePokerFacecount].x, pokerposi[updatePokerFacecount].y, 7);
                } else {
                    this.spawnpokerface(item.color, item.num, pokerposi[updatePokerFacecount].x, pokerposi[updatePokerFacecount].y, 7);
                }
                updatePokerFacecount++;
            });
        } else {
            data.pokes[usertoken[drawindex]].pokes.forEach((item, index) => {
                if (typeof item === 'string') {

                    var pf = eval('(' + item + ')');
                    this.spawnpokerface(pf.color, pf.num, pokerposi[updatePokerFacecount].x, pokerposi[updatePokerFacecount].y, 7);
                } else {
                    this.spawnpokerface(item.color, item.num, pokerposi[updatePokerFacecount].x, pokerposi[updatePokerFacecount].y, 7);
                }
                updatePokerFacecount++;
            });
        }
        this.wc.children[drawindex].active = true;
        // }
        // }, data.timeout);
    },
    updateLocalCoins(localSn, ownCoins) {
        // if(localSn == 3){
        GD.player.experience = ownCoins;
        // }
    },
    gameOverDeal(data) {
        let self = this;
        self.jxyx.active = true;

        //加钱扣钱操作
        data.players.forEach((item) => {
            let localSn = self._seatNumMatch(item.seatNum);
            let userNode = self.childNodes['user' + localSn];
            let moneyNode = userNode.getChildByName('moneyNode');

            self.genMoneyNumberNode(moneyNode, item.win, item.isWinner);

            self._updateLocalCoins(localSn, item.ownCoins);
        });

        self.data.gameStatus = 2;
    },
    //定义EventHandler
    myHandler(name) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = cc.find('Canvas/script');
        eventHandler.component = "cattleInit";
        eventHandler.handler = "handlerFunc";
        eventHandler.customEventData = name;
        return eventHandler;
    },
    back() { //返回
        if (GD.gameStatus != 0 && this.data.playStatus == 1) {
            ccUtil.modalTip('您当前正在游戏', null, 1);
            return;
        }

        //全局变量
        GD.gameRoomKey = null;

        cc.director.loadScene(CD.gameTypes[2].roomListScene);
    },
    //对应myHandler的处理方法
    handlerFunc(event, name) {
        if (name == 'back_hall') {
            this.back();
        } else if (name == 'go_on_match') {
            cc.director.loadScene(cc.director.getScene().getName());
        }
    },
    bankertime(timeout) {
        allcount = timeout;
        this.schedule(this.updateTime, 1, allcount, 0);
    },
    //匹配房间
    matchingRoom() {
        // console.log('匹配中...');
        let cb = function() { //提示后执行的函数，可为null
            cc.log('modal - tip');
        }
        ccUtil.modalLoading('正在为您匹配牌桌\n游戏即将开始,请耐心等待');
        // ccUtil.modalLoading('匹配中...');
        ZR_IO.emit('matching_room', {});
    },
    onGameEvent() {
        let self = this;

        //在另一个地方进行房间匹配->停止匹配->提供返回操作
        ZR_IO.on('match_other', (data, status) => {
            ccUtil.modalLoading(data.msg, {
                buttons: [{ name: 'back', handler: self.myHandler('back_hall') }]
            });
        });
        //匹配时间到了，没匹配成功->停止匹配->提供返回、继续匹配操作
        ZR_IO.on('match_end', (data, status) => {
            ccUtil.modalLoading(data.msg, {
                buttons: [{ name: 'back', handler: self.myHandler('back_hall') }, { name: 'go_on_match', handler: self.myHandler('go_on_match') }]
            });
        });
        //在其他房间玩，且为结束->停止匹配->提供返回、继续匹配操作
        ZR_IO.on('game_unfinish', (data, status) => {
            ccUtil.modalLoading(data.msg, {
                buttons: [{ name: 'back', handler: self.myHandler('back_hall') }]
            });
        });

        //通知谁可以进入房间->通知服务端进入
        ZR_IO.on('game_ready', (data, status) => { //房间匹配成功的事件
            if (status) {
                if (data.playerIds && data.playerIds.indexOf(GD.playerId) != -1) {
                    ZR_IO.emit('entering_room', { roomKey: data.roomKey });
                    ccUtil.closeModal();
                    ccUtil.modalLoading('匹配成功，并入房间');
                    playerIds = data.playerIds;
                }
            }
        });
        ZR_IO.on('choose_yn', (data, status) => {
            // console.log(data);
            if (playerIds.indexOf(data.playerId) == 0) {
                //自己选牌自己的牌就不做操作
            } else {
                // console.log(data.playerId);
                let drawindex = playerIds.indexOf(data.playerId);
                this.wc.children[drawindex].active = true;
                // this.scheduleOnce(function() {
                //     this.updatePokerFace(data.playerId, updatedata);
                // }, getRandom(0, 1));
            }
        });
        ZR_IO.on('choose_mn', (data, status) => {
            // console.log(data);
            if (playerIds.indexOf(data.playerId) == 0) {
                //自己选牌自己的牌就不做操作
            } else {
                let drawindex = playerIds.indexOf(data.playerId);
                this.wc.children[drawindex].active = true;
                // this.updatePokerFace(data.playerId, updatedata);
            }
        });
        ZR_IO.on('game_begin', (data, status) => { //游戏开始前获取用户的信息
            if (status) {
                ccUtil.closeModal();
                GD.gameRoomKey = data.roomKey;

                //将当前用户id替换到数组第一位
                var currentplayer = GD.playerId;
                var curplayerindex = playerIds.indexOf(currentplayer);
                var temp = playerIds[curplayerindex];
                playerIds[curplayerindex] = playerIds[0];
                playerIds[0] = temp;

                this.roomKey.getComponent("cc.Label").string = data.roomInfo.roomId;
                for (var i = 0; i < playerIds.length; i++) {
                    // 设置玩家在房间中显示的信息
                    this.userinfo[i].getChildByName('uid').getComponent("cc.Label").string = data.playersInfo[playerIds[i]].username;
                    var account = data.playersInfo[playerIds[i]].experience.toFixed(1);
                    var a = parseFloat(account);
                    this.userinfo[i].getChildByName('account').getComponent("cc.Label").string = a;

                    //设置玩家头像
                    let headimgurl = data.playersInfo[playerIds[i]].headimg;
                    let headNode = this.mask[i].getChildByName('userhead');

                    if (headimgurl) {
                        cc.loader.load(headimgurl, (err, item) => {
                            if (item instanceof cc.Texture2D) {
                                try {
                                    // sf.setRect(0,0,129,129);
                                    headNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(item, cc.Rect(0, 0, 129, 129));
                                    headNode.width = 129;
                                    headNode.height = 129;
                                } catch (e) {
                                    cc.log('error', e);
                                }
                            }
                        });
                    } else {
                        //随机头像
                    }
                }
                // 保存用户的token信息
                for (var i = 0; i < playerIds.length; i++) {
                    usertoken.push(data.playersInfo[playerIds[i]].playerToken);
                }
                ZR_IO.emit('game_begin', {});
                this.yxks.active = true;
                cc.audioEngine.play(this.audiosource.getComponent('audio').gamestart, false, 1);

                // 设置开始游戏节点动画
                var scaleaction = cc.sequence(cc.show(), cc.scaleTo(0.3, 0.5, 0.5), cc.delayTime(3), cc.hide());
                this.yxks.runAction(scaleaction);
            }

        });

        ZR_IO.on('banker_roll', (data, status) => { //游戏开始，抢庄
            // console.log(data);
            if (status) {
                step = 1;
                let self = this;
                ccUtil.closeModal();
                // self.snatchvillagebtn.active = true;
                //保存抢庄依赖顺序
                for (var key in data.playersInfo) {
                    playersInfos.push(key);
                }
                // 设置当前玩家可选择的抢庄按钮
                curplexperience = data.playersInfo[GD.playerId].experience.toFixed(1);
                console.log("curplexperience:" + curplexperience);
                if (curplexperience < 480) {
                    for (var i = 1; i < this.snatchvillagebtn.children.length - 1; i++) {
                        this.snatchvillagebtn.children[i].getComponent(cc.Button).interactable = false;
                        this.snatchvillagebtn.children[i].opacity = 127.5;
                        this.snatchvillagebtn.children[i].targetOff(this);
                    }
                } else if (curplexperience < 720) {
                    for (var i = 2; i < this.snatchvillagebtn.children.length - 2; i++) {
                        this.snatchvillagebtn.children[i].getComponent(cc.Button).interactable = false;
                        this.snatchvillagebtn.children[i].opacity = 127.5;
                        this.snatchvillagebtn.children[i].targetOff(this);
                    }
                } else if (curplexperience < 960) {
                    for (var i = 3; i < this.snatchvillagebtn.children.length - 3; i++) {
                        this.snatchvillagebtn.children[i].getComponent(cc.Button).interactable = false;
                        this.snatchvillagebtn.children[i].opacity = 127.5;
                        this.snatchvillagebtn.children[i].targetOff(this);
                    }
                } else {
                    //金币大于960不禁用按钮
                }
                // 设置抢庄倒计时
                if (playerIds.length == 2) {
                    self.scheduleOnce(function() {
                        console.log("1");
                        clock = 0;
                        allcount = data.timeout;
                        self.schedule(self.updateTime, 1, allcount, 0);
                    }, 0);
                    self.scheduleOnce(function() {
                        this.unschedule(self.updateTime);
                        console.log("2");
                        clock = 1;
                        allcount = data.timeout;
                        self.schedule(self.updateTime, 1, allcount, 0);
                    }, 4);
                } else if (playerIds.length == 3) {
                    self.scheduleOnce(function() {
                        console.log("1");
                        clock = 0;
                        allcount = data.timeout;
                        self.schedule(self.updateTime, 1, allcount, 0);
                    }, 0);
                    self.scheduleOnce(function() {
                        this.unschedule(self.updateTime);
                        console.log("2");
                        clock = 1;
                        allcount = data.timeout;
                        self.schedule(self.updateTime, 1, allcount, 0);
                    }, 4);
                    self.scheduleOnce(function() {
                        this.unschedule(self.updateTime);
                        console.log("3");
                        clock = 2;
                        allcount = data.timeout;
                        self.schedule(self.updateTime, 1, allcount, 0);
                    }, 8);
                } else if (playerIds.length == 4) {
                    self.scheduleOnce(function() {
                        console.log("1");
                        clock = 0;
                        allcount = data.timeout;
                        self.schedule(self.updateTime, 1, allcount, 0);
                    }, 0);
                    self.scheduleOnce(function() {
                        this.unschedule(self.updateTime);
                        console.log("2");
                        clock = 1;
                        allcount = data.timeout;
                        self.schedule(self.updateTime, 1, allcount, 0);
                    }, 4);
                    self.scheduleOnce(function() {
                        this.unschedule(self.updateTime);
                        console.log("3");
                        clock = 2;
                        allcount = data.timeout;
                        self.schedule(self.updateTime, 1, allcount, 0);
                    }, 8);
                    self.scheduleOnce(function() {
                        this.unschedule(self.updateTime);
                        console.log("4");
                        clock = 3;
                        allcount = data.timeout;
                        self.schedule(self.updateTime, 1, allcount, 0);
                    }, 12);
                }
                //根据playersInfo数据对玩家进行倒计时排序
                //TODO: 玩家可以操作
                // 获取当前玩家的钱币数
            }
        });
        ZR_IO.on('one_choosebanker', (data, status) => { //下一步：倒计时
            if (status) {
                console.log("one_choosebanker:" + data.playerId);
                let bankerindex = playerIds.indexOf(data.playerId);
                this.spawnbankerOdds(bankerindex, data.odds);
            }
        });
        ZR_IO.on('player_roll', (data, status) => { //闲家定倍
            if (status) {
                step = 2;
                ispc_deal = true;
                this.snatchvillagebtn.active = false;
                // 取消抢庄环节的定时器
                this.unschedule(this.updateTime);
                // 获取庄家在数据中的排位号,
                var bankerindex = playerIds.indexOf(data.banker.playerId);
                cattleGlobal.gtoposiX = coinposi[bankerindex].x;
                cattleGlobal.gtoposiY = coinposi[bankerindex].y;
                this.schedule(function() {
                    this.spawng();
                }, 0, 30, 0);
                // 设置庄家牛牛专属头像
                this.scheduleOnce(function() {
                    this.userinfo[bankerindex].getChildByName('ZJTX-01').active = true;
                }, 1.5);
                //设置庄家等待抢注提示
                if (playerIds.indexOf(data.banker.playerId) == 0) { //如果庄家是玩家自己，显示等待下注提示
                    this.waitchipin.active = true;
                } else {
                    //庄家不是玩家自己，不显示等待下注提示
                    this.chipinbtn.active = true;
                    // 根据玩家金币多少显示下注按钮
                    if (curplexperience < 64) {
                        this.chipinbtn.getChildByName('chipinbtn1').active = true;
                        this.chipinbtn.getChildByName('chipinbtn2').active = false;
                        this.chipinbtn.getChildByName('chipinbtn3').active = false;
                        this.chipinbtn.getChildByName('chipinbtn4').active = false;
                        this.chipinbtn.getChildByName('chipinbtn5').active = false;
                    } else if (curplexperience < 128) {
                        this.chipinbtn.getChildByName('chipinbtn1').active = false;
                        this.chipinbtn.getChildByName('chipinbtn2').active = true;
                        this.chipinbtn.getChildByName('chipinbtn3').active = false;
                        this.chipinbtn.getChildByName('chipinbtn4').active = false;
                        this.chipinbtn.getChildByName('chipinbtn5').active = false;
                    } else if (curplexperience < 192) {
                        this.chipinbtn.getChildByName('chipinbtn1').active = false;
                        this.chipinbtn.getChildByName('chipinbtn2').active = false;
                        this.chipinbtn.getChildByName('chipinbtn3').active = true;
                        this.chipinbtn.getChildByName('chipinbtn4').active = false;
                        this.chipinbtn.getChildByName('chipinbtn5').active = false;
                    } else if (curplexperience < 256) {
                        this.chipinbtn.getChildByName('chipinbtn1').active = false;
                        this.chipinbtn.getChildByName('chipinbtn2').active = false;
                        this.chipinbtn.getChildByName('chipinbtn3').active = false;
                        this.chipinbtn.getChildByName('chipinbtn4').active = true;
                        this.chipinbtn.getChildByName('chipinbtn5').active = false;
                    } else {
                        this.chipinbtn.getChildByName('chipinbtn1').active = false;
                        this.chipinbtn.getChildByName('chipinbtn2').active = false;
                        this.chipinbtn.getChildByName('chipinbtn3').active = false;
                        this.chipinbtn.getChildByName('chipinbtn4').active = false;
                        this.chipinbtn.getChildByName('chipinbtn5').active = true;
                    }
                }
                this.spawnbankerOdds(bankerindex, data.banker.odds);
                //设置除庄家其余玩家的抢庄倍数
                for (var i = 0; i < playerIds.length; i++) {
                    exceptbanker.push(playerIds[i]);
                }
                exceptbanker.splice(bankerindex, 1);

                if (data.bankerChoose) {
                    for (var i = 0; i < exceptbanker.length; i++) {
                        //获取playerIds数组中当前循环到的玩家的下标
                        var plindex = playerIds.indexOf(exceptbanker[i]);
                        this.spawnbankerOdds(plindex, data.bankerChoose[exceptbanker[i]].odds);
                    }
                } else {
                    for (var i = 0; i < exceptbanker.length; i++) {
                        //获取playerIds数组中当前循环到的玩家的下标
                        var plindex = playerIds.indexOf(exceptbanker[i]);
                        this.spawnbankerOdds(plindex, data.plasyer[exceptbanker[i]].odds);
                    }
                }

                this.ddk.active = false;

                // 设置下注倒计时时长
                allcount = data.timeout;
                //设置下注环节倒计时
                clock = 0;
                this.schedule(this.updateTime, 1, allcount, 0);
            }
        });
        ZR_IO.on('one_chooseplayer', (data, status) => { //下一步：倒计时
            if (status) {
                console.log("one_chooseplayer:" + data);
                let plindex = playerIds.indexOf(data.playerId);
                this.spawnplayerOdds(plindex, data.odds);
            }
        });
        ZR_IO.on('deal', (data, status) => { //发牌
            if (status) {
                step = 3;
                updatedata = data;
                this.unschedule(this.updateTime);

                this.chipinbtn.active = false;
                this.waitchipin.active = false;
                this.dxk.active = true;
                this.pokerchoose.active = true;
                this.jsk.active = true;
                this.dealpoker();

                //设置除庄家外其余玩家的下注倍数
                for (var i = 0; i < exceptbanker.length; i++) {
                    //获取playerIds数组中当前循环到的玩家的下标
                    var plindex = playerIds.indexOf(exceptbanker[i]);
                    this.spawnplayerOdds(plindex, data.plasyer[exceptbanker[i]].odds);
                }
                this.scheduleOnce(function() {
                    //清理牌背面
                    for (var i = 0; i < 5; i++) {
                        this.pokers.children[i].destroy();
                    }
                    // 创建当前玩家牌正面
                    // for (var i = 0; i < playerIds.length; i++) {
                    //判断获取到的数据类型是否是string
                    pokerfacecount = 0;
                    if (typeof usertoken[0] !== 'string') {
                        var ut = usertoken[0].toString();
                        data.pokes[ut].pokes.forEach((item, index) => {
                            if (typeof item === 'string') {

                                var pf = eval('(' + item + ')');
                                this.spawnpokerface(pf.color, pf.num, pokerposi[pokerfacecount].x, pokerposi[pokerfacecount].y, pokerfacecount, data.roomKey);
                                poker.push({ color: pf.color, num: pf.num, pX: pokerposi[pokerfacecount].x, pY: pokerposi[pokerfacecount].y, pfc: pokerfacecount, roomKey: data.roomKey });
                            } else {
                                this.spawnpokerface(item.color, item.num, pokerposi[pokerfacecount].x, pokerposi[pokerfacecount].y, pokerfacecount, data.roomKey);
                                poker.push({ color: item.color, num: item.num, pX: pokerposi[pokerfacecount].x, pY: pokerposi[pokerfacecount].y, pfc: pokerfacecount, roomKey: data.roomKey });
                            }
                            pokerfacecount++;
                            if ((pokerfacecount + 1) % 5 == 0) {
                                this.schedule(function() {

                                });
                            }
                        });
                    } else {
                        data.pokes[usertoken[0]].pokes.forEach((item, index) => {
                            if (typeof item === 'string') {

                                var pf = eval('(' + item + ')');
                                this.spawnpokerface(pf.color, pf.num, pokerposi[pokerfacecount].x, pokerposi[pokerfacecount].y, pokerfacecount, data.roomKey);
                                poker.push({ color: pf.color, num: pf.num, pX: pokerposi[pokerfacecount].x, pY: pokerposi[pokerfacecount].y, pfc: pokerfacecount, roomKey: data.roomKey });
                            } else {
                                this.spawnpokerface(item.color, item.num, pokerposi[pokerfacecount].x, pokerposi[pokerfacecount].y, pokerfacecount, data.roomKey);
                                poker.push({ color: item.color, num: item.num, pX: pokerposi[pokerfacecount].x, pY: pokerposi[pokerfacecount].y, pfc: pokerfacecount, roomKey: data.roomKey });
                            }
                            pokerfacecount++;
                        });
                    }
                    // 绑定选牌事件
                    // var paiback = (playerIds.length-1)*5; //牌背面的数量
                    // currentnum = poker[i].num;
                    //预创建一个控制牌上下移动的数组
                    let self = this;

                    function choosepoker() {

                        let pokermove = [false, false, false, false, false];
                        // 保存牌的下标
                        let cplabel = [];
                        // 保存当前点击数的下标
                        let cplabel1 = [];
                        for (var i = 0; i < 5; i++) {
                            // console.log(self.pokers.children[(playerIds.length) * 5 + i]);
                            self.pokers.children[(playerIds.length) * 5 + i].on(cc.Node.EventType.TOUCH_END, function(event) {
                                cc.audioEngine.play(self.audiosource.getComponent('audio').carddone1, false, 1);
                                let currentpoindex = event.currentTarget.index;
                                console.log(currentpoindex);
                                // 控制牌上下移动
                                if (poker[currentpoindex].num == 11 || poker[currentpoindex].num == "J") {
                                    currentnum = "J";
                                } else if (poker[currentpoindex].num == 12 || poker[currentpoindex].num == "Q") {
                                    currentnum = "Q";
                                } else if (poker[currentpoindex].num == 13 || poker[currentpoindex].num == "K") {
                                    currentnum = "K";
                                } else {
                                    currentnum = poker[currentpoindex].num;
                                }
                                if (pokermove[currentpoindex]) {
                                    event.currentTarget.y = event.currentTarget.y - 25;
                                    event.currentTarget.x = event.currentTarget.x;
                                    pokerfaceclickcount--;
                                    let ind = cplabel.indexOf(currentnum);
                                    let ind1 = cplabel1.indexOf(currentpoindex);
                                    cplabel1.splice(ind1, 1);
                                    cplabel.splice(ind, 1);
                                    // console.log(cplabel);
                                    self.jsk.children[ind].getComponent('cc.Label').string = '';
                                    pokermove[currentpoindex] = !pokermove[currentpoindex];
                                } else {
                                    event.currentTarget.y = event.currentTarget.y + 25;
                                    event.currentTarget.x = event.currentTarget.x;
                                    cplabel.push(currentnum);
                                    cplabel1.push(currentpoindex);

                                    // console.log(cplabel);
                                    for (var i = 0; i < cplabel.length; i++) {
                                        self.jsk.children[i].getComponent('cc.Label').string = cplabel[i];
                                    }
                                    // cplabel1.push(pokerfaceclickcount);
                                    pokerfaceclickcount++;
                                    pokermove[currentpoindex] = !pokermove[currentpoindex];
                                }
                                // 选牌上移动画
                                // this.pokers.children[5].destroy();
                                // this.spawnpokerface(color, num, pX, pY + 25, pfc);
                                if (pokerfaceclickcount >= 3) {
                                    for (var i = 0; i < 3; i++) {
                                        self.clickpokertype(self.jsk.children[i].getComponent('cc.Label').string);
                                    }
                                    //点击有牛后计算所选三张牌的总数并推送
                                    self.jsk.getChildByName('AN-yn').on(cc.Node.EventType.TOUCH_END, function() {
                                        if (clickpokertype[0] != null && clickpokertype[1] != null && clickpokertype[2] != null) {
                                            self.jsk.children[3].getComponent('cc.Label').string = clickpokertype[0] + clickpokertype[1] + clickpokertype[2];
                                            if ((clickpokertype[0] + clickpokertype[1] + clickpokertype[2]) % 10 == 0) {
                                                cc.audioEngine.play(self.audiosource.getComponent('audio').carddone, false, 1);
                                                self.dxk.children[0].getComponent(cc.Label).string = "选牌正确";
                                                //选牌正确后翻牌到背面
                                                console.log(self.pokers);
                                                for (var i = 0; i < 5; i++) { //创建牌背面前先摧毁牌正面
                                                    self.pokers.children[(playerIds.length - 1) * 5 + i].destroy();
                                                }
                                                let count = 0;
                                                this.schedule(function() {
                                                    // 这里的 this 指向 component
                                                    this.ymnpokerback(pokerposi[count].x, pokerposi[count].y);
                                                    // cc.audioEngine.play(this.audiosource.getComponent('audio').dealcard, false, 1);
                                                    count++;
                                                }, 0.02, 4, 0);
                                                this.schedule(function() {
                                                    this.wc.children[0].active = true;
                                                }, 0.02 * 4);
                                            } else {
                                                cc.audioEngine.play(self.audiosource.getComponent('audio').montageerror, false, 1);
                                                self.dxk.children[0].getComponent(cc.Label).string = "选牌错误";
                                            }
                                            // self.playAudio('carddone');
                                        } else {
                                            //没选牌数据不做操作
                                        }
                                        self.jsk.getChildByName('ynbk').active = true;
                                        self.jsk.getChildByName('mnbk').active = false;
                                        ZR_IO.emit('choose_yn', { playerId: GD.playerId, roomKey: data.roomKey });
                                    }, self);
                                    console.log("开始取消选牌监听事件");
                                    // 去除已选牌之外其他牌的点击事件
                                    let noclickarr = [0, 1, 2, 3, 4];
                                    console.log(cplabel1);
                                    for (var i = 0; i < cplabel1.length; i++) {
                                        let curind = noclickarr.indexOf(cplabel1[i]);
                                        noclickarr.splice(curind, 1);
                                    }
                                    for (var i = 0; i < noclickarr.length; i++) {
                                        console.log((playerIds.length - 1) * 5 + noclickarr[i]);
                                        self.pokers.children[(playerIds.length - 1) * 5 + noclickarr[i]].targetOff(self);
                                    }
                                    console.log(noclickarr);
                                    // for (var i = 0; i < 5; i++) {
                                    //     this.pokers.children[i].targetOff(this);
                                    // }
                                } else {
                                    choosepoker();
                                    //再次设置点击牌的事件
                                }
                            }, self);
                            //点击没牛之后页面效果并发送推送
                            self.jsk.getChildByName('AN-mn').on(cc.Node.EventType.TOUCH_END, function() {
                                self.jsk.getChildByName('ynbk').active = false;
                                self.jsk.getChildByName('mnbk').active = true;
                                console.log(playersInfos);
                                let allpl = [];
                                if (data.pokes[usertoken[0]].title == "没牛") {
                                    cc.audioEngine.play(self.audiosource.getComponent('audio').carddone, false, 1);
                                    self.dxk.children[0].getComponent(cc.Label).string = "选牌正确";
                                    // 选牌正确后创建牌背面
                                    for (var i = 0; i < 5; i++) { //创建牌背面前先摧毁牌正面
                                        self.pokers.children[(playerIds.length - 1) * 5 + i].destroy();
                                    }
                                    let count = 0;
                                    this.schedule(function() {
                                        // 这里的 this 指向 component
                                        this.ymnpokerback(pokerposi[count].x, pokerposi[count].y);
                                        // cc.audioEngine.play(this.audiosource.getComponent('audio').dealcard, false, 1);
                                        count++;
                                    }, 0.02, 4, 0);
                                    this.schedule(function() {
                                        this.wc.children[0].active = true;
                                    }, 0.02 * 4);
                                } else {
                                    cc.audioEngine.play(self.audiosource.getComponent('audio').montageerror, false, 1);
                                    self.dxk.children[0].getComponent(cc.Label).string = "选牌错误";
                                }
                                ZR_IO.emit('choose_mn', { playerId: GD.playerId, roomKey: data.roomKey });
                                cc.audioEngine.play(self.audiosource.getComponent('audio').carddone1, false, 1);
                            }, self);
                        }
                    }
                    choosepoker();
                    //用于保存已选择牌的大小
                    // }
                    // 创建除已选牌和当前玩家之外其他玩家牌正面

                    this.scheduleOnce(function() {
                        //清理牌背面
                        // for (var i = 5; i < (playerIds.length - 1) * 5; i++) {
                        //     this.pokers.children[i].destroy();
                        // }
                        var exceptchooserCurrentpl = [];
                        // for (var i = 0; i < playerIds.length; i++) {
                        //     exceptchooserCurrentpl.push(playerIds[i]);
                        // }
                        for (var i = 0; i < playerIds.length; i++) {
                            // console.log(playerIds[i]);
                            exceptchooserCurrentpl.push(playerIds[i]);
                        }
                        // 去除已选牌的用户id
                        for (var i = 0; i < alreadychoosepl.length; i++) {
                            var alreadychooseplIndex = exceptchooserCurrentpl.indexOf(alreadychoosepl[i]);
                            exceptchooserCurrentpl.splice(alreadychooseplIndex, 1);
                        }
                        // 去除当前用户id
                        var currentPlIndex = exceptchooserCurrentpl.indexOf(GD.playerId);
                        exceptchooserCurrentpl.splice(currentPlIndex, 1);
                        // 创建剩余玩家牌正面
                        for (var i = 0; i < exceptchooserCurrentpl.length; i++) {
                            //判断获取到的数据类型是否是string
                            var leftInd = playerIds.indexOf(exceptchooserCurrentpl[i]);
                            pokerfacecount = leftInd * 5;
                            if (typeof usertoken[leftInd] !== 'string') {
                                var ut = usertoken[leftInd].toString();
                                data.pokes[ut].pokes.forEach((item, index) => {
                                    if (typeof item === 'string') {

                                        var pf = eval('(' + item + ')');
                                        this.spawnpokerface(pf.color, pf.num, pokerposi[pokerfacecount].x, pokerposi[pokerfacecount].y, pokerfacecount);
                                    } else {
                                        this.spawnpokerface(item.color, item.num, pokerposi[pokerfacecount].x, pokerposi[pokerfacecount].y, pokerfacecount);
                                    }
                                    pokerfacecount++;
                                    if ((pokerfacecount + 1) % 5 == 0) {
                                        this.schedule(function() {

                                        });
                                    }
                                });
                            } else {
                                data.pokes[usertoken[leftInd]].pokes.forEach((item, index) => {
                                    if (typeof item === 'string') {

                                        var pf = eval('(' + item + ')');
                                        this.spawnpokerface(pf.color, pf.num, pokerposi[pokerfacecount].x, pokerposi[pokerfacecount].y, pokerfacecount);
                                    } else {
                                        this.spawnpokerface(item.color, item.num, pokerposi[pokerfacecount].x, pokerposi[pokerfacecount].y, pokerfacecount);
                                    }
                                    pokerfacecount++;
                                });
                            }
                        }
                    }, data.timeout);

                    //对牌进行从大到小排序
                    this.scheduleOnce(function() {
                        //清除pokers里已创建的牌面
                        for (var i = 0; i < this.pokers.children.length; i++) {
                            this.pokers.children[i].destroy();
                        }
                        for (var s = 0; s < playerIds.length; s++) {
                            let poke = data.pokes[usertoken[s]].pokes;
                            // 使用冒泡排序法根据牌的大小对牌进行排序
                            for (var i = 0; i < poke.length; i++) {
                                for (var j = 0; j < poke.length - 1 - i; j++) {
                                    if (poke[j].num < poke[j + 1].num) {
                                        var temp = poke[j];
                                        poke[j] = poke[j + 1];
                                        poke[j + 1] = temp;
                                    }
                                }
                            }
                            //选出三张牌为10的倍数
                            function threepoke(e) {
                                // let poke = data.pokes[usertoken[e]].pokes;
                                for (var q = 0; q < poke.length; q++) {
                                    for (var w = 0; w < poke.length; w++) {
                                        for (var e = 0; e < poke.length; e++) {
                                            let fnum, snum, tnum;
                                            if (poke[e].num > 10) {
                                                fnum = 10;
                                            } else {
                                                fnum = poke[e].num;
                                            }
                                            if (poke[w].num > 10) {
                                                snum = 10;
                                            } else {
                                                snum = poke[w].num;
                                            }
                                            if (poke[q].num > 10) {
                                                tnum = 10;
                                            } else {
                                                tnum = poke[q].num;
                                            }
                                            if (e == w || e == q || w == q) {
                                                continue;
                                            } else if ((fnum + snum + tnum) % 10 == 0) {
                                                let arr = [q, w, e];
                                                // console.log(poke[e],poke[w],poke[q]);
                                                return arr;
                                            }
                                        }
                                    }
                                }
                            };
                            let ismn = false;
                            for (var t = 0; t < usertoken.length; t++) {
                                let curarr = threepoke(t);
                                if (curarr != undefined) {
                                    for (var y = 0; y < curarr.length; y++) {
                                        let temp = poke[y];
                                        poke[y] = poke[curarr[y]];
                                        poke[curarr[y]] = temp;
                                    }
                                    ismn = false;
                                } else {
                                    // 没牛不排序
                                    console.log("没牛");
                                    ismn = true;
                                }
                            }
                            pokerfacecount = s * 5;
                            poke.forEach((item, index) => {
                                if (typeof item === 'string') {

                                    var pf = eval('(' + item + ')');
                                    if (ismn) {
                                        this.spawnpokerface(pf.color, pf.num, mnsortpoker[pokerfacecount].x, mnsortpoker[pokerfacecount].y, pokerfacecount);
                                    } else {
                                        this.spawnpokerface(pf.color, pf.num, sortpokerposi[pokerfacecount].x, sortpokerposi[pokerfacecount].y, pokerfacecount);
                                    }
                                } else {
                                    if (ismn) {
                                        this.spawnpokerface(item.color, item.num, mnsortpoker[pokerfacecount].x, mnsortpoker[pokerfacecount].y, pokerfacecount);
                                    } else {
                                        this.spawnpokerface(item.color, item.num, sortpokerposi[pokerfacecount].x, sortpokerposi[pokerfacecount].y, pokerfacecount);
                                    }
                                }
                                pokerfacecount++;
                                // if ((pokerfacecount + 1) % 5 == 0) {
                                //     this.schedule(function() {

                                //     });
                                // }
                            });
                            console.log(poke);
                        }
                    }, data.timeout + 0.5);

                    cc.audioEngine.play(this.audiosource.getComponent('audio').sendcard, false, 1);
                    // 设置选牌倒计时

                    allcount = data.timeout;
                    this.schedule(this.updateTime, 1, allcount, 0);
                    //显示牌面为牛几
                    var bullcount = 0;
                    this.schedule(function() {
                        var bulltype = data.pokes[usertoken[bullcount]].title;
                        switch (bulltype) {
                            case "没牛":
                                this.spawnbulltype(bullcount, 0);
                                cc.audioEngine.play(this.audiosource.getComponent('audio').cow0, false, 1);
                                break;
                            case "牛一":
                                this.spawnbulltype(bullcount, 1);
                                cc.audioEngine.play(this.audiosource.getComponent('audio').cow1, false, 1);
                                break;
                            case "牛二":
                                this.spawnbulltype(bullcount, 2);
                                cc.audioEngine.play(this.audiosource.getComponent('audio').cow2, false, 1);
                                break;
                            case "牛三":
                                this.spawnbulltype(bullcount, 3);
                                cc.audioEngine.play(this.audiosource.getComponent('audio').cow3, false, 1);
                                break;
                            case "牛四":
                                this.spawnbulltype(bullcount, 4);
                                cc.audioEngine.play(this.audiosource.getComponent('audio').cow4, false, 1);
                                break;
                            case "牛五":
                                this.spawnbulltype(bullcount, 5);
                                cc.audioEngine.play(this.audiosource.getComponent('audio').cow5, false, 1);
                                break;
                            case "牛六":
                                this.spawnbulltype(bullcount, 6);
                                cc.audioEngine.play(this.audiosource.getComponent('audio').cow6, false, 1);
                                break;
                            case "牛七":
                                this.spawnbulltype(bullcount, 7);
                                cc.audioEngine.play(this.audiosource.getComponent('audio').cow7, false, 1);
                                break;
                            case "牛八":
                                this.spawnbulltype(bullcount, 8);
                                cc.audioEngine.play(this.audiosource.getComponent('audio').cow8, false, 1);
                                break;
                            case "牛九":
                                this.spawnbulltype(bullcount, 9);
                                cc.audioEngine.play(this.audiosource.getComponent('audio').cow9, false, 1);
                                break;
                            case "牛牛":
                                this.spawnbulltype(bullcount, 10);
                                cc.audioEngine.play(this.audiosource.getComponent('audio').cow10, false, 1);
                                break;
                            case "四花牛":
                                this.spawnbulltype(bullcount, 11);
                                cc.audioEngine.play(this.audiosource.getComponent('audio').cow11, false, 1);
                                break;
                            case "四炸":
                                this.spawnbulltype(bullcount, 12);
                                cc.audioEngine.play(this.audiosource.getComponent('audio').cow13, false, 1);
                                break;
                            case "五小牛":
                                this.spawnbulltype(bullcount, 13);
                                cc.audioEngine.play(this.audiosource.getComponent('audio').cow14, false, 1);
                                break;
                            case "五花牛":
                                this.spawnbulltype(bullcount, 14);
                                cc.audioEngine.play(this.audiosource.getComponent('audio').cow12, false, 1);
                                break;
                            default:
                                this.spawnbulltype(bullcount, 0);
                                cc.audioEngine.play(this.audiosource.getComponent('audio').montageerror, false, 1);
                        }
                        bullcount++;
                    }, 1, playerIds.length - 1, data.timeout + 1);
                    // 设置玩家的输赢多少
                    this.scheduleOnce(function() {
                        // 根据除庄家玩家数量设置循环次数
                        for (var i = 0; i < exceptbanker.length; i++) {
                            var winfailnum = data.plasyer[exceptbanker[i]].amount.toString();
                            if (winfailnum.length > 5) {
                                let a = eval('(' + winfailnum + ')');
                                a = a.toFixed(1);
                                winfailnum = a.toString();
                                console.log(winfailnum);
                            }
                            console.log("playerId:" + exceptbanker[i], "amount:" + winfailnum);
                            if (winfailnum > 0) {
                                winfailnum = "+" + winfailnum;
                            }
                            //获取当前玩家在playerIds数组中的下标
                            var plindex = playerIds.indexOf(exceptbanker[i]);
                            // 根据输赢字段长度设置循环次数
                            for (var j = 0; j < winfailnum.length; j++) {
                                var firstsymbol = winfailnum.charAt(0);
                                var symbol = winfailnum.charAt(j);
                                if (plindex == 3) {
                                    let childindex = 6 - winfailnum.length;
                                    console.log(childindex);
                                    this.spawnwinfailnum(firstsymbol, symbol, plindex, childindex + j);
                                } else {
                                    this.spawnwinfailnum(firstsymbol, symbol, plindex, j);
                                }
                            }
                        }
                    }, data.timeout + 1 + playerIds.length);

                    // 解决庄家和其他玩家同时调用spawnwinfailnum
                    this.scheduleOnce(function() {
                        var baindex = playerIds.indexOf(data.banker.playerId);
                        // 设置庄家的输赢多少
                        var bankerwinfailnum = data.banker.amount.toString();
                        if (bankerwinfailnum.length > 5) {
                            let a = eval('(' + bankerwinfailnum + ')');
                            a = a.toFixed(1);
                            bankerwinfailnum = a.toString();
                            console.log(bankerwinfailnum);
                        }
                        if (bankerwinfailnum > 0) {
                            bankerwinfailnum = "+" + bankerwinfailnum;
                        }
                        for (var s = 0; s < bankerwinfailnum.length; s++) {
                            var fsymbol = bankerwinfailnum.charAt(0);
                            var bsymbol = bankerwinfailnum.charAt(s);
                            if (baindex == 3) {
                                let childindex = 6 - bankerwinfailnum.length;
                                console.log(childindex);
                                this.spawnwinfailnum(fsymbol, bsymbol, baindex, childindex + s);
                            } else {
                                this.spawnwinfailnum(fsymbol, bsymbol, baindex, s);
                            }
                            // this.spawnwinfailnum(fsymbol, bsymbol, baindex, s);
                        }
                    }, data.timeout + 1 + playerIds.length);
                    // 设置庄家通杀或通赔
                    this.scheduleOnce(function() {
                        // 对扑克牌id进行冒泡排序由大到小，如果庄家在下标为0的位置则通杀，若果在下标为3的位置则通赔
                        var tscaleaction = cc.sequence(cc.show(), cc.scaleTo(0.1, 0.7, 0.7), cc.delayTime(1.5), cc.hide());
                        var comparearr = [];
                        comparearr.push(data.pokes[data.banker.token].pokeId);
                        for (var i = 0; i < exceptbanker.length; i++) {
                            comparearr.push(data.pokes[data.plasyer[exceptbanker[i]].token].pokeId);
                        }
                        for (var i = 0; i < comparearr.length; i++) {
                            for (var j = 0; j < comparearr.length - 1 - i; j++) {
                                if (comparearr[j] < comparearr[j + 1]) {
                                    var temp = comparearr[j];
                                    comparearr[j] = comparearr[j + 1];
                                    comparearr[j + 1] = temp;
                                }
                            }
                        }
                        if (data.pokes[data.banker.token].pokeId == comparearr[0]) { // 设置通杀
                            this.ts.active = true;
                            this.ts.runAction(tscaleaction);
                            cc.audioEngine.play(this.audiosource.getComponent('audio').pentakill, false, 1);
                        } else if (data.pokes[data.banker.token].pokeId == comparearr[playerIds.length]) { // 设置通赔
                            this.tp.active = true;
                            this.tp.runAction(tscaleaction);
                            cc.audioEngine.play(this.audiosource.getComponent('audio').montageerror, false, 1);
                        } else {
                            //默认什么也不做
                        }
                    }, data.timeout + 2 + playerIds.length);
                    //设置继续游戏按钮
                    this.scheduleOnce(function() {
                        this.jxyx.active = true;
                    }, data.timeout + 3 + playerIds.length);
                }, 0.05 * (playerIds.length * 5) + 1);
                //设置金币特效
                this.schedule(function() {
                    var bindex = 0,
                        pindex = 0;
                    for (var s = 0; s < playerIds.length; s++) {
                        if (playerIds[s] == data.banker.playerId) {
                            bindex = s;
                        } else {}
                    }
                    pindex = playerIds.indexOf(exceptbanker[coinindex]);
                    // console.log(coinindex);
                    if (data.pokes[data.banker.token].pokeId > data.pokes[data.plasyer[exceptbanker[coinindex]].token].pokeId) {
                        this.schedule(function() {
                            cattleGlobal.cointoposiX = coinposi[bindex].x; //设置金币要移动到的坐标              
                            cattleGlobal.cointoposiY = coinposi[bindex].y;
                            this.spawncoin(coinposi[pindex].x + cc.randomMinus1To1() * 60, coinposi[pindex].y + cc.randomMinus1To1() * 60);
                        }, 0, Math.round(Math.abs(data.plasyer[playerIds[pindex]].amount) / 2), 0);
                        if (Math.abs(data.plasyer[playerIds[pindex]].amount) * 2 > 5) {
                            cc.audioEngine.play(this.audiosource.getComponent('audio').betAll, false, 1);
                        } else {
                            cc.audioEngine.play(this.audiosource.getComponent('audio').betone, false, 1);
                        }
                    } else {
                        this.schedule(function() {
                            cattleGlobal.cointoposiX = coinposi[pindex].x;
                            cattleGlobal.cointoposiY = coinposi[pindex].y;
                            this.spawncoin(coinposi[bindex].x + cc.randomMinus1To1() * 60, coinposi[bindex].y + cc.randomMinus1To1() * 60);
                            // 如果赚取的金币数量大于五，播放大量金币音乐，否则播放少量金币音乐
                        }, 0, Math.round(Math.abs(data.plasyer[playerIds[pindex]].amount) / 2), 0);
                        if (Math.abs(data.plasyer[playerIds[pindex]].amount) * 2 > 5) {
                            cc.audioEngine.play(this.audiosource.getComponent('audio').betAll, false, 1);
                        } else {
                            cc.audioEngine.play(this.audiosource.getComponent('audio').betone, false, 1);
                        }
                    }
                    coinindex++;
                }, 0.05, exceptbanker.length - 1, data.timeout + 4 + playerIds.length);
            } else {
                this.jxyx.active = true;

                ccUtil.modalLoading('游戏结算异常~~~~', {
                    buttons: [{ name: 'back', handler: self.myHandler('back_hall') }]
                });
            }
        });
        ZR_IO.on('game_over', (data, status) => { //下一步：倒计时
            if (status) {
                console.log(data);
                let uia = data.userinfo;
                for (var i = 0; i < uia.length; i++) {
                    let cind = playerIds.indexOf(uia[i].playerId);
                    this.userinfo[cind].getChildByName('account').getComponent(cc.Label).string = uia[i].experience.toFixed(2);
                }
            }
        });
    },
    // 提交抢庄倍数
    commitBankerOdds() {
        var self = this;

        function clickbanker(index) {
            self.snatchvillagebtn.children[index].on(cc.Node.EventType.TOUCH_END, function() {
                var bodds;
                if (index == 0) {
                    bodds = 0;
                } else if (index == 1) {
                    bodds = 2;
                } else if (index == 2) {
                    bodds = 3;
                } else if (index == 3) {
                    bodds = 4;
                }
                cc.audioEngine.play(this.audiosource.getComponent('audio').windowopen, false, 1);
                ZR_IO.emit('banker_choose', { playerId: GD.playerId, odds: bodds, roomKey: GD.roomKey });
                // ispc_deal = true;
                self.snatchvillagebtn.active = false;
                self.ddk.active = true;
                bankerisclick = true;
            }, self);
        }
        clickbanker(0);
        clickbanker(1);
        clickbanker(2);
        clickbanker(3);
    },
    // 提交下注倍数
    chipinOdds() {
        var self = this;

        function click(index1, index2) {
            self.chipinbtn.children[index1].children[index2].on(cc.Node.EventType.TOUCH_END, function() {
                var podds = (index1 * 4) + 1 + index2;
                ZR_IO.emit('player_choose', { playerId: GD.playerId, odds: podds });
                self.chipinbtn.active = false;
                cc.audioEngine.play(this.audiosource.getComponent('audio').windowopen, false, 1);
            }, self);
        }
        click(0, 0);
        click(0, 1);
        click(0, 2);
        click(0, 3);
        click(1, 0);
        click(1, 1);
        click(1, 2);
        click(1, 3);
        click(2, 0);
        click(2, 1);
        click(2, 2);
        click(2, 3);
        click(3, 0);
        click(3, 1);
        click(3, 2);
        click(3, 3);
        click(4, 0);
        click(4, 1);
        click(4, 2);
        click(4, 3);
    },
    onLoad() {
        window.ttt = this;
        let self = this;

        //监听菜单返回
        cc.director.off('emit-setting-exit');
        cc.director.on('emit-setting-exit', () => {
            self.back();
        });
        //存放数据
        this.data = {};

        // ccUtil.modalLoading('加载中...');

        this.defaultscene();

        this.matchingRoom();
        //提交抢庄倍数
        this.commitBankerOdds();
        //提交下注倍数
        this.chipinOdds();

        this.onGameEvent();
        cc.audioEngine.play(this.audiosource.getComponent('audio').windowopen, false, 1);
        //点击继续游戏按钮后重新加载场景
        cc.director.preloadScene("cattle", function() {
            cc.log("Next scene preloaded");
        });
        this.jxyx.on(cc.Node.EventType.TOUCH_END, function() {
            cc.director.loadScene("cattle");
            this.jxyx.children[0].active = true;
        }, this);
    },

    start() {

    },

    update(dt) {

    },
});