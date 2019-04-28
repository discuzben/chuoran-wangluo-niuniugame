cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function(e){
            window.AudioCtrl.resumeAudio();
        });
        this.node.on(cc.Node.EventType.MOUSE_ENTER, function(e){
            window.AudioCtrl.resumeAudio();
        });
        this.node.on(cc.Node.EventType.MOUSE_DOWN, function(e){
            window.AudioCtrl.resumeAudio();
        });
    },

});
