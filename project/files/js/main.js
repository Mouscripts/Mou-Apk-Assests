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
    var Time_Out = (typeof params.Time_Out !== "undefined" && typeof params.Time_Out !== "number") ? params.Time_Out : 10000;
    if (typeof mouscripts !== "undefined") {
        var args = typeof params.arguments !== "undefined" ? params.arguments : {};
        var function_token = makeid(4) + Date.now();
        var this_func_success = params.success;
        if (typeof params.fail !== "undefined") {
            var this_func_fail = params.fail;

        } else {
            var this_func_fail = function (code, msg, args, this_func_name) {
                showToast("حدث خطأ اثناء التحميل");
            }
        }

        window["return_success_" + function_token] = function (res, this_func_name) {
            this_func_success(res, this_func_name, args);
        };

        window["return_failer_" + function_token] = function (code, msg, args, this_func_name) {
            this_func_fail(code, msg, args, this_func_name);
        };
        req_obj = params;
        delete req_obj.success;
        delete req_obj.fail;

        // req_obj.headers["Cache-Control"] = "no-cache";

        // alert(JSON.stringify(req_obj.headers));

        req_obj["OnSuccess"] = "mou_ajax_success_" + function_token;
        req_obj["OnFailer"] = "mou_ajax_failer_" + function_token;
        window["mou_ajax_success_" + function_token] = function (res, fun_name) {
            this_function_token = /mou_ajax_success_(.*)/gm.exec(fun_name)[1];
            window["return_success_" + this_function_token](convert_byte_to_string(res));
            clearTimeout(window["time_out_" + this_function_token]);
        }
        window["mou_ajax_failer_" + function_token] = function (status_code, fun_name, msg) {
            this_function_token = /mou_ajax_failer_(.*)/gm.exec(fun_name)[1];
            window["return_failer_" + this_function_token](status_code, msg, fun_name);
        }

        window["time_out_" + function_token] = setTimeout(() => {

            window["mou_ajax_failer_" + function_token](419, "mou_ajax_failer_" + function_token, "Time Out");

            window["mou_ajax_failer_" + function_token] = function () { };
            window["mou_ajax_success_" + function_token] = function () { };
        }, Time_Out);

        mouscripts.ajax(JSON.stringify(req_obj));
        return this;
    } else {
        delete params.headers;
        $.ajax(params);
    }

};
function convert_byte_to_string(array) {
    array = JSON.parse(array);
    bytesView = new Uint8Array(array);
    return new TextDecoder().decode(bytesView);
}
function fireWith(context, args) {
    if (!locked) {
        args = args || [];
        args = [context, args.slice ? args.slice() : args];
        queue.push(args);
        if (!firing) {
            fire();
        }
    }
    return this;
}

function strtr(t, r, s) { var i, e, h, n, o = "", f = 0, p = 0, a = !1, c = "", g = [], l = [], u = "", b = !1; if ("object" == typeof r) { for (o in a = this.ini_set("phpjs.strictForIn", !1), r = this.krsort(r), this.ini_set("phpjs.strictForIn", a), r) r.hasOwnProperty(o) && (g.push(o), l.push(r[o])); r = g, s = l } for (i = t.length, e = r.length, h = "string" == typeof r, n = "string" == typeof s, f = 0; f < i; f++) { if (b = !1, h) { for (c = t.charAt(f), p = 0; p < e; p++)if (c == r.charAt(p)) { b = !0; break } } else for (p = 0; p < e; p++)if (t.substr(f, r[p].length) == r[p]) { b = !0, f = f + r[p].length - 1; break } u += b ? n ? s.charAt(p) : s[p] : t.charAt(f) } return u }

function mou_custom_encode($txt, $num = 1) {
    $default = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    $custom = "ZYXWVUTSRQPONMLKJIHGFEDCBAzyxwvutsrqponmlkjihgfedcba9876543210+/";
    $encoded = escape($txt);
    for ($i = 1; $i <= $num; $i++) {
        $encoded = strtr(btoa($encoded), $custom, $default);
    }
    return $encoded.replace(/\=/g, "");;
}

function mou_custom_decode($txt, $num = 1) {
    $default = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    $custom = "ZYXWVUTSRQPONMLKJIHGFEDCBAzyxwvutsrqponmlkjihgfedcba9876543210+/";
    $decoded = unescape(decodeURIComponent($txt));
    for ($i = 1; $i <= $num; $i++) {
        $decoded = atob(strtr($decoded, $custom, $default));
    }
    return unescape($decoded);
}
function unPack(code) {
    function indent(code) {
        try {
            var tabs = 0, old = -1, add = '';
            for (var i = 0; i < code.length; i++) {
                if (code[i].indexOf("{") != -1) tabs++;
                if (code[i].indexOf("}") != -1) tabs--;

                if (old != tabs) {
                    old = tabs;
                    add = "";
                    while (old > 0) {
                        add += "\t";
                        old--;
                    }
                    old = tabs;
                }

                code[i] = add + code[i];
            }
        } finally {
            tabs = null;
            old = null;
            add = null;
        }
        return code;
    }

    var env = {
        eval: function (c) {
            code = c;
        },
        window: {},
        document: {}
    };

    eval("with(env) {" + code + "}");

    code = (code + "").replace(/;/g, ";\n").replace(/{/g, "\n{\n").replace(/}/g, "\n}\n").replace(/\n;\n/g, ";\n").replace(/\n\n/g, "\n");

    code = code.split("\n");
    code = indent(code);

    code = code.join("\n");
    return code;
}


function get_yacin_res(url, callback) {
    var callback_token = makeid(6) + Date.now();
    var callback_function = callback;
    window["return_yacin_res_" + callback_token] = function (res) {
        callback_function(JSON.parse(convert_byte_to_string(res)));
    };
    mouscripts.get_yacin_res(url, "return_yacin_res_" + callback_token);
}