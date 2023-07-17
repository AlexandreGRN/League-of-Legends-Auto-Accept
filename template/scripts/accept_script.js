async function makeRequest() {
    ipcRenderer.invoke("checkForMatchAccept");
}

$(document).ready(function() {
    $(".accept").change(function() {
        ipcRenderer.invoke("matchAcceptBinary");
        makeRequest();
    });
});

$(document).ready(function() {
    $(".accept_tab").click(function() {
        ipcRenderer.invoke("changeWindow", "accept");
    });
    $(".pick_tab").click(function() {
        ipcRenderer.invoke("changeWindow", "pick");
    });
    $(".ban_tab").click(function() {
        ipcRenderer.invoke("changeWindow", "ban");
    });
});