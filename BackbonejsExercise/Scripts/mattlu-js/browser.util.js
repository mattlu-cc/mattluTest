var Sys;
function getBrowser() {
    Sys = {};
    var ua = navigator.userAgent.toLowerCase();
    var s;
    (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
    (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
    (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] :
    (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
    (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] : 0;
    if(Sys.ie == null)
        Sys.ie = !!(navigator.userAgent.match(/Trident/) && navigator.userAgent.match(/rv:11/));

}

window.load = getBrowser();