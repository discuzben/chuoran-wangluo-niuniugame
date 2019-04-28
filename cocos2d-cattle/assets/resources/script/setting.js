
cc.Class({
    extends: cc.Component,

    properties: {
        settingBtn: cc.Node,
        settingPanel: cc.Node,
        advicePage: cc.Node,
        setPage: cc.Node,
        exitPage: cc.Node,
        helpPage: cc.Node,
        paitypePage: cc.Node,
        recordPage: cc.Node,
        musicSwitchNode: cc.Node,
        effectSwitchNode: cc.Node,
        adviceEdit: cc.EditBox,
        musiceSlider: cc.Slider,
        effectSlider: cc.Slider,
        recordItemPrefab: cc.Prefab,
        recordContent: cc.Node
    },

    _emitEvent(name, data){
        cc.director.emit('emit-setting-'+name, data);
    },

    settingMain(isForce,isOpen){
        if(isForce === true){
            this.isSettingOpen = !!isOpen;
        }else{
            this.isSettingOpen = !this.isSettingOpen;
        }
        if(this.isSettingOpen){
            // this.settingBtn.runAction(cc.rotateTo(0.2, -90));
            this.settingPanel.active = true;
        }else{
            // this.settingBtn.runAction(cc.rotateTo(0.2, 0));
            this.settingPanel.active = false;
        }
    },

    submitAdvice(){
        let text = this.adviceEdit;
        if(text){
            API.post('/api/game/feedback', {gameId: GD.current.hallItem.gameId, content: text, playerId: GD.playerId}, (status, result)=>{
                if(status){
                    ccUtil.modalTip();
                }else{
                    console.log(result);
                }
            });
        }

        this.closeModal();
    },

    closeModal(){
        let self = this;
        let _modal = this._modal;
        if(_modal){
            delete this._modal;
            _modal.runAction(cc.sequence(cc.scaleTo(0.1, 0.3), cc.callFunc(()=>{
                _modal.active = false;
            })));
        }
    },

    sliderCtrl(sender, sign){
        let percent = Math.round(sender.progress*10)/10;
        let targetNode = sender.node.getChildByName('light');
        targetNode.width = sender.node.width*percent;
        if(sign == 'music'){
            window.AudioCtrl.setMusicVolume(percent);
        }else if(sign == 'effect'){
            window.AudioCtrl.setEffectVolume(percent);
        }
    },

    musicSwitch(){
        this.musicOff = !this.musicOff;
        this.musicSwitchNode.getChildByName('on').active = !this.musicOff;
        this.musicSwitchNode.getChildByName('off').active = !!this.musicOff;

        window.AudioCtrl.muteMusic(this.musicOff);
    },

    effectSwitch(){
        this.effectOff = !this.effectOff;
        this.effectSwitchNode.getChildByName('on').active = !this.effectOff;
        this.effectSwitchNode.getChildByName('off').active = !!this.effectOff;

        window.AudioCtrl.muteEffect(this.effectOff);
    },

    menuCtrl(event, sign){
        this.closeModal();

        if(sign == 'exit'){
            this._modal = this.exitPage;
        }else if(sign == 'set'){
            this._modal = this.setPage;
        }else if(sign == 'record'){
            this._modal = this.recordPage;
        }else if(sign == 'paiType'){
            this._modal = this.paitypePage;
        }else if(sign == 'help'){
            this._modal = this.helpPage;
        }else if(sign == 'advice'){
            this._modal = this.advicePage;
        }
            
        if(this._modal){
            this._modal.setScale(0.3);
            this._modal.active = true;
            this._modal.runAction(cc.scaleTo(0.1, 1));

            if(sign == 'set'){
                this.initSet();
            }else if(sign == 'record'){
                this.initRecord();
            }
        }

        this.settingMain(true, false);
    },

    _showRecords(){
        this.recordData.forEach((item,index)=>{
            let itemNode = cc.instantiate(this.recordItemPrefab);
            itemNode.parent = this.recordContent;

            // #EBC561  dealOperate
            let moneyNode = cc.find('row_layout/money', itemNode);
            if(item.amount >= 0){
                item.amount = '+'+item.amount;
                moneyNode.color = new cc.Color(233,192,99); 
            }else{
                moneyNode.color = new cc.Color(90,214,73);
            }

            ccUtil.setLabelString(itemNode,'row_layout/index', index+1);
            ccUtil.setLabelString(itemNode,'row_layout/room', item.hallName);
            ccUtil.setLabelString(itemNode,'row_layout/money', item.amount);
            ccUtil.setLabelString(itemNode,'row_layout/time', item.recordTime);
        });
    },

    _getRecordData(){
        let self = this;
        API.post('/api/user/queryStatements',{gameId: GD.current.hallItem.gameId, pageSize: 10, currentPageNum: this.recordPageNum}, (status,data)=>{
            if(status && data){
                self.recordPageNum ++;
                self.recordData = self.recordData.concat(data.logs);
                self._showRecords();
            }
        });
    },

    initRecord(){
        this.recordPageNum = 1;
        this.recordData = [];
        this.recordContent.removeAllChildren();
        this._getRecordData();
    },

    initSet(){
        this.musiceSlider.progress = GD.setting.musicVolume*1;
        this.effectSlider.progress = GD.setting.effectVolume*1;

        this.musicLightBarWidget.right = 1 - this.musiceSlider.progress;
        this.effectLightBarWidget.right = 1 - this.effectSlider.progress;

        this.musicOff = GD.setting.isMusicMute;
        this.effectOff = GD.setting.isEffectMute;
        
        this.musicSwitchNode.getChildByName('on').active = !this.musicOff;
        this.musicSwitchNode.getChildByName('off').active = !!this.musicOff;

        this.effectSwitchNode.getChildByName('on').active = !this.effectOff;
        this.effectSwitchNode.getChildByName('off').active = !!this.effectOff;
    },

    exitCancel(){
        this.closeModal();
    },

    exitSure(){
        this._emitEvent('exit');
        this.closeModal();
    },

    onLoad(){
        window.ttt = this;

        this.musicLightBarWidget = this.musiceSlider.node.getChildByName('light').getComponent(cc.Widget);
        this.effectLightBarWidget = this.effectSlider.node.getChildByName('light').getComponent(cc.Widget);
    },

    onDestroy () {
        cc.audioEngine.stopAll();
    },
});
