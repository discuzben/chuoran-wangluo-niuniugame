"use strict";
cc._RF.push(module, '8000cop7k9JspAJcqAS3lju', 'Audio');
// resources/script/Audio.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...

        bgVolume: 1.0, // 背景音量

        deskVolume: 1.0, //   房间 房间音量

        bgAudioID: -1 //   背景 音乐  id
    },

    // use this for initialization
    init: function init() {
        var t = cc.sys.localStorage.getItem("bgVolume");
        if (t != null) {
            this.bgVolume = parseFloat(t);
        }

        var t = cc.sys.localStorage.getItem("deskVolume");

        if (t != null) {
            this.deskVolume = parseFloat(t);
        }

        cc.game.on(cc.game.EVENT_HIDE, function () {
            cc.audioEngine.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            cc.audioEngine.resumeAll();
        });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    getUrl: function getUrl(url) {
        return cc.url.raw("resources/audio/" + url);
    },

    playBGM: function playBGM(url, bgVolume) {
        var audioUrl = this.getUrl(url);
        if (this.bgAudioID >= 0) {
            cc.audioEngine.stop(this.bgAudioID);
        }
        if (bgVolume != null) {
            this.setBGMVolume(bgVolume);
        }
        this.bgAudioID = cc.audioEngine.play(audioUrl, true, this.bgmVolume);
    },

    playSFX: function playSFX(url) {
        var audioUrl = this.getUrl(url);
        if (this.deskVolume > 0) {
            var audioId = cc.audioEngine.play(audioUrl, false, this.deskVolume);
        }
    },

    stopBGM: function stopBGM() {
        if (this.bgAudioID >= 0) {
            cc.audioEngine.stop(this.bgAudioID);
            this.bgAudioID = null;
        }
    },

    setSFXVolume: function setSFXVolume(v) {
        if (this.deskVolume != v) {
            cc.sys.localStorage.setItem("deskVolume", v);
            this.deskVolume = v;
        }
    },
    getState: function getState() {
        return cc.audioEngine.getState(this.bgAudioID);
    },
    setBGMVolume: function setBGMVolume(v, force) {
        if (this.bgAudioID >= 0) {
            if (v > 0 && cc.audioEngine.getState(this.bgAudioID) === cc.audioEngine.AudioState.PAUSED) {
                cc.audioEngine.resume(this.bgAudioID);
            } else if (v == 0) {
                cc.audioEngine.pause(this.bgAudioID);
            }
        }
        if (this.bgVolume != v || force) {
            cc.sys.localStorage.setItem("bgVolume", v);
            this.bgmVolume = v;
            cc.audioEngine.setVolume(this.bgAudioID, v);
        }
    },

    pauseAll: function pauseAll() {
        cc.audioEngine.pauseAll();
    },

    resumeAll: function resumeAll() {
        cc.audioEngine.resumeAll();
    }
});

cc._RF.pop();