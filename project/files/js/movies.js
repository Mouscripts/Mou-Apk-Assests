var search_key = "";
function load_akowam(this_btn, link, is_search = false) {
    $(".servers_btns_container").hide();
    $(".server_content").show();

    title_before = $("#header_title").text();
    new_header_title = $(this_btn).text();
    if (is_search == true) {
        new_header_title = "نتائج البحث عن : " + search_key;
    }
    $("#header_title").text(new_header_title);
    $(".server_content .posts_ul").html("");
    load_akoam_posts(link, is_search);

    back_buttons_functions.unshift(function () {
        $(".servers_btns_container").show();
        $(".server_content").hide();
        $("#header_title").text(title_before);
    });
}
var loading_posts = false;
function load_akoam_posts(url, is_search = false) {
    if (loading_posts == false) {
        loading_posts = true;
        $("#load_more_posts_btn").html("جاري التحميل");
        $.ajax({
            "type": "GET",
            "url": url,
            success: function (res) {
                res_html = $(res);

                $(res_html).find(".widget-body").find(".entry-box").each(function () {
                    post_url = $(this).find("a").attr("href");
                    post_title = $(this).find(".entry-title a").text();
                    post_img = $(this).find(".entry-image img").attr("data-src");


                    post_div = `<a class="vide_container my_box_shadow" data-film_url="${post_url}"><span
                class="vide_thump"
                style="background:url(${post_img}) no-repeat center center;background-size: cover"></span>
            <div class="vide_disc">
                <div class="about_vid">
                    <div class="vid_detailes_container">
                        <h3>${post_title}</h3>
                    </div>
                </div>
            </div>
        </a>`;


                    if (is_search == true) {
                        if (post_url.includes("/movie/") || post_url.includes("/series/") || post_url.includes("/shows/")) {
                            $(".posts_ul").append(post_div);
                        }
                    } else {

                        $(".posts_ul").append(post_div);
                    }


                });


                if ($(res_html).find(".pagination").length == 0 || $(res_html).find(".pagination .page-item").last().hasClass("disabled")) {
                    $("#load_more_posts_btn").remove();
                } else {
                    next_page_url = $(res_html).find(".pagination .page-link[rel='next']").attr("href");
                    $("#load_more_posts_btn").attr("onclick", `load_akoam_posts('${next_page_url}',${is_search})`);
                }

                $(document).off("scroll");
                $(document).scroll(function () {
                    if ($('#load_more_posts_btn').length > 0) {
                        if (is_elment_in_view_port('#load_more_posts_btn', 0, 5000)) {
                            $("#load_more_posts_btn").click();
                        }
                    }
                });
                $("[data-film_url]").off("click");
                $("[data-film_url]").click(function () {

                    aflams_content_scrolled_from_top = $(document).scrollTop();
                    $(".post_content").attr("data-scrolled", aflams_content_scrolled_from_top);

                    title_before = $("#header_title").text();
                    $("#header_title").text($(this).find(".vid_detailes_container h3").text());
                    back_buttons_functions.unshift(function () {
                        $(".server_content").show();
                        $(".post_content").hide();
                        $("#header_title").text(title_before);
                        $(document).scrollTop(aflams_content_scrolled_from_top);

                    });

                    $(".post_content").html(`<div class="mou_vid_container"><div class="post_img_container" style="width:200px;height: 306px;margin-bottom: 0.5rem;"><div class="loader_content"></div></div><span class="post_title" style="height: 20px;"><div class="loader_content"></div></span></div>`);

                    $(".server_content").hide();
                    $(".post_content").show();
                    film_url = $(this).attr("data-film_url");
                    post_type = (film_url.includes("/series/") || film_url.includes("/shows/")) ? "series" : "film";
                    this_epo_num = false;
                    $.ajax({
                        "type": "GET",
                        "url": film_url,
                        success: function (res) {
                            res_html = $(res);

                            vid_title = $(res_html).find(".movie-cover h1.entry-title").text();
                            vid_img = $(res_html).find(".movie-cover img").attr("src");

                            table_trs = ``;

                            for (i = 0; i < $(res_html).find(".movie-cover .col-lg-7 div.mt-2").length; i++) {
                                if (i == 0) {
                                    continue;
                                }
                                key_value = $(res_html).find(".movie-cover .col-lg-7 div.mt-2").eq(i).find("span").text().split(":");
                                if (key_value.length > 1) {
                                    key = key_value[0].trim();
                                    val = key_value[1].trim();
                                    table_trs += `<tr><td>${key}</td><td>${val}</td></tr>`;
                                }
                            }

                            vid_description = $(res_html).find(".widget-body h2 p").text();

                            post_html = `<div class="mou_vid_container">

                            <div class="post_img_container">
                                <img src="${vid_img}">
                            </div>
                            <span class="post_title">${vid_title}</span>
                            <table class="mou-info-table">
                                <tbody>
                                    ${table_trs}
                                </tbody>
                            </table>
                        </div>
                        <div class="mou_vid_container">
                            <h5 class="header-title">القصة</h5><span id="video_description">${vid_description}</span>
                        </div>
                        <div class="mou_vid_container" id="hlakat_elmoslsal_container" style="display:none;">
                            <h5 class="header-title">الحلقات<span id="eposids_num"></span></h5>
                            <div id="hlakat_elmoslsal"></div>
                        </div>
                        <div class="mou_vid_container" id="msader_elmoshda">
                            <h5 class="header-title">مصادر المشاهدة</h5>
                            <div class="watch_sources"></div>
                        </div>`;

                            $(".post_content").html(post_html);


                            if (post_type == "series") {

                                $("#hlakat_elmoslsal_container").show();
                                $("#msader_elmoshda").hide();

                                $("#eposids_num").text(` ( ${$(res_html).find("#series-episodes , #show-episodes").find(".col-12").length} ) `);
                                $(res_html).find("#series-episodes , #show-episodes").find(".col-12").each(function () {
                                    epo_num = $(this).find("a").text().trim().match(/(\d+)/)[0];
                                    epo_link = $(this).find("a").attr("href")
                                    $("#hlakat_elmoslsal").append(`<a class="mou_eps_num" data-epo_link="${epo_link}"><em>${epo_num}</em><span>حلقة</span></a>`);
                                });
                                $("[data-epo_link]").off("click").click(function () {
                                    $(".mou_eps_num").removeClass("active");
                                    $(this).addClass("active");

                                    $("#msader_elmoshda").show();
                                    $(".watch_sources").html(`<span><i class="fas fa-circle-notch fa-spin fa-lg"></i> جاري التحميل</span>`);

                                    this_epo_num = $(this).find("em").text();
                                    this_epo_link = $(this).attr("data-epo_link");
                                    $.ajax({
                                        "type": "GET",
                                        "url": this_epo_link,
                                        success: function (epo_html) {
                                            watch_red_url = $(epo_html).find(".qualities a.link-btn").attr("href");


                                            get_watche_servers_from_red_link(watch_red_url);
                                        }
                                    });
                                });

                            } else {

                                $(".watch_sources").html(`<span><i class="fas fa-circle-notch fa-spin fa-lg"></i> جاري التحميل</span>`);

                                watch_red_url = $(res_html).find(".qualities a.link-btn").attr("href");
                                get_watche_servers_from_red_link(watch_red_url);



                            }



                        }
                    })

                });

                loading_posts = false;
                $("#load_more_posts_btn").html("تحميل المزيد");
            }
        });

    }

}

function is_elment_in_view_port(elm, top = 0, bottom = 0, left = 0, right = 0) {

    stop_for_unvisable = false;
    $(elm).parents().each(function () {
        if ($(this).css("display") == "none") {
            stop_for_unvisable = true;
        }
    });

    if (stop_for_unvisable == true) {
        return false;
    }

    bounding = document.querySelector(elm).getBoundingClientRect();
    if (
        bounding.top >= top &&
        bounding.left >= left &&
        bounding.right <= (window.innerWidth || document.documentElement.clientWidth) + right &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) + bottom
    ) {
        return true;
    } else {
        return false;
    }
}

function get_watche_servers_from_red_link(red_link) {
    $.ajax({
        "type": "GET",
        "url": red_link,
        success: function (watch_red_res) {
            direct_watch_link = $(watch_red_res).find(".page-download .download-link").attr("href");

            $.ajax({
                "type": "GET",
                "url": direct_watch_link,
                success: function (dircet_watch_res) {
                    $(".watch_sources").html("");
                    alert(dircet_watch_res);
                    size_used = [];

                    $(dircet_watch_res).find("video").find("source").each(function () {
                        src_name = $(this).attr("size") + "p";
                        src_link = $(this).attr("src");
                        src_size = $(this).attr("size");

                        if (!size_used.includes(src_size)) {

                            $(".watch_sources").append(`<span class="mou_btn" onclick="mouscripts.play_vid(\`${src_link}\`, \`${vid_title} - ${this_epo_num !== false ? "حلقة " + this_epo_num + " - " : ""}${src_name}\`,\`Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36\`, \`{}\`)">${src_name}</span>`);
                            size_used.push(src_size);
                        }

                    });

                }
            });

        }
    });
}

function load_aflam(what = "") {
    if (what !== "") {
        if (what == "akowam") {
            show_akoam_cats("movies");
            $("#header_title").text("أفلام");
        }
    }
}
function load_muslslat(what = "") {
    if (what !== "") {
        if (what == "akowam") {
            show_akoam_cats("series");
            $("#header_title").text("مسلسلات");

        }
    }
}
function load_shows(what = "") {
    if (what !== "") {
        if (what == "akowam") {
            show_akoam_cats("shows");
            $("#header_title").text("تلفزيون");

        }
    }
}

function show_akoam_cats(cat = "movies") {

    if (cat == "shows") {
        cats = {
            "البرامج التلفزيونية": "42",
            "البرامج الوثائقية": "46",
            "المسرحيات": "45",
            "المصارعة الحرة": "43",
        };
    } else {
        cats = {
            "عربية": "29",
            "اجنبية": "30",
            "هندية": "31",
            "تركية": "32",
            "اسيوية": "33"
        };
    }

    $(".servers_btns_container").html("");
    for (i = 0; i < Object.keys(cats).length; i++) {
        cat_id = cats[Object.keys(cats)[i]];
        if (cat == "movies") {
            button_text = "افلام " + Object.keys(cats)[i];
            button_icon = `<i class="fas fa-film"></i>`;
        } else if (cat == "series") {
            button_text = "مسلسلات " + Object.keys(cats)[i];
            button_icon = `<i class="fas fa-tv"></i>`;
        } else if (cat == "shows") {
            button_text = Object.keys(cats)[i];
            button_icon = `<i class="fal fa-tv-retro"></i>`;
        }


        $(".servers_btns_container").append(`<button class="server_btn" onclick="javascript:load_akowam(this,'https://akwam.to/${cat}?section=${cat_id}')">${button_icon}${button_text}</button>`);
    }

    back_buttons_functions.unshift(function () {
        $(".servers_btns_container").html(`<button class="server_btn" onclick="load_aflam('akowam')"><i class="fas fa-film"></i> أفلام
</button>
<button class="server_btn" onclick="load_muslslat('akowam')"><i class="far fa-tv"></i> مسلسلات</button>`);
    });
}

$("#search_in_aflam").click(function () {
    $("#akowam_search").openpopup();
    $("#akowam_search .search_key").focus();
    back_buttons_functions.unshift(function () {
        $("#akowam_search").closepopup();
    });
});
$("#akowam_search .search_key").keypress(function (event) {
    if (event.keyCode == 13) {
        $("#submit_search_in_akowam").click();
    }
});
$("#submit_search_in_akowam").click(function () {
    $(".post_content").hide();
    search_key = $("#akowam_search .search_key").val();
    search_link = "https://to.akwam.cz/search?q=" + search_key;
    load_akowam(this, search_link, true);
    $("#akowam_search").closepopup();

})