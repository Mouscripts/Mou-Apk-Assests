function getQueryVariable(variable, meth = 1, link = "") {
    if (meth == 1) {
        var query = window.location.search.substring(1);
    } else {
        var query = link.split("?")[1];
    }
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (false);
}

// mouscripts.ajax(JSON.stringify({
//     "type": "GET",
//     "url": "https://mouapi.herokuapp.com/videoserver/test_get.php",
//     "headers": {
//         "User-Agent": "mou_user_agent",
//         "Referer": "mou_referrer",
//         "Origin": "mou_origin"
//     },
//     "OnSuccess": "ongetgoogle"
// }));

// show_unity_rewardedAd("Rewarded_Android", function (ad_status) {
//     if (ad_status == true) {

//     } else {

//     }
// });
// show_unity_Interstitial();
// mouscripts.Show_Admob_Interstitial(`ca-app-pub-3940256099942544/1033173712`);

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;

}
var now_unity_rewardedAd = "";
function show_unity_rewardedAd(adUnitId, callback) {
    now_unity_rewardedAd = callback;
    mouscripts.load_unity_ad(adUnitId);
}

function unity_reward_status(user_status) {
    window["now_unity_rewardedAd"](user_status);
}
var unity_Interstitial_ids = ["video", "interstitial_2"];
var unity_Interstitial_ids_will_show = 0;
function show_unity_Interstitial() {
    if (unity_Interstitial_ids.length > 0) {
        if (typeof unity_Interstitial_ids[unity_Interstitial_ids_will_show] !== "undefined") {
            adUnitId = unity_Interstitial_ids[unity_Interstitial_ids_will_show];
            unity_Interstitial_ids_will_show++;
        } else {
            adUnitId = unity_Interstitial_ids[0];
            unity_Interstitial_ids_will_show = 1;
        }
        mouscripts.load_unity_ad(adUnitId);
    }
}
$("[data-target_view]").click(function () {
    $(".mou_panal").removeClass("active").addClass("hiden");
    target_view = $(this).attr("data-target_view");
    $("#" + target_view).addClass("active").removeClass("hiden");
});

$.MouAjax = function (params) {
    function_token = makeid(4) + Date.now();
    window["return_success" + function_token] = params.success;
    req_obj = params;
    delete req_obj.success;
    req_obj["OnSuccess"] = "mou_ajax_" + function_token;
    window["mou_ajax_" + function_token] = function (res, fun_name) {
        this_function_token = /mou_ajax_(.*)/gm.exec(fun_name)[1];
        window["return_success" + this_function_token](res);
    }
    mouscripts.ajax(JSON.stringify(req_obj));
    return this;
};
