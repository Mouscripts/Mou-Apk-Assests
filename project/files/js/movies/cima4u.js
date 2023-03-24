obj =
{
    "main_domain": "https://www.cima4u.mx",
    "server_domain": "https://cima4u1.mom/",
    "type": "cats",
    "server_title": "cima4u",
    "icon": `<i class="fas fa-film"></i>`,
    "load_list_function": function (res, load_type = "first_load") {
        aflam_json = {};
        aflam_posts = [];
        doc = new DOMParser().parseFromString(res, "text/html");

        $(doc).find(".Cima4uBlocks").find(".MovieBlock").each(function () {
            film = {};
            film.url = $(this).find("a[href]").attr("href");
            film.type = $(this).find(".Number").length > 0 ? "muslsal" : "film";
            $(this).find(".BoxTitleInfo").remove();
            film.title = $(this).find(".BoxTitle").text().trim();

            if (/^مشاهدة مسلسل(.*)/gm.test(film.title) == true) {
                film.title = /^مشاهدة مسلسل(.*)/gm.exec(film.title)[1].trim();
            } else if (/^مشاهدة فيلم(.*)/gm.test(film.title) == true) {
                film.title = /^مشاهدة فيلم(.*)/gm.exec(film.title)[1].trim();
            }
            img_style_string = $(this).find(".Thumb .Half1").attr("style");
            film.img = /(https.*)\)/gm.exec(img_style_string)[1];
            aflam_posts.push(film);
        });
        aflam_json.server_title = now_server_title;
        aflam_json.aflam = aflam_posts;

        $(doc).find(`.pagination ul.page-numbers *.page-numbers`).each(function (index) {
            if ($(this).hasClass("current")) {
                next_button = $(doc).find(`.pagination ul.page-numbers .page-numbers`).eq(index + 1);
                if (next_button.length > 0) {
                    next_page_link = $(next_button).attr("href");
                    aflam_json.next_page = next_page_link;
                }
            }
        });
        load_aflam_posts(aflam_json, load_type);
    },
    search_function: function (key) {
        search_url = now_aflam_server_domain + "/search/" + key + "/";
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
                film_data.description = $(doc).find(`.Story p`).text();

                $(doc).find(`.InformationList li`).each(function () {
                    tr = {};
                    tr_key = $(this).find("span").text().replace(":", "").trim();
                    tr_val = $(this).find("a").text().trim();
                    if (["مدة العرض", "السنه", "السنة", "اللغة", "الجودة", "الدولة"].includes(tr_key)) {
                        film_trs[tr_key] = tr_val;
                    }
                })
                film_data.trs = film_trs;
                show_film_data(film_data);
                watch_url = $(doc).find(`.WatchNow`).parents("a").attr("href");

                if (page_type == "film") {
                    load_cima_4u_watch_server(watch_url, "film", film_url);
                } else if (page_type == "muslsal") {
                    $.ajax({
                        "type": "GET",
                        "url": watch_url,
                        success: function (doc) {

                            if ($(doc).find(".EpisodesSection .EpisodeItem").length > 0) {

                                halkat_num = $(doc).find(".EpisodesSection .EpisodeItem").length;
                                $("#eposids_num").text(` ( ${halkat_num} ) `);
                                $(doc).find(`.EpisodesSection .EpisodeItem`).each(function () {

                                    halka_num = parseInt($(this).find("span").text().trim().match(/(\d+)/)[0], 10);
                                    epo_link = $(this).find("a").attr("href");
                                    active_class = "";
                                    if ($(this).hasClass("active")) {
                                        active_class = " activee";
                                    }

                                    $("#hlakat_elmoslsal").append(`<a class="mou_eps_num${active_class}" onclick="load_cima_4u_watch_server('${epo_link}','muslsal','${epo_link}',this)"><em>${halka_num}</em><span>حلقة</span></a>`);
                                });

                                $(".mou_eps_num.activee").click();
                                $("#hlakat_elmoslsal_container").show();
                            }

                        }
                    })
                }

            }
        });

    },
    load_7alakat_function: function (this_btn) {
        link = $(this_btn).attr("data-link");
        $("#msader_elmoshda,#msader_eltahmel").hide();
        $("#hlakat_elmoslsal").html(`<span><i class="fas fa-circle-notch fa-spin fa-lg"></i> جاري التحميل</span>`);
        $.ajax({
            "type": "GET",
            "url": link,
            success: function (res) {
                $("#hlakat_elmoslsal").html("");
                doc = new DOMParser().parseFromString(res, "text/html");
                halkat_num = $(doc).find(`.Episodes--Seasons--Episodes a`).length;
                $("#eposids_num").text(` ( ${halkat_num} ) `);
                $(doc).find(`.Episodes--Seasons--Episodes a`).each(function () {
                    halka_num = parseInt($(this).find("episodetitle").text().trim().match(/(\d+)/)[0], 10);
                    epo_link = $(this).attr("href");
                    active_class = "";
                    if ($(this).hasClass("active")) {
                        active_class = " activee";
                    }

                    $("#hlakat_elmoslsal").append(`<a class="mou_eps_num${active_class}" onclick="load_this_watch_server('${epo_link}','muslsal','${epo_link}',this)"><em>${halka_num}</em><span>حلقة</span></a>`);
                });



            }
        })
    }, load_msadr_watch_function: function (link, watch_type, referer = "") {
        $.ajax({
            "type": "GET",
            "url": link,
            success: function (watching_res) {
                watching_doc = new DOMParser().parseFromString(watching_res, "text/html");
                $(watching_doc).find(".serversWatchSide a").each(function () {
                    servre_name = $(this).text().trim();
                    // if (servre_name == "Up-Stream") {
                    //     server_link = change_subdomain(now_aflam_server_domain, "tv") + "structure/server.php?id=" + $(this).attr("data-link");
                    //     $.ajax({
                    //         "type": "POST",
                    //         "url": server_link,
                    //         success: function (structure) {
                    //             structure_doc = new DOMParser().parseFromString(structure, "text/html");
                    //             uptostream_link = $(structure_doc).find("iframe").attr("src");
                    //             $.ajax({
                    //                 "type": "GET",
                    //                 "url": uptostream_link,
                    //                 success: function (uptostream) {
                    //                     uptostream_doc = new DOMParser().parseFromString(uptostream, "text/html");
                    //                     if (/recaptchaKeyPub = .*'(.*)'/gm.test(uptostream)) {
                    //                         recaptchaKeyPub = /recaptchaKeyPub = .*'(.*)'/gm.exec(uptostream)[1];

                    //                         alert(recaptchaKeyPub);
                    //                     }

                    //                 }
                    //             });

                    //         }
                    //     });
                    // }
                    if (servre_name == "Vadbam") {
                        server_link = change_subdomain(now_aflam_server_domain, "tv") + "structure/server.php?id=" + $(this).attr("data-link");
                        $.ajax({
                            "type": "POST",
                            "url": server_link,
                            success: function (structure) {
                                structure_doc = new DOMParser().parseFromString(structure, "text/html");
                                link = $(structure_doc).find("iframe").attr("src");
                                $.ajax({
                                    "type": "GET",
                                    "url": link,
                                    success: function (Vadbam) {
                                        $(".watch_sources span,.download_sources span").remove();
                                        // Vadbam_doc = new DOMParser().parseFromString(Vadbam, "text/html");
                                        if (/sources:.*(\[.*\]),/gm.test(Vadbam)) {
                                            bad_json = /sources:.*(\[.*\]),/gm.exec(Vadbam)[1];
                                            eval(`srcs_array = ` + bad_json.replace(/\s*(['"])?([a-z0-9A-Z_\.]+)(['"])?\s*:([^,\}]+)(,)?/g, '"$2": $4$5'));

                                            for (i = 0; i < srcs_array.length; i++) {
                                                src = srcs_array[i];


                                                quality_name = src.label;
                                                src_link = src.file;

                                                src_name = quality_name;
                                                // add_to_title = watch_type == "muslsal" ? " - موسم " + $("#moasm_elmoslsal .mou_eps_num.activee em").text() : "";
                                                add_to_title = watch_type == "muslsal" ? " - حلقة " + $("#hlakat_elmoslsal .mou_eps_num.activee em").text() : "";
                                                full_title = film_data.title + add_to_title + " - " + src_name;

                                                $(`<span class="mou_btn" onclick="play_embed_server_from_this_server(\`${src_link}\`,\`${full_title}\`)">${src_name}</span>`).appendTo(".watch_sources");

                                                $(".download_sources").append(`<span class="mou_btn" onclick="add_for_downlaod_this_server(\`downloads/\`,\`${full_title}\`, false, \`${src_link}\`,\`video\`, \`{}\`)">${src_name}</span>`);



                                            }

                                        }

                                    }
                                });

                            }
                        });
                    }
                })


                // for (i = 0; i < srcs_array.length; i++) {
                //     src = srcs_array[i];

                //     if (src.format !== "auto") {
                //         quality_name = src.format == "جودة غير معروفة" ? "720p" : parseInt(src.format.replace(/[^\d.]/g, '')) + "p";
                //         src_link = src.src;

                //         src_name = quality_name;
                //         add_to_title = watch_type == "muslsal" ? " - موسم " + $("#moasm_elmoslsal .mou_eps_num.activee em").text() : "";
                //         add_to_title += watch_type == "muslsal" ? " - حلقة " + $("#hlakat_elmoslsal .mou_eps_num.activee em").text() : "";
                //         full_title = film_data.title + add_to_title + " - " + src_name;

                //         $(`<span class="mou_btn" onclick="play_embed_server_from_this_server(\`${src_link}\`,\`${full_title}\`)">${src_name}</span>`).appendTo(".watch_sources");

                //         $(".download_sources").append(`<span class="mou_btn" onclick="add_for_downlaod_this_server(\`downloads/\`,\`${full_title}\`, false, \`${src_link}\`,\`video\`, \`{}\`)">${src_name}</span>`);


                //     }
                // }


            }
        });


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
                "افلام عربية": {
                    "type": "list",
                    "url": "category/افلام-عربي-arabic5-movies/",
                    "icon": `<i class="fas fa-film"></i>`
                },
                "افلام اجنبية": {
                    "type": "list",
                    "url": "category/افلام/10-movies-english-افلام-اجنبي/",
                    "icon": `<i class="fas fa-film"></i>`
                },
                "افلام تركية": {
                    "type": "list",
                    "url": "category/افلام/افلام-تركى-turkish-films/",
                    "icon": `<i class="fas fa-film"></i>`
                },
                "افلام هندية": {
                    "type": "list",
                    "url": "category/افلام/افلام-هندي-indian-movies/",
                    "icon": `<i class="fas fa-film"></i>`
                },
                "افلام كرتون": {
                    "type": "list",
                    "url": "category/افلام-كرتون/",
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
                    "url": "category/مسلسلات-7series/مسلسلات-رمضان-2023/",
                    "icon": `<i class="fas fa-tv"></i>`
                },
                "مسلسلات عربية": {
                    "type": "list",
                    "url": "category/مسلسلات/13-مسلسلات-عربيه-arabic-series/list/",
                    "icon": `<i class="fas fa-tv"></i>`
                },
                "مسلسلات أجنبية": {
                    "type": "list",
                    "url": "category/مسلسلات/5-series-english-مسلسلات-اجنبي/list/",
                    "icon": `<i class="fas fa-tv"></i>`
                },
                "مسلسلات تركية": {
                    "type": "list",
                    "url": "category/مسلسلات/8-مسلسلات-تركية-turkish-series/list/",
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

function load_cima_4u_watch_server(link, type, referer = "", this_btn = false) {
    $("#msader_elmoshda").show();
    $("#msader_eltahmel").show();
    $(".watch_sources,.download_sources").html(`<span><i class="fas fa-circle-notch fa-spin fa-lg"></i> جاري التحميل</span>`);

    if (this_btn !== false) {
        $("#hlakat_elmoslsal_container .mou_eps_num").removeClass("activee");
        $(this_btn).addClass("activee");
        console.log(link);
        now_load_msadr_watch_function(link, type, referer);

        // $.ajax({
        //     "type": "GET",
        //     "url": link,
        //     success: function (res) {
        //         doc = new DOMParser().parseFromString(res, "text/html");
        //         watch_url = $(doc).find(`.MyCimaServer btn`).attr("data-url");
        //     }
        // });
    } else {
        now_load_msadr_watch_function(link, type, referer);
    }
}

function play_embed_server_from_this_server(src_link, title) {

    mouscripts.play_vid(src_link, title, `Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36`, `{}`);


}
function add_for_downlaod_this_server(dir, full_title, typee, src_link, type, headers) {

    add_for_downlaod(dir, full_title, typee, src_link, type, headers);

}
function change_subdomain(url, toSubdomain) {
    const replace = "://" + toSubdomain + ".";
    if (!/^\w*:\/\//.test(url)) {
        url = "http://" + url;
    }
    // Check if we got a subdomain in url
    if (url.match(/\.\w*\b/g).length > 1) {
        return url.replace(/(:\/\/\w+\.)/, replace)
    }
    return url.replace(/:\/\/(\w*\.)/, `${replace}$1`)
}
mou_aflam_servers_array["سيما فور يو"] = obj;