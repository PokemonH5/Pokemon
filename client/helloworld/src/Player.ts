class GamePlayer extends egret.Sprite
{

    private _mcData:any;
    private _mcTexture:egret.Texture;
    public role:egret.MovieClip;
    public constructor()
    {
        super();
        this.load(this.initMovieClip);
    }
    public order()
    {
        var locatEvent:LocationEvent = new LocationEvent(LocationEvent.LOCATE)
        locatEvent._player_x = this.x;
        locatEvent._player_y = this.y;

        //发送要求事件
        this.dispatchEvent(locatEvent)
    }

     protected load(callback:Function):void {
         //两个问价都加载完才能播放动画
        var count:number = 0;
        var self = this;
        
        var check = function () {
            count++;
            if (count == 2) {
                callback.call(self);
            }
        }
        //加载png文件
        var loader = new egret.URLLoader();
        loader.addEventListener(egret.Event.COMPLETE, function loadOver(e) {
            var loader = e.currentTarget;

            this._mcTexture = loader.data;
            
            check();
        }, this);
        loader.dataFormat = egret.URLLoaderDataFormat.TEXTURE;
        var request = new egret.URLRequest("resource/assets/mc/player1.png");
        loader.load(request);
    
        //加载json文件
        var loader = new egret.URLLoader();
        loader.addEventListener(egret.Event.COMPLETE, function loadOver(e) {
            var loader = e.currentTarget;

            this._mcData = JSON.parse(loader.data);
            //this._mcData.height = 30;
            check();
        }, this);
        loader.dataFormat = egret.URLLoaderDataFormat.TEXT;
        var request = new egret.URLRequest("resource/assets/mc/player1.json");
        loader.load(request);
    }


     private initMovieClip():void {
        /*** 本示例关键代码段开始 ***/
        var mcDataFactory = new egret.MovieClipDataFactory(this._mcData, this._mcTexture);
        this.role= new egret.MovieClip(mcDataFactory.generateMovieClipData("zhen1"));
       
        
        this.addChild(this.role);
       
        //this.addChild(this.role);
        //role.gotoAndPlay(1, 3);
       /*
        this.role.addEventListener(egret.Event.COMPLETE, function (e:egret.Event):void {
            //egret.log("play over!")
        }, this);
       */
        var count:number = 0;
        this.role.addEventListener(egret.Event.LOOP_COMPLETE, function (e:egret.Event):void {
            egret.log("play times:" + ++count);
        }, this);
        this.role.addEventListener(egret.MovieClipEvent.FRAME_LABEL, function (e:egret.MovieClipEvent):void {
            //egret.Tween.get(this.tmxTileMap).to({x:this.tmxTileMap.x + 50},1000,egret.Ease.backIn);
        }, this);
        /*
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, function (e:egret.TouchEvent):void {
            //count = 0;
            this.role.gotoAndPlay(1, 3);
        }, this);*/
        /*** 本示例关键代码段结束 ***/
    }
}

class LocationEvent extends egret.TouchEvent
{
    public static LOCATE:string = "特定位置";
    //解决方案1：位置检测
    public _player_x: number = 0;
    public _player_y: number = 0;
    
    //解决方案二：图层碰撞检测：待商榷

    public constructor(type:string, bubbles:boolean=false, cancelable:boolean=false)
    {
        super(type,bubbles,cancelable);
    }
}



