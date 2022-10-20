var app_version = "";
function check_update() {
    $.getJSON("config.json", function (json) {
        app_version = json.version;


        mouscripts.ajax(JSON.stringify({
            "type": "GET",
            "url": "https://raw.githubusercontent.com/Mouscripts/Mou-Apk-Assests/main/config.json",
            "headers": {
                "Cache-Control": "max-age=0"
            },
            "OnSuccess": "config_file"
        }));
    });
}
check_update();
$("#check_updates").click(function () {
    check_update();
});
function config_file(res) {
    res = JSON.parse(res);
    latest_app_version = res.version;

    if (latest_app_version == app_version) {
        mouscripts.showToast("لديك احدث اصدار");
    } else {
        mouscripts.showToast("يرجي تحديث التطبيق");
    }
}