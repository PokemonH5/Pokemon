class JsonpReq {
    private static _regID:number = 0;
    public static completeCall:any = {};
    public static process(url:string, callback:Function, callobj:any):void {
        JsonpReq.completeCall["call_"+JsonpReq._regID] = callback.bind(callobj);
        JsonpReq.startLoader(url, JsonpReq._regID++);
    }
      
    private static startLoader(url, id:number):void{
        var script = document.createElement('script');
        script.src = url + "JsonpReq.completeCall.call_" + id +"";
        document.body.appendChild(script);
    }
}