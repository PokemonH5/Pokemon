var GamePlayer = (function (_super) {
    __extends(GamePlayer, _super);
    function GamePlayer() {
        _super.call(this);
    }
    var d = __define,c=GamePlayer,p=c.prototype;
    p.order = function () {
        var locatEvent = new LocationEvent(LocationEvent.LOCATE);
        locatEvent._player_x = this.x;
        locatEvent._player_y = this.y;
        //发送要求事件
        this.dispatchEvent(locatEvent);
    };
    return GamePlayer;
}(egret.Sprite));
egret.registerClass(GamePlayer,'GamePlayer');
var LocationEvent = (function (_super) {
    __extends(LocationEvent, _super);
    //解决方案二：图层碰撞检测：待商榷
    function LocationEvent(type, bubbles, cancelable) {
        if (bubbles === void 0) { bubbles = false; }
        if (cancelable === void 0) { cancelable = false; }
        _super.call(this, type, bubbles, cancelable);
        //解决方案1：位置检测
        this._player_x = 0;
        this._player_y = 0;
    }
    var d = __define,c=LocationEvent,p=c.prototype;
    LocationEvent.LOCATE = "特定位置";
    return LocationEvent;
}(egret.TouchEvent));
egret.registerClass(LocationEvent,'LocationEvent');
//# sourceMappingURL=Player.js.map