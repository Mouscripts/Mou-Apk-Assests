mouscripts.ajax(JSON.stringify({
    "type": "GET",
    "url": "https://raw.githubusercontent.com/Mouscripts/Mou-Apk-Assests/main/config.json",
    "OnSuccess": "config_file"
}));

function config_file(res) {
   mouscripts.showToast(res);
}