/**
 * @file 焦点图广告展示
 * @author：张少龙（zhangshaolongjj@163.com）
 */
(function (root, factory) {
    var focus = factory();
    if (typeof define === 'function') {
        define(function() {
            return focus;
        });
    } else {
        root.Focus = focus;
    }
})(this, function () {
    var Focus = function(options){
        this.interval = options.interval || 5;
        this.speed = options.speed || 300;
        this.currentIndex = 0;
        this.holder = options.holder;
        this.stepTimer = null;
        this.changerTimer = null;
        this.switchInterval = options.switchInterval || 4000;
        this.pauseable = options.pauseable;
        this.wheelable = options.wheelable;
        build(this, this.holder = options.holder);
    };
    Focus.prototype.play = function(){
        move(this, 0);
    };
    Focus.prototype.load = function(resources, onloaded){
        var res0, len;
        resources && (len = resources.length) && (res0 = resources[0]);
        if(res0){
            var constructor = res0.constructor;
            if(String === constructor){
                var content = res0;
                for(var i=1; i<len; i++){
                    var resource = resources[i];
                    content += resource;
                }
                this.resourceHolder.innerHTML = content;
                var nodes = this.resourceHolder.childNodes;
                for(var i=0; i<len; i++){
                    var resource = nodes[i];
                    resource.className = resource.className
                        ? resource.className + ' focus-resource'
                        : 'focus-resource';
                    resource.style.width = this.width + 'px';
                    resource.style.height = this.height + 'px';
                }
            }else if(res0.nodeName){
                for(var i=0,len=resources.length; i<len; i++){
                    var resource = resources[i];
                    resource.className = resource.className
                        ? resource.className + ' focus-resource'
                        : 'focus-resource';
                    resource.style.width = this.width + 'px';
                    resource.style.height = this.height + 'px';
                    this.resourceHolder.appendChild(resource.cloneNode(true));
                }
            }
            var pager = document.createElement('div');
            pager.className = 'focus-pager';
            pager.style.width = this.width + 'px';
            var pages = this.pages = [];
            for(var i=len; i>0; i--){
                var page = document.createElement('div');
                page.className = 'focus-page unselected';
                page.innerHTML = i;
                pager.appendChild(page);
                pages[i - 1] = page;
            }
            addEvent(this);
            this.container.appendChild(pager);
            this.resourceHolder.style.width = this.width * len + 'px';
            onloaded && onloaded(this);
        }
    };
    
    var build = function(o, node){
        var width = o.width = node.clientWidth;
        var height = o.height = node.clientHeight;
        var container = o.container = document.createElement('div');
        container.className = 'focus-container';
        container.style.width = width + 'px';
        container.style.height = height + 'px';
        container.style.position = 'relative';
        var resourceHolder = o.resourceHolder = document.createElement('div');
        resourceHolder.className = 'resource-holder';
        resourceHolder.style.height = height + 'px';
        resourceHolder.style.left = '0px';
        node.appendChild(container);
        container.appendChild(resourceHolder);
    };
    var move = function(o, nextIndex){
        clearInterval(o.stepTimer);
        clearTimeout(o.changerTimer);
        if (nextIndex < 0) {
            nextIndex = 0;
        }
        if (nextIndex >= o.pages.length) {
            nextIndex = o.pages.length - 1;
        }
        o.pages[o.currentIndex].className = 'focus-page unselected'
        o.pages[nextIndex].className = 'focus-page selected';
        o.currentIndex = nextIndex;
        var left = parseFloat(o.resourceHolder.style.left);
        var distance = - nextIndex * o.width - left;
        var flg = distance > 0 ? 1 : -1;
        var step = distance / o.speed * o.interval;
        var offset = left;
        var len = o.pages.length;
        o.stepTimer = setInterval(function(){
            offset = offset + step;
            if(flg * (offset - left - distance) >= 0){
                clearInterval(o.stepTimer);
                o.resourceHolder.style.left = -nextIndex * o.width + 'px';
                o.changerTimer = setTimeout(function(){
                    nextIndex++;
                    if(nextIndex === len){
                        nextIndex = 0;
                    }
                    move(o, nextIndex);
                }, o.switchInterval);
            }else{
                o.resourceHolder.style.left = offset + 'px';
            }
        }, o.interval);
    };
    var addEvent = function(o){
        var pages = o.pages;
        for(var i=0,len=pages.length; i<len; i++){
            var page = pages[i];
            page.onclick = (function(i){
                return function(){
                    move(o, i);
                };
            })(i);
        }
        if (o.pauseable) {
                o.resourceHolder.onmouseover = function(){
                clearInterval(o.stepTimer);
                clearTimeout(o.changerTimer);
            };
            o.resourceHolder.onmouseout = function(){
                move(o, o.currentIndex);
            };
        }
        if (o.wheelable) {
            var scrollFunc = function (e) {
                e = e || window.event;
                var isNega = null;
                if (e.wheelDelta) {
                    isNega = -e.wheelDelta;
                } else if (e.detail) {
                    isNega = e.detail;
                }
                if (isNega > 0) {
                    move(o, o.currentIndex + 1);
                } else {
                    move(o, o.currentIndex - 1);
                }
            }
            if (document.addEventListener) {
                document.addEventListener('DOMMouseScroll', scrollFunc, false);
            } 
            document.onmousewheel = scrollFunc;
        }
    };
    return Focus;
});
