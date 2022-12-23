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

var order_matches = true;
loader_match_div = `<div class="match mou_box_shadow"><div class="mou_match"><div class="team team_1"><div class="team_logo"><div class="loader_content"></div></div><span class="team_name" style="width: 60%;"><div class="loader_content"></div></span></div><div class="match_center" style="grid-template-columns: 1fr;"><div><div class="loader_content"></div></div></div><div class="team team_2"><div class="team_logo"><div class="loader_content"></div></div><span class="team_name" style="width: 60%;"><div class="loader_content"></div></span></div></div></div>`;
for (i = 0; i < 3; i++) {
    $(".matches_container").append(loader_match_div);
}


get_matches_json(0);
function get_matches_json(matches_index = 0) {

    if (matches_index == 0) {

        var date_ob = new Date();
        var date = ("0" + date_ob.getDate()).slice(-2);
        var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        var year = date_ob.getFullYear();
        var today_date = year + "-" + month + "-" + date;
        $.MouAjax({
            "type": "GET",
            "url": "https://www.filgoal.com/matches/ajaxlist?date=" + today_date,
            "headers": {
                "user-agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
                "referer": "https://www.filgoal.com/matches/"
            },
            success: function (res) {

                if (typeof mouscripts !== "undefined") {
                    table_res = JSON.parse(res);

                } else {
                    table_res = res;

                }

                matches_json = [];


                for (i = 0; i < table_res.length; i++) {
                    match = {};
                    match["id"] = table_res[i].Id;
                    match["team_1_name"] = table_res[i].HomeTeamName;
                    match["team_1_logo"] = "https:" + table_res[i].HomeTeamLogoUrl;
                    match["team_1_score"] = table_res[i].HomeScore == null ? "-" : table_res[i].HomeScore;
                    match["team_1_pen_score"] = table_res[i].HomePenaltyScore;
                    match["team_2_name"] = table_res[i].AwayTeamName;
                    match["team_2_logo"] = "https:" + table_res[i].AwayTeamLogoUrl;
                    match["team_2_score"] = table_res[i].AwayScore == null ? "-" : table_res[i].AwayScore;
                    match["team_2_pen_score"] = table_res[i].AwayPenaltyScore;
                    match["league_name"] = table_res[i].ChampionshipName;
                    match["stadium_Name"] = table_res[i].StadiumName;
                    match_channels = [];
                    if (typeof table_res[i].TvCoverage !== "undefined" && table_res[i].TvCoverage.length > 0) {
                        for (o = 0; o < table_res[i].TvCoverage.length; o++) {
                            ch = {};
                            ch["tv_channel_name"] = table_res[i].TvCoverage[o].TvChannelName;
                            ch["commenter_name"] = table_res[i].TvCoverage[o].CommenterName;
                            match_channels.push(ch);
                        }

                    }
                    match["channels"] = match_channels;
                    match["ChampionshipId"] = table_res[i].ChampionshipId;
                    match_date = new Date(parseInt(/\((.*?)\)/gm.exec(table_res[i].Date)[1])).getTime();

                    // match_date = match_date - ((3 * 60 * 60) - (15 * 60)) * 1000;
                    match["time_stamp"] = match_date;
                    matches_json.push(match);
                }
                show_matches(matches_json);

            },
            fail: function (code, msg) {
                get_matches_json(1);
            }
        });



    } else if (matches_index == 1) {
        alert("حدث خطأ اثناء تحميل الجدول");

    }

}

function show_matches(matches) {
    $(".match").remove();
    all_matches_div = "";

    liga_names = [];

    for (i = 0; i < matches.length; i++) {
        match = matches[i];

        new_time = new Date(match.time_stamp);
        match_hour = new_time.getHours();
        suffix = match_hour >= 12 ? "م" : "ص";
        match_hours = ((match_hour + 11) % 12 + 1);
        match_time_text = zeroFill(match_hours, 2) + ":" + zeroFill(new_time.getMinutes(), 2) + " " + suffix;

        match_channels = match["channels"];

        channels_div = `<li class="channels">`;
        if (match_channels.length > 0) {
            for (e = 0; e < match_channels.length; e++) {

                ch_name = match_channels[e]["tv_channel_name"];
                ch_comentator = match_channels[e]["commenter_name"];
                channels_div = channels_div + `<div class="ch_box mou_box_shadow"><span class="ch_name">${ch_name}</span>`;

                if (typeof ch_comentator !== "undefined" && ch_comentator !== null) {
                    channels_div += `<span class="ch_comentator">${ch_comentator}</span>`;
                }

                channels_div += `</div>`;
            }

        }
        channels_div = channels_div + `</li>`;

        stad_div = (typeof match.stadium_Name !== "undefined" && match.stadium_Name !== null) ? `<li class="match_stad"><span><svg class="mou_icon icon-soccer-court"><use xlink:href="#icon-soccer-court"></use></svg><span class="stad_name">${match.stadium_Name}</span></span></li>` : "";

        match_ch_name = typeof match["tv_channel_name"] !== "undefined" ? match["tv_channel_name"] : "";

        matche_div = `<div class="match mou_box_shadow" data-match_id="${match.id}"><div class="mou_match" >
        <div class="team team_1">
            <img src="${match.team_1_logo}" class="team_logo" width="40" height="40">
            <span class="team_name"><span>${match.team_1_name}</span></span>
        </div>
        <div class="match_center">
            <div class="team_score team_1_score">${match.team_1_score}</div>
            <div class="time_center">
                <span class="mou_match_time">${match_time_text}</span>
                <span class="mou_match_status"></span>
            </div>
            <div class="team_score team_2_score">${match.team_2_score}</div>
        </div>
        <div class="team team_2">
            <img src="${match.team_2_logo}" class="team_logo">
            <span class="team_name"><span>${match.team_2_name}</span></span>
        </div>
    </div>
    
    <div class="info">

        <div class="countdown">

            <div class="match_start_in countdown_timer" data-mou_match_start_in="${match.time_stamp}">
            
            </div>

        </div>

        <ul>

            ${stad_div}
            ${channels_div}
        </ul>

    </div>

    </div>`;


        if (liga_names.includes(match.league_name)) {



        } else {
            liga_names.push(match.league_name);

            liga_div = `<div class="liga_container" data-liga_name="${match.league_name}"><div class="liga_name mou_box_shadow" style="border-color:${stringToColour(match.league_name)};">${match.league_name}</div><div class="liga_matches"></div></div>`;
            $(".matches_container").append(liga_div);
        }


        $(`.liga_container[data-liga_name='${match.league_name}'] .liga_matches`).append(matche_div);

    }

    // sorter_matches = $("<div>" + all_matches_div + "</div>");

    // if (order_matches == true) {

    //     matches_div_array = $(sorter_matches).find(".match");
    //     matches_div_array.sort(function (a, b) {
    //         a_attr = parseInt($(a).find("[data-mou_match_start_in]").attr('data-mou_match_start_in'));
    //         b_attr = parseInt($(b).find("[data-mou_match_start_in]").attr('data-mou_match_start_in'));
    //         now_now = new Date().getTime();
    //         if (a_attr - now_now < -(105 * 60000)) {
    //             return 1;
    //         }
    //         if (b_attr - now_now < -(105 * 60000)) {
    //             return -1;
    //         }
    //         if (a_attr > b_attr) {
    //             return 1;
    //         } else if (a_attr < b_attr) {
    //             return -1;
    //         } else {
    //             return 0;
    //         }
    //     }).appendTo(".matches_container");
    //     // $(".matches_container").html($(matches_div_array));
    // } else {
    //     $(".matches_container").html(all_matches_div);
    // }

    ready_mou_matches_timers();
    ready_match_click();
}

if (typeof timerArray !== "undefined") {
    for (var i = 0; i < timerArray.length; i++) {
        clearInterval(timerArray[i]);
    }
}

var timerArray = [];
function ready_mou_matches_timers() {

    for (var i = 0; i < timerArray.length; i++) {
        clearInterval(timerArray[i]);
    }

    timerArray = [];
    $('[data-mou_match_start_in]').each(function (index) {
        var finalTime = $(this).attr('data-mou_match_start_in');
        ready_mou_matches_timers_loop(index, finalTime);
        var x = setInterval(function () {
            ready_mou_matches_timers_loop(index, finalTime);
        }, 1000);
        timerArray.push(x);
    });
}

function ready_mou_matches_timers_loop(thisIndex, finalTime) {
    var now = new Date().getTime();
    var distance = finalTime - now;
    var timers_days = zeroFill(Math.floor(distance / (1000 * 60 * 60 * 24)), 3);
    var timers_hours = zeroFill(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), 2);
    var timers_minutes = zeroFill(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)), 2);
    var timers_seconds = zeroFill(Math.floor((distance % (1000 * 60)) / 1000), 2);

    // timer_html = `<h4 class="title">باقي علي المباراة : </h4>`;
    timer_html = `<div class="mou_box_shadow"><span class="count">${timers_hours}</span><div class="name">ساعة</div></div>`;
    timer_html += `<div class="mou_box_shadow"><span class="count">${timers_minutes}</span><div class="name">دقيقة</div></div>`;
    timer_html += `<div class="mou_box_shadow"><span class="count">${timers_seconds}</span><div class="name">ثانيه</div></div>`;

    $('[data-mou_match_start_in]').eq(thisIndex).html(timer_html);

    $('[data-mou_match_start_in]').eq(thisIndex).parents(".match").find(".mou_match_time").css("display", "block");

    if (distance < 15 * 60000) {

        $('[data-mou_match_start_in]').eq(thisIndex).parents(".match").addClass("animation").addClass("Nearstart");

        $('[data-mou_match_start_in]').eq(thisIndex).parents(".match").find(".mou_match_time").css("display", "none");
        $('[data-mou_match_start_in]').eq(thisIndex).parents(".match").find(".mou_match_status").html(`<span>اقتربت ع البدء</span>`);
    }
    if (distance < 0) {
        $('[data-mou_match_start_in]').eq(thisIndex).parents(".match").removeClass("Nearstart").addClass("live");

        $('[data-mou_match_start_in]').eq(thisIndex).parents(".match").find(".mou_match_time").css("display", "none");
        $('[data-mou_match_start_in]').eq(thisIndex).parents(".countdown").css("display", "none");
        $('[data-mou_match_start_in]').eq(thisIndex).parents(".match").find(".mou_match_status").html(`<span>مباشر ( ${Math.abs(timers_minutes)} )</span>`);
        $('[data-mou_match_start_in]').eq(thisIndex).html(``);

    }
    if (distance < -(45 * 60000)) {
        $('[data-mou_match_start_in]').eq(thisIndex).parents(".match").removeClass("Nearstart").removeClass("live").addClass("betmatch");

        $('[data-mou_match_start_in]').eq(thisIndex).parents(".match").find(".mou_match_time").css("display", "none");
        $('[data-mou_match_start_in]').eq(thisIndex).parents(".match").find(".mou_match_status").html(`<span>بين الشوطين</span>`);
        $('[data-mou_match_start_in]').eq(thisIndex).html(``);

    }
    if (distance < -(62 * 60000)) {
        $('[data-mou_match_start_in]').eq(thisIndex).parents(".match").removeClass("Nearstart").removeClass("betmatch").addClass("live");
        $('[data-mou_match_start_in]').eq(thisIndex).parents(".match").find(".mou_match_time").css("display", "none");
        $('[data-mou_match_start_in]').eq(thisIndex).parents(".match").find(".mou_match_status").html(`<span>مباشر ( ${Math.abs(timers_minutes - 43)} )</span>`);
        $('[data-mou_match_start_in]').eq(thisIndex).html(``);

    }
    if (distance < -(107 * 60000)) {

        end_match(thisIndex);


    }
}

function end_match(thisIndex) {
    clearInterval(timerArray[thisIndex]);

    $('[data-mou_match_start_in]').eq(thisIndex).parents(".match").removeClass("Nearstart").removeClass("betmatch").removeClass("live").removeClass("animation").addClass("match_ended");

    $('[data-mou_match_start_in]').eq(thisIndex).parents(".match").find(".mou_match_time").css("display", "block");

    $('[data-mou_match_start_in]').eq(thisIndex).parents(".match").find(".mou_match_status").html(`<span>انتهت</span>`);

    $('[data-mou_match_start_in]').eq(thisIndex).html(``);



}

function zeroFill(number, width) {
    width -= number.toString().length;
    if (width > 0) {
        return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
    }
    return number + ""; // always return a string
}

function ready_match_click() {
    $(".mou_match").off("click");
    $(".ch_box").off("click");
    $(".mou_match").click(function () {
        if (!$(this).hasClass("active")) {
            // $(this).parents(".match").find(".info").removeClass("slideUp").addClass("slideDown");

            $(this).parents(".match").find(".info").slideDown(150);

            $(this).addClass("active");
        } else {
            // $(this).parents(".match").find(".info").removeClass("slideDown").addClass("slideUp");

            $(this).parents(".match").find(".info").slideUp(150);


            $(this).removeClass("active");
        }
    });

    $(".ch_box").click(function () {
        ch_name = $(this).find(".ch_name").text();

        get_ch_sources_from_blogger(ch_name);
    });
}

function get_ch_sources_from_blogger(ch_name) {
    $(".ch_searching_for").text(ch_name);
    ch_name_search_key = ch_name + "---" + ch_name.length;
    $("#res_ch_search").html(`<span><i class="fas fa-circle-notch fa-spin fa-lg"></i> جاري البحث عن مصادر قناة ${ch_name}</span>`)

    $("#ch_search").openpopup();

    $.MouAjax({
        "type": "GET",
        "url": `https://www.blogger.com/feeds/4509831944672887969/posts/default?q="${ch_name_search_key}"&alt=json&orderby=published&start-index=1&max-results=9999`,
        "headers": {
            "user-agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36"
        },
        success: function (res) {

            if (typeof mouscripts !== "undefined") {
                blogger_res = JSON.parse(res);
            } else {
                blogger_res = res;
            }


            if (typeof blogger_res.feed.entry !== "undefined" && blogger_res.feed.entry.length > 0) {


                for (i = 0; i < blogger_res.feed.entry.length; i++) {

                    post_contnet = blogger_res.feed.entry[i].content["$t"];
                    player_json = $("<div>" + post_contnet + "</div>").find("player_json");


                    sources = JSON.parse(mou_custom_decode(player_json.html()))["sources"];

                    filterd_sources = sources.filter(function (element) {
                        return element.working;
                    });
                    if (filterd_sources.length > 0) {

                        $("#res_ch_search").html("");
                        for (s = 0; s < filterd_sources.length; s++) {


                            source = filterd_sources[s];

                            source_name = source.name == "" ? "مصدر " + (s + 1) : source.name;
                            source.name = ch_name + " - " + source_name

                            $("#res_ch_search").append(`<span class="mou_btn" onclick="custom_play_vid(this,'${mou_custom_encode(JSON.stringify(source))}','#ch_search')">${source_name}</span>`);

                        }
                    } else {
                        $("#res_ch_search").html(`لا يوجد مصادر متوفرة لهذه القناة حتي الان`);
                    }



                }


            } else {
                $("#res_ch_search").html(`لا يوجد مصادر متوفرة لهذه القناة حتي الان`);

            }

        }
    });



}

async function custom_play_vid(this_btn, encoded_json) {
    this_btn = $(this_btn);


    if ($(this_btn).hasClass("loading_data") !== true) {
        $(this_btn).addClass("loading_data").prepend(`<i class="fas fa-circle-notch fa-spin fa-lg loading_icon">  `);
    }

    source = JSON.parse(mou_custom_decode(encoded_json));
    source_link = source.link;
    source_name = source.name == "" ? "مصدر " + (s + 1) : source.name;
    vid_headers = {};
    user_agent = "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36";

    if (typeof source.file_gets_data !== "undefined" && source.file_gets_data.length > 0) {


        for (a = 0; a < source.file_gets_data.length; a++) {
            source_action = source.file_gets_data[a];



            if ((typeof source_action.regex !== "undefined" && source_action.regex !== "") || (typeof source_action.function !== "undefined" && source_action.function !== "")) {

                action_headers = typeof source_action.custom_headers !== "undefined" ? source_action.custom_headers : {};

                if (typeof source_action.type_of_select !== "undefined" && source_action.type_of_select == "regex") {


                    regex = mou_custom_decode(source_action.regex);
                    re_matches = /\/(.*)\/(.*)/g.exec(regex);
                    re_string = re_matches[1];
                    re_letters = re_matches[2];
                    re = new RegExp(re_string, re_letters);
                    await new Promise((resolve, reject) => {
                        $.MouAjax({
                            url: source_link,
                            headers: action_headers,
                            success: function (res) {
                                source_link = re.exec(res)[1];
                                resolve();
                            }
                        })

                    })

                } else if (typeof source_action.type_of_select !== "undefined" && source_action.type_of_select == "function") {

                    await new Promise((resolve, reject) => {
                        $.MouAjax({
                            url: source_link,
                            headers: action_headers,
                            success: function (res) {

                                var this_function_text = mou_custom_decode(source_action.function);


                                new_function_name = "mou_func_" + Date.now();
                                script = $(`<script data-id='${new_function_name}'>`);
                                $(script).text(`function ${new_function_name} (page_res){${this_function_text}}`);
                                $("body").append(script);

                                source_link = window[new_function_name](res);

                                $(`script[data-id='${new_function_name}']`).remove();


                                resolve();

                            }
                        })

                    })





                }




            }
        }

        if (typeof source.file_gets_data[source.file_gets_data.length - 1] !== "undefined" && typeof source.file_gets_data[source.file_gets_data.length - 1].custom_headers !== "undefined") {
            vid_headers = source.file_gets_data[source.file_gets_data.length - 1].custom_headers;
        }

    }

    for (i = 0; i < Object.keys(vid_headers).length; i++) {
        if (["user-agent", "useragent"].includes(Object.keys(vid_headers)[i])) {
            user_agent = vid_headers[Object.keys(vid_headers)[i]];
            delete vid_headers[Object.keys(vid_headers)[i]];
        }

    }
    $(this_btn).removeClass("loading_data").find(".loading_icon").remove();

    if (source_link !== "" && typeof mouscripts !== "undefined") {

        mouscripts.play_vid(source_link, source_name, user_agent, JSON.stringify(vid_headers));
    }

}


function stringToColour(string, saturation = 100, lightness = 75) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    return `hsl(${(hash % 360)}, ${saturation}%, ${lightness}%)`;
}


function copy_to_clipboard(text = "") {
    text_area = $(`<textarea style="position:fixed;"></textarea>`);
    $(text_area).text(text);
    $(text_area).appendTo("body");
    $(text_area).focus();
    $(text_area).select();
    try {
        successful = document.execCommand('copy');
        msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.log('Oops, unable to copy');
    }
    $(text_area).remove();
}