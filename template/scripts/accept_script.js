InGame = false;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest() {
    while (!InGame) {
        ipcRenderer.invoke("checkForMatchAccept");
        await sleep(2000);
    }
}

$(document).ready(function() {
    $(".accept").click(function() {
        if ($(".accept").css("background-color") == "rgb(255, 0, 0)") {
            makeRequest();
            $(".accept").css("background-color","rgb(0, 255, 0)");
        } else {
            makeRequest();
            $(".accept").css("background-color","rgb(255, 0, 0)");
        }
    });
    $(".accept").click(function() {
        ipcRenderer.send("matchAccept");
    });
    makeRequest();
});
