
cc.Class({
    extends: cc.Component,

    properties: {
        layoutNode: cc.Node
    },

    loadGameRes(cb){
      let self = this;
      cc.loader.loadRes("images/cattle_room_item", cc.SpriteAtlas, function (err, res) {
        if(!err){
          cb && cb.call(self,true,res);
        }else{
          cb && cb.call(self,false,res,err);
        }
      });
    },

    loadGameList(atlas){
      let self = this;

      API.post('/api/game/hall/listBygameId', {gameId: CD.gameTypes[2].gameId}, (status, data)=>{
          let roomPretab;
          let nodeArr = [];
          let nodesAdd = ()=>{
            nodeArr.sort(MyUtil.compareUp(nodeArr,'sort'));
            nodeArr.forEach((item)=>{
              self.layoutNode.addChild(item.node);
            });
          }

          data.list.forEach((item)=>{
            let dealNode = ()=>{
              var node = cc.instantiate(roomPretab);
              node.position = cc.v2(0, 0);

              node.getChildByName('label_rc').getComponent(cc.Label).string += item.less;
              node.getChildByName('label_dz').getComponent(cc.Label).string += item.bottom;

              //判断房间级别，加载不同内容
              if(atlas){
                let altaName;
                if(item.hallId == 1){ //初级场
                  altaName = 'minbull';
                }else if(item.hallId == 2){
                  altaName = 'maxbull';
                }
                if(altaName){
                  node.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(altaName);
                }
              }

              self.bindScrollItemEvent(node, ()=>{
                self.enterRoom(item);
              });

              nodeArr.push({sort:item.hallId, node: node});
              if(nodeArr.length == data.list.length){
                nodesAdd.call(self);
              }
            };
            
            // zhajinhua_room_item
            if(roomPretab){
              dealNode();
            }else{
              cc.loader.loadRes("prefabs/cattle_room_item", cc.Prefab, (err, prefab) => {
                roomPretab = prefab;
                cc.loader.setAutoRelease(prefab, true);
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
    
    enterRoom(hallItem){
      let experience = GD.player.experience || 0;
      if(experience < hallItem.less){
        ccUtil.modalTip('余额不够进入：' + experience);
        return;
      }

      //TODO：进入房间校验
      GD.current.hallItem = hallItem;
      cc.director.loadScene(CD.gameTypes[2].gameSceneName);
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

    back(){

    },

    getToken(){
      return GD.token = MyUtil.getQueryString('token') || '7ddb168e6e024ddb8cf732c5f30cb10c';
    },

    initSocketIo(){
      window.ZR_IO && ZR_IO.destroy();

      let self = this;
      //实例化全局socket.io
      let roomParams = {};
      let socketCb = (connectStatus, roomData, isJoinRoomOk)=>{
          console.log('连接结果 - ', connectStatus, isJoinRoomOk, roomData);
          
      };
      window.initSocketIo(roomParams, socketCb);
    },

    onLoad () {
      let self = this;

      ccUtil.modalLoading('数据加载中...');

      GD.gameRoomType = 1;
      delete GD.current.hallItem;

      this.getToken();

      this.initSocketIo();

      ZR_IO.emit('player_info',{},(info)=>{
        console.log('playerInfo', info);

        if(info.playerInfo && typeof info.playerInfo == 'object'){
          GD.player = info.playerInfo;
          GD.playerId = info.playerInfo.playerId;

          self.loadGameRes((status,data)=>{
            if(status){
              self.loadGameList(data);
    
              ccUtil.closeModal();
            }else{
              ccUtil.modalLoading('资源载入失败');
            }
          });

        }else{
          ccUtil.modalLoading('无效Token');
        }
      });
      
		},

    start () {

    },

    // update (dt) {},
});
