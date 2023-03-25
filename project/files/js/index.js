mouscripts.initializeUnityAds();
$(document).ready(function () {

});


var back_buttons_functions = [];
function back_button_clicked() {

    if (back_buttons_functions.length == 0) {
        console.log("Exit App");
    } else {
        if (typeof back_buttons_functions[0] == "function") {
            back_buttons_functions[0]();
        }
        back_buttons_functions.shift();

    }

}
// side nav
$(".openside_nav").click(function () {
    $(".sidenav").show_side_nav();
});

$(".sidenav").click(function () {
    if ($(this).attr("data-lockpopup") !== "true") {
        $("#" + $(this).attr("id")).hide_side_nav();
    }
}).children().click(function (e) {
    return false;
});

(function ($) {
    $.fn.extend({
        show_side_nav: function () {
            $(this).addClass("show").removeClass("hide");
            $("body").css("overflow", "hidden");
        }
    });
})(jQuery);
(function ($) {
    $.fn.extend({
        hide_side_nav: function () {
            $(this).removeClass("show").addClass("hide");
            $("body").css("overflow", "unset");
        }
    });
})(jQuery);
// End Sidenav
// dropdown
function open_dropdown(this_btn) {
    this_drop_down = $(this_btn).parents(".dropdown").find(".dropdown-content");
    $(".dropdown-content.show").not(this_drop_down).removeClass("show");

    $(this_btn).parents(".dropdown").find(".dropdown-content").toggleClass("show");
}
$(window).on("click", function (event) {

    can_close = true;
    if ($(event.target).parents(".dropdown").length > 0) {
        can_close = false;
    }
    if ($(event.target).hasClass("dropdown-content") || $(event.target).parents(".dropdown-content").length > 0) {
        can_close = true;
    }
    if (can_close) {
        $(".dropdown-content").removeClass("show");
    }
})
// End dropdown
// downloads js
function open_downloads() {
    $(".sidenav").hide_side_nav();
    $("#downloads").openpopup();
    back_buttons_functions.unshift(function () {
        $("#downloads").closepopup();
    });
}
function open_settings() {
    $(".sidenav").hide_side_nav();
    $(`.navigation li.list`).last().click();
}
function open_contact_us() {
    $(".sidenav").hide_side_nav();
    $("#contact_us").openpopup();
    back_buttons_functions.unshift(function () {
        $("#contact_us").closepopup();
    });
}

var downloads_db = openDatabase('app_Downloads_db', '1.0', 'Downloads', 5 * 1024 * 1024);
downloads_db.transaction(function (transaction) {
    transaction.executeSql(`CREATE TABLE IF NOT EXISTS downloads 
    (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_ext VARCHAR(50) NOT NULL,
    file_link TEXT NOT NULL,
    start_at int(20) NOT NULL,
    full_size VARCHAR(50) NOT NULL,
    downloaded_size VARCHAR(50) NOT NULL,
    dl_status int(1) not NULL,
    stoped_by_user int(1) not NULL,
    type VARCHAR(50) NOT NULL,
	err_res TEXT NOT NULL,
	custom_headers TEXT NOT NULL
    )`, undefined, function () { }, function (transaction, err) {
        console.log(err.message);
    });
});

downloads_db.transaction(function (transaction) {
    transaction.executeSql("SELECT * FROM downloads ORDER BY id DESC", undefined, function (transaction, result) {
        if (result.rows.length) {
            for (var i = 0; i < result.rows.length; i++) {
                row = result.rows.item(i);
                id = row.id;
                path = row.path;
                file_name = row.file_name;
                file_ext = row.file_ext;
                file_link = row.file_link;
                start_at = row.start_at;
                full_size = row.full_size;
                downloaded_size = row.downloaded_size;
                dl_status = row.dl_status;
                stoped_by_user = row.stoped_by_user;
                type = row.type;
                err_res = row.err_res;
                custom_headers = row.custom_headers;
                add_download_div(id, path, file_name, file_ext, file_link, start_at, full_size, downloaded_size, dl_status, type, stoped_by_user, err_res, custom_headers);
            }
            ready_downloading_progress();
        }
    })
});
function get_extension_from_link(link) {
    return link.split(/[#?]/)[0].split('.').pop().trim();
}
async function add_for_downlaod(file_dir = "", file_name = "", file_ext = false, file_link = false, type = "", custom_headers = "{}") {
    if (mouscripts.check_storage_Permission()) {
        if (file_link !== false && file_link !== "") {

            if (file_ext == false) {
                file_ext = get_extension_from_link(file_link);
            }
            file_name = await get_the_correct_name(file_name);
            file_size = "000";
            downloads_db.transaction(function (transaction) {
                transaction.executeSql("INSERT INTO downloads(path,file_name,file_ext,file_link,start_at,full_size,downloaded_size,dl_status,type,stoped_by_user,err_res,custom_headers) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)", [file_dir, file_name, file_ext, file_link, Date.now(), file_size, "0", 1, type, 0, "0", custom_headers], function () {
                    transaction.executeSql("SELECT MAX(id) FROM downloads LIMIT 1", undefined, function (transaction, result) {
                        id = result.rows[0][`MAX(id)`];
                        add_download_div(id, file_dir, file_name, file_ext, file_link, Date.now(), file_size, "0", 1, type, 0, "0", custom_headers);
                        open_downloads();
                        if (typeof mouscripts !== "undefined") {

                            // mouscripts.get_downloading_file_size(file_name + "." + file_ext);

                            get_file_size(file_link, custom_headers, function (full_file_size) {
                                if (full_file_size == "false") {
                                    on_download_error(id, "خطأ في الاتصال");
                                } else {
                                    mouscripts.showToast("جاري التحميل");
                                    downloads_db.transaction(function (transaction2) {
                                        transaction2.executeSql(`UPDATE downloads SET full_size='${full_file_size}',stoped_by_user=0 WHERE id='${id}'`, undefined, function () {
                                            $("#download_files .file[data-file_id='" + id + "']").attr("data-full_size", full_file_size);
                                            $("#download_files .file[data-file_id='" + id + "'] .dl_full_size").text(formatBytes(full_file_size));
                                        }, function (transaction, err) {
                                            alert(err.message);
                                        })
                                    })

                                    ready_downloading_progress();
                                    mouscripts.download_file_now(file_link, file_dir, file_name + "." + file_ext, String(id), false, custom_headers);
                                }
                            });

                        }
                    });
                }, function (transaction, err) {
                    alert(err.code + " => " + err.message);
                    // if (err.code == 6) {
                    //     alert(file_dir + " موجود بالفعل");
                    // }
                })
            })





        }
    } else {
        request_storage_permissoin(function (status) {
            if (status == true) {
                add_for_downlaod(file_dir, file_name, file_ext, file_link, type)
            } else {
                alert("يرجي التحقق من الموافقة علي الوصول الي التخزين .");
            }
        });
    }
}
var downloadingArray = [];
function ready_downloading_progress() {
    update_interval = 300;
    for (var i = 0; i < downloadingArray.length; i++) {
        clearInterval(downloadingArray[i]);
    }
    downloadingArray = [];
    $('#download_files .file').each(function (index) {
        var file_id = $(this).attr('data-file_id');
        $(this).attr("this_index", index);
        if (($(this).attr("data-dl_status") == "1" ? true : false) == true) {
            mou_downloading_progress(file_id, update_interval);
            var x = setInterval(function () {
                mou_downloading_progress(file_id, update_interval);
            }, update_interval);
            downloadingArray.push(x);
        }
    });

    // local_file_size = mouscripts.get_file_size(mouscripts.get_files_path("1") + $(this).attr("data-file_dir"), ($(this).attr("data-file_name") + "." + $(this).attr("data-file_ext")));
    // if (full_size == local_file_size) {
    //     end_dl(id);
    // }
}
function mou_downloading_progress(dl_id, update_interval) {
    now_size = typeof $("#download_files .file[data-file_id='" + dl_id + "']").attr("downloaded_size") !== "undefined" ? $("#download_files .file[data-file_id='" + dl_id + "']").attr("downloaded_size") : "0";
    new_size = mouscripts.get_downloading_len(dl_id);
    download_speed_per_sec = formatBytes((parseInt(new_size) - parseInt(now_size)) * (1000 / update_interval));
    $("#download_files .file[data-file_id='" + dl_id + "'] .now_size").text(formatBytes(new_size));
    $("#download_files .file[data-file_id='" + dl_id + "'] .speed").text(download_speed_per_sec + "/s");
    $("#download_files .file[data-file_id='" + dl_id + "']").attr("downloaded_size", new_size);

    full_size = $("#download_files .file[data-file_id='" + dl_id + "']").attr("data-full_size");

    downloads_db.transaction(function (transaction) {
        transaction.executeSql(`UPDATE downloads SET downloaded_size='${new_size}' WHERE id='${dl_id}'`, undefined, function () {
        }, function (transaction, err) {
            alert(err.message);
        })
    });

    if (new_size == full_size && $("#download_files .file[data-file_id='" + dl_id + "']").attr("download_done") !== "true") {

        downloads_db.transaction(function (transaction2) {
            transaction2.executeSql(`UPDATE downloads SET dl_status=3,stoped_by_user=0 WHERE id='${dl_id}'`, undefined, function () {
                mouscripts.showToast("انتهي التحميل.");
                this_dl = $("#download_files .file[data-file_id='" + dl_id + "']");
                dl_index = $(this_dl).attr("this_index");
                $(this_dl).attr("download_done", "true");
                clearInterval(downloadingArray[dl_index]);

                $(this_dl).find(".toggle_pause").hide();
                $(this_dl).find(".dl_full_size").hide();
                $(this_dl).find(".speed").html(`<i class="far fa-check-circle"></i>`);
            }, function (transaction, err) {
                alert(err.message);
            })
        })
    }
}

function request_storage_permissoin(callback) {
    var callback_function = callback;
    window["return_request_storage_permissoin"] = function (res) {
        callback_function(res);
    };
    mouscripts.request_storage_permissoin("return_request_storage_permissoin");
}
function on_download_error(dl_id, error) {
    if (error.includes("failed to connect to") || error.includes("خطأ في الاتصال")) {
        error = "خطأ في الاتصال";
    }
    if (error == "Socket closed") {
        error = "متوقف مؤقتا";
    }
    else if (error == "1004") {
        error = "متوقف مؤقتا";

        downloads_db.transaction(function (transaction) {
            transaction.executeSql(`UPDATE downloads SET dl_status=2 WHERE id='${dl_id}'`, undefined, function () {

            }, function (transaction, err) {
                alert(err.message);
            })
        });
    }

    dl_file = $("#download_files .file[data-file_id='" + dl_id + "']");
    dl_index = $(dl_file).index();
    $(dl_file).find(".toggle_pause").attr("data-is_paused", "true").html(`<i class="fal fa-play-circle fa-lg"></i>`);

    $(dl_file).find(".speed").html(`<span class="dl_error"><i class="far fa-exclamation-triangle"></i> ${error}</span>`);
    clearInterval(downloadingArray[dl_index]);
    // alert("ON download error : dl_index = " + dl_index + " - dl_id = " + dl_id);

}
async function get_the_correct_name(file_name, main_name = file_name, index = 2) {
    is_same_file_name_exist = await new Promise((resolve, reject) => {
        downloads_db.transaction(function (transaction) {
            transaction.executeSql(`SELECT file_name FROM downloads WHERE file_name='${file_name}'`, undefined, function (transaction, result) {
                if (result.rows.length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    });
    if (is_same_file_name_exist == true) {
        return await get_the_correct_name(main_name + ` (${index})`, main_name, index + 1);
    } else {
        return file_name;
    }
}
function get_file_size(link, custom_headers, callback) {
    var callback_token = makeid(6) + Date.now();
    var callback_function = callback;
    window["return_file_size_" + callback_token] = function (res) {
        callback_function(res);
    };
    if (typeof mouscripts !== "undefined") {
        mouscripts.get_file_size_from_link(link, custom_headers, "return_file_size_" + callback_token);
    } else {
        xhr = $.ajax({
            type: "HEAD",
            url: link,
            success: function (msg) {
                window["return_file_size_" + callback_token](xhr.getResponseHeader('Content-Length'));
            }
        });
    }

}

function add_download_div(id, path, file_name, file_ext, file_link, start_at, full_size, downloaded_size, dl_status, type, stoped_by_user, err_res = "0", custom_headers) {
    // alert(dl_status);
    down_img = `files/images/download.svg`;
    if (dl_status == "1") {
        dl_info = `جاري الاتصال <i class="fas fa-circle-notch fa-spin"></i>`;

        toggle_pause_btn = `<span class="animate_btn toggle_pause" onclick="toggle_pause(this)" data-is_paused="false"><i class="fal fa-pause-circle fa-lg"></i></span>`;

    } else if (dl_status == "2") {
        dl_info = `<span class="dl_error"><i class="far fa-exclamation-triangle"></i> متوقف مؤقتا</span>`;

        toggle_pause_btn = `<span class="animate_btn toggle_pause" onclick="toggle_pause(this)" data-is_paused="true"><i class="fal fa-play-circle fa-lg"></i></span>`;

    }
    if (type == "video") {
        down_img = `files/images/video.svg`;
    }


    $("#download_files").append(`<div class="file" data-file_id="${id}" data-full_size="${full_size}" data-file_link="${file_link}" data-file_dir="${path}" data-file_name="${file_name}" data-file_ext="${file_ext}" data-dl_status="${dl_status}" data-stoped_by_user="${stoped_by_user}">
    <data style="display:none;" id="custom_headers">${custom_headers}</data>
    <div class="file_img">
        <img src="${down_img}" alt="">
    </div>
    <div class="file_info">
        <span>
            <span class="file_name">${file_name}</span>
        </span>
        <span class="download_info">
            <span class="dl_full_size">${formatBytes(full_size)}</span>
            <span class="speed">${dl_info}</span>
            <span class="now_size">${formatBytes(downloaded_size)}</span>
            
        </span>
    </div>
    <div class="dl_actions">
        <div class="dropdown">
            <span class="animate_btn dropdown_btn" onclick="open_dropdown(this)"><i class="fas fa-ellipsis-v fa-lg"></i></span>
            <div class="dropdown-content">
                <button type="button" class="btn btn-block bg-gradient-danger" onclick="delete_dl(this)">الحذف <i class="fas fa-trash-alt mr-1 ml-1"></i></button>
            </div>
        </div>
       ${toggle_pause_btn}
    </div>
</div>`);

}
function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function toggle_pause(this_btn) {
    file = $(this_btn).parents(".file");
    is_paused = $(this_btn).attr("data-is_paused") == "false" ? false : true;
    file_id = $(file).attr("data-file_id");
    if (is_paused) {
        file_link = $(file).attr("data-file_link");
        file_dir = $(file).attr("data-file_dir");
        file_name = $(file).attr("data-file_name");
        file_ext = $(file).attr("data-file_ext");
        custom_headers = $(file).find("data#custom_headers").html();
        mouscripts.download_file_now(file_link, file_dir, file_name + "." + file_ext, file_id, true, custom_headers);

        downloads_db.transaction(function (transaction) {
            transaction.executeSql(`UPDATE downloads SET dl_status=1 WHERE id='${file_id}'`, undefined, function () {
                $(this_btn).attr("data-is_paused", "false");
                $(this_btn).attr("data-dl_status", "1");

            }, function (transaction, err) {
                alert(err.message);
            })
        });

    } else {
        mouscripts.pause_downloading(file_id);
        downloads_db.transaction(function (transaction) {
            transaction.executeSql(`UPDATE downloads SET stoped_by_user=1 WHERE id='${file_id}'`, undefined, function () {
                $(this_btn).attr("data-is_paused", "true");
                $(this_btn).attr("data-dl_status", "2");

            }, function (transaction, err) {
                alert(err.message);
            });
        });
    }
    ready_downloading_progress();

}
function file_resuming(file_id) {
    $("#download_files .file[data-file_id='" + file_id + "'] .toggle_pause").attr("data-is_paused", "false").html(`<i class="fal fa-pause-circle fa-lg"></i>`);
}

function contact_us_submit() {
    contact_user_name = $("#contact_user_name").val();
    contact_email = $("#contact_email").val();
    contact_message = $("#contact_message").val();
    if (contact_user_name == "") {
        showToast("يرجي ادخال الاسم !");
    }
    if (contact_email == "") {
        showToast("يرجي ادخال الايميل !");
    }
    if (contact_message == "") {
        showToast("يرجي ادخال الرساله !");
    }
    if (contact_user_name == "" || contact_email == "" || contact_message == "") {
        return;;
    }
    telegram_msg = encodeURIComponent(`<b>الاسم</b> : <strong>${contact_user_name}</strong>\n<b>ايميل</b> : <strong>${contact_email}</strong>\n\n${contact_message}`);

    telegram_token = "6220016110:AAFD5xCKAmFZgDUL3FTmMV_MpwLBMLm1FHY";
    chat_id = "2140799570";
    telegram_msg_link = `https://api.telegram.org/bot${telegram_token}/sendMessage?chat_id=${chat_id}&parse_mode=HTML&text=${telegram_msg}`;
    $.ajax({
        "type": "GET",
        "url": telegram_msg_link,
        success: function (res) {
            if (typeof res.ok !== "undefined" && res.ok == true) {
                $("#contact_us").closepopup();
                $("#contact_user_name").val("");
                $("#contact_email").val("");
                $("#contact_message").val("");
                showToast("تم الارسال بنجاح");
            } else {
                showToast("حدث خطأ اثناء الارسال");
            }
        }
    })
}

function showToast(msg) {
    if (typeof mouscripts !== "undefined") {
        mouscripts.showToast(msg);
    } else {
        alert(msg);
    }
}

function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.log('Oops, unable to copy');
    }
    document.body.removeChild(textArea);
}

function unity_reward_status(status) {
    window["on_unity_rewarded_end"](status);
}
function show_rewarded_unity(ad_id, callback) {
    mouscripts.load_unity_ad(ad_id);
    window["on_unity_rewarded_end"] = callback;
}
function play_vid(src_link, full_title, useragent, headers) {
    // mouscripts.Show_Admob_Interstitial("ca-app-pub-1789959428115714/5652324572");
    // show_rewarded_unity("Rewarded_Android", function (status) {
    //     if (status == true) {
    //         mouscripts.play_vid(src_link, full_title, useragent, headers);
    //     } else {
    //     }
    // });
    mouscripts.play_vid(src_link, full_title, useragent, headers);
    mouscripts.load_unity_ad("video");
}