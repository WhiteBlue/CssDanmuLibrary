/**
 * Created by WhiteBlue on 16/2/10.
 */

//@todo 待完成
var TopPositionComment = (function (_super) {
    __extends(TopPositionComment, _super);

    function TopPositionComment(manager, init) {
        _super.call(this, manager, init);
    }

    TopPositionComment.prototype._findOffsetY = function (index, channel, offset) {
        var preY = this.manager.stage.offsetTop + offset;
        if (this.manager.nowLine.length == 1) {
            return preY;
        }
        for (var i = 0; i < this.manager.nowLine.length; i++) {
            var cmObj = this.manager.nowLine[i];
            if (cmObj.mode === this.mode && cmObj.index === index) {
                if (cmObj.y - preY >= channel) {
                    return cmObj.y;
                } else {
                    preY = cmObj.y + cmObj.height;
                }
            }
        }
        if (preY + channel <= (this.manager.stage.offsetTop + this.manager.stage.offsetHeight)) {
            return preY;
        }
        return -1;
    };

    TopPositionComment.prototype.layout = function () {
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
        this.index = index-1;
        this.x = this.manager.stage.offsetLeft + (this.manager.stage.offsetWidth - this.width) / 2;
        this.y = insertY;
    };

    return TopPositionComment;
})(CommentObject);

