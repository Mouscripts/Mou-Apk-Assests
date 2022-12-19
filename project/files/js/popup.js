// start pop_up_script
readypopups();
function readypopups() {
    $("[data-openpopup]").click(function () {
        fadein_sec = 1;
        this_popup_id = $(this).attr("data-openpopup");
        $("#" + this_popup_id).openpopup();
    });
    $('[data-closepopup],[data-dismisspopup]').click(function (e) {
        e.preventDefault();
        this_popup_id = $(this).parents(".mou_popup");
        $(this_popup_id).closepopup();
    });
    $(".mou_popup").click(function () {
        if ($(this).attr("data-lockpopup") !== "true") {
            $("#" + $(this).attr("id")).closepopup();
        }
    }).children().click(function (e) {
        return false;
    });
}
(function ($) {
    $.fn.extend({
        openpopup: function () {
            $(this).addClass("show").removeClass("hide");
            $("body").css("overflow", "hidden");
        }
    });
})(jQuery);
(function ($) {
    $.fn.extend({
        closepopup: function () {
            $(this).removeClass("show").addClass("hide");
            $("body").css("overflow", "unset");
        }
    });
})(jQuery);
// end popup scrpit