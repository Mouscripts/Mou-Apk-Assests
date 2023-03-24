obj = {
    "type": "cats",
    "server_title": "cima_now",
    "icon": `<i class="fas fa-film"></i>`,
    "server_domain": "https://a.cimanow.cc/",
    "load_list_function": function (res, load_type = "first_load") {
        aflam_json = {};
        aflam_posts = [];
        doc = new DOMParser().parseFromString(res, "text/html");
        $(doc).find("section").find("article").each(function () {
            film = {};
            $(this).find("li[aria-label='title']").find("em").remove();
            film.url = $(this).find("a[href]").attr("href");
            film.type = $(this).find(`[aria-label="episode"]`).length > 0 || film.url.includes("/selary/") ? "muslsal" : "film";
            film.title = $(this).find("li[aria-label='title']").text().trim();
            film.img = $(this).find("img").attr("data-src");
            if ($(this).find(`[aria-label="episode"]`).length > 0) {
                $(this).find(`[aria-label="episode"] em`).remove();
                film.eposide = parseInt($(this).find(`[aria-label="episode"]`).text().trim().match(/(\d+)/)[0], 10);
            }

            aflam_posts.push(film);
        });
        aflam_json.server_title = now_server_title;
        aflam_json.aflam = aflam_posts;
        next_button = $(doc).find(`ul[aria-label="pagination"] li`).eq(($(doc).find(`ul[aria-label="pagination"] li.active`).index() + 1));
        if (next_button.length > 0) {
            next_page_link = $(next_button).find("a[href]").attr("href");
            aflam_json.next_page = next_page_link;
        }
        load_aflam_posts(aflam_json, load_type);
    }, search_function: function (key) {
        search_url = now_aflam_server_domain + "?s=" + key;
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
        film_eposide = $(this_btn).attr("data-eposide");
        $.ajax({
            "type": "GET",
            "url": film_url,
            success: function (res) {
                film_data = {};
                film_trs = {};
                doc = new DOMParser().parseFromString(res, "text/html");
                film_data.title = film_title;
                film_data.img = film_img;
                film_data.description = $(doc).find(`section[aria-label="details"]`).find(".tabcontent#details li").eq(0).find("p").text();
                $(doc).find(`section[aria-label="details"]`).find(".tabcontent#details li").eq(0).remove();
                $(doc).find(`section[aria-label="details"]`).find(".tabcontent#details li").each(function () {
                    tr = {};
                    tr_key = $(this).find("strong").text().replace(":", "").trim();
                    $(this).find("strong").remove();
                    tr_val = $(this).text().trim();
                    film_trs[tr_key] = tr_val;
                })
                film_data.trs = film_trs;
                show_film_data(film_data);
                if (page_type == "film") {
                    load_msadr_watch(film_url, "film");

                } else if (page_type == "muslsal") {
                    $("#moasm_elmoslsal_container").show();
                    moasm_num = $(doc).find(`section[aria-label="seasons"] ul li`).length;
                    $("#moasm_num").text(` ( ${moasm_num} ) `);
                    $(doc).find(`section[aria-label="seasons"] ul li`).each(function () {
                        $(this).find("a em").remove();
                        mosem_num = $(this).find("a").text().trim().match(/(\d+)/)[0];
                        epo_link = $(this).find("a").attr("href");
                        $("#moasm_elmoslsal").append(`<a class="mou_eps_num" data-7alkat_link="${epo_link}" onclick="load_7alakat(this)"><em>${mosem_num}</em><span>موسم</span></a>`);

                        if ($(this).hasClass("active")) {
                            active_mosem_link = epo_link;
                        }
                    });
                    if (!$(`#moasm_elmoslsal .mou_eps_num[data-7alkat_link="${active_mosem_link}"]`).hasClass("activee")) {
                        $(`#moasm_elmoslsal .mou_eps_num[data-7alkat_link="${active_mosem_link}"]`).addClass("activee");
                    }
                    if (film_eposide !== "" && typeof film_eposide !== "undefined") {
                        $(`#moasm_elmoslsal .mou_eps_num[data-7alkat_link="${active_mosem_link}"]`).click();
                        check_7alakat_loded = setInterval(function () {
                            if ($("#hlakat_elmoslsal .mou_eps_num").length > 0) {
                                $("#hlakat_elmoslsal .mou_eps_num").each(function () {
                                    if ($(this).find("em").text() == film_eposide) {
                                        $(this).click();
                                    }
                                });
                                clearInterval(check_7alakat_loded);
                            }
                        }, 100);
                    }

                    halkat_num = $(doc).find(`#eps li`).length;
                    $("#eposids_num").text(` ( ${halkat_num} ) `);
                    $(doc).find(`#eps li`).each(function () {
                        halka_num = parseInt($(this).find("em").text().trim().match(/(\d+)/)[0], 10);
                        epo_link = $(this).find("a").attr("href");
                        $("#hlakat_elmoslsal").append(`<a class="mou_eps_num" onclick="load_msadr_watch('${epo_link}','muslsal',this)"><em>${halka_num}</em><span>حلقة</span></a>`);
                    });
                    $("#hlakat_elmoslsal_container").show();
                }


            }
        });

    },
    load_7alakat_function: function (this_btn) {
        link = $(this_btn).attr("data-7alkat_link");


        $.ajax({
            "type": "GET",
            "url": link,
            success: function (res) {
                doc = new DOMParser().parseFromString(res, "text/html");


                halkat_num = $(doc).find(`#eps li`).length;

                $("#eposids_num").text(` ( ${halkat_num} ) `);

                $(doc).find(`#eps li`).each(function () {

                    halka_num = parseInt($(this).find("em").text().trim().match(/(\d+)/)[0], 10);

                    epo_link = $(this).find("a").attr("href");

                    $("#hlakat_elmoslsal").append(`<a class="mou_eps_num" onclick="load_msadr_watch('${epo_link}','muslsal',this)"><em>${halka_num}</em><span>حلقة</span></a>`);
                });

            }
        })
    }, load_msadr_watch_function: function (link, watch_type) {

        $(".watch_sources,.download_sources").html(`<span><i class="fas fa-circle-notch fa-spin fa-lg"></i> جاري التحميل</span>`);


        $.ajax({
            "type": "GET",
            "url": link + "watching/",
            success: function (watching_res) {
                $(".watch_sources span,.download_sources span").remove();
                watching_doc = new DOMParser().parseFromString(watching_res, "text/html");
                msdr_num = 1;

                $(watching_doc).find(`li[aria-label="quality"]`).each(function () {

                    $(this).find(`a[href]`).each(function () {

                        src_link = $(this).attr("href");
                        $(this).find("p").remove();
                        quality_name = $(this).text().trim();
                        src_name = "مصدر " + msdr_num + " - " + quality_name;
                        add_to_title = watch_type == "muslsal" ? " - موسم " + $("#moasm_elmoslsal .mou_eps_num.activee em").text() : "";
                        add_to_title += watch_type == "muslsal" ? " - حلقة " + $("#hlakat_elmoslsal .mou_eps_num.activee em").text() : "";
                        full_title = film_data.title + add_to_title + " - " + src_name;

                        $(".watch_sources").append(`<span class="mou_btn" onclick="mouscripts.play_vid(\`${src_link}\`, \`${full_title}\`,\`Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36\`, \`{'Referer':'https://watch26.cimanow.net/'}\`)">${src_name}</span>`);


                        $(".download_sources").append(`<span class="mou_btn" onclick="add_for_downlaod(\`downloads/\`,\`${full_title}\`, false, \`${src_link}\`,\`video\`, \`{'Referer':'https://cc.cimanow.cc/'}\`)">${src_name}</span>`);

                    });
                    msdr_num++;
                })



            }
        })


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
                    "url": "category/افلام-عربية/",
                    "icon": `<i class="fas fa-film"></i>`
                },
                "افلام اجنبية": {
                    "type": "list",
                    "url": "category/افلام-اجنبية/",
                    "icon": `<i class="fas fa-film"></i>`
                },
                "افلام تركية": {
                    "type": "list",
                    "url": "category/افلام-تركية/",
                    "icon": `<i class="fas fa-film"></i>`
                },
                "افلام هندية": {
                    "type": "list",
                    "url": "category/افلام-هندية/",
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
                "مسلسلات رمضان": {
                    "type": "list",
                    "url": "category/رمضان-2023/",
                    "icon": `<i class="fas fa-tv"></i>`
                },
                "مسلسلات عربية": {
                    "type": "list",
                    "url": "category/مسلسلات-عربية/",
                    "icon": `<i class="fas fa-tv"></i>`
                },
                "مسلسلات أجنبية": {
                    "type": "list",
                    "url": "category/مسلسلات-اجنبية/",
                    "icon": `<i class="fas fa-tv"></i>`
                }
            }
        }
    }
};

mou_aflam_servers_array["سيما ناو"] = obj;