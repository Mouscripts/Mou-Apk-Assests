$(document).ready(function () {
    // $(".navigation .list").eq(2).click();
    
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