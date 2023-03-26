obj =
{
    "main_domain": "https://k1.arabseed.ink/",
    "server_domain": "https://arbsed.sbs/",
    "type": "cats",
    "server_title": "arabseed",
    "icon": `<i class="fas fa-film"></i>`,
    "load_list_function": function (res, load_type = "first_load") {
        aflam_json = {};
        aflam_posts = [];
        doc = new DOMParser().parseFromString(res, "text/html");

        $(doc).find(".Blocks-UL").find(".MovieBlock").each(function () {
            film = {};
            film.url = $(this).find("a[href]").attr("href");
            film.type = $(this).find(".number").length > 0 ? "muslsal" : "film";
            film.title = $(this).find(".BlockName h4").text().trim();

            if (/^مسلسل(.*)الحلقة/gm.test(film.title) == true) {
                film.title = /^مسلسل(.*)الحلقة/gm.exec(film.title)[1].trim();
            } else if (/^فيلم(.*)/gm.test(film.title) == true) {
                film.title = /^فيلم(.*)/gm.exec(film.title)[1].trim();
            }
            if ($(this).find(`.number`).length > 0) {
                film.eposide = parseInt($(this).find(`.number span`).text().trim().match(/(\d+)/)[0], 10);
            }
            film.img = $(this).find(".Poster img").attr("data-src");
            aflam_posts.push(film);
        });
        aflam_json.server_title = now_server_title;
        aflam_json.aflam = aflam_posts;

        $(doc).find(`.pagination ul.page-numbers *.page-numbers`).each(function (index) {
            if ($(this).hasClass("current")) {
                next_button = $(doc).find(`.pagination ul.page-numbers .page-numbers`).eq(index + 1);
                if (next_button.length > 0) {
                    next_page_link = $(next_button).attr("href");
                    aflam_json.next_page = now_aflam_server_domain + next_page_link;
                }
            }
        });

        load_aflam_posts(aflam_json, load_type);
    }, search_function: function (key) {
        search_url = now_aflam_server_domain + "find/?find=" + key;
        $("#load_more_posts_btn").html("جاري التحميل");
        $(".servers_btns_container").hide();
        $(".server_content").show();
        $.ajax({
            "type": "GET",
            "url": search_url,
            success: function (res) {
                now_load_list_function(res, "first_load");
                $("#load_more_posts_btn").html("تحميل المزيد");
            }
        });
    },
    load_film_function: function (this_btn) {
        film_title = $(this_btn).attr("data-film_title");
        film_url = $(this_btn).attr("data-film_url");
        film_img = $(this_btn).attr("data-film_img");
        page_type = $(this_btn).attr("data-film_type");
        $.ajax({
            "type": "GET",
            "url": film_url,
            success: function (res) {
                film_data = {};
                film_trs = {};
                doc = new DOMParser().parseFromString(res, "text/html");
                film_data.title = film_title;
                film_data.img = film_img;
                film_data.description = $(doc).find(`.StoryLine`).find("p.descrip").eq(1).text();

                $(doc).find(`.MetaTermsInfo li`).each(function () {
                    tr = {};
                    tr_key = $(this).find("span").text().replace(":", "").trim();
                    tr_val = $(this).find("a").text().trim();
                    if (["مدة العرض", "السنه", "اللغة", "الجودة", "الدولة"].includes(tr_key)) {
                        film_trs[tr_key] = tr_val;
                    }
                })
                film_data.trs = film_trs;
                show_film_data(film_data);

                if (page_type == "film") {
                    watch_url = $(doc).find(`.WatchButtons .watchBTn`).attr("href");

                    load_arab_seed_watch_server(watch_url, "film", film_url);

                } else if (page_type == "muslsal") {

                    if ($(doc).find(".SeasonsListHolder").length > 1) {

                        $("#moasm_elmoslsal_container").show();
                        moasm_num = $(doc).find(".SeasonsListHolder ul li").length;
                        $("#moasm_num").text(` ( ${moasm_num} ) `);

                        $(doc).find(".SeasonsListHolder ul li").each(function () {

                            moasem_dic = {
                                1: ["الأول", "الاول"],
                                2: ["الثاني"],
                                3: ["الثالث"],
                                4: ["الرابع"],
                                5: ["الحامس"],
                                6: ["السادس"],
                                7: ["السابع"],
                                8: ["الثامن"],
                                9: ["التاسع"]
                            }

                            mosem_text = $(this).find("span").text().trim();

                            if ($(this).find("span").text() !== "") {


                                for (i = 0; i < Object.keys(moasem_dic).length; i++) {
                                    mosem_texts = moasem_dic[Object.keys(moasem_dic)[i]];
                                    for (e = 0; e < mosem_texts.length; e++) {
                                        this_mosem_text = mosem_texts[e];

                                        if (mosem_text.includes(this_mosem_text)) {
                                            mosem_num = Object.keys(moasem_dic)[i];
                                        }
                                    }
                                    if ($(this).hasClass("active")) {
                                        active_mosem = mosem_num;
                                    }
                                }
                                data_id = $(this).attr("data-id");
                                season_id = $(this).attr("data-season");
                                $("#moasm_elmoslsal").append(`<a class="mou_eps_num" data-id="${data_id}" data-season="${season_id}" onclick="load_7alakat(this)"><em>${mosem_num}</em><span>موسم</span></a>`);
                            }

                        });

                        $("#moasm_elmoslsal .mou_eps_num").each(function (index) {
                            if ($(this).find("em").text() == active_mosem) {
                                active_mosem_index = index;
                            }
                        })
                        $("#moasm_elmoslsal .mou_eps_num").eq(active_mosem_index).addClass("activee");
                    }


                    halkat_num = $(doc).find(`.EpisodesArea .ContainerEpisodesList a`).length;

                    $("#eposids_num").text(` ( ${halkat_num} ) `);

                    $(doc).find(`.EpisodesArea .ContainerEpisodesList a`).each(function () {

                        halka_num = parseInt($(this).find("em").text().trim().match(/(\d+)/)[0], 10);

                        epo_link = $(this).attr("href");
                        active_class = "";
                        if ($(this).hasClass("active")) {
                            active_class = " activee";
                        }

                        $("#hlakat_elmoslsal").append(`<a class="mou_eps_num${active_class}" onclick="load_arab_seed_watch_server('${epo_link}','muslsal','${epo_link}',this)"><em>${halka_num}</em><span>حلقة</span></a>`);
                    });

                    $(".mou_eps_num.activee").click();
                    $("#hlakat_elmoslsal_container").show();
                }

            }
        });

    },
    load_7alakat_function: function (this_btn) {
        data_id = $(this_btn).attr("data-id");
        season_id = $(this_btn).attr("data-season");
        $.ajax({
            "type": "POST",
            "url": "wp-content/themes/Elshaikh2021/Ajaxat/Single/Episodes.php",
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            "data": {
                "post_id": data_id,
                "season": season_id
            },
            success: function (res) {
                doc = new DOMParser().parseFromString(res, "text/html");
                halkat_num = $(doc).find(`a`).length;
                $("#eposids_num").text(` ( ${halkat_num} ) `);
                $(doc).find(`a`).each(function () {
                    halka_num = parseInt($(this).find("em").text().trim().match(/(\d+)/)[0], 10);
                    epo_link = $(this).attr("href");
                    $("#hlakat_elmoslsal").append(`<a class="mou_eps_num" onclick="load_msadr_watch('${epo_link}','muslsal',this)"><em>${halka_num}</em><span>حلقة</span></a>`);
                });
            }
        })
    }, load_msadr_watch_function: function (link, watch_type, referer = "") {

        $(".watch_sources,.download_sources").html(`<span><i class="fas fa-circle-notch fa-spin fa-lg"></i> جاري التحميل</span>`);
        opts = {
            "type": "GET",
            "url": link,
            success: function (watching_res) {
                $(".watch_sources span,.download_sources span").remove();
                watching_doc = new DOMParser().parseFromString(watching_res, "text/html");
                srces_div = $("<div/>");
                $(watching_doc).find(".containerServers ul *").each(function () {
                    if ($(this).prop("tagName") == "H3") {
                        new_div = $(`<div class="srcs"/>`).attr("data-srces_name", $(this).text()).appendTo(srces_div);
                    } else if ($(this).prop("tagName") == "LI") {
                        if ($(this).find("span").text() == "سيرفر عرب سيد") {
                            $(this).appendTo($(srces_div).find(".srcs").last());
                        }

                    }
                });

                $(srces_div).find(".srcs").each(function () {
                    quality_name = parseInt($(this).attr("data-srces_name").replace(/[^\d.]/g, '')) + "p";
                    src_link = $(this).find("li").attr("data-link");

                    src_name = quality_name;
                    add_to_title = watch_type == "muslsal" ? " - موسم " + $("#moasm_elmoslsal .mou_eps_num.activee em").text() : "";
                    add_to_title += watch_type == "muslsal" ? " - حلقة " + $("#hlakat_elmoslsal .mou_eps_num.activee em").text() : "";
                    full_title = film_data.title + add_to_title + " - " + src_name;

                    $(`<span class="mou_btn" onclick="play_embed_server_from_arabseed(\`${src_link}\`,\`${full_title}\`)">${src_name}</span>`).appendTo(".watch_sources");

                    $(".download_sources").append(`<span class="mou_btn" onclick="add_for_downlaod_from_arabseed(\`downloads/\`,\`${full_title}\`, false, \`${src_link}\`,\`video\`, \`{}\`)">${src_name}</span>`);


                    // $(".watch_sources").append(`<span class="mou_btn" onclick="play_vid(\`${src_link}\`, \`${full_title}\`,\`Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36\`, \`{'Referer':'https://watch26.cimanow.net/'}\`)">${src_name}</span>`);


                    // $(".download_sources").append(`<span class="mou_btn" onclick="add_for_downlaod(\`downloads/\`,\`${full_title}\`, false, \`${src_link}\`,\`video\`, \`{'Referer':'https://cc.cimanow.cc/'}\`)">${src_name}</span>`);

                });




            }
        };
        if (referer !== "") {
            opts["headers"] = {
                "referer": referer
            };
        }
        $.MouAjax(opts);


    }
    ,
    "cats":
    {
        "الافلام":
        {
            "type": "cats",
            "icon": `<i class="fas fa-film"></i>`,
            "cats":
            {
                "نيتفليكس – Netfilx": {
                    "type": "list",
                    "url": "category/netfilx",
                    "icon": `<i class="fas fa-film"></i>`
                },
                "افلام عربية": {
                    "type": "list",
                    "url": "category/arabic-movies-5/",
                    "icon": `<i class="fas fa-film"></i>`
                },
                "افلام اجنبية": {
                    "type": "list",
                    "url": "category/foreign-movies4/",
                    "icon": `<i class="fas fa-film"></i>`
                },
                "افلام تركية": {
                    "type": "list",
                    "url": "category/افلام-تركية/",
                    "icon": `<i class="fas fa-film"></i>`
                },
                "افلام هندية": {
                    "type": "list",
                    "url": "category/indian-movies/",
                    "icon": `<i class="fas fa-film"></i>`
                },
                "افلام انيميشن": {
                    "type": "list",
                    "url": "category/افلام-انيميشن/",
                    "icon": `<i class="fas fa-film"></i>`
                }
            }

        },
        "المسلسلات":
        {
            "type": "cats",
            "icon": `<i class="fas fa-tv"></i>`,
            "cats":
            {
                "مسلسلات رمضان 2023": {
                    "type": "list",
                    "url": "category/المسلسلات/مسلسلات-رمضان-2023/",
                    "icon": `<i class="fas fa-tv"></i>`
                },
                "مسلسلات عربية": {
                    "type": "list",
                    "url": "category/مسلسلات-عربي/",
                    "icon": `<i class="fas fa-tv"></i>`
                },
                "مسلسلات مصريه": {
                    "type": "list",
                    "url": "category/مسلسلات-مصريه/",
                    "icon": `<i class="fas fa-tv"></i>`
                },
                "مسلسلات أجنبية": {
                    "type": "list",
                    "url": "category/foreign-series/",
                    "icon": `<i class="fas fa-tv"></i>`
                },
                "مسلسلات تركية": {
                    "type": "list",
                    "url": "category/turkish-series-1/",
                    "icon": `<i class="fas fa-tv"></i>`
                },
                "مسلسلات كرتون": {
                    "type": "list",
                    "url": "category/مسلسلات-كرتون/",
                    "icon": `<i class="fas fa-tv"></i>`
                }
            }
        }
    }
};

function load_arab_seed_watch_server(link, type, referer = "", this_btn = false) {
    $("#msader_elmoshda").show();
    $("#msader_eltahmel").show();
    if (this_btn !== false) {
        $("#hlakat_elmoslsal_container .mou_eps_num").removeClass("activee");
        $(this_btn).addClass("activee");
        $.ajax({
            "type": "GET",
            "url": link,
            success: function (res) {
                doc = new DOMParser().parseFromString(res, "text/html");
                this_watch_url = $(doc).find(`.WatchButtons .watchBTn`).attr("href");
                now_load_msadr_watch_function(this_watch_url, type, referer);
            }
        });
    } else {
        now_load_msadr_watch_function(link, type, referer);
    }
}

function play_embed_server_from_arabseed(src_link, title) {
    $.ajax({
        "type": "GET",
        "url": src_link,
        success: function (embed_watching_res) {
            embed_watching_doc = new DOMParser().parseFromString(embed_watching_res, "text/html");
            this_src_link = $(embed_watching_doc).find("#player_code source").attr("src");
            play_vid(this_src_link, title, `Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36`, `{}`);
        }
    });
}
function add_for_downlaod_from_arabseed(dir, full_title, typee, src_link, type, headers) {
    $.ajax({
        "type": "GET",
        "url": src_link,
        success: function (embed_watching_res) {
            embed_watching_doc = new DOMParser().parseFromString(embed_watching_res, "text/html");

            this_src_link = $(embed_watching_doc).find("#player_code source").attr("src");
            add_for_downlaod(dir, full_title, typee, this_src_link, type, headers);
        }
    });
}
mou_aflam_servers_array["عرب سيد"] = obj;