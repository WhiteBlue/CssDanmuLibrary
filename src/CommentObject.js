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
                this.dom.className = this.parent.options.global.className + " rshadow";
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
            this.update();
        }
        if (this.lastTime <= 0) {
            this.finish();
        }
    };

    //弹幕刷新动画
    CommentObject.prototype.update = function () {
    };

    //弹幕排布方法
    CommentObject.prototype.layout = function () {
    };

    //弹幕生命周期结束
    CommentObject.prototype.finish = function () {
        this.manager.remove(this);
    };
    return CommentObject;
})();


