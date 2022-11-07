const list = document.querySelectorAll(".list");
var now_navigation_link = 0;
function activeLink(elmnt, i) {
    list.forEach((item) => {
        item.classList.remove("active");
        this.classList.add("active");
        now_navigation_link = getElementIndex(this);
        fix_indicator_positon();
    });
    link = document.querySelectorAll(".list a")[now_navigation_link].getAttribute("data-full_iframe_target_url");

    elmnt = document.getElementById("content");
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                elmnt.innerHTML = this.responseText;
            }
            if (this.status == 404) {
                elmnt.innerHTML = "Page not found.";
            }
        }
    }
    xhttp.open("GET", link, true);
    xhttp.send();



}

function fix_indicator_positon(animation = true) {
    navigation_width = document.querySelectorAll(".navigation ul")[0].getBoundingClientRect().width;
    navigation_link_width = document.querySelectorAll(".navigation ul li")[0].getBoundingClientRect().width;
    navigation_links_num = navigation_width / navigation_link_width;
    indicator = document.querySelectorAll(".navigation .indicator");
    indicator_width = indicator[0].getBoundingClientRect().width;
    if (animation == true) {
        indicator[0].classList.add("animation");
    } else {
        indicator[0].classList.remove("animation");
    }

    if (typeof document.getElementsByTagName('html')[0].getAttribute('dir') !== "undefined" && document.getElementsByTagName('html')[0].getAttribute('dir') == "rtl") {
        indicator[0].style.cssText += `transform: translateX(-${((navigation_link_width - indicator_width) / 2) + now_navigation_link * navigation_link_width}px);`;
    } else {
        indicator[0].style.cssText += `transform: translateX(${((navigation_link_width - indicator_width) / 2) + now_navigation_link * navigation_link_width}px);`;
    }

}
fix_indicator_positon(false);
window.onresize = function (event) {
    fix_indicator_positon(false);
};
list.forEach((item) => item.addEventListener("click", activeLink));
function getElementIndex(el) {
    return [...el.parentElement.children].indexOf(el);
}
document.querySelectorAll(".navigation ul li.active")[0].click();