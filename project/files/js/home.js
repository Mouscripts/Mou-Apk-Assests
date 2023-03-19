function get_yacin(url) {
    get_yacin_res(url, function (res) {
        console.log(res);
    });
}
$("#open_aflam_w_muslslat").click(function () {
    $(`[data-full_iframe_target_url="movies.html"]`).parents("li").click();
})
$("#open_gdwal_elmobrayat").click(function () {
    $(`[data-full_iframe_target_url="matches_table.html"]`).parents("li").click();
})