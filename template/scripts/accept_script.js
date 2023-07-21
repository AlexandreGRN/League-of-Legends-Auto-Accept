$(document).ready(function() {
    ipcRenderer.on("checkBox", (data) => {
        $('.accept_checkbox').prop("checked", data.AutoAccept);
        $(".pick_checkbox").prop("checked", data.AutoPick);
        $(".ban_checkbox").prop("checked", data.AutoBan);
    });
    $(".accept").change(function() {
        ipcRenderer.invoke("matchAcceptBinary");
        makeRequest();
    });
    $(".pick").change(function() {
        ipcRenderer.invoke("matchPickBinary");
    });
    $(".ban").change(function() {
        ipcRenderer.invoke("matchBanBinary");
    });
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