

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