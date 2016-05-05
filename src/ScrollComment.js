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
        switch (this.mode) {
            case 1:
                this.align = 0;
                break;
            case 2:
                this.align = 2;
                break;
            case 6:
                this.align = 1;
        }
        this.follow = false;
        this.control = true;
        this.lifeTime *= manager.options.scroll.scale;
    }

    ScrollComment.prototype._findOffsetY = function (index, channel, offset) {
        var cmObj;
        //取得起始位置(区别对齐方式)
        var preY = offset;
        for (var i = 0; i < this.manager.nowLine.length; i++) {
            cmObj = this.manager.nowLine[i];
            //弹幕同类型同层
            if (cmObj.mode === this.mode && cmObj.index === index) {
                if (cmObj.offsetY() - preY >= channel) {
                    return preY;
                }
                //弹幕无碰撞
                if ((!cmObj.follow) && (cmObj.timeLeft <= (cmObj.lifeTime * 0.5))) {
                    cmObj.follow = true;
                    return cmObj.offsetY();
                }
                preY = cmObj.offsetY() + cmObj.Height();
            }
        }
        if (preY + channel <= this.manager.stage.offsetHeight) {
            return preY;
        }
        return -1;
    };


    ScrollComment.prototype.layout = function () {
        var index = 0;
        var channel = this.Size() + 2 * this.manager.options.margin;
        var offset = 0;
        var insertY = -1;

        while (insertY < 0) {
            if (index > 1000) {
                return;
            }
            insertY = this._findOffsetY(index, channel, offset);
            index++;
            offset += this.manager.options.indexOffset;
        }
        this.index = index - 1;
        this.offsetY(insertY);
        this.offsetX(-this.Width());

        this.moveAnimation();
    };


    ScrollComment.prototype.moveAnimation = function () {
        var locate = this.align % 2 == 0 ? '-left ' : '-right ';
        var animation = "cmt-move" + locate + this.lifeTime / 1000 + "s linear";
        this.dom.style.animation = animation;
        this.dom.style["-webkit-animation"] = animation;
        this.dom.style["-moz-animation"] = animation;
        this.dom.style["-o-animation"] = animation;
    };

    ScrollComment.prototype.start = function () {
        this.dom.style["animation-play-state"] = "running";
    };


    ScrollComment.prototype.stop = function () {
        this.dom.style["animation-play-state"] = "paused";
    };

    return ScrollComment;
})(CommentObject);
