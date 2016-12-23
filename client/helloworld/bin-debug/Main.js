var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.tileHeight = 32;
        this.tileWidth = 32;
        this._cellSize = 32;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function (event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
        /*初始化资源加载路径*/
        this.url = "resource/assets/airos.tmx";
        /*初始化请求*/
        this.request = new egret.HttpRequest();
        /*监听资源加载完成事件*/
        this.request.once(egret.Event.COMPLETE, this.onMapComplete, this);
        /*发送请求*/
        this.request.open(this.url, egret.HttpMethod.GET);
        this.request.send();
    };
    /*地图加载完成*/
    p.onMapComplete = function (event) {
        /*获取到地图数据*/
        var data = egret.XML.parse(event.currentTarget.response);
        /*初始化地图*/
        this.tmxTileMap = new tiled.TMXTilemap(2000, 2000, data, this.url);
        this.tileHeight = this.tmxTileMap.tileheight;
        this.tileWidth = this.tmxTileMap.tilewidth;
        this.tmxTileMap.render();
        /*将地图添加到显示列表*/
        this.addChild(this.tmxTileMap);
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    p.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    p.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
     * 创建游戏场景
     * Create a game scene
     */
    p.createGameScene = function () {
        var stageW = this.stage.stageWidth;
        var stageH = this.stage.stageHeight;
        this._player = new GamePlayer();
        this._player.constructor();
        //var playerTexture:egret.Bitmap = this.createBitmapByName("player_png");
        //this._player.addChild(playerTexture);
        this.addChild(this._player);
        this._player.anchorOffsetX = 16;
        this._player.anchorOffsetY = 16;
        this._player.x = 0;
        this._player.y = 160;
        // let playerHeight = playerTexture.height/2;
        //let playerWidth = playerTexture.width/2;
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, this.clickEvent, this);
        this.getMapInfo(1);
        //this.getPosFromServer();
    };
    p.locationEvent = function (evt) {
        //解决方案1：位置检测
        if (evt._player_x > 100) {
            console.log("", evt._player_x);
            console.log("", evt._player_y);
        }
        //解决方案2 ：图层碰撞检测：待商榷
        console.log("this is a test");
    };
    p.clickEvent = function (evt) {
        var xpos = Math.floor(evt.stageX / this._cellSize);
        var ypos = Math.floor(evt.stageY / this._cellSize);
        var endNp = this._grid.getNode(xpos, ypos);
        var xpos2 = Math.floor(this._player.x / this._cellSize);
        var ypos2 = Math.floor(this._player.y / this._cellSize);
        var startNp = this._grid.getNode(xpos2, ypos2);
        if (endNp.walkable == false) {
            var replacer = this._grid.findReplacer(startNp, endNp);
            if (replacer) {
                xpos = replacer.x;
                ypos = replacer.y;
            }
        }
        this._grid.setStartNode(xpos2, ypos2);
        this._grid.setEndNode(xpos, ypos);
        this.findPath();
        /********* 走到特定位置触发event START*************/
        //注册侦听器
        this._player.addEventListener(LocationEvent.LOCATE, this.locationEvent, this);
        //发送Event
        this._player.order();
        /**********走到特定位置触发event  END*/
    };
    p.findPath = function () {
        var astar = new AStar2();
        if (astar.findPath(this._grid)) {
            //得到平滑路径
            astar.floyd();
            //在路径中去掉起点节点，避免玩家对象走回头路
            astar.floydPath.shift();
            this._path = astar.floydPath;
            for (var i = 0; i < this._path.length; i++) {
                console.log(this._path[i].x, this._path[i].y);
            }
            //this._path = astar.path;
            this._index = 0;
            this.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
        }
    };
    p.onEnterFrame = function (evt) {
        if (this._path.length == 0) {
            this.removeEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
            return;
        }
        var targetX = this._path[this._index].x * this._cellSize + this._cellSize / 2;
        var targetY = this._path[this._index].y * this._cellSize + this._cellSize / 2;
        var dx = targetX - this._player.x;
        var dy = targetY - this._player.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) {
            this._index++;
            if (this._index >= this._path.length) {
                //this.sendPosToServer(this._path[this._index -1].x,this._path[this._index -1].y);
                this.removeEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
            }
        }
        else {
            this._player.x += dx * .5;
            this._player.role.gotoAndPlay(0, 5);
            this._player.y += dy * .5;
        }
    };
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    p.getMapInfo = function (mapID) {
        var url = "resource/map/map" + mapID + ".txt";
        var request = new egret.HttpRequest();
        var respHandler = function (evt) {
            switch (evt.type) {
                case egret.Event.COMPLETE:
                    break;
                case egret.IOErrorEvent.IO_ERROR:
                    console.log("respHandler io error");
                    break;
            }
        };
        var progressHandler = function (evt) {
            console.log("progress:", evt.bytesLoaded, evt.bytesTotal);
        };
        request.once(egret.Event.COMPLETE, respHandler, null);
        request.once(egret.IOErrorEvent.IO_ERROR, respHandler, null);
        request.once(egret.ProgressEvent.PROGRESS, progressHandler, null);
        request.open(url, egret.HttpMethod.GET);
        request.send();
        request.addEventListener(egret.Event.COMPLETE, this.onGetComplete, this);
    };
    p.onGetComplete = function (event) {
        var request = event.currentTarget;
        var ab = request.response;
        var arr = new Array();
        for (var i = 0; i < 2000; i++) {
            arr.push(ab[i]);
        }
        this.makeGrid(arr);
    };
    p.makeGrid = function (arr) {
        this._grid = new Grid(40, 50, 100);
        //随机障碍物
        for (var i = 0; i < 40; i++) {
            for (var k = 0; k < 50; k++) {
                if (arr[k + 50 * i] == 1) {
                    this._grid.setWalkable(k, i, false);
                }
            }
        }
    };
    p.sendPosToServer = function (x, y) {
        //拼接参数
        var params = "xPos=" + x + "&yPos=" + y;
        var request = new egret.HttpRequest();
        //var url = "http://httpbin.org/post";//
        var url = "http://121.48.228.114:8080/Pokemen/setPlayerPos";
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(url, egret.HttpMethod.POST);
        //设置响应头
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        //发送参数
        request.send(params);
        request.addEventListener(egret.Event.COMPLETE, this.onPostComplete, this);
    };
    p.onPostComplete = function (event) {
        var request = event.currentTarget;
        console.log("post data : ", request.response);
    };
    p.getPosFromServer = function () {
        //拼接参数
        var request = new egret.HttpRequest();
        //var url = "http://httpbin.org/post";//
        var url = "http://121.48.228.114:8080/Pokemen/getPlayerPos";
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(url, egret.HttpMethod.POST);
        //设置响应头
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        //发送参数
        request.send();
        request.addEventListener(egret.Event.COMPLETE, this.onGetPosComplete, this);
    };
    p.onGetPosComplete = function (event) {
        var pos = new Array();
        var request = event.currentTarget;
        var data = request.response;
        console.log(data, data.length);
        var posArr = data.split(",");
        pos[0] = Number(posArr[0]);
        pos[1] = Number(posArr[1]);
        console.log(pos[0], pos[1] + "born point");
        this._player.x = pos[0] * this._cellSize + this._cellSize / 2;
        this._player.y = pos[1] * this._cellSize + this._cellSize / 2;
    };
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
//# sourceMappingURL=Main.js.map