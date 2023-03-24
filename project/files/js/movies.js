// $(document).ajaxSuccess(function (event, xhr, settings) {

// }).ajaxError(function (event, jqxhr, settings, thrownError) {
//     if (jqxhr.status == 403) {
//         settings.url = "https://webcache.googleusercontent.com/search?q=cache:" + settings.url;
//         $.ajax(settings);
//     }
// });

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

var lazyloadThrottleTimeout;

function lazyload() {
    var lazyloadImages = $(".lazy_poster_img");
    if (lazyloadThrottleTimeout) {
        clearTimeout(lazyloadThrottleTimeout);
    }

    lazyloadThrottleTimeout = setTimeout(function () {
        var scrollTop = window.pageYOffset;
        $(".lazy_poster_img").each(function () {
            if ($(this).offset().top < (window.innerHeight + scrollTop + 1000)) {
                $(this).attr(`style`, `background:url(${$(this).attr("data-poster_img")}) no-repeat center center;background-size: cover`);
                $(this).removeClass('lazy_poster_img');
            }
        });
        if (lazyloadImages.length == 0) {
            document.removeEventListener("scroll", lazyload);
            window.removeEventListener("resize", lazyload);
            window.removeEventListener("orientationChange", lazyload);
        }
    }, 20);
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


                    post_div = `<a class="vide_container my_box_shadow" data-film_title="${post_title}" data-film_url="${post_url}"><span
                class="vide_thump lazy_poster_img" data-poster_img="${post_img}"></span>
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

                lazyload();
                document.addEventListener("scroll", lazyload);
                window.addEventListener("resize", lazyload);
                window.addEventListener("orientationChange", lazyload);


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
                    this_epo_num = false;
                    $.ajax({
                        "type": "GET",
                        "url": film_url,
                        success: function (res) {
                            res_html = $(res);

                            vid_title = $(res_html).find(".movie-cover h1.entry-title").text();
                            vid_img = $(res_html).find(".movie-cover img").attr("src");

                            post_type = (film_url.includes("/series/") || $(res_html).find(".header-tabs-container").length == 0) ? "series" : "film";

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
                        </div>
                        <div class="mou_vid_container" id="msader_eltahmel">
                            <h5 class="header-title">التحميل</h5>
                            <div class="download_sources"></div>
                        </div>`;

                            $(".post_content").html(post_html);


                            if (post_type == "series") {

                                $("#hlakat_elmoslsal_container").show();
                                $("#msader_elmoshda,#msader_eltahmel").hide();

                                $("#eposids_num").text(` ( ${$(res_html).find("#series-episodes , #show-episodes").find(".col-12").length} ) `);
                                $(res_html).find("#series-episodes , #show-episodes").find(".col-12").each(function () {
                                    epo_num = $(this).find("a").text().trim().match(/(\d+)/)[0];
                                    epo_link = $(this).find("a").attr("href")
                                    $("#hlakat_elmoslsal").append(`<a class="mou_eps_num" data-epo_link="${epo_link}"><em>${epo_num}</em><span>حلقة</span></a>`);
                                });
                                $("[data-epo_link]").off("click").click(function () {
                                    $(".mou_eps_num").removeClass("active");
                                    $(this).addClass("active");

                                    $("#msader_elmoshda,#msader_eltahmel").show();
                                    $(".watch_sources,.download_sources").html(`<span><i class="fas fa-circle-notch fa-spin fa-lg"></i> جاري التحميل</span>`);

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

                                $(".watch_sources,.download_sources").html(`<span><i class="fas fa-circle-notch fa-spin fa-lg"></i> جاري التحميل</span>`);

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


$("#search_in_aflam").click(function () {
    $("#aflam_search .aflam_search_key").val("");
    $("#aflam_search").openpopup();
    $("#aflam_search .aflam_search_key").focus();
    back_buttons_functions.unshift(function () {
        $("#aflam_search").closepopup();
    });
});
$("#aflam_search .aflam_search_key").keypress(function (event) {
    if (event.keyCode == 13) {
        $("#submit_search_in_aflam").click();
    }
});
$(document).on("click", "#submit_search_in_aflam", function () {
    $(".post_content").hide();
    $(".posts_ul").html("");
    $("#header_title").text("البطل - البحث");
    search_key = $("#aflam_search .aflam_search_key").val();
    if (search_key == "") {
        showToast("يرجي ادخال كلمة البحث");
    } else {
        now_aflam_search_function(search_key);
        $("#aflam_search").closepopup();
    }
})


var now_aflam_cats = false;
var now_load_list_function = false;
var now_load_film_function = false;
var now_load_7alakat_function = false;
var now_load_msadr_watch_function = false;
var now_aflam_server_domain = "";
var now_server_title = false;
var now_aflam_search_function = false;
$(document).ready(function () {
    $("#header_title").text("المشاهدة");
    now_aflam_cats = mou_aflam_servers_array;
    for (let i = 0; i < Object.keys(now_aflam_cats).length; i++) {
        cat_name = Object.keys(now_aflam_cats)[i];
        cat_name_text = "سيرفر " + (i + 1);
        cat_val = now_aflam_cats[Object.keys(now_aflam_cats)[i]];
        check_server_domain = cat_val.server_domain;

        $(".servers_btns_container").append(`<button class="server_btn" data-check_server="${check_server_domain}" onclick="load_aflam_server('${cat_name}')" style="display:none;">${cat_val.icon} ${cat_name}</button>`);

        if (check_server_domain !== "undefined") {
            $.ajax({
                type: "HEAD",
                url: check_server_domain,
                success: function (data, textStatus, xhr) {
                    $(".servers_btns_container").append($(`.server_btn[data-check_server="${this.url}"]`));
                    $(`.server_btn[data-check_server="${this.url}"]`).show("online")
                }
            });
        }
    }
});


function load_aflam_server(server_name) {
    $("#header_title").text("البطل - " + server_name);
    $(".servers_btns_container").html("");
    for (let i = 0; i < Object.keys(now_aflam_cats).length; i++) {
        cat_name = Object.keys(now_aflam_cats)[i];
        cat_val = now_aflam_cats[Object.keys(now_aflam_cats)[i]];

        if (cat_name == server_name) {
            if (typeof cat_val.server_title !== "undefined") {
                now_server_title = cat_val.server_title;
            }
            if (typeof cat_val.load_list_function == "function") {
                now_load_list_function = cat_val.load_list_function;
            }
            if (typeof cat_val.load_film_function == "function") {
                now_load_film_function = cat_val.load_film_function;
            }
            if (typeof cat_val.load_7alakat_function == "function") {
                now_load_7alakat_function = cat_val.load_7alakat_function;
            }
            if (typeof cat_val.load_msadr_watch_function == "function") {
                now_load_msadr_watch_function = cat_val.load_msadr_watch_function;
            }
            if (typeof cat_val.server_domain !== "undefined") {
                now_aflam_server_domain = cat_val.server_domain;
            }
            if (typeof cat_val.search_function !== "undefined") {
                now_aflam_search_function = cat_val.search_function;
                $("#search_in_aflam").show();
            }

            if (cat_val.type == "cats" && typeof cat_val.cats !== "undefined") {

                for (let i = 0; i < Object.keys(cat_val.cats).length; i++) {
                    cat_name = Object.keys(cat_val.cats)[i];
                    this_cat_val = cat_val.cats[Object.keys(cat_val.cats)[i]];
                    $(".servers_btns_container").append(`<button class="server_btn" onclick="load_aflam_server('${cat_name}')">${this_cat_val.icon} ${cat_name}</button>`);
                }

                now_aflam_cats = cat_val.cats;
            } else if (cat_val.type == "list") {
                $("#load_more_posts_btn").html("جاري التحميل");
                $(".servers_btns_container").hide();
                $(".server_content").show();
                $.ajax({
                    "type": "GET",
                    "url": now_aflam_server_domain + cat_val.url,
                    success: function (res) {
                        now_load_list_function(res, "first_load");
                        $("#load_more_posts_btn").html("تحميل المزيد");
                    }
                });
            }

            break;
        }
    }



}
function load_aflam_posts(aflam_json, load_type) {
    if (load_type == "first_load") {
        $(".posts_ul").html("");
    }
    aflam = aflam_json.aflam;
    for (let index = 0; index < aflam.length; index++) {
        const film = aflam[index];


        post_div = $(`<a class="vide_container my_box_shadow" data-film_title="${film.title}" data-film_url="${film.url}" data-film_img="${film.img}" data-server_title="${film.server_title}" data-film_type="${film.type}" onclick="load_film(this)">
        <div class="vide_container_overlay"></div>
        <span
        class="vide_thump lazy_poster_img" data-poster_img="${film.img}"></span>
    <div class="vide_disc">
        <div class="about_vid">
            <div class="vid_detailes_container">
                <h3>${film.title}</h3>
            </div>
        </div>
    </div>
</a>`);
        if (typeof film.eposide !== "undefined") {
            $(post_div).find(".vide_container_overlay").append(`<a class="mou_eps_num mou_vid_container"><em>${film.eposide}</em><span>حلقة</span></a>`);
            $(post_div).attr("data-eposide", film.eposide)
        }

        $(".posts_ul").append($(post_div));
    }
    lazyload();
    document.addEventListener("scroll", lazyload);
    window.addEventListener("resize", lazyload);
    window.addEventListener("orientationChange", lazyload);

    if (typeof aflam_json.next_page !== "undefined") {
        next_page = aflam_json.next_page;
        $("#load_more_posts_btn").attr("onclick", `load_more_posts('${next_page}','${aflam_json.server_title}')`);
    } else {
        $("#load_more_posts_btn").remove();
    }

    $(document).off("scroll");
    $(document).scroll(function () {
        if ($('#load_more_posts_btn').length > 0) {
            if (is_elment_in_view_port('#load_more_posts_btn', 0, 5000)) {
                $("#load_more_posts_btn").click();
            }
        }
    });
}
var loading_more_posts = false;
function load_more_posts(page_url, server_title) {
    if (loading_more_posts == false) {
        loading_more_posts = true;
        $.ajax({
            "type": "GET",
            "url": page_url,
            success: function (res) {
                now_load_list_function(res, "load_more");
                loading_more_posts = false;
            }
        });
    }


}
function load_7alakat(this_btn) {

    $("#hlakat_elmoslsal_container").show();
    $("#hlakat_elmoslsal").html("");
    $("#moasm_elmoslsal .mou_eps_num").removeClass("activee");
    $(this_btn).addClass("activee");

    now_load_7alakat_function(this_btn);
}
function load_msadr_watch(watch_msdar_link, watch_type, this_btn = false) {

    $("#msader_elmoshda").show();
    $("#msader_eltahmel").show();
    $("#hlakat_elmoslsal_container .mou_eps_num").removeClass("activee");
    if (this_btn !== false) {
        $(this_btn).addClass("activee");
    }
    now_load_msadr_watch_function(watch_msdar_link, watch_type);
}
function load_film(this_btn) {


    $(".post_content").html(`<div class="mou_vid_container"><div class="post_img_container" style="width:200px;height: 306px;margin-bottom: 0.5rem;"><div class="loader_content"></div></div><span class="post_title" style="height: 20px;"><div class="loader_content"></div></span></div>`);
    $(".server_content").hide();
    $(".post_content").show();

    now_load_film_function(this_btn);
}

function show_film_data(film_data) {
    table_trs = ``;
    for (index = 0; index < Object.keys(film_data.trs).length; index++) {
        key = Object.keys(film_data.trs)[index];
        val = film_data.trs[key];
        table_trs += `<tr><td>${key}</td><td>${val}</td></tr>`;
        // console.log(key);
    }

    post_html = `<div class="mou_vid_container">

        <div class="post_img_container">
            <img src="${film_data.img}">
        </div>
        <span class="post_title">${film_data.title}</span>
        <table class="mou-info-table">
            <tbody>
                ${table_trs}
            </tbody>
        </table>
    </div>
    <div class="mou_vid_container">
        <h5 class="header-title">القصة</h5><span id="video_description">${film_data.description}</span>
    </div>
    <div class="mou_vid_container" id="moasm_elmoslsal_container" style="display:none;">
        <h5 class="header-title">المواسم<span id="moasm_num"></span></h5>
        <div class="halakat_btns" id="moasm_elmoslsal"></div>
    </div>
    <div class="mou_vid_container" id="hlakat_elmoslsal_container" style="display:none;">
        <h5 class="header-title">الحلقات<span id="eposids_num"></span></h5>
        <div class="halakat_btns" id="hlakat_elmoslsal"></div>
    </div>
    <div class="mou_vid_container" id="msader_elmoshda" style="display:none;">
        <h5 class="header-title">مصادر المشاهدة</h5>
        <div class="watch_sources"></div>
    </div>
    <div class="mou_vid_container" id="msader_eltahmel" style="display:none;">
        <h5 class="header-title">التحميل</h5>
        <div class="download_sources"></div>
    </div>`;

    $(".post_content").html(post_html);

}
