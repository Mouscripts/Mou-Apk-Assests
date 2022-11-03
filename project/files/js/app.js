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

$("#getsource1").click(function () {
    $.MouAjax({
        url: "http://mouapi.herokuapp.com/akowam/items/stitichsports.php?url=https%3A%2F%2Fstitichsports.com%2Ftv%2Fsports_tv.php&type=list",
        type: 'GET',
        success: function (data) {
            vid_source = data.data[0]["items"][45]["Link"];
            $.ajax({
                url: vid_source,
                type: 'GET',
                success: function (data) {
                    server_data = data.data[0]["Servers"][0];
                    $("#url").val(server_data.Url);
                    $("#useragent").val("");

                    $("#referer").val(server_data.Ref);
                    mouscripts.showToast("done");
                }
            });
        }
    });
});
$("#Play").click(function () {
    user_agent = $("#useragent").val();
    referer = $("#referer").val();
    origin = $("#origin").val();
    headers = {};
    if (referer !== "") {
        headers["Referer"] = referer;
    }
    if (origin !== "") {
        headers["Origin"] = origin;
    }
    headers = JSON.stringify(headers);

    mouscripts.play_vid($("#url").val(), $("#vid_name").val(), user_agent, headers);
});

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

$("#reset").click(function () {
    // show_unity_rewardedAd("Rewarded_Android", function (ad_status) {
    //     if (ad_status == true) {

    //     } else {

    //     }
    // });
    show_unity_Interstitial();

    $("input").each(function () {
        $(this).val($(this).attr("value"));
    });
});

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

$("#test_get").click(function () {
    mouscripts.ajax(JSON.stringify({
        "type": "GET",
        "url": "https://mouapi.herokuapp.com/videoserver/test_get.php",
        "headers": {
            "User-Agent": "mou_user_agent",
            "Referer": "mou_referrer",
            "Origin": "mou_origin"
        },
        "OnSuccess": "ongetgoogle"
    }));

});
function ongetgoogle(res) {
    $("#get_res").text(res);
}

$("#encode").click(function () {
    val = $("#decoded_input").val();
    encoded = mouscripts.MouPerfect(val, true);
    $("#encoded_input").val(encoded);
});
$("#decode").click(function () {
    val = $("#encoded_input").val();
    encoded = mouscripts.MouPerfect(val, false);
    $("#decoded_input").val(encoded);
});

$("#write_file").click(function () {
    file_text = $("#file_text").val();
    write_file_status = mouscripts.Write_file("welcome.html", file_text);
    mouscripts.showToast(write_file_status);
});
$("#read_file").click(function () {
    file_text = $("#file_text").val();
    read_file_status = mouscripts.Read_file("welcome.html");
    $("#file_text").val(read_file_status);
    mouscripts.showToast(read_file_status);
});

$("#delete_file").click(function () {
    delete_file_status = mouscripts.Delete_file("welcome.html");
    $("#file_text").val(delete_file_status);

    mouscripts.showToast(delete_file_status);
});

