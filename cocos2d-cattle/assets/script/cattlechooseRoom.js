var roomitemposi = [{x:199,y:176},{x:604,y:175},{x:205,y:-266},{x:654,y:-268},{x:377,y:-46}];
cc.Class({
    extends: cc.Component,

    properties: {
        layoutNode: cc.Node,
        bg: {
          url: cc.AudioClip,
          default:null
        }
    },
    loadGameRes(cb){
      let self = this;
      cc.loader.loadRes("/hall/QZNN-DT-ZY", cc.SpriteAtlas, function (err, res) {
        if(!err){
          cb && cb.call(self,true,res);
        }else{
          cb && cb.call(self,false,res,err);
        }
      });
    },

    loadGameList(atlas){
      let self = this;

      API.get('/api/game/hall/listBygameId', {gameId: CD.gameTypes[2].gameId}, (status, result)=>{
          let roomPretab;
          let nodeArr = [];
          let nodesAdd = ()=>{
            nodeArr.sort(MyUtil.compareUp(nodeArr,'sort'));
            nodeArr.forEach((item)=>{
              self.layoutNode.addChild(item.node);
            });
          }

          for(let r in result){
            if(r != '抢庄场'){
              continue;
            }

            let dataList = result[r];
            dataList.forEach((item,index)=>{
              let dealNode = ()=>{
                var node = cc.instantiate(roomPretab);
                node.position = cc.v2(roomitemposi[index].x, roomitemposi[index].y);

                var less = new cc.Node('Label');
                var lb1 = less.addComponent(cc.Label);
                lb1.string = "底注:" + item.bottom;
                lb1.fontSize = 35;
                node.addChild(less);
                if (index == 1 || index == 4) {
                  less.setPosition(cc.v2(0,100));
                }else{
                  less.setPosition(cc.v2(-50,100));
                }

                var boottom = new cc.Node('Label');
                var lb2 = boottom.addComponent(cc.Label);
                lb2.string = "入场:" + item.less;
                lb2.fontSize = 35;
                var color = new cc.Color(255,235,4);
                boottom.color = color;
                // color.setA(#F8E692);
                node.addChild(boottom);
                if (index == 4) {
                  boottom.setPosition(cc.v2(0,-100));
                }else if(index == 1){
                  boottom.setPosition(cc.v2(10,-100));
                }
                else{
                  boottom.setPosition(cc.v2(-50,-100));
                }

                //判断房间级别，加载不同内容
                if(atlas){
                  let altaName;
                  if(item.hallId == 7){ //初级场
                    altaName = 'DT-FJ-XS';
                  }else if(item.hallId == 8){
                    altaName = 'DT-FJ-CJ';
                  }else if(item.hallId == 9){
                    altaName = 'DT-FJ-ZJ';
                  }else if(item.hallId == 10){
                    altaName = 'DT-FJ-GJ';
                  }else if(item.hallId == 20){
                    altaName = 'DT-FJ-ZZ';
                  }
                  if(altaName){
                    node.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(altaName);
                  }
                }

                self.bindScrollItemEvent(node, ()=>{
                  self.enterRoom(item);
                });

                nodeArr.push({sort:item.hallId, node: node});
                if(nodeArr.length == dataList.length){
                  nodesAdd.call(self);
                }
              };
              
              // zhajinhua_room_item
              if(roomPretab){
                dealNode();
              }else{
                cc.loader.loadRes("prefab/roomname", cc.Prefab, (err, prefab) => {
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
        }
      });

    },
    
    enterRoom(hallItem){
      let experience = GD.player.experience || 0;
      if(experience < hallItem.less){
        ccUtil.modalTip('余额不够进入：' + experience);
        return;
      }

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
      if(CC_DEBUG){
        GD.token = MyUtil.getQueryString('token') || '7ddb168e6e024ddb8cf732c5f30cb10c';
      }else{
        GD.token = MyUtil.getQueryString('token');
      }
      return GD.token;
    },

    initSocketIo(){
      window.ZR_IO && ZR_IO.destroy();

      let self = this;
      //实例化全局socket.io
      let roomParams = {};
      let socketCb = (connectStatus, roomData, isJoinRoomOk)=>{
          console.log('连接结果 - ', connectStatus, isJoinRoomOk, roomData);
          if(connectStatus == false){
            cc.director.loadScene(CD.gameTypes[1].roomListScene);
          }
      };
      window.initSocketIo(roomParams, socketCb);
    },

    onLoad () {
      let self = this;

      ccUtil.modalLoading('数据加载中...');

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
      // cc.director.preloadScene(CD.gameTypes[1].gameSceneName,function() {
      //    cc.log("Next scene preloaded");
      // });
      
		},

    start () {

    },

    // update (dt) {},
});
