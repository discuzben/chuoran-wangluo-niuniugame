window.__ccModal = null;
let ccModal = function(){
    if(window.__ccModal){
        return window.__ccModal;
    }else{
        window.__ccModal = this;
    }
}

ccModal.prototype._modal = function(msg, cb, seconds){
    let self = this;
    this.close();

    let setCb = ()=>{
        let node = cc.instantiate(window.__modalPrefab);

        ccUtil.setLabelString(node, 'container/text', msg || '');

        node.parent = cc.director.getScene();
        node.active = true;

        window.__modalNode = node;
        
        if(seconds != null){
            let scheNode = node.children[0]._components[0];
            scheNode.schedule(()=>{
                if(--seconds <= 0){
                    scheNode.unscheduleAllCallbacks();
                    self.close();
                    cb && cb();
                }
            }, 1);
        }else{
            cb && cb();
        }
    };
    if(window.__modalPrefab){
        setCb();
    }else{
        cc.loader.loadRes('public/modal',(err,prefab)=>{
            if(err){
                cc.error('loadRes - modal 失败', err.message || err);
                return;
            }
            if(prefab instanceof cc.Prefab){
                window.__modalPrefab = prefab;
                setCb();
            }
        });
        
    }
}

ccModal.prototype.close = function(){
    window.__modalNode && window.__modalNode.destroy();
}

ccModal.prototype.loading = function(msg){
    this._modal.apply(this,[msg]);
}

ccModal.prototype.tip = function(msg,cb,seconds){
    this._modal.apply(this,[msg,cb,seconds || 2]);
}


let ccUtil = {
    setLabelString(targetNode, childName, text){
        if(childName){
            let arr = childName.split('/').forEach((item)=>{
                targetNode = targetNode.getChildByName(item);
            });
        }
        if(targetNode){
            targetNode.getComponent(cc.Label).string = text==null?'':text
        }
    },
    labelInterval(targetNode,childName,seconds,cb){
        if(childName){
            let arr = childName.split('/').forEach((item)=>{
                targetNode = targetNode.getChildByName(item);
            });
        }

        let labelCom = targetNode.getComponent(cc.Label);

        cb && cb(labelCom,seconds);
        let sched = labelCom.schedule(()=>{
            if(--seconds <= 0){
                labelCom.unscheduleAllCallbacks();
            }
            cb && cb(labelCom,seconds);
        }, 1);
    },
    modalLoading(msg){
        new ccModal().loading(msg);
    },
    modalTip(msg,cb,seconds){
        new ccModal().tip(msg,cb,seconds);
    },
    closeModal(){
        new ccModal().close();
    }
};

window.ccUtil = ccUtil;