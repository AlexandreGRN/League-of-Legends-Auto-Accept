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

        $(".accept_tab").css("color", "#7b7b7b");
        $(".pick_tab").css("color", "#ffffff");
        $(".ban_tab").css("color", "#ffffff");

    });
    $(".pick_tab").click(function() {
        $(".champion_list_pick").css("display", "flex");
        $(".selected_champion_list_pick").css("display", "flex");
        $(".champion_list_ban").css("display", "none");
        $(".selected_champion_list_ban").css("display", "none");

        $(".accept_tab").css("color", "#ffffff");
        $(".pick_tab").css("color", "#7b7b7b");
        $(".ban_tab").css("color", "#ffffff");
    });
    $(".ban_tab").click(function() {
        $(".champion_list_ban").css("display", "flex");
        $(".selected_champion_list_ban").css("display", "flex");
        $(".champion_list_pick").css("display", "none");
        $(".selected_champion_list_pick").css("display", "none");
        
        $(".accept_tab").css("color", "#ffffff");
        $(".pick_tab").css("color", "#ffffff");
        $(".ban_tab").css("color", "#7b7b7b");
    });
});

