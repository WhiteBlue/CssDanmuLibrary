/**
 * Created by WhiteBlue on 16/2/10.
 */

//@todo 待完成
var TopPositionComment = (function (_super) {
    __extends(TopPositionComment, _super);

    function TopPositionComment(manager, init) {
        _super.call(this, manager, init);
    }

    TopPositionComment.prototype.layout = function () {
        var index = 0;
        var offsetY = 0;
        var cmObj;
        for (var i = 0; i < this.manager.nowLine.length; i++) {
            if (this.manager.nowLine[i].mode === this.mode) {
                cmObj = this.manager.nowLine[i];
                if (cmObj.index > 0) {
                    continue;
                }
                if (cmObj.stime + cmObj.lastTime >= this.stime + this.ttl / 2) {
                    offsetY = cmObj.y;
                    break;
                }
                //offsetY +=
            }
        }
    };

})(CommentObject);

