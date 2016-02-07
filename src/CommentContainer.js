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