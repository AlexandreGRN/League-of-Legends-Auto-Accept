$(document).ready(function() {
    $(".accept").change(function() {
        ipcRenderer.invoke("matchAcceptBinary");
    });
    $(".pick").change(function() {
        ipcRenderer.invoke("matchPickBinary");
    });
    $(".ban").change(function() {
        ipcRenderer.invoke("matchBanBinary");
    });
    $(".accept_tab").click(function() {
        $(".champion_list_pick").css("display", "none");
        $(".selected_champion_list_pick").css("display", "none");
        $(".champion_list_ban").css("display", "none");
        $(".selected_champion_list_ban").css("display", "none");
    });
    $(".pick_tab").click(function() {
        $(".champion_list_pick").css("display", "flex");
        $(".selected_champion_list_pick").css("display", "flex");
        $(".champion_list_ban").css("display", "none");
        $(".selected_champion_list_ban").css("display", "none");
    });
    $(".ban_tab").click(function() {
        $(".champion_list_ban").css("display", "flex");
        $(".selected_champion_list_ban").css("display", "flex");
        $(".champion_list_pick").css("display", "none");
        $(".selected_champion_list_pick").css("display", "none");
    });
});

