

//继承方法
var __extends = function (SubType, SuperType) {
    var __prototype = function () {
    };
    __prototype.prototype = SuperType.prototype;
    var proto = new __prototype();
    proto.constructor = SubType;
    SubType.prototype = proto;
};

//数组操作封装
var BinArray = (function () {
    var BinArray = {};
    //搜索符合条件位置
    BinArray.bsearch = function (arr, what, how) {
        if (arr.length === 0) {
            return 0;
        }
        //首元素比较
        if (how(what, arr[0]) < 0) {
            return 0;
        }
        //尾元素比较
        if (how(what, arr[arr.length - 1]) >= 0) {
            return arr.length;
        }

        var low = 0;
        var i = 0;
        var count = 0;
        var high = arr.length - 1;
        while (low <= high) {
            //取high和low中位元素
            i = Math.floor((high + low + 1) / 2);
            //循环计数
            count++;
            //i和相邻元素符合要求
            if (how(what, arr[i - 1]) >= 0 && how(what, arr[i]) < 0) {
                return i;
            }
            if (how(what, arr[i - 1]) < 0) {
                //i不符合要求,向下递减范围
                high = i - 1;
            } else if (how(what, arr[i]) >= 0) {
                //i符合要求,向上递增范围
                low = i;
            } else {
                console.error('Judge error at : ' + how);
            }
            if (count > 1500) {
                console.error('Too many run cycles.');
            }
        }
        return -1;
    };
    //按给定要求插入元素返回index
    BinArray.binsert = function (arr, what, how) {
        var index = BinArray.bsearch(arr, what, how);
        arr.splice(index, 0, what);
        return index;
    };
    return BinArray;
})();
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
 * Created by WhiteBlue on 16/2/4.
 */

var CoreComment = (function () {
    function CoreComment(parent, init) {
        if (typeof init === "undefined") {
            init = {};
        }
        this.mode = 1;
        this.stime = 0;
        this.text = "";
        this.ttl = 4000;
        this.dur = 4000;
        this.cindex = -1;
        this.motion = [];
        this.movable = true;
        this._alphaMotion = null;
        this.absolute = true;
        this.align = 0;
        this._alpha = 1;
        this._size = 25;
        this._color = 0xffffff;
        this._border = false;
        this._shadow = true;
        this._font = "";
        if (!parent) {
            throw new Error("Comment not bind to comment manager.");
        } else {
            this.parent = parent;
        }
        if (init.hasOwnProperty("stime")) {
            this.stime = init["stime"];
        }
        if (init.hasOwnProperty("mode")) {
            this.mode = init["mode"];
        } else {
            this.mode = 1;
        }
        if (init.hasOwnProperty("dur")) {
            this.dur = init["dur"];
            this.ttl = this.dur;
        }
        this.dur *= this.parent.options.global.scale;
        this.ttl *= this.parent.options.global.scale;
        if (init.hasOwnProperty("text")) {
            this.text = init["text"];
        }
        //定位弹幕用
        if (init.hasOwnProperty("motion")) {
            this._motionStart = [];
            this._motionEnd = [];
            this.motion = init["motion"];
            var head = 0;
            for (var i = 0; i < init["motion"].length; i++) {
                this._motionStart.push(head);
                var maxDur = 0;
                for (var k in init["motion"][i]) {
                    var m = init["motion"][i][k];
                    maxDur = Math.max(m.dur, maxDur);
                    if (m.easing === null || m.easing === undefined) {
                        init["motion"][i][k]["easing"] = CoreComment.LINEAR;
                    }
                }
                head += maxDur;
                this._motionEnd.push(head);
            }
            this._curMotion = 0;
        }
        if (init.hasOwnProperty("color")) {
            this._color = init["color"];
        }
        if (init.hasOwnProperty("size")) {
            this._size = init["size"];
        }
        if (init.hasOwnProperty("border")) {
            this._border = init["border"];
        }
        if (init.hasOwnProperty("opacity")) {
            this._alpha = init["opacity"];
        }
        if (init.hasOwnProperty("alpha")) {
            this._alphaMotion = init["alpha"];
        }
        if (init.hasOwnProperty("font")) {
            this._font = init["font"];
        }
        if (init.hasOwnProperty("x")) {
            this._x = init["x"];
        }
        if (init.hasOwnProperty("y")) {
            this._y = init["y"];
        }
        if (init.hasOwnProperty("shadow")) {
            this._shadow = init["shadow"];
        }
        if (init.hasOwnProperty("position")) {
            if (init["position"] === "relative") {
                this.absolute = false;
                if (this.mode < 7) {
                    console.warn("Using relative position for CSA comment.");
                }
            }
        }
    }

    CoreComment.prototype.init = function (recycle) {
        if (typeof recycle === "undefined") {
            recycle = null;
        }
        //元素绑定
        if (recycle !== null) {
            this.dom = recycle.dom;
        } else {
            this.dom = document.createElement("div");
        }
        //设置CSS class
        this.dom.className = this.parent.options.global.className;
        //创建节点
        this.dom.appendChild(document.createTextNode(this.text));
        //兼容IE和FF
        this.dom.textContent = this.text;
        this.dom.innerText = this.text;

        this.size = this._size;
        if (this._color != 0xffffff) {
            this.color = this._color;
        }
        this.shadow = this._shadow;
        if (this._border) {
            this.border = this._border;
        }
        if (this._font !== "") {
            this.font = this._font;
        }
        if (this._x !== undefined) {
            this.x = this._x;
        }
        if (this._y !== undefined) {
            this.y = this._y;
        }
        if (this._alpha !== 1 || this.parent.options.global.opacity < 1) {
            this.alpha = this._alpha;
        }
        if (this.motion.length > 0) {
            this.animate();
        }
    };

    Object.defineProperty(CoreComment.prototype, "x", {
        get: function () {
            if (this._x === null || this._x === undefined) {
                if (this.align % 2 === 0) {
                    this._x = this.dom.offsetLeft;
                } else {
                    this._x = this.parent.width - this.dom.offsetLeft - this.width;
                }
            }
            if (!this.absolute) {
                return this._x / this.parent.width;
            }
            return this._x;
        },
        set: function (x) {
            this._x = x;
            if (!this.absolute) {
                this._x *= this.parent.width;
            }
            if (this.align % 2 === 0) {
                this.dom.style.left = this._x + "px";
            } else {
                this.dom.style.right = this._x + "px";
            }
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(CoreComment.prototype, "y", {
        get: function () {
            if (this._y === null || this._y === undefined) {
                if (this.align < 2) {
                    this._y = this.dom.offsetTop;
                } else {
                    this._y = this.parent.height - this.dom.offsetTop - this.height;
                }
            }
            if (!this.absolute) {
                return this._y / this.parent.height;
            }
            return this._y;
        },
        set: function (y) {
            this._y = y;
            if (!this.absolute) {
                this._y *= this.parent.height;
            }
            if (this.align < 2) {
                this.dom.style.top = this._y + "px";
            } else {
                this.dom.style.bottom = this._y + "px";
            }
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(CoreComment.prototype, "bottom", {
        get: function () {
            return this.y + this.height;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(CoreComment.prototype, "right", {
        get: function () {
            return this.x + this.width;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(CoreComment.prototype, "width", {
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

    Object.defineProperty(CoreComment.prototype, "height", {
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

    Object.defineProperty(CoreComment.prototype, "size", {
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

    Object.defineProperty(CoreComment.prototype, "color", {
        get: function () {
            return this._color;
        },
        set: function (c) {
            this._color = c;
            var color = c.toString(16);
            color = color.length >= 6 ? color : new Array(6 - color.length + 1).join("0") + color;
            this.dom.style.color = "#" + color;
            if (this._color === 0) {
                this.dom.className = this.parent.options.global.className + " rshadow";
            }
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(CoreComment.prototype, "alpha", {
        get: function () {
            return this._alpha;
        },
        set: function (a) {
            this._alpha = a;
            this.dom.style.opacity = Math.min(this._alpha, this.parent.options.global.opacity) + "";
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(CoreComment.prototype, "border", {
        get: function () {
            return this._border;
        },
        set: function (b) {
            this._border = b;
            if (this._border) {
                this.dom.style.border = "1px solid #00ffff";
            } else {
                this.dom.style.border = "none";
            }
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(CoreComment.prototype, "shadow", {
        get: function () {
            return this._shadow;
        },
        set: function (s) {
            this._shadow = s;
            if (!this._shadow) {
                this.dom.className = this.parent.options.global.className + " noshadow";
            }
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(CoreComment.prototype, "font", {
        get: function () {
            return this._font;
        },
        set: function (f) {
            this._font = f;
            if (this._font.length > 0) {
                this.dom.style.fontFamily = this._font;
            } else {
                this.dom.style.fontFamily = "";
            }
        },
        enumerable: true,
        configurable: true
    });


    //时间更新,使弹幕运动
    CoreComment.prototype.time = function (time) {
        this.ttl -= time;
        if (this.ttl < 0) {
            this.ttl = 0;
        }
        if (this.movable) {
            this.update();
        }
        if (this.ttl <= 0) {
            this.finish();
        }
    };

    CoreComment.prototype.update = function () {
        this.animate();
    };

    CoreComment.prototype.invalidate = function () {
        this._x = null;
        this._y = null;
        this._width = null;
        this._height = null;
    };

    CoreComment.prototype._execMotion = function (currentMotion, time) {
        for (var prop in currentMotion) {
            if (currentMotion.hasOwnProperty(prop)) {
                var m = currentMotion[prop];
                this[prop] = m.easing(Math.min(Math.max(time - m.delay, 0), m.dur), m.from, m.to - m.from, m.dur);
            }
        }
    };

    //弹幕像素运动
    CoreComment.prototype.animate = function () {
        if (this._alphaMotion) {
            this.alpha = (this.dur - this.ttl) * (this._alphaMotion["to"] - this._alphaMotion["from"]) / this.dur + this._alphaMotion["from"];
        }
        if (this.motion.length === 0) {
            return;
        }
        var ttl = Math.max(this.ttl, 0);
        var time = (this.dur - ttl) - this._motionStart[this._curMotion];
        this._execMotion(this.motion[this._curMotion], time);
        if (this.dur - ttl > this._motionEnd[this._curMotion]) {
            this._curMotion++;
            if (this._curMotion >= this.motion.length) {
                this._curMotion = this.motion.length - 1;
            }
            return;
        }
    };

    CoreComment.prototype.finish = function () {
        this.parent.finish(this);
    };

    CoreComment.prototype.toString = function () {
        return ["[", this.stime, "|", this.ttl, "/", this.dur, "]", "(", this.mode, ")", this.text].join("");
    };
    CoreComment.LINEAR = function (t, b, c, d) {
        return t * c / d + b;
    };
    return CoreComment;
})();

var ScrollComment = (function (_super) {
    __extends(ScrollComment, _super);
    function ScrollComment(parent, data) {
        _super.call(this, parent, data);
        this.dur *= this.parent.options.scroll.scale;
        this.ttl *= this.parent.options.scroll.scale;
    }

    Object.defineProperty(ScrollComment.prototype, "alpha", {
        set: function (a) {
            this._alpha = a;
            this.dom.style.opacity = Math.min(Math.min(this._alpha, this.parent.options.global.opacity), this.parent.options.scroll.opacity) + "";
        },
        enumerable: true,
        configurable: true
    });

    ScrollComment.prototype.init = function (recycle) {
        if (typeof recycle === "undefined") {
            recycle = null;
        }
        _super.prototype.init.call(this, recycle);
        this.x = this.parent.width;
        if (this.parent.options.scroll.opacity < 1) {
            this.alpha = this._alpha;
        }
        this.absolute = true;
    };

    ScrollComment.prototype.update = function () {
        this.x = (this.ttl / this.dur) * (this.parent.width + this.width) - this.width;
    };
    return ScrollComment;
})(CoreComment);




var CSSScrollComment = (function (_super) {
    __extends(CSSScrollComment, _super);
    function CSSScrollComment() {
        _super.apply(this, arguments);
        this._dirtyCSS = true;
    }

    Object.defineProperty(CSSScrollComment.prototype, "x", {
        get: function () {
            return (this.ttl / this.dur) * (this.parent.width + this.width) - this.width;
        },
        set: function (x) {
            if (typeof this._x === "number") {
                var dx = x - this._x;
                this._x = x;
                this.transformCSS( "translateX(" + dx + "px)");
            } else {
                this._x = x;
                if (!this.absolute) {
                    this._x *= this.parent.width;
                }
                if (this.align % 2 === 0) {
                    this.dom.style.left = this._x + "px";
                } else {
                    this.dom.style.right = this._x + "px";
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    CSSScrollComment.prototype.update = function () {
        if (this._dirtyCSS) {
            this.dom.style.transition = "transform " + this.ttl + "ms linear";
            this.x = -this.width;
            this._dirtyCSS = false;
        }
    };

    CSSScrollComment.prototype.transformCSS = function (trans) {
        this.dom.style.transform = trans;
        this.dom.style["webkitTransform"] = trans;
        this.dom.style["msTransform"] = trans;
        this.dom.style["oTransform"] = trans;
    };


    CSSScrollComment.prototype.invalidate = function () {
        _super.prototype.invalidate.call(this);
        this._dirtyCSS = true;
    };

    CSSScrollComment.prototype.stop = function () {
        this.dom.style.transition = "";
        this.x = this._x;
        this._x = null;
        this.x = (this.ttl / this.dur) * (this.parent.width + this.width) - this.width;
        this._dirtyCSS = true;
    };
    return CSSScrollComment;
})(ScrollComment);
/**
 * Created by WhiteBlue on 16/2/4.
 */


var CommentSpaceAllocator = (function () {
    //基本容器
    function CommentSpaceAllocator(width, height) {
        this._pools = [
            []
        ];
        //弹幕边距容差
        this.avoid = 1;
        this.className = 'cmt';
        this._width = width;
        this._height = height;
    }

    //两弹幕是否碰撞
    CommentSpaceAllocator.prototype.willCollide = function (existing, check) {
        return existing.stime + existing.ttl >= check.stime + check.ttl / 2;
    };

    //遍历弹幕池,判断是否展示弹幕
    CommentSpaceAllocator.prototype.pathCheck = function (y, comment, pool) {
        //遍历弹幕池
        for (var i = 0; i < pool.length; i++) {
            if (pool[i].y > y + comment.height || pool[i].bottom < y) {
                //弹幕y轴方向不重合
            } else if (pool[i].right < comment.x || pool[i].x > comment.right) {
                //弹幕x轴方向不完全重合但y轴重合
                if (this.willCollide(pool[i], comment)) {
                    //会碰撞
                    return false;
                }
            } else {
                //两弹幕完全重合
                return false;
            }
        }
        //安全
        return true;
    };

    //取得弹幕合理y轴坐标
    CommentSpaceAllocator.prototype.assign = function (comment, cindex) {
        //插入index大于length,弹幕池扩容
        while (this._pools.length <= cindex) {
            this._pools.push([]);
        }
        var pool = this._pools[cindex];
        if (pool.length === 0) {
            //当前弹幕池容量为0(comment为初始元素)
            comment.cindex = cindex;
            return 0;
        } else if (this.pathCheck(0, comment, pool)) {
            //弹幕池无碰撞
            comment.cindex = cindex;
            return 0;
        }
        var y = 0;
        //遍历弹幕池,把新弹幕安排在一个老弹幕下面
        for (var k = 0; k < pool.length; k++) {
            //avoid -> 避免碰撞像素大小
            y = pool[k].bottom + this.avoid;
            if (y + comment.height > this._height) {
                //超出容器
                break;
            }
            if (this.pathCheck(y, comment, pool)) {
                //弹幕显示
                comment.cindex = cindex;
                return y;
            }
        }
        //没有合适的位置踢到下一个容器
        return this.assign(comment, cindex + 1);
    };


    //插入弹幕
    CommentSpaceAllocator.prototype.add = function (comment) {
        if (comment.height > this._height) {
            //弹幕超出容器y轴
            comment.cindex = -2;
            comment.y = 0;
        } else {
            //取得y轴坐标
            comment.y = this.assign(comment, 0);
            //合适位置插入
            BinArray.binsert(this._pools[comment.cindex], comment, function (a, b) {
                if (a.bottom < b.bottom) {
                    return -1;
                } else if (a.bottom > b.bottom) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }
    };

    //移除弹幕
    CommentSpaceAllocator.prototype.remove = function (comment) {
        if (comment.cindex < 0) {
            return;
        }
        if (comment.cindex >= this._pools.length) {
            throw new Error("cindex out of bounds");
        }
        var index = this._pools[comment.cindex].indexOf(comment);
        if (index < 0)
            return;
        this._pools[comment.cindex].splice(index, 1);
    };

    //大小设置
    CommentSpaceAllocator.prototype.setBounds = function (width, height) {
        this._width = width;
        this._height = height;
    };


    return CommentSpaceAllocator;
})();

var AnchorCommentSpaceAllocator = (function (_super) {
    __extends(AnchorCommentSpaceAllocator, _super);
    function AnchorCommentSpaceAllocator() {
        _super.apply(this, arguments);
    }

    AnchorCommentSpaceAllocator.prototype.add = function (comment) {
        _super.prototype.add.call(this, comment);
        comment.x = (this._width - comment.width) / 2;
    };

    AnchorCommentSpaceAllocator.prototype.willCollide = function (a, b) {
        return true;
    };

    AnchorCommentSpaceAllocator.prototype.pathCheck = function (y, comment, pool) {
        var bottom = y + comment.height;
        for (var i = 0; i < pool.length; i++) {
            if (pool[i].y > bottom || pool[i].bottom < y) {
                continue;
            } else {
                return false;
            }
        }
        return true;
    };
    return AnchorCommentSpaceAllocator;
})(CommentSpaceAllocator);
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
                this.send(this.timeline[this.position]);
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