var cattleGlobal = require("cattleGlobal");

var chipslist = [],buttonindex,chipsposition = [];
var pokerpositions = [
{x:-402,y:50},{x:-372,y:50},{x:-342,y:50},{x:-312,y:50},{x:-282,y:50},
{x:-179,y:50},{x:-149,y:50},{x:-119,y:50},{x:-89,y:50},{x:-59,y:50},
{x:44,y:50},{x:74,y:50},{x:104,y:50},{x:134,y:50},{x:164,y:50},
{x:266,y:50},{x:296,y:50},{x:326,y:50},{x:356,y:50},{x:386,y:50},
{x:34,y:269},{x:64,y:269},{x:94,y:269},{x:124,y:269},{x:154,y:269}
];

cc.Class({
    extends: cc.Component,

    properties: {
    	ANfanhui: {
    		default:null,
    		type: cc.Node
    	},
    	anniuWYSZ01: {
    		default:null,
    		type: cc.Node
    	},
    	ZJ: {
    		default: null,
    		type:cc.Node
    	},
    	LSJL: {
    		default: null,
    		type:cc.Node
    	},
    	ZYDB01: {
    		default: null,
    		type:cc.Node
    	},
    	winPrefab: {
    		default: null,
    		type:cc.Prefab
    	},
    	failPrefab: {
    		default: null,
    		type:cc.Prefab
    	},
    	bankerscontent: {
    		default: null,
    		type:cc.Node
    	},
    	bankerlist: {
    		default: null,
    		type:cc.Node
    	},
    	bankerlistX: {
            default: null,
            type: cc.Node
        },
    	beginbetnode: {
    		default: [],
    		type:cc.Node
    	},
        chips: {
            default: [],
            type:cc.Prefab
        },
        checked: {
            default: [],
            type:cc.Prefab
        },
    	chipbox: {
    		default: null,
    		type:cc.Node
    	},
        YZK: {
            default: [],
            type:cc.Node
        },
        pokerback: {
            default: null,
            type: cc.Prefab
        },
        dealpoker: {
            default: null,
            type: cc.Node
        },
        specialeffect: {
            default: null,
            type: cc.Node
        },
        countnum: {
        	default: [],
        	type: cc.Prefab
        },
    },
    backtoroomlist(){
    	//监听返回列表房间
		this.ANfanhui.on(cc.Node.EventType.TOUCH_END, function () {
            cc.director.loadScene('cattle');
        }, this);
        //设置庄家列表默认隐藏
    	this.bankerlist.active = false;
    	//监听庄家列表显示事件
        this.anniuWYSZ01.on(cc.Node.EventType.TOUCH_END, function () {
            this.bankerlist.active = true;
        }, this);
        //监听庄家列表隐藏点击事件
        this.bankerlistX.on(cc.Node.EventType.TOUCH_END, function () {
            this.bankerlist.active = false;
        }, this);
        // 获取筹码堆放区域的高宽
        for (var i = 0; i < this.YZK.length; i++) {
            cattleGlobal.chipinsize.push({wid:this.YZK[i].width,hei:this.YZK[i].height});
        }
        // 保存六块筹码的初始坐标
        for (var i = 0; i < this.chipbox.children.length; i++) {
            chipsposition.push({x:this.chipbox.children[i].x,y:this.chipbox.children[i].y});
        }
    },
    loadbankers() {
    	API.get('/api/niuniu/bankers', {roomId: GD.roomId}, (status, data)=>{
    		// 当前庄家的信息
    		this.ZJ.children[0].getComponent(cc.Label).string = (data.bankers[0].player.province || '')+(data.bankers[0].player.city || '');
    		this.ZJ.children[1].getComponent(cc.Label).string = data.bankers[0].player.username;
    		this.ZJ.children[2].getComponent(cc.Label).string = data.bankers[0].takeAmount;
    		data.bankers.forEach((item,index)=>{
    			var contentitem = new cc.Node();
    			var contentitem
    			console.log(item.player.username);
    		});
        });
    },
    loadLSJLandZYDB01() {
        API.get('/api/niuniu/history', {roomId:GD.roomId}, (status, data)=>{
        	// 四块区域历史胜利局数
    		this.LSJL.children[0].getComponent(cc.Label).string = data.dashboard.spadeWin;
    		this.LSJL.children[1].getComponent(cc.Label).string = data.dashboard.clubWin;
    		this.LSJL.children[2].getComponent(cc.Label).string = data.dashboard.heartWin;
    		this.LSJL.children[3].getComponent(cc.Label).string = data.dashboard.diamondWin;
    		// 遍历当前房间的历史记录并切换输赢图
    		data.history.forEach((item,index)=>{
    			if (item.spade) {
    				this.spawnNewwinPrefab(index*4,2);
    			} else {
    				this.spawnNewfailPrefab(index*4,2);
    			}
    			if (item.heart) {
    				this.spawnNewwinPrefab(index*4,3);
    			} else {
    				this.spawnNewfailPrefab(index*4,3);
    			}
    			if (item.club) {
    				this.spawnNewwinPrefab(index*4,4);
    			} else {
    				this.spawnNewfailPrefab(index*4,4);
    			}
    			if (item.diamond) {
    				this.spawnNewwinPrefab(index*4,5);
    			} else {
    				this.spawnNewfailPrefab(index*4,5);
    			}
            });
        });
    },
    // 当前用户上庄请求
    beBankerreq() {
    	API.put('/api/niuniu/beBanker', {takeAmount:'3000',roomId:GD.roomId}, (status, data)=>{
    		console.log(status,data);
        });
    },
    // 创建输的预制资源
    spawnNewwinPrefab(index,addnum) {
        var NewwinPrefab = cc.instantiate(this.winPrefab);
    	this.ZYDB01.addChild(NewwinPrefab);
		NewwinPrefab.setPosition(this.ZYDB01.children[index+addnum].x,this.ZYDB01.children[index+addnum].y);
    	this.ZYDB01.children[index+addnum].destroy();
    },
    //创建赢的预制资源
    spawnNewfailPrefab(index,addnum) {
        var NewfailPrefab = cc.instantiate(this.failPrefab);
    	this.ZYDB01.addChild(NewfailPrefab);
		NewfailPrefab.setPosition(this.ZYDB01.children[index+addnum].x,this.ZYDB01.children[index+addnum].y);
    	this.ZYDB01.children[index+addnum].destroy();
    },
    // 创建选中预制资源
    spawnCheckedChip(prefabindex,positionindex){
        // 在创建新的选中预制资源之前清除之前已经创建的预制资源
        if (this.chipbox.getChildByName("CM-xuanzhon")!=null) {
            this.chipbox.getChildByName("CM-xuanzhon").destroy();
        }
        var newChecked = cc.instantiate(this.checked[prefabindex]);
        this.chipbox.addChild(newChecked);
        newChecked.setPosition(chipsposition[positionindex].x,chipsposition[positionindex].y);
    },
    // 创建选中预制资源
    spawnCheckedYzk(prefabindex,positionX,positionY){
        // 在创建新的选中预制资源之前清除之前已经创建的预制资源
        if (this.specialeffect.getChildByName("YZK-xz")!=null) {
            this.specialeffect.getChildByName("YZK-xz").destroy();
        }
        var newChecked = cc.instantiate(this.checked[prefabindex]);
        this.specialeffect.addChild(newChecked);
        newChecked.setPosition(positionX,positionY);
    },
    // 默认筹码切换可选筹码
    tooglechips1() {
        for (var i = 0; i < this.chipbox.children.length; i++) {
            chipslist.push(this.chips[i+6]);
        }
        // 使用预制资源创建新的筹码节点，并给新创建的节点添加点击监听事件保存按钮下标，chipslist.length根据（用户携带筹码数/4）计算
        for (var i = 0; i < chipslist.length; i++) {
            var NewChipPrefab = cc.instantiate(chipslist[i]);
            this.chipbox.addChild(NewChipPrefab);
            NewChipPrefab.setPosition(this.chipbox.children[i].x,this.chipbox.children[i].y);
            NewChipPrefab.scaleX = 0.7;
            NewChipPrefab.scaleY = 0.7;
            if (i == 0) {
                NewChipPrefab.on(cc.Node.EventType.TOUCH_END, function () {
                    buttonindex = 1;
                    this.spawnCheckedChip(0,0);
                }, this);
            }else if(i == 1){
                NewChipPrefab.on(cc.Node.EventType.TOUCH_END, function () {
                    buttonindex = 5;
                    this.spawnCheckedChip(0,1);
                }, this);
            }else if(i == 2){
                NewChipPrefab.on(cc.Node.EventType.TOUCH_END, function () {
                    buttonindex = 10;
                    this.spawnCheckedChip(0,2);
                }, this);
            }else if(i == 3){
                NewChipPrefab.on(cc.Node.EventType.TOUCH_END, function () {
                    buttonindex = 15;
                    this.spawnCheckedChip(0,3);
                }, this);
            }else if(i == 4){
                NewChipPrefab.on(cc.Node.EventType.TOUCH_END, function () {
                    buttonindex = 20;
                    this.spawnCheckedChip(0,4);
                }, this);
            }else if(i == 5){
                NewChipPrefab.on(cc.Node.EventType.TOUCH_END, function () {
                    buttonindex = 25;
                    this.spawnCheckedChip(0,5);
                }, this);
            }
            this.chipbox.children[i].destroy();
        }
        this.chipin();
        this.dealPoker();
    },
    // 监听筹码下注区域的点击事件
    chipin() {
        for (var i = 0; i < this.YZK.length; i++) {
            this.YZK[i].on(cc.Node.EventType.TOUCH_END, function (event) {
                cattleGlobal.clickindexX = event.target.x;
                cattleGlobal.clickindexY = event.target.y;
                this.spawnCheckedYzk(1,cattleGlobal.clickindexX,cattleGlobal.clickindexY);
                switch(buttonindex){
                    case 1:
                    this.spawnSpecialChip(0);
                    break;
                    case 5:
                    this.spawnSpecialChip(1);
                    break;
                    case 10:
                    this.spawnSpecialChip(2);
                    break;
                    case 15:
                    this.spawnSpecialChip(3);
                    break;
                    case 20:
                    this.spawnSpecialChip(4);
                    break;
                    case 25:
                    this.spawnSpecialChip(5);
                    break;
                    default:
                    this.spawnSpecialChip(0);
                }
            }, this);
        }
    },
    // 创建有特效的筹码
    spawnSpecialChip(index) {
        cattleGlobal.ismove = true;
        var newChouma = cc.instantiate(this.chips[index+6]);
        this.specialeffect.addChild(newChouma);
    },
    dealPoker() {
        this.dealpoker.on(cc.Node.EventType.TOUCH_END, function () {
            var count = 0;
            this.schedule(function() {
                 // 这里的 this 指向 component
                 cattleGlobal.pokerPositonX = pokerpositions[count].x;
                 cattleGlobal.pokerPositonY = pokerpositions[count].y;
                this.spawnnewpoker();
                 count++;
            }, 0.1,pokerpositions.length-1, 0);
        }, this);
    },
    spawnnewpoker() {
        var newPoker = cc.instantiate(this.pokerback);
        newPoker.setPosition(350,280);
        this.specialeffect.addChild(newPoker);
    },
    countDowm(countdownnum) {
    	switch(countdownnum) {
    		case 15:
    		this.spawnCountnum(0);
    		break;
    		case 14:
    		this.spawnCountnum(1);
    		break;
    		case 13:
    		this.spawnCountnum(2);
    		break;
    		case 12:
    		this.spawnCountnum(3);
    		break;
    		case 11:
    		this.spawnCountnum(4);
    		break;
    		case 10:
    		this.spawnCountnum(5);
    		break;
    		case 9:
    		this.spawnCountnum(6);
    		break;
    		case 8:
    		this.spawnCountnum(7);
    		break;
    		case 7:
    		this.spawnCountnum(8);
    		break;
    		case 6:
    		this.spawnCountnum(9);
    		break;
    		case 5:
    		this.spawnCountnum(10);
    		break;
    		case 4:
    		this.spawnCountnum(11);
    		break;
    		case 3:
    		this.spawnCountnum(12);
    		break;
    		case 2:
    		this.spawnCountnum(13);
    		break;
    		case 1:
    		this.spawnCountnum(14);
    		break;
    		default:
    		this.spawnCountnum(15);

    	}
    },
    spawnCountnum(ind) {
    	if (this.beginbetnode[5].children.length != 0) {
    		this.beginbetnode[5].children.destroy();
    	}
    	var newCountnum = instantiate(this.countdownnum[ind]);
    	this.beginbetnode[5].addChild(newCountnum);
    },
    clickwysz(){
        // 监听上庄点击事件
        this.bankerlist.getChildByName("slider").getChildByName("anniu-WYSZ-01").on(cc.Node.EventType.TOUCH_END, function (event) {
               this.beBankerreq();
            }, this);
    },
    defaultscene() {
    	// 进房后默认场景
        this.beginbetnode[0].active = true;
        this.beginbetnode[1].active = false;
        this.beginbetnode[3].active = true;
        this.beginbetnode[2].active = false;
        this.beginbetnode[4].active = true;
    },
    beginbetscene() {
        //开始下注后场景
        this.ZJ.children[0].getComponent(cc.Label).string = (data.province || '')+(data.city || '');
        this.ZJ.children[1].getComponent(cc.Label).string = data.banker;
        this.ZJ.children[2].getComponent(cc.Label).string = data.bankerAmount;
        this.beginbetnode[0].active = false;
        this.beginbetnode[1].active = true;
        this.startChipInAction();
        this.beginbetnode[3].active = false;
        this.beginbetnode[4].active = false;
    },
    //开始下注图片进入特效
    startChipInAction() {
            this.beginbetnode[2].active = true;
            var scaleaction = cc.sequence(cc.show(),cc.scaleTo(0.5,0.7,0.7),cc.delayTime(0.5),cc.hide());
            this.beginbetnode[2].runAction(scaleaction);
            this.beginbetnode[2].scaleX = 0.2;
            this.beginbetnode[2].scaleY = 0.2;
    },

    onGameEvent(){
        let self = this;

        ZR_IO.on('game_ready', (data,status)=>{
            if(status){
                if(data.playerIds && data.playerIds.indexOf(GD.playerId)!=-1){
                    self._resetUIToDefault();
                    ZR_IO.emit('entering_room', {roomKey: data.roomKey});
                    ccUtil.modalLoading('匹配成功，并入房间');
                }
            }
        });

        ZR_IO.on('game_start', (data,status)=>{
            if(status){
                ccUtil.closeModal();
                //TODO: 玩家可以操作

            }
        });

        ZR_IO.on('begin_bet', (data,status)=>{
            console.log('begin_bet', status, data);
            if(status){
                this.beginbetscene();
            }
        });
        ZR_IO.on('deal', (data,status)=>{
            console.log('begin_bet', status, data);
            if(status){
                
            }
        });
    },
    onLoad () {
        this.onGameEvent();
        this.backtoroomlist();
        this.defaultscene();
        this.tooglechips1();
        // this.clickwysz();
    },

    start () {

    },

    update (dt) {
 
    },
});
