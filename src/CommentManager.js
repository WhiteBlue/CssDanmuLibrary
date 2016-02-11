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
    this.nowLinePush = function (cmtObj) {
        this.nowLine.push(cmtObj);
        //重新整理
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
        //动画初始化
        //this.stage.style.perspective = this.width * Math.tan(40 * Math.PI / 180) / 2 + "px";
        //this.stage.style.webkitPerspective = this.width * Math.tan(40 * Math.PI / 180) / 2 + "px";
    };

    this.init = function () {
        this.setBounds();
    };

    this.start = function () {
        if (this.timer) {
            return;
        }
        var cm = this;
        this.timer = window.setInterval(function () {
            //取时间差
            var elapsed = new Date().getTime() - cm.lastTime;
            cm.lastTime = new Date().getTime();
            cm.onTimerEvent(elapsed, cm);
        }, this.options.fresh);
    };

    this.stop = function () {
        window.clearInterval(this.timer);
        this.timer = 0;
    };

    //在当前队列插入弹幕
    this.send = function (data) {
        var cmt;
        if (data.mode === 5 || data.mode === 4) {
            cmt = new StaticComment(this, data);
        } else {
            //cmt = new CommentObject(this, data);
            return;
        }

        //对齐方式判定
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
        }

        //执行初始化,创建node
        cmt.init();

        //dom插入
        this.stage.appendChild(cmt.dom);

        cmt.layout();

        this.nowLinePush(cmt);
    };

    //跳转到指定时间
    this.locate = function (locateTime) {
        this.position = 0;
        this.position = this.seek(locateTime);
    };

    //定位弹幕队列
    this.seek = function (time) {
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
            console.log('播放完成');
            return;
        }

        var end = this.seek(betweenTime);

        for (; this.position < end; this.position++) {
            this.send(this.commentLine[this.position]);
        }
        this.position = end;
    };

    //更新时间,移动弹幕
    this.onTimerEvent = function (timePassed, cmObj) {
        for (var i = 0; i < cmObj.nowLine.length; i++) {
            var cmt = cmObj.nowLine[i];
            cmt.time(timePassed);
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
    this.remove = function (cmObj) {
        this.stage.removeChild(cmObj.dom);
        var index = this.nowLine.indexOf(cmObj);
        if (index >= 0) {
            this.nowLine.splice(index, 1);
        }
    };
}