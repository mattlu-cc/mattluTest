function isUserAgent(key) { return eval("navigator.userAgent.toLowerCase().match(\/" + key + "\/i)") == key; }
function isIpad() { return isUserAgent("ipad"); }
function isIphone() { return isUserAgent("iphone os"); }
function isAndroid() { return isUserAgent("android"); }
function isMobile() { return isUserAgent("windows mobile"); }
function isWinCE() { return isUserAgent("windows ce"); }
function isUC() { return isUserAgent("ucweb"); }
function isUC7() { return isUserAgent("rv:1.2.3.4"); }
function isIpadOrIphoneOrAndroid() { return isIpad() || isIphone() || isAndroid(); }
function isIOS4() { return isUserAgent("os 4"); }
function isIOS5() { return isUserAgent("os 5"); }
function isIOS6() { return isUserAgent("os 6"); }
function isUndefined(val) { return typeof (val) === 'undefined'; }
function packingUrl(url) { return url + (url.indexOf("?") >= 0 ? "&" : "?") + Math.random(); }

/*
* Guid motheds
*/
Guid = function (t) {
    this._arr = new Array();
    this.type = t;
    if (typeof (this.type) == "string")
        this._initByString(this._arr, this.type);
    else
        this._initByOther(this._arr);

};
Guid.prototype = {
    equals: function (o) {
        if (o && o.isGuid)
            return this.toString() == o.toString();
        else
            return false;
    },
    isGuid: function () { },
    toString: function () {
        return this._arr.toString().replace(/,/g, "");
    },
    _initByString: function (arr, g) {
        g = g.replace(/\{|\(|\)|\}|-/g, "");
        g = g.toLowerCase();
        if (g.length != 32 || g.search(/[^0-9,a-f]/i) != -1)
            InitByOther(arr);
        else
            for (var i = 0; i < g.length; i++)
                arr.push(g[i]);
    },
    _initByOther: function (arr) {
        var i = 32;
        while (i--) {
            arr.push("0");
        }
    }
};
Guid.Empty = new Guid();
Guid.NewGuid = function () {
    var g = "";
    var i = 32;
    while (i--) {
        g += Math.floor(Math.random() * 16.0).toString(16);
    }
    return new Guid(g);
}

function setSaveBtnImg(obj, inx) {
    if ($(obj).parent().find("span").eq(inx).attr("class").indexOf("btnTag2") < 0)
        $(obj).parent().find("span").eq(inx).attr("class", "btnTag2");
}