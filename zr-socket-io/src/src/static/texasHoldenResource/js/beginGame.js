    //游戏开始发布玩家，座位，庄家等信息。
    ZR_IO.on('beginGame', (data, status) => { 
        if (status) {
            texasHoldem.initData(data.game);
            var players=texasHoldem.players;
            var seatsInfo=texasHoldem.seatsInfo;
            domUtil.write("begin_game!"); 
            domUtil.write("当前房间详情："); 
            domUtil.write("当前房间信息（type：Object）：",texasHoldem.info);   
            domUtil.write("当前房间座位信息（type：Object）："); 
            Object.keys(texasHoldem.seatsInfo).forEach(function(key){
                domUtil.write(key+"=",texasHoldem.seatsInfo[key]);  
            }); 
            domUtil.write("当前所有玩家（type：Object）："); 
            Object.keys(players).forEach(function(key){
                domUtil.write(key+"=",texasHoldem.players[key]);  
            }); 
            domUtil.write("当前庄家：",texasHoldem.banker);
            domUtil.write("当前玩家的座位：",texasHoldem.currentPlayer.seatNumber);
            domUtil.write("荷官正在洗牌......");  
        }
    });
    ZR_IO.on('kanpai', function(data, status){ 
        if (status) {
            var title=data.title;
            domUtil.write("荷官正在发牌......"); 
            domUtil.write("第一次发牌：每人发2张牌!"); 
            domUtil.write("你的头两张牌是："); 
            domUtil.write(title);            
        }
    });
    //游戏进入第一轮。
   /* ZR_IO.on('deal', function(data, status){ 
        if (status) {
            domUtil.write("荷官正在发牌......"); 
            domUtil.write("第一次发牌：每人发2张牌!");          
        }
    });*/
    //下小盲注。
    ZR_IO.on("sb",function(data,status){
        var seat=data.seat;
        texasHoldem.initData(data.game);
        domUtil.write("庄家左手边1号投小盲注：",seat); 
        domUtil.write("庄家左手边1号玩家信息：",texasHoldem.getPlayerInfo(seat.playerId));  
        domUtil.write("投注额：",seat.bet); 
        domUtil.write("该玩家累计投注额：",seat.totalBetNum);                
    });
     //下大盲注。
    ZR_IO.on('bb',function(data,status){
        var seat=data.seat;
        texasHoldem.initData(data.game);
        domUtil.write("庄家左手边2号投大盲注：",seat); 
        domUtil.write("庄家左手边2号玩家信息：",texasHoldem.getPlayerInfo(seat.playerId));         
        domUtil.write("投注额：",seat.bet); 
        domUtil.write("该玩家累计投注额：",seat.totalBetNum);
    });
    //游戏进入第二轮。
    ZR_IO.on('turn',function(data,status){
        var publicPokes=data.publicPokes;
        var title=data.title;
        let game=data.game;
        texasHoldem.initData(data.game);
        domUtil.write("游戏进入第二轮"); 
        domUtil.write("荷官正在发出三张公牌..."); 
        domUtil.write("发出的三张公牌为:");
        domUtil.writeArray(publicPokes);
        domUtil.write("你的最大牌型是："); 
        domUtil.write(title);
        domUtil.write("当前的游戏公共信息有:",game);
        domUtil.write("场上仍活着的玩家:");
        var seats=texasHoldem.seatsInfo;
        Object.keys(seats).forEach(function(key){
            var seat=seats[key];
            if(seat.playStatus===true){
                domUtil.write("座位号:",seat.seatNumber,'玩家id号：',
                texasHoldem.getPlayerInfo(seat.playerId));
            }
        });
        domUtil.write("小盲注座位号:",texasHoldem.getSbSeat()); 
    });
     //游戏进入第三轮。
    ZR_IO.on('flop',function(data,status){
        var publicPokes=data.publicPokes;
        var title=data.title;
        let game=data.game;
        texasHoldem.initData(data.game);
        domUtil.write("游戏进入第三轮"); 
        domUtil.write("荷官正在发出第四张公牌..."); 
        domUtil.write("发出的第四张公牌为:",publicPokes[0]);
        domUtil.write("你的最大牌型是："); 
        domUtil.write(title);
        domUtil.write("当前的游戏公共信息有:",game);
        domUtil.write("场上仍活着的玩家:");
        var seats=texasHoldem.seatsInfo;
        Object.keys(seats).forEach(function(key){
            var seat=seats[key];
            if(seat.playStatus===true){
                domUtil.write("座位号:",seat.seatNumber,'玩家id号：',
                texasHoldem.getPlayerInfo(seat.playerId));
            }
        });
        domUtil.write("小盲注座位号:",texasHoldem.getSbSeat()); 
    });
     //游戏进入第四轮。
    ZR_IO.on('river',function(data,status){
        var publicPokes=data.publicPokes;
        var title=data.title;
        let game=data.game;
        texasHoldem.initData(data.game);
        domUtil.write("游戏进入第四轮，该轮为本游戏最后一轮"); 
        domUtil.write("荷官正在发出第五张公牌..."); 
        domUtil.write("发出的第五张公牌为:",publicPokes[0]);  
        domUtil.write("你的最大牌型是："); 
        domUtil.write(title);
        domUtil.write("当前的游戏公共信息有:",game);  
        domUtil.write("场上仍活着的玩家:");
        var seats=texasHoldem.seatsInfo;
        Object.keys(seats).forEach(function(key){
            var seat=seats[key];
            if(seat.playStatus===true){
                domUtil.write("座位号:",seat.seatNumber,'玩家id号：',
                texasHoldem.getPlayerInfo(seat.playerId));
            }
        }); 
        domUtil.write("小盲注座位号:",texasHoldem.getSbSeat());    
    });
    ZR_IO.on('dealLeftPokes',function(data,status){
        var publicPokes=data.publicPokes;
        var title=data.title;
        let game=data.game;
        texasHoldem.initData(data.game);
        domUtil.write("荷官正在发出剩余的所有公共牌....."); 
        domUtil.write("剩余的公共牌如下：");  
        domUtil.writeArray(publicPokes);  
        domUtil.write("你的最大牌型是："); 
        domUtil.write(title);
        domUtil.write("当前的游戏公共信息有:",game);  
        domUtil.write("场上仍活着的玩家:");
        var seats=texasHoldem.seatsInfo;
        Object.keys(seats).forEach(function(key){
            var seat=seats[key];
            if(seat.playStatus===true){
                domUtil.write("座位号:",seat.seatNumber,'玩家id号：',
                texasHoldem.getPlayerInfo(seat.playerId));
            }
        }); 
        domUtil.write("小盲注座位号:",texasHoldem.getSbSeat());    
    });
    //比牌
    ZR_IO.on('headsUp',function(data,status){
        var winSeats=data.winSeats;
        var aliveSeats=data.aliveSeats;
        texasHoldem.initData(data.game);
        domUtil.write("比牌"); 
        domUtil.write("参与比牌的玩家:"); 
        domUtil.writeArray(aliveSeats);
        if(winSeats.length>1){
            domUtil.write("本局有多位玩家的牌大小相同：这些玩家共同赢得本场游戏"); 
            domUtil.writeArray(winSeats);
        }else{
            domUtil.write("比牌胜利的玩家为：");
            domUtil.writeArray(winSeats);
        }
          
    });
    //游戏结束
    ZR_IO.on('gameOver',function(data,status){
        var winSeats=data.winSeats;
        texasHoldem.initData(data.game);
        domUtil.write("游戏结束了"); 
        domUtil.write("场上依然活着的玩家为："); 
        let len=winSeats.length;
        
        
        domUtil.write('座位信息：');
        domUtil.writeArray(winSeats); 
        domUtil.write('玩家信息：');  
        for(var i;i<len;i++){
            domUtil.write(texasHoldem.getPlayerInfo(winSeats[i].playerId));
        }
    });
     //游戏进入结算阶段
    ZR_IO.on('balanceAccount',function(data,status){
        let game=data.game;
        texasHoldem.initData(data.game);
        domUtil.write("游戏进入结算阶段"); 
        domUtil.write("本局游戏所有玩家累计投注额：",game.totalBetNum.toFixed(2)); 
        let seats=game.seatsInfo;
        let keys=Object.keys(seats);
        let len=keys.length;
        for(var i=0;i<len;i++){
            var seat=seats[keys[i]];
            var player=texasHoldem.getPlayerInfo(seat.playerId);
            if(seat.playStatus===true){
                domUtil.write("玩家",player.username,"+",seat.winBetNum); 
            }else{
                domUtil.write("玩家",player.username,"-",seat.totalBetNum); 
            }          
        }
        
    });
    //接收游戏发生错误时的消息
    ZR_IO.on('error',function(data,status){
        var error=data.error;
        domUtil.write(error); 
        
    });
    //玩家弃牌操作。
    ZR_IO.on('turnTo',function(data,status){
        var seat=data.seat;
        texasHoldem.initData(data.game);
        let game=data.game;
        domUtil.write('轮到座位号为',seat.seatNumber,'的玩家操作'); 
        domUtil.write('座位信息：',seat);
        domUtil.write('玩家信息：',texasHoldem.getPlayerInfo(seat.playerId));  
        domUtil.write("该玩家上一次投注额：",seat.bet); 
        domUtil.write("该玩家累计投注额：",seat.totalBetNum);
        domUtil.write("玩家剩余可操作时间：",seat.leftTime); 
        domUtil.write("开始倒计时！"); 
        var leftTime=texasHoldem.getAccurateLeftTime(seat.leftTime,data.timeStamp)
        domUtil.showTimer(leftTime);
        if(seat.playerId===texasHoldem.currentPlayer.playerId){
            domUtil.showAction(seat.choice);
        }
    });
     //玩家过牌操作。
    ZR_IO.on('pass',function(data,status){
        domUtil.clearTimer();
        var seat=data.seat;
        texasHoldem.initData(data.game);
        domUtil.write("座位号为：",seat.seatNumber,'的玩家过牌了'); 
        domUtil.write('座位信息：',seat);
        domUtil.write('玩家信息：',texasHoldem.getPlayerInfo(seat.playerId));  
        domUtil.write("该玩家上一次投注额：",seat.bet); 
        domUtil.write("该玩家累计投注额：",seat.totalBetNum);
    });
    //玩家弃牌操作。
    ZR_IO.on('fold',function(data,status){
        domUtil.clearTimer();
        var seat=data.seat;
        texasHoldem.initData(data.game);
        domUtil.write("座位号为：",seat.seatNumber,'的玩家弃牌了'); 
        domUtil.write('座位信息：',seat);
        domUtil.write('玩家信息：',texasHoldem.getPlayerInfo(seat.playerId));  
        domUtil.write("该玩家上一次投注额：",seat.bet); 
        domUtil.write("该玩家累计投注额：",seat.totalBetNum);
    });
    //玩家跟注操作。
    ZR_IO.on('call',function(data,status){
        domUtil.clearTimer();
        var seat=data.seat;
        texasHoldem.initData(data.game);
        domUtil.write("座位号为：",seat.seatNumber,'的玩家跟注'); 
        domUtil.write('座位信息：',seat);
        domUtil.write('玩家信息：',texasHoldem.getPlayerInfo(seat.playerId));  
        domUtil.write("该玩家投注额：",seat.bet); 
        domUtil.write("该玩家累计投注额：",seat.totalBetNum);
    });
     //玩家加注操作。
     ZR_IO.on('raise',function(data,status){
        domUtil.clearTimer();
        var seat=data.seat;
        texasHoldem.initData(data.game);
        domUtil.write("座位号为：",seat.seatNumber,'的玩家跟注'); 
        domUtil.write('座位信息：',seat);
        domUtil.write('玩家信息：',texasHoldem.getPlayerInfo(seat.playerId));  
        domUtil.write("该玩家投注额：",seat.bet); 
        domUtil.write("该玩家累计投注额：",seat.totalBetNum);
    });
     //玩家allIn操作。
    ZR_IO.on('allIn',function(data,status){
        domUtil.clearTimer();
        var seat=data.seat;
        texasHoldem.initData(data.game);
        domUtil.write("座位号为：",seat.seatNumber,'的玩家allIn'); 
        domUtil.write('座位信息：',seat);
        domUtil.write('玩家信息：',texasHoldem.getPlayerInfo(seat.playerId));  
        domUtil.write("该玩家投注额：",seat.bet); 
        domUtil.write("该玩家累计投注额：",seat.totalBetNum);
    });
     //玩家看牌操作。
     ZR_IO.on('check',function(data,status){
        domUtil.clearTimer();
        var pokes=data.pokes;
        domUtil.write("您选择了看牌"); 
        domUtil.write("您的底牌为"); 
        domUtil.writeArray(pokes);
       
    });
     //接手某位玩家看牌操作。
    ZR_IO.on('oneCheck',function(data,status){
        var seat=data.seat;
        texasHoldem.initData(data.game);
        domUtil.write("座位号为：",seat.seatNumber,'的玩家看牌了'); 
        domUtil.write('座位信息：',seat);
        domUtil.write('玩家信息：',texasHoldem.getPlayerInfo(seat.playerId));  
        domUtil.write("该玩家投注额：",seat.bet); 
        domUtil.write("该玩家累计投注额：",seat.totalBetNum);
    });
    //玩家看牌操作。
    ZR_IO.on('autoCall',function(data,status){
        domUtil.clearTimer();
        var seat=data.seat;
        domUtil.write("座位号为：",seat.seatNumber,"的玩家自动跟注了"); 
        domUtil.write("玩家信息："); 
        domUtil.write(texasHoldem.getPlayerInfo(seat.playerId));  
        domUtil.write("该玩家投注额：",seat.bet); 
        domUtil.write("该玩家累计投注额：",seat.totalBetNum);
    });
    domUtil.getManipulatePanel().addEventListener('click',function(event){
        var target=event.target;
        if(target.className==='action'){
            var key=target.getAttribute('key');
            switch(key){
                case'pass':texasHoldem.pass();break;
                case'fold':texasHoldem.fold();break;
                case'call':texasHoldem.call();break;
                case'autoCall':texasHoldem.autoCall();break;
                case'raise':texasHoldem.raise();break;
                case'check':texasHoldem.check();break;
                case'allIn':texasHoldem.allIn();break;
            }
        }
    },false)
    
    