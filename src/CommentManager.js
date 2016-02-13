/**
 * Created by WhiteBlue on 16/2/9.
 */

function CommentManager(stage) {
    this.stage = stage;
    this.options = {
        className: "cmt",
        indexOffset: 0,        //弹幕层偏移
        margin: 1,
        fresh: 10               //刷新频率
    };
    this.commentLine = [];      //总弹幕队列
    this.nowLine = [];          //当前播放弹幕
    this.position = 0;          //当前弹幕位置
    this.width = stage.offsetWidth;
    this.height = stage.offsetHeight;

    this.startTimer = function () {
        for (var i = 0; i < this.nowLine.length; i++) {
            if (this.nowLine[i].control) {
                this.nowLine[i].start();
            }
        }
    };


    this.stopTimer = function () {
        for (var i = 0; i < this.nowLine.length; i++) {
            if (this.nowLine[i].control) {
                this.nowLine[i].stop();
            }
        }
    };

    //同屏队列适当位置插入新元素
    this.nowLinePush = function (pushCmt) {
        if (this.nowLine.length === 0) {
            this.nowLine.push(pushCmt);
            return;
        }
        if (this.nowLine[this.nowLine.length - 1].y <= pushCmt.y) {
            this.nowLine.push(pushCmt);
            return;
        }
        if (this.nowLine[0].y >= pushCmt.y) {
            this.nowLine.unshift(pushCmt);
            return;
        }
        var low = 0;
        var high = this.nowLine.length - 1;

        var i = 0;
        var insertIndex = 0;
        while (low < high) {
            i = Math.floor((high + low + 1) / 2);
            if (this.nowLine[i - 1].y <= pushCmt.y && this.nowLine[i].y >= pushCmt.y) {
                insertIndex = i;
                break;
            }
            if (this.nowLine[i - 1].y > pushCmt.y) {
                high = i - 1;
            } else {
                low = i;
            }
        }
        this.nowLine.splice(insertIndex, 0, pushCmt);
    };

    //同屏队列移除元素
    this.nowLineRemove = function (removeCmt) {
        var index = this.nowLine.indexOf(removeCmt);
        if (index >= 0) {
            this.nowLine.splice(index, 1);
        }
    };

    this.setBounds = function () {
        this.width = this.stage.offsetWidth;
        this.height = this.stage.offsetHeight;
        this.initAnimation();
    };

    this.init = function () {
        this.setBounds();
    };

    //插入弹幕
    this.send = function (data) {
        var cmt;
        if (data.mode === 5 || data.mode === 4) {
            cmt = new StaticComment(this, data);
        } else if (data.mode === 1 || data.mode === 2) {
            cmt = new ScrollComment(this, data);
        } else {
            console.log('不支持的弹幕');
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
    this.time = function (nowTime) {
        nowTime -= 1;

        if (this.position >= this.commentLine.length) {
            return;
        }

        var end = this.locate(nowTime);

        for (; this.position < end; this.position++) {
            this.send(this.commentLine[this.position]);
        }
        this.position = end;

        //弹幕过期检查
        var length = this.nowLine.length;
        for (var i = 0; i < length; i++) {
            var cmt = this.nowLine[i];
            if (!cmt.checkTime(nowTime)) {
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


    this.initAnimation = function () {
        var animation = "@keyframes cmt-move { to {  right: " + this.width + "px;  } }";
        if (document.styleSheets && document.styleSheets.length) {
            //避免重复定义
            for (var i = 0; i < document.styleSheets[0].rules.length; i++) {
                if (document.styleSheets[0].rules[i].name === "cmt-move") {
                    document.styleSheets[0].removeRule(i);
                    break;
                }
            }
            document.styleSheets[0].insertRule(animation, 0);
        }
    }
}