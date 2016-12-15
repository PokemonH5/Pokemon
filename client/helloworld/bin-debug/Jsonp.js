var JsonpReq = (function () {
    function JsonpReq() {
    }
    var d = __define,c=JsonpReq,p=c.prototype;
    JsonpReq.process = function (url, callback, callobj) {
        JsonpReq.completeCall["call_" + JsonpReq._regID] = callback.bind(callobj);
        JsonpReq.startLoader(url, JsonpReq._regID++);
    };
    JsonpReq.startLoader = function (url, id) {
        var script = document.createElement('script');
        script.src = url + "JsonpReq.completeCall.call_" + id + "";
        document.body.appendChild(script);
    };
    JsonpReq._regID = 0;
    JsonpReq.completeCall = {};
    return JsonpReq;
}());
egret.registerClass(JsonpReq,'JsonpReq');
//# sourceMappingURL=Jsonp.js.map