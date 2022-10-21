$("[data-target_view]").click(function () {
    $(".mou_panal").removeClass("active").addClass("hiden");
    target_view = $(this).attr("data-target_view");
    $("#" + target_view).addClass("active").removeClass("hiden");
});

$("#getsource1").click(function () {
    $.ajax({
        url: "http://mouapi.herokuapp.com/akowam/items/stitichsports.php?url=https%3A%2F%2Fstitichsports.com%2Ftv%2Fsports_tv.php&type=list",
        type: 'GET',
        success: function (data) {

            vid_source = data.data[0]["items"][45]["Link"];

            referer

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

$("#reset").click(function () {
    $("input").each(function () {
        $(this).val($(this).attr("value"));
    });
});
$("#mbcmasr").click(function () {
    mouscripts.play_vid("https://shls-masr-ak.akamaized.net/out/v1/b7093401da27496797a8949de23f4578/index.m3u8", "MBC Masr 1 Live");
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