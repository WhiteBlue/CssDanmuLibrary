/**
 * Created by WhiteBlue on 16/2/9.
 *
 * 基本弹幕对象
 */

var CommentObject = (function () {
    function CommentObject(manager, init) {
        this.align = 0;
        this.index = 0;
        this.mode = 1;
        this.stime = 0;
        this.text = "";
        this.lifeTime = 4000 * manager.options.global.scale;
        //this.timeLeft = 4000 * manager.options.global.scale;
        this._size = 25;
        this._color = 0xffffff;
        this.manager = manager;
        this.control = false;
        this._border = false;

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
        if (init.hasOwnProperty("border")) {
            this._border = init["border"];
        }
    }

    CommentObject.prototype.offsetX = function (x) {
        if (x === null || x === undefined) {
            if (this._x === null || this._x === undefined) {
                if (this.align % 2 === 0) {
                    this._x = this.dom.offsetLeft - this.manager.stage.offsetLeft;
                } else {
                    this._x = this.manager.stage.offsetWidth - (this.dom.offsetLeft - this.manager.stage.offsetLeft + this.dom.offsetWidth);
                }
            }
            return this._x;
        } else {
            this._x = x;
            if (this.align % 2 === 0) {
                this.dom.style.right = this._x + "px";
            } else {
                this.dom.style.left = this._x + "px";
            }
        }
    };


    CommentObject.prototype.offsetY = function (y) {
        if (y === null || y === undefined) {
            if (this._y === null || this._y === undefined) {
                if (this.align < 2) {
                    this._y = this.dom.offsetTop;
                } else {
                    this._y = this.manager.stage.offsetHeight - (this.dom.offsetTop + this.dom.offsetHeight);
                }
            }
            return this._y;
        } else {
            this._y = y;
            if (this.align < 2) {
                this.dom.style.top = this._y + "px";
            } else {
                this.dom.style.top = (this.manager.stage.offsetHeight - y - this.dom.offsetHeight) + "px";
            }
        }
    };


    CommentObject.prototype.Color = function (c) {
        if (c === null || c === undefined) {
            return this._color;
        } else {
            this._color = c;
            var color = c.toString(16);
            color = color.length >= 6 ? color : new Array(6 - color.length + 1).join("0") + color;
            if (color.indexOf('#') !== 0) {
                color = '#'.concat(color);
            }
            this.dom.style.color = color;
            if (this._color === 0) {
                this.dom.className = this.manager.options.className + " rshadow";
            }
        }
    };


    CommentObject.prototype.Width = function (w) {
        if (w === null || w === undefined) {
            if (this._width === null || this._width === undefined) {
                this._width = this.dom.offsetWidth;
            }
            return this._width;
        } else {
            this._width = w;
            this.dom.style.width = this._width + "px";
        }
    };


    CommentObject.prototype.Height = function (h) {
        if (h === null || h === undefined) {
            if (this._height === null || this._height === undefined) {
                this._height = this.dom.offsetHeight;
            }
            return this._height;
        } else {
            this._height = h;
            this.dom.style.height = this._height + "px";
        }
    };


    CommentObject.prototype.Size = function (s) {
        if (s === null || s === undefined) {
            return this._size;
        } else {
            this._size = s;
            this.dom.style.fontSize = this._size + "px";
        }
    };


    CommentObject.prototype.Border = function (b) {
        if (b === null || b === undefined) {
            return this._border;
        } else {
            this._border = b;
            this.dom.style.border = b;
        }
    };


    //初始化,dom创建等等
    CommentObject.prototype.init = function () {
        var dom = document.createElement("div");
        dom.className = this.manager.options.className;

        dom.appendChild(document.createTextNode(this.text));

        dom.textContent = this.text;
        dom.innerText = this.text;

        this.dom = dom;

        //新弹幕边框设置
        if (this._border) {
            dom.style.border = "2px solid red";
        }

        this.Color(this._color);
        this.Size(this._size);
    };

    //更新时间
    CommentObject.prototype.checkTime = function (nowTime) {
        //this.timeLeft = (this.stime + this.lifeTime) - nowTime;
        return (this.stime + this.lifeTime) >= nowTime;
    };


    //弹幕排布方法
    CommentObject.prototype.layout = function () {
    };


    CommentObject.prototype.stop = function () {
    };

    CommentObject.prototype.start = function () {
    };

    return CommentObject;
})();


