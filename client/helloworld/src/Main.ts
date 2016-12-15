

class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView:LoadingUI;
    /*设置请求*/
    private request:egret.HttpRequest;
    /*设置资源加载路径*/
    private url:string;

    private tmxTileMap: tiled.TMXTilemap;
    private tileHeight: number = 32;
    private tileWidth: number = 32;

    private _cellSize: number = 32;
    private _grid: Grid;
    private _player: egret.Sprite;
    private _index: number;
    private _path: NodePoint[];

    private _lineShape: egret.Shape;
    private _gridContent: egret.DisplayObjectContainer;
    public _gridArr: egret.Shape[][];

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event:egret.Event) {
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
        this.request.once( egret.Event.COMPLETE,this.onMapComplete,this);
        /*发送请求*/
        this.request.open(this.url,egret.HttpMethod.GET);
        this.request.send();
    }

    /*地图加载完成*/
    private onMapComplete( event:egret.Event ) {
        /*获取到地图数据*/
        var data:any = egret.XML.parse(event.currentTarget.response);
        /*初始化地图*/
        this.tmxTileMap = new tiled.TMXTilemap(2000, 2000, data, this.url);
        this.tileHeight = this.tmxTileMap.tileheight;
        this.tileWidth = this.tmxTileMap.tilewidth;
        this.tmxTileMap.render();
        /*将地图添加到显示列表*/
        this.addChild(this.tmxTileMap);
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event:RES.ResourceEvent):void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event:RES.ResourceEvent):void {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event:RES.ResourceEvent):void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private textfield:egret.TextField;

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene():void {

        let stageW:number = this.stage.stageWidth;
        let stageH:number = this.stage.stageHeight;
        
        this._player = new egret.Sprite();
        var playerTexture:egret.Bitmap = this.createBitmapByName("player_png");
        this._player.addChild(playerTexture);
        this.addChild(this._player);
        this._player.anchorOffsetX = 16;
        this._player.anchorOffsetY = 16;
        this._player.x = 0;
        this._player.y = 160;
        let playerHeight = playerTexture.height/2;
        let playerWidth = playerTexture.width/2;

        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP,this.clickEvent,this);

        this.getMapInfo(1);
        this.getPosFromServer();
        
    }

    private clickEvent(evt:egret.TouchEvent){
        var xpos: number = Math.floor(evt.stageX / this._cellSize);
        var ypos: number = Math.floor(evt.stageY / this._cellSize);
        var endNp: NodePoint = this._grid.getNode(xpos,ypos);
        

        var xpos2: number = Math.floor(this._player.x / this._cellSize);
        var ypos2: number = Math.floor(this._player.y / this._cellSize);
        var startNp: NodePoint = this._grid.getNode(xpos2,ypos2);
        
        if(endNp.walkable == false) { 
            var replacer:NodePoint = this._grid.findReplacer(startNp, endNp);
            if( replacer ){
                xpos = replacer.x;
                ypos = replacer.y;
            }
        }
        
        this._grid.setStartNode(xpos2,ypos2);
        this._grid.setEndNode(xpos,ypos);
        

        this.findPath();
    }

    private findPath(): void {

        var astar: AStar2 = new AStar2();
        if(astar.findPath(this._grid)) {
            //得到平滑路径
            astar.floyd();
            //在路径中去掉起点节点，避免玩家对象走回头路
            astar.floydPath.shift();
            this._path = astar.floydPath;
            for(var i=0;i<this._path.length;i++){
                console.log(this._path[i].x,this._path[i].y);                
            }
            //this._path = astar.path;
            this._index = 0;
            this.addEventListener(egret.Event.ENTER_FRAME,this.onEnterFrame,this);

        }
    }
    
    private onEnterFrame(evt: egret.Event) {
        if(this._path.length == 0) { 
            this.removeEventListener(egret.Event.ENTER_FRAME,this.onEnterFrame,this);
            return;
        }
        var targetX: number = this._path[this._index].x * this._cellSize + this._cellSize / 2;
        var targetY: number = this._path[this._index].y * this._cellSize + this._cellSize / 2;
        var dx: number = targetX - this._player.x;
        var dy: number = targetY - this._player.y;
        var dist: number = Math.sqrt(dx * dx + dy * dy);
        if(dist < 1) {
            this._index++;
            if(this._index >= this._path.length) {
                this.sendPosToServer(this._path[this._index -1].x,this._path[this._index -1].y);
                this.removeEventListener(egret.Event.ENTER_FRAME,this.onEnterFrame,this);
            }
        }
        else {
            this._player.x += dx * .5;
            this._player.y += dy * .5;
        }
    }

    private createBitmapByName(name:string):egret.Bitmap {
        let result = new egret.Bitmap();
        let texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    private getMapInfo(mapID:number){
        var url = "resource/map/map"+mapID+".txt";
        var request:egret.HttpRequest = new egret.HttpRequest();
        var respHandler = function( evt:egret.Event):void{
            switch(evt.type){
                case egret.Event.COMPLETE:

                break;
                case egret.IOErrorEvent.IO_ERROR:
                console.log("respHandler io error");
                break;               
            }
        }
        var progressHandler = function( evt:egret.ProgressEvent):void{
            console.log("progress:",evt.bytesLoaded,evt.bytesTotal);          
        }
        request.once(egret.Event.COMPLETE,respHandler,null);
        request.once(egret.IOErrorEvent.IO_ERROR,respHandler,null);
        request.once(egret.ProgressEvent.PROGRESS,progressHandler,null);
        request.open(url,egret.HttpMethod.GET);
        request.send();
        request.addEventListener(egret.Event.COMPLETE,this.onGetComplete,this);
    }

    private onGetComplete(event:egret.Event):void {
        var request = <egret.HttpRequest>event.currentTarget;
        var ab:ArrayBuffer = request.response;

        var arr:Array<number> = new Array<number>();
        for(var i=0;i<2000;i++){
            arr.push(ab[i]);
        }
        this.makeGrid(arr);

    }

    private makeGrid(arr:Array<number>): void {
        this._grid = new Grid(40,50,100);
        //随机障碍物
      
        for(var i=0;i<40;i++){
            for(var k=0;k<50;k++){
                if(arr[k+50*i]==1){
                    this._grid.setWalkable(k,i,false);     
                }
            }
        }

    }

    private sendPosToServer(x:number,y:number){
        //拼接参数
        var params = "xPos="+x+"&yPos="+y;
        var request = new egret.HttpRequest();
        //var url = "http://httpbin.org/post";//
        var url = "http://121.48.228.114:8080/Pokemen/setPlayerPos";
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(url,egret.HttpMethod.POST);
        //设置响应头
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        //发送参数
        request.send(params);       
        request.addEventListener(egret.Event.COMPLETE,this.onPostComplete,this);
    }

    private onPostComplete(event:egret.Event){
        var request = <egret.HttpRequest>event.currentTarget;
        console.log("post data : ",request.response);
    }

    private getPosFromServer(){
        //拼接参数
        var request = new egret.HttpRequest();
        //var url = "http://httpbin.org/post";//
        var url = "http://121.48.228.114:8080/Pokemen/getPlayerPos";
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(url,egret.HttpMethod.POST);
        //设置响应头
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        //发送参数
        request.send();       
        request.addEventListener(egret.Event.COMPLETE,this.onGetPosComplete,this);
    }

    private onGetPosComplete(event:egret.Event){
        var pos = new Array<number>();
        var request = <egret.HttpRequest>event.currentTarget;
        var data:string = request.response;
        console.log(data,data.length);
        var posArr = data.split(",");
        pos[0] = Number(posArr[0]);
        pos[1] = Number(posArr[1]);
        console.log(pos[0],pos[1]+"born point");
        this._player.x = pos[0] * this._cellSize + this._cellSize / 2;
        this._player.y = pos[1] * this._cellSize + this._cellSize / 2;
        
    }
}


