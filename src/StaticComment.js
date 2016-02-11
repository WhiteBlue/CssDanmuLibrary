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
                    return cmObj.y;
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

