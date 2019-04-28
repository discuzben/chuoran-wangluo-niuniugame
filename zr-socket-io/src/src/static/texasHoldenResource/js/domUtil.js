var domUtil={
    timer:null,
    leftTime:0,
    step:0,
    showPanel:null,
    manipulatePanel:null,
    createNode:function(tagName,className){
        var node=document.createElement(tagName);
        if(className!==undefined){
            node.className=className;
        }
        return node;
    },
    getTimeStr:function(){
        var date=new Date();
        var time=date.getFullYear()+"-"+(date.getMonth()+1)+
        "-"+date.getDate()+"&nbsp&nbsp"+date.getHours()+":"+
        date.getMinutes()+":"+date.getSeconds();
        return "<span class='time'>时间："+time+"</span>";
    },
    getShowPanel:function(){
        if(this.showPanel===null){
            this.showPanel=document.getElementById('showPanel');
        }
        return this.showPanel;
    },
    getManipulatePanel:function(){
        if(this.manipulatePanel===null){
            this.manipulatePanel=document.getElementById('manipulatePanel');
        }
        return this.manipulatePanel;
    },
    mountShow:function(div){
        this.getShowPanel().appendChild(div);
    },
    mountMani:function(node){
        this.getManipulatePanel().appendChild(node);
    },
    writeStr:function(){
        var len=arguments.length;
        var str='';
        for(var i=0;i<len;i++){
            str=str+this.getObjectStr(arguments[i]);
        }
        var div=document.createElement('div');
        div.className='info';
        div.innerHTML=this.getTimeStr()+str;
        this.mountShow(div);
    },
    write:function(){
        if(arguments[0]!==undefined&&arguments[0].tagName!==undefined){
            this.writeNode.apply(this,arguments);
        }else{
            this.writeStr.apply(this,arguments);
        }
    },
    writeNode:function(vnode){
        var len=arguments.length;
        var str='';
        for(var i=1;i<len;i++){
            str=str+this.getObjectStr(arguments[i]);
        }
        var nodeName=vnode.tagName;
        var style=vnode.style;
        var className=vnode.className;
        var div=document.createElement(nodeName);
        if(style!==undefined){
            Object.keys(style).forEach(function(key){
                div.style[key]=style[key];
            });
        }
        if(className!==undefined){
                div.className=className;
        }
        div.innerHTML=this.getTimeStr()+str;
        this.mountShow(div);
    },
    writeArray:function(array){
        var me= this;
        array.forEach(function(item){
            me.write(item);
        });
    },
    isObject:function(obj){
        if(obj===null||obj===undefined)return false;
        var  flag=typeof obj==='object' && !(obj instanceof String);
        return flag;
    },
    getObjectStr:function(obj){
        var str='';
        var me=this;
        if(this.isObject(obj)){
            str="{";
            Object.keys(obj).forEach(function(key){
                var m='';
                if(me.isObject(obj[key])){
                    m=me.getObjectStr(obj[key]);
                }else{
                    m=obj[key];
                }
                if(str==='{'){
                    str=str+"<span class='key'>"+key+"</span>:"+m;
                }else{
                    str=str+','+"<span class='key'>"+key+"</span>:"+m;
                }
            });
            str=str+"}"; 
        }else{
            str=obj; 
        }
        return str;
    },
    loop:function(method,lefttime,step){
        this.leftTime=lefttime;
        let me=this;
        this.timer=setTimeout(function(){
            method();
            if(me.leftTime===0){
                me.clearTimer();
            }else{
                me.timer=me.loop(method,me.leftTime-step,step);
            }
        },step);
    },
    showAction:function(array){
        var len=array.length;
        var fragment=this.createNode('div','actionBar');
        for(var i=0;i<len;i++){
            var button=this.createNode('button','action');
            button.innerHTML=array[i].label;
            button.setAttribute('key',array[i].key);
            fragment.appendChild(button);
        }
        this.mountMani(fragment);
    },
    showTimer:function(leftTime){
        this.clearTimer();
        this.leftTime=leftTime;
        var me=this;
        var modal=document.createElement('div');
        modal.className='timer';
        modal.innerHTML=domUtil.getTimeStr()+"开始倒计时："+
        "<span class='lefttime'>"+Math.round(leftTime/1000)+"</span>";
        this.mountShow(modal);
        var clone=modal.cloneNode(true);
        this.mountMani(clone);
        this.loop(function(){
            var nodeList=me.getShowPanel().getElementsByClassName('lefttime');
            nodeList[nodeList.length-1].innerHTML=Math.round(me.leftTime/1000);
            var nodeList1=me.getManipulatePanel().getElementsByClassName('lefttime');
            if( nodeList1[nodeList1.length-1]!=undefined){
                nodeList1[nodeList1.length-1].innerHTML=Math.round(me.leftTime/1000);
            }
            if(me.leftTime.toFixed(0)===0){
                me.clearTimer();
            }
        },leftTime,1000);
        return ;
    },
    clearTimer:function(){
        if(this.timer!==null){
            clearTimeout(this.timer);
            this.timer=null;
        }
        this.clearManipulatePanel();
    },
    clearManipulatePanel:function(){
        this.getManipulatePanel().innerHTML='';
    }

}