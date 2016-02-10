/**
 * Created by WhiteBlue on 16/2/4.
 */


var CommentManager = (function () {
    function CommentManager(stageObject) {
        var __timer = 0;
        this.stage = stageObject;
        this.options = {
            global: {
                opacity: 1,
                scale: 1,
                className: "cmt"
            },
            scroll: {
                opacity: 1,
                scale: 1
            },
            limit: 0
        };
        //总弹幕
        this.timeline = [];
        //已渲染弹幕
        this.runline = [];

        this.position = 0;
        this.filter = null;
        //弹幕舞台
        this.csa = {
            //滚动
            scroll: new CommentSpaceAllocator(0, 0),
            //顶部
            top: new AnchorCommentSpaceAllocator(0, 0),
            //底部
            bottom: new AnchorCommentSpaceAllocator(0, 0),
            //变换
            reverse: new CommentSpaceAllocator(0, 0),
            //底部滚动
            scrollbtm: new CommentSpaceAllocator(0, 0)
        };

        //舞台大小初始化
        this.width = this.stage.offsetWidth;
        this.height = this.stage.offsetHeight;

        //计时器开始方法
        this.startTimer = function () {
            if (__timer > 0)
                return;
            var lastTPos = new Date().getTime();
            var cmMgr = this;
            //时间更新方法
            __timer = window.setInterval(function () {
                //时间间隔
                var elapsed = new Date().getTime() - lastTPos;
                //更新lasttime
                lastTPos = new Date().getTime();
                cmMgr.onTimerEvent(elapsed, cmMgr);
            }, 10);
        };

        //计时器停止方法
        this.stopTimer = function () {
            window.clearInterval(__timer);
            __timer = 0;
        };
    }

    //停止计时器
    CommentManager.prototype.stop = function () {
        this.stopTimer();
    };

    //开始计时器
    CommentManager.prototype.start = function () {
        this.startTimer();
    };

    //大小设置
    CommentManager.prototype.setBounds = function () {
        this.width = this.stage.offsetWidth;
        this.height = this.stage.offsetHeight;
        //容器们大小初始化
        for (var comAlloc in this.csa) {
            this.csa[comAlloc].setBounds(this.width, this.height);
        }
        //动画初始化
        //this.stage.style.perspective = this.width * Math.tan(40 * Math.PI / 180) / 2 + "px";
        //this.stage.style.webkitPerspective = this.width * Math.tan(40 * Math.PI / 180) / 2 + "px";
    };

    //寻找当前时间点的弹幕index , 同时刷新position
    CommentManager.prototype.seek = function (time) {
        this.position = BinArray.bsearch(this.timeline, time, function (innerTime, b) {
            if (innerTime < b.stime) {
                return -1;
            }
            else if (innerTime > b.stime) {
                return 1;
            }
            else return 0;
        });
    };

    //弹幕发送
    CommentManager.prototype.send = function (data) {
        //判断弹幕滚动还是固定
        var cmt = (data.mode === 1 || data.mode === 2 || data.mode === 6) ? new CSSScrollComment(this, data) : cmt = new CoreComment(this, data);

        //弹幕位置判定
        switch (cmt.mode) {
            case 1:
                cmt.align = 0;
                break;
            case 2:
                cmt.align = 2;
                break;
            case 4:
                cmt.align = 2;
                break;
            case 5:
                cmt.align = 0;
                break;
            case 6:
                cmt.align = 1;
                break;
        }
        //弹幕初始化
        cmt.init();
        //dom元素插入舞台
        this.stage.appendChild(cmt.dom);
        //弹幕对象绑定各自容器
        switch (cmt.mode) {
            case 1:
                this.csa.scroll.add(cmt);
                break;
            case 2:
                this.csa.scrollbtm.add(cmt);
                break;
            case 4:
                this.csa.bottom.add(cmt);
                break;
            case 5:
                this.csa.top.add(cmt);
                break;
            case 6:
                this.csa.reverse.add(cmt);
                break;
            case 7:
            {
                if (data.rY !== 0 || data.rZ !== 0) {
                    cmt.dom.style.transform = getRotMatrix(data.rY, data.rZ);
                    cmt.dom.style.webkitTransform = getRotMatrix(data.rY, data.rZ);
                    cmt.dom.style.OTransform = getRotMatrix(data.rY, data.rZ);
                    cmt.dom.style.MozTransform = getRotMatrix(data.rY, data.rZ);
                    cmt.dom.style.MSTransform = getRotMatrix(data.rY, data.rZ);
                }
            }
                break;
        }
        //推入当前弹幕链
        this.runline.push(cmt);
    };


    //@todo: time是什么到底
    CommentManager.prototype.time = function (time) {
        //注 : time是时间间隔
        time = time - 1;
        if (this.position >= this.timeline.length || Math.abs(this.lastPos - time) >= 2000) {
            this.seek(time);
            this.lastPos = time;
            if (this.timeline.length <= this.position) {
                //全部弹幕播放完毕
                return;
            }
        } else {
            //初始化上次位置
            this.lastPos = time;
        }
        for (; this.position < this.timeline.length; this.position++) {
            if (this.timeline[this.position]['stime'] <= time) {
                //发送弹幕
                console.log(this.timeline[this.position]);
                //this.send(this.timeline[this.position]);
            } else {
                //弹幕开始时间超过当前时间 , 结束循环
                break;
            }
        }
    };


    //时间更新,使timeline中的弹幕运动
    CommentManager.prototype.onTimerEvent = function (timePassed, cmObj) {
        for (var i = 0; i < cmObj.runline.length; i++) {
            var cmt = cmObj.runline[i];
            //if (cmt.hold) {
            //    continue;
            //}
            //弹幕移动
            cmt.time(timePassed);
        }
    };

    //结束时移除弹幕
    CommentManager.prototype.finish = function (cmt) {
        this.stage.removeChild(cmt.dom);
        //从当渲染弹幕中移除
        var index = this.runline.indexOf(cmt);
        if (index >= 0) {
            this.runline.splice(index, 1);
        }
        //从容器中移除
        switch (cmt.mode) {
            default:
            case 1:
            {
                this.csa.scroll.remove(cmt);
            }
                break;
            case 2:
            {
                this.csa.scrollbtm.remove(cmt);
            }
                break;
            case 4:
            {
                this.csa.bottom.remove(cmt);
            }
                break;
            case 5:
            {
                this.csa.top.remove(cmt);
            }
                break;
            case 6:
            {
                this.csa.reverse.remove(cmt);
            }
                break;
            case 7:
                break;
        }
    };


    //舞台清除
    CommentManager.prototype.clear = function () {
        while (this.runline.length > 0) {
            this.runline[0].finish();
        }
    };


    //CommentManager初始化
    CommentManager.prototype.init = function () {
        //初始化大小
        this.setBounds();
    };


    //弹幕加载
    CommentManager.prototype.load = function (timeline) {
        this.timeline = timeline;
        //按照开始时间(stime)重排序
        this.timeline.sort(function (a, b) {
            if (a.stime > b.stime) return 2;
            else if (a.stime < b.stime) return -2;
            else {
                if (a.date > b.date) return 1;
                else if (a.date < b.date) return -1;
                else if (a.dbid != null && b.dbid != null) {
                    if (a.dbid > b.dbid) return 1;
                    else if (a.dbid < b.dbid) return -1;
                    return 0;
                } else
                    return 0;fontSize
            }
        });
    };


    return CommentManager;
})();