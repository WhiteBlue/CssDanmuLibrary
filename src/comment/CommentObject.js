/**
 * Created by WhiteBlue on 16/2/9.
 */

// @todo 重叠判定
function CommentObject(manager, init) {
    var cmobj = {
        //对齐方式
        align: 0,
        //层叠顺序
        index: 0,
        mode: 1,
        stime: 0,
        text: "",
        lastTime: 4000,
        movable: false,
        _x: 0,
        _y: 0,
        _size: 25,
        _color: 0xffffff,
        manager: manager
    };
    if (init.hasOwnProperty("align")) {
        cmobj.align = init["align"];
    }
    if (init.hasOwnProperty("stime")) {
        cmobj.stime = init["stime"];
    }
    if (init.hasOwnProperty("mode")) {
        cmobj.mode = init["mode"];
    }
    if (init.hasOwnProperty("color")) {
        cmobj._color = init["color"];
    }
    if (init.hasOwnProperty("size")) {
        cmobj._size = init["size"];
    }
    if (init.hasOwnProperty("x")) {
        cmobj._x = init["x"];
    }
    if (init.hasOwnProperty("y")) {
        cmobj._y = init["y"];
    }
    return cmobj;
}

Object.defineProperty(CommentObject.prototype, "x", {
    get: function () {
        if (this.align % 2 === 0) {
            this._x = this.dom.offsetLeft;
        } else {
            this._x = this.parent.width - this.dom.offsetLeft - this.width;
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

Object.defineProperty(CommentObject.prototype, "y", {
    get: function () {
        if (this.align < 2) {
            this._y = this.dom.offsetTop;
        } else {
            this._y = this.parent.height - this.dom.offsetTop - this.height;
        }
        return this._y;
    },
    set: function (y) {
        this._y = y;
        if (this.align < 2) {
            this.dom.style.top = this._y + "px";
        } else {
            this.dom.style.bottom = this._y + "px";
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


//初始化,dom创建等等
CommentObject.prototype.init = function () {
    var dom = document.createElement("div");
    dom.className = this.manager.options.fresh;

    dom.appendChild(document.createTextNode(this.text));

    dom.textContent = this.text;
    dom.innerText = this.text;

    this.dom = dom;

    this.x = this._x;
    this.y = this._y;
    this.color = this._color;
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

