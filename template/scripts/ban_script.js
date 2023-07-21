// Variables

var championList = []
var selectedChampionList = []

// Make the champion card of all the character in the game
async function makeChampionCard() {
    for (i in championList) {
        // Create the champion card
        champName = championList[i].championName;
        champURL = championList[i].championImageUrl;
        champCard = "<div id='" + champName + "' class='champion'><img src='" + champURL + "'><p>" + champName + "</p></div>"
        $(".champion_list").append(champCard);

        // Champion card click event
        $("#" + champName).click(function(){
            if ($("#" + $(this).attr("id") + "_selected").length == 0) {
                ipcRenderer.invoke("champion-clicked-ban", {championName: $(this).attr("id"), championImageUrl: $(this).children("img").attr("src")});
                $(".selected_champion_list").append("<div id='" + $(this).attr("id") + "_selected" + "' class='champion'><img src='" + $(this).children("img").attr("src") + "'><p>" + $(this).attr("id") + "</p></div>");
                $("#" + $(this).attr("id") + "_selected").click(function(){
                    ipcRenderer.invoke("champion-clicked-remove-ban", {championName: $(this).attr("id"), championImageUrl: $(this).children("img").attr("src")});
                    $(this).remove();
                });
            };
        });
    };
};

// Make the champion card of all the character selected
async function makeSelectedChampionCard(){
    for (i in selectedChampionList) {
        champName = selectedChampionList[i].championName;
        champURL = selectedChampionList[i].championImageUrl;
        if ($("#" + champName + "_selected").length == 0) {
            champCard = "<div id='" + champName + "_selected" + "' class='champion'><img src='" + champURL + "'><p>" + champName + "</p></div>"
            $(".selected_champion_list").append(champCard);
            $("#" + champName + "_selected").click(function(){
                ipcRenderer.invoke("champion-clicked-remove-ban", {championName: $(this).attr("id"), championImageUrl: $(this).children("img").attr("src")});
                $(this).remove();
            });
        };
    };
}


$(document).ready(async function(){
    // Get all champions from the database
    // Then make the champion card
    ipcRenderer.on('championListBan', (data) => {
        championList = data;
        makeChampionCard();
    });
    // Then make the selected champion card
    ipcRenderer.on('selectedBanChampionList', (data) => {
        selectedChampionList = data;
        makeSelectedChampionCard();
    });


});

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