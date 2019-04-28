
cc.Class({
    extends: cc.Component,

    properties: {
        layoutNode: cc.Node,
        gameSceneName: ''
    },

    loadGameList(){
        let self = this;
        API.get('/api/game/list', null, (status, data)=>{
            let atlas;
            console.log(data);
            data.list.forEach((item)=>{
                
                let dealNode = ()=>{
                    let node = new cc.Node('game_'+item.gameId);
                    node.setPosition(50, 50);
                    let spriteComp = node.addComponent(cc.Sprite);
                    
                    let gameScene, altaName;
    
                    if(item.gameId == CD.gameTypes['1'].gameId){
                        gameScene = CD.gameTypes['1'].roomListScene || CD.gameTypes['1'].gameSceneName;
                        altaName = 'lan-cn-game5';
                    }else if(item.gameId == CD.gameTypes['2'].gameId){
                        gameScene = CD.gameTypes['2'].roomListScene || CD.gameTypes['2'].gameSceneName;
                        altaName = 'lan-cn-game3';
                    }else if(item.gameId == CD.gameTypes['3'].gameId){
                        gameScene = CD.gameTypes['3'].roomListScene || CD.gameTypes['3'].gameSceneName;
                        altaName = 'lan-cn-game4';
                    }

                    if(gameScene){
                        spriteComp.spriteFrame = atlas.getSpriteFrame(altaName);

                        self.bindScrollItemEvent(node, ()=>{
                            cc.director.loadScene(gameScene);
                        });
                    }

                    self.layoutNode.addChild(node);
                };

                if(atlas){
                    dealNode();
                }else{
                    cc.loader.loadRes("hall/game1", cc.SpriteAtlas, function (err, res) {
                        atlas = res;
                        dealNode();
                    });
                }
                
                // cc.loader.loadRes('bg_info', cc.SpriteFrame, (err,res)=>{
                //     spriteComp.spriteFrame.spriteFrame = res;
                // });

                //self.layoutNode.updateLayout();
            });
        });
    },
    
    bindScrollItemEvent(node, cb){
        let isTouchMove = false, self = this, _x, _y;

        node.on(cc.Node.EventType.TOUCH_START, function(event){
            _x = event.touch._point.x, _y = event.touch._point.y;
            self.isTouchMove = false;
        });
        node.on(cc.Node.EventType.TOUCH_CANCEL, function(event){
            self.isTouchMove = false;
        });
        node.on(cc.Node.EventType.TOUCH_MOVE, function(event){
            let maxStep = Math.max(Math.abs(event.touch._point.x - _x), Math.abs(event.touch._point.y - _y));
            if(maxStep > 5){
                self.isTouchMove = true;
            }
        });
        node.on(cc.Node.EventType.TOUCH_END, function(event){
            if(self.isTouchMove == false){
                cb && cb.call(self);
            }
        });
    },

    exit(){
        GD.token = null;
        GD.player = null;
        GD.playerId = null;
        cc.director.loadScene('game');
    },

    onLoad() {
        // window.ZR_IO && ZR_IO.destroy();

        // this.loadGameList();
    },

    start () {
        //TODO: 大厅场景持久化
        //cc.game.addPersistRootNode(myNode);

    },

    // update (dt) {},
});
