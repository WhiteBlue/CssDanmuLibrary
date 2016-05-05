/**
 * Created by WhiteBlue on 16/2/9.
 */

function CommentManager(stage) {
    this.stage = stage;
    this.options = {
        indexOffset: 0,     //弹幕层偏移
        className: "cmt",
        margin: 1,
        fresh: 10,          //刷新频率
        global: {
            opacity: 1,
            scale: 1
        },
        scroll: {
            opacity: 1,
            scale: 1
        },
        limit: 0
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
        if (this.nowLine[this.nowLine.length - 1].offsetY() <= pushCmt.offsetY()) {
            this.nowLine.push(pushCmt);
            return;
        }
        if (this.nowLine[0].offsetY() >= pushCmt.offsetY()) {
            this.nowLine.unshift(pushCmt);
            return;
        }
        var low = 0;
        var high = this.nowLine.length - 1;

        var i = 0;
        var insertIndex = 0;
        while (low < high) {
            i = Math.floor((high + low + 1) / 2);
            if (this.nowLine[i - 1].offsetY() <= pushCmt.offsetY() && this.nowLine[i].offsetY() >= pushCmt.offsetY()) {
                insertIndex = i;
                break;
            }
            if (this.nowLine[i - 1].offsetY() > pushCmt.offsetY()) {
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
    };

    this.init = function () {
        this.setBounds();
        this.position = 0;
    };

    //插入弹幕
    this.send = function (data) {
        var cmt;
        if (data.mode === 5 || data.mode === 4) {
            cmt = new StaticComment(this, data);
        } else if (data.mode === 1 || data.mode === 2 || data.mode == 6) {
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
        //播放结束
        if (this.nowLine.length === 0 && this.position === this.commentLine.length) {
            return;
        }

        nowTime -= 1;

        if (this.position < this.commentLine.length) {
            var end = this.locate(nowTime);

            for (; this.position < end; this.position++) {
                this.send(this.commentLine[this.position]);
            }
            this.position = end;
        }

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
        this.position = 0;
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
        this.stage.removeChild(rmObj.dom);
    };


    //清除舞台
    this.clear = function () {
        while (this.nowLine.length > 0) {
            this.remove(this.nowLine[0]);
        }
    };
}