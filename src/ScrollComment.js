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