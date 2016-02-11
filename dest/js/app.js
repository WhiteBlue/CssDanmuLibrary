/**
 * Created by WhiteBlue on 16/2/10.
 */

var __extends = function (SubType, SuperType) {
    var __prototype = function () {
    };
    __prototype.prototype = SuperType.prototype;
    var proto = new __prototype();
    proto.constructor = SubType;
    SubType.prototype = proto;
};

/**
 * Bilibili Format Parser
 * @license MIT License
 * Takes in an XMLDoc/LooseXMLDoc and parses that into a Generic Comment List
 **/
function BilibiliParser(xmlDoc) {
    function format(string) {
        // Format the comment text to be JSON Valid.
        return string.replace(/\t/, "\\t");
    }
    var elems = xmlDoc.getElementsByTagName('d');

    var tlist = [];
    for (var i = 0; i < elems.length; i++) {
        if (elems[i].getAttribute('p') != null) {
            var opt = elems[i].getAttribute('p').split(',');
            if (!elems[i].childNodes[0])
                continue;
            var text = elems[i].childNodes[0].nodeValue;
            var obj = {};
            obj.stime = Math.round(parseFloat(opt[0]) * 1000);
            obj.mode = parseInt(opt[1]);
            obj.size = parseInt(opt[2]);
            obj.color = parseInt(opt[3]);
            obj.date = parseInt(opt[4]);
            obj.pool = parseInt(opt[5]);
            obj.position = "absolute";
            if (opt[7] != null)
                obj.dbid = parseInt(opt[7]);
            obj.hash = opt[6];
            obj.border = false;
            if (obj.mode < 7) {
                obj.text = text.replace(/(\/n|\\n|\n|\r\n)/g, "\n");
            } else {
                if (obj.mode == 7) {
                    try {
                        adv = JSON.parse(format(text));
                        obj.shadow = true;
                        obj.x = parseFloat(adv[0]);
                        obj.y = parseFloat(adv[1]);
                        if (Math.floor(obj.x) < obj.x || Math.floor(obj.y) < obj.y) {
                            obj.position = "relative";
                        }
                        obj.text = adv[4].replace(/(\/n|\\n|\n|\r\n)/g, "\n");
                        obj.rZ = 0;
                        obj.rY = 0;
                        if (adv.length >= 7) {
                            obj.rZ = parseInt(adv[5], 10);
                            obj.rY = parseInt(adv[6], 10);
                        }
                        obj.motion = [];
                        obj.movable = false;
                        if (adv.length >= 11) {
                            obj.movable = true;
                            var singleStepDur = 500;
                            var motion = {
                                x: {from: obj.x, to: parseFloat(adv[7]), dur: singleStepDur, delay: 0},
                                y: {from: obj.y, to: parseFloat(adv[8]), dur: singleStepDur, delay: 0},
                            };
                            if (adv[9] !== '') {
                                singleStepDur = parseInt(adv[9], 10);
                                motion.x.dur = singleStepDur;
                                motion.y.dur = singleStepDur;
                            }
                            if (adv[10] !== '') {
                                motion.x.delay = parseInt(adv[10], 10);
                                motion.y.delay = parseInt(adv[10], 10);
                            }
                            if (adv.length > 11) {
                                obj.shadow = adv[11];
                                if (obj.shadow === "true") {
                                    obj.shadow = true;
                                }
                                if (obj.shadow === "false") {
                                    obj.shadow = false;
                                }
                                if (adv[12] != null) {
                                    obj.font = adv[12];
                                }
                                if (adv.length > 14) {
                                    // Support for Bilibili Advanced Paths
                                    if (obj.position === "relative") {
                                        console.log("Cannot mix relative and absolute positioning");
                                        obj.position = "absolute";
                                    }
                                    var path = adv[14];
                                    var lastPoint = {x: motion.x.from, y: motion.y.from};
                                    var pathMotion = [];
                                    var regex = new RegExp("([a-zA-Z])\\s*(\\d+)[, ](\\d+)", "g");
                                    var counts = path.split(/[a-zA-Z]/).length - 1;
                                    var m = regex.exec(path);
                                    while (m !== null) {
                                        switch (m[1]) {
                                            case "M":
                                            {
                                                lastPoint.x = parseInt(m[2], 10);
                                                lastPoint.y = parseInt(m[3], 10);
                                            }
                                                break;
                                            case "L":
                                            {
                                                pathMotion.push({
                                                    "x": {
                                                        "from": lastPoint.x,
                                                        "to": parseInt(m[2], 10),
                                                        "dur": singleStepDur / counts,
                                                        "delay": 0
                                                    },
                                                    "y": {
                                                        "from": lastPoint.y,
                                                        "to": parseInt(m[3], 10),
                                                        "dur": singleStepDur / counts,
                                                        "delay": 0
                                                    }
                                                });
                                                lastPoint.x = parseInt(m[2], 10);
                                                lastPoint.y = parseInt(m[3], 10);
                                            }
                                                break;
                                        }
                                        m = regex.exec(path);
                                    }
                                    motion = null;
                                    obj.motion = pathMotion;
                                }
                            }
                            if (motion !== null) {
                                obj.motion.push(motion);
                            }
                        }
                        obj.dur = 2500;
                        if (adv[3] < 12) {
                            obj.dur = adv[3] * 1000;
                        }
                        var tmp = adv[2].split('-');
                        if (tmp != null && tmp.length > 1) {
                            var alphaFrom = parseFloat(tmp[0]);
                            var alphaTo = parseFloat(tmp[1]);
                            obj.opacity = alphaFrom;
                            if (alphaFrom !== alphaTo) {
                                obj.alpha = {from: alphaFrom, to: alphaTo}
                            }
                        }
                    } catch (e) {
                        console.log('[Err] Error occurred in JSON parsing');
                        console.log('[Dbg] ' + text);
                    }
                } else if (obj.mode == 8) {
                    obj.code = text; //Code comments are special
                }
            }
            if (obj.text != null)
                obj.text = obj.text.replace(/\u25a0/g, "\u2588");
            tlist.push(obj);
        }
    }
    return tlist;
}

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

        this.stage.style.perspective = this.width * Math.tan(40 * Math.PI / 180) / 2 + "px";
        this.stage.style.webkitPerspective = this.width * Math.tan(40 * Math.PI / 180) / 2 + "px";
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
        } else if (data.mode === 1 || data.mode === 2) {
            cmt = new ScrollComment(this, data);
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
            this.nowLine[0].finish();
        }
    };
}
/**
 * Created by WhiteBlue on 16/2/9.
 */

// @todo 重叠判定
//全局使用相对坐标
var CommentObject = (function () {
    function CommentObject(manager, init) {
        this.align = 0;
        this.index = 0;
        this.mode = 1;
        this.stime = 0;
        this.text = "";
        this.lastTime = 4000;
        this.lifeTime = 4000;
        this.movable = false;
        this._size = 25;
        this._color = 0xffffff;
        this.manager = manager;

        if (init.hasOwnProperty("align")) {
            this.align = init["align"];
        }
        if (init.hasOwnProperty("stime")) {
            this.stime = init["stime"];
        }
        if (init.hasOwnProperty("text")) {
            this.text = init["text"];
        }
        if (init.hasOwnProperty("mode")) {
            this.mode = init["mode"];
        }
        if (init.hasOwnProperty("color")) {
            this._color = init["color"];
        }
        if (init.hasOwnProperty("size")) {
            this._size = init["size"];
        }
        if (init.hasOwnProperty("x")) {
            this._x = init["x"];
        }
        if (init.hasOwnProperty("y")) {
            this._y = init["y"];
        }
    }

    //取得/设置相对x轴坐标
    Object.defineProperty(CommentObject.prototype, "x", {
        get: function () {
            if (this._x === null || this._x === undefined) {
                if (this.align % 2 === 0) {
                    //左对齐
                    this._x = this.dom.offsetLeft - this.manager.stage.offsetLeft;
                } else {
                    //右对齐
                    this._x = this.manager.stage.offsetWidth - (this.dom.offsetLeft - this.manager.stage.offsetLeft + this.dom.offsetWidth);
                }
            }
            return this._x;
        },
        set: function (x) {
            this._x = x;
            if (this.align % 2 === 0) {
                this.dom.style.left = this._x + "px";
            } else {
                this.dom.style.right = this._x + "px";
            }
        },
        enumerable: true,
        configurable: true
    });

    //取得/设置相对y轴坐标
    Object.defineProperty(CommentObject.prototype, "y", {
        get: function () {
            if (this._y === null || this._y === undefined) {
                if (this.align < 2) {
                    //上对齐
                    this._y = this.dom.offsetTop;
                } else {
                    //下对齐
                    this._y = this.manager.stage.offsetHeight - (this.dom.offsetTop + this.dom.offsetHeight);
                }
            }
            return this._y;
        },
        set: function (y) {
            this._y = y;
            if (this.align < 2) {
                this.dom.style.top = this._y + "px";
            } else {
                this.dom.style.top = (this.manager.stage.offsetHeight - y - this.dom.offsetHeight) + "px";
            }
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(CommentObject.prototype, "color", {
        get: function () {
            return this._color;
        },
        set: function (c) {
            this._color = c;
            var color = c.toString(16);
            color = color.length >= 6 ? color : new Array(6 - color.length + 1).join("0") + color;
            this.dom.style.color = "#" + color;
            if (this._color === 0) {
                this.dom.className = this.manager.options.className + " rshadow";
            }
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(CommentObject.prototype, "width", {
        get: function () {
            if (this._width === null || this._width === undefined) {
                this._width = this.dom.offsetWidth;
            }
            return this._width;
        },
        set: function (w) {
            this._width = w;
            this.dom.style.width = this._width + "px";
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(CommentObject.prototype, "height", {
        get: function () {
            if (this._height === null || this._height === undefined) {
                this._height = this.dom.offsetHeight;
            }
            return this._height;
        },
        set: function (h) {
            this._height = h;
            this.dom.style.height = this._height + "px";
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(CommentObject.prototype, "size", {
        get: function () {
            return this._size;
        },
        set: function (s) {
            this._size = s;
            this.dom.style.fontSize = this._size + "px";
        },
        enumerable: true,
        configurable: true
    });


    //初始化,dom创建等等
    CommentObject.prototype.init = function () {
        var dom = document.createElement("div");
        dom.className = this.manager.options.className;

        dom.appendChild(document.createTextNode(this.text));

        dom.textContent = this.text;
        dom.innerText = this.text;

        this.dom = dom;

        this.color = this._color;
        this.size = this._size;
    };

    //更新时间
    CommentObject.prototype.time = function (time) {
        this.lastTime -= time;
        if (this.lastTime < 0) {
            this.lastTime = 0;
        }
        if (this.movable) {
            if (!this.update()) {
                return false;
            }
        }
        return this.lastTime > 0;
    };

    //弹幕生命周期结束
    CommentObject.prototype.finish = function () {
        this.manager.remove(this);
    };

    //弹幕刷新动画
    CommentObject.prototype.update = function () {
        return true;
    };

    //弹幕排布方法
    CommentObject.prototype.layout = function () {
    };

    return CommentObject;
})();



/**
 * Created by WhiteBlue on 16/2/11.
 *
 *
 * 滚动弹幕: 1.上端滚动弹幕  2.下端滚动弹幕
 */

var ScrollComment = (function (_super) {
    __extends(ScrollComment, _super);

    function ScrollComment(manager, init) {
        _super.call(this, manager, init);
        this.align = (this.mode == 2) ? 3 : 0;
        this.movable = true;
    }

    ScrollComment.prototype._findOffsetY = function (index, channel, offset) {
        //取得起始位置(区别对齐方式)
        var preY = offset;
        for (var i = 0; i < this.manager.nowLine.length; i++) {
            var cmObj = this.manager.nowLine[i];
            //弹幕同类型同层
            if (cmObj.mode === this.mode && cmObj.index === index) {
                if (cmObj.y - preY >= channel) {
                    return preY;
                }
                ////弹幕无碰撞,同channel插入
                //if (cmObj.stime + cmObj.lastTime <= this.stime + this.lastTime / 2) {
                //    return cmObj.y;
                //}
                preY = cmObj.y + cmObj.height;
            }
        }
        if (preY + channel <= this.manager.stage.offsetHeight) {
            return preY;
        }
        return -1;
    };

    ScrollComment.prototype.layout = function () {
        var index = 0;
        var channel = this.size + 2 * this.manager.options.margin;
        var offset = 0;
        var insertY = -1;

        while (insertY < 0) {
            if (index > 10) {
                console.error('too many loops...');
                return;
            }
            insertY = this._findOffsetY(index, channel, offset);
            index++;
            offset += 12;
        }
        this.index = index - 1;
        this.x = this.manager.width;
        this.y = insertY;
    };

    ScrollComment.prototype.update = function () {
        var preX = (this.lastTime / this.lifeTime) * (this.manager.width + this.width) - this.width;
        this.x = preX;
        return preX > -this.width;

    };

    return ScrollComment;
})(CommentObject);
/**
 * Created by WhiteBlue on 16/2/10.
 *
 *
 * 静止弹幕: 4.底部弹幕  5.顶部弹幕
 */

var StaticComment = (function (_super) {
    __extends(StaticComment, _super);

    function StaticComment(manager, init) {
        _super.call(this, manager, init);
        this.align = (this.mode == 4) ? 3 : 0;
    }

    //寻找适合offsetY
    StaticComment.prototype._findOffsetY = function (index, channel, offset) {
        //取得起始位置(区别对齐方式)
        var preY = offset;
        for (var i = 0; i < this.manager.nowLine.length; i++) {
            var cmObj = this.manager.nowLine[i];
            //弹幕同类型同层
            if (cmObj.mode === this.mode && cmObj.index === index) {
                if (cmObj.y - preY >= channel) {
                    return preY;
                } else {
                    preY = cmObj.y + cmObj.height;
                }
            }
        }
        if (preY + channel <= this.manager.stage.offsetHeight) {
            return preY;
        }
        return -1;
    };

    //弹幕坐标适配(已插入真实dom)
    StaticComment.prototype.layout = function () {
        var index = 0;
        var channel = this.size + 2 * this.manager.options.margin;
        var offset = 0;
        var insertY = -1;

        while (insertY < 0) {
            if (index > 10) {
                console.error('too many loops...');
                return;
            }
            insertY = this._findOffsetY(index, channel, offset);
            index++;
            offset += 12;
        }

        this.index = index - 1;
        this.x = this.manager.stage.offsetLeft + (this.manager.stage.offsetWidth - this.width) / 2;
        this.y = insertY;
    };

    return StaticComment;
})(CommentObject);

