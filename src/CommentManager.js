/**
 * Created by WhiteBlue on 16/2/9.
 */

function CommentManager(stage) {
    this.stage = stage;
    this.options = {
        className: "cmt",
        margin: 2,
        fresh: 10       //刷新频率
    };
    this.commentLine = [];      //总弹幕队列
    this.nowLine = [];          //当前播放弹幕
    this.position = 0;          //当前弹幕位置
    this.lastTime = 0;
    this.width = stage.offsetWidth;
    this.height = stage.offsetHeight;
    this.timer = null;


    //同屏队列插入新元素并重排序
    this.nowLinePush = function (pushCmt) {
        this.nowLine.push(pushCmt);
        //重新整理
        this.nowLine.sort(function (a, b) {
            if (a.y >= b.y) {
                return 1;
            } else {
                return -1;
            }
        });
    };

    //同屏队列移除元素并重排序
    this.nowLineRemove = function (removeCmt) {
        var index = this.nowLine.indexOf(removeCmt);
        if (index >= 0) {
            this.nowLine.splice(index, 1);
        }
        this.nowLine.sort(function (a, b) {
            if (a.y >= b.y) {
                return 1;
            } else {
                return -1;
            }
        });
    };

    this.setBounds = function () {
        this.width = this.stage.offsetWidth;
        this.height = this.stage.offsetHeight;
    };

    this.init = function () {
        this.setBounds();
    };

    this.startTimer = function () {
        if (this.timer) {
            return;
        }
        var cm = this;
        this.timer = window.setInterval(function () {
            //取时间差
            var elapsed = new Date().getTime() - cm.lastTime;
            cm.lastTime = new Date().getTime();
            cm.onTimerEvent(elapsed);
        }, this.options.fresh);
    };

    this.stopTimer = function () {
        window.clearInterval(this.timer);
        this.timer = 0;
    };

    //插入弹幕
    this.send = function (data) {
        var cmt;
        if (data.mode === 5 || data.mode === 4) {
            cmt = new StaticComment(this, data);
        } else if (data.mode === 1 || data.mode === 2 || data.mode === 6) {
            cmt = new ScrollComment(this, data);
        } else {
            console.log('不支持弹幕类型:' + data.mode);
            return;
        }

        //执行初始化,创建node
        cmt.init();

        //dom插入
        this.stage.appendChild(cmt.dom);

        cmt.layout();

        this.nowLinePush(cmt);
    };

    //跳转到指定时间
    this.seek = function (locateTime) {
        this.position = 0;
        this.position = this.locate(locateTime);
    };

    //定位弹幕队列
    this.locate = function (time) {
        for (var i = this.position; i < this.commentLine.length; i++) {
            var cm = this.commentLine[i];
            if (cm.stime >= time) {
                return i;
            }
        }
        //播放完毕
        return this.commentLine.length;
    };

    //按时间差更新弹幕队列
    this.time = function (betweenTime) {
        betweenTime -= 1;

        if (this.position >= this.commentLine.length) {
            return;
        }

        var end = this.locate(betweenTime);

        for (; this.position < end; this.position++) {
            this.send(this.commentLine[this.position]);
        }
        this.position = end;
    };

    //更新时间,移动弹幕
    this.onTimerEvent = function (timePassed) {
        var length = this.nowLine.length;
        for (var i = 0; i < length; i++) {
            var cmt = this.nowLine[i];
            if (!cmt.time(timePassed)) {
                this.remove(cmt);
                length--;
            }
        }
    };

    //加载弹幕
    this.load = function (timeLine) {
        this.commentLine = timeLine;
        this.commentLine.sort(function (a, b) {
            if (a.stime >= b.stime) {
                return 1;
            } else {
                return -1;
            }
        });
    };

    //移除弹幕
    this.remove = function (rmObj) {
        this.nowLineRemove(rmObj);
        try {
            this.stage.removeChild(rmObj.dom);
        } catch (e) {
            console.log(e);
            console.log(rmObj);
        }
    };


    //清除舞台
    this.clear = function () {
        while (this.nowLine.length > 0) {
            this.remove(this.nowLine[0]);
        }
    };
}