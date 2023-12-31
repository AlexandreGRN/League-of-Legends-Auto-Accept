// Variables
var championListPick = []

// Make the champion card of all the character in the game
async function makeChampionCardPick() {
    for (i in championListPick) {
        // Create the champion card
        champName = championListPick[i].championName;
        champURL = championListPick[i].championImageUrl;
        champId = championListPick[i].lolId;
        champCard = "<div id='" + champName + "_pick" + "_id_"+ champId + "' class='champion'><img src='" + champURL + "'><p>" + champName + "</p></div>"
        $(".champion_list_pick").append(champCard);

        // Champion card click event
        $("#" + champName + "_pick" + "_id_"+ champId).click(function(){
            if ($("#" + $(this).attr("id") + "_selected").length == 0) {
                ipcRenderer.invoke("champion-clicked-pick", {championName: $(this).attr("id").split("_")[0], championImageUrl: $(this).children("img").attr("src"), championId: $(this).attr("id").split("_")[3]});
                $(".selected_champion_list_pick").append("<div id='" + $(this).attr("id") + "_selected" + "' class='champion'><img src='" + $(this).children("img").attr("src") + "'><p>" + ($(this).attr("id")).split("_")[0] + "</p></div>");
                $("#" + $(this).attr("id") + "_selected").click(function(){
                    ipcRenderer.invoke("champion-clicked-pick-remove", {championName: $(this).attr("id").split("_")[0], championImageUrl: $(this).children("img").attr("src"), championId: $(this).attr("id").split("_")[3]});
                    $(this).remove();
                });
            };
        });
    };
};

ipcRenderer.on('championListPick', (data) => {
    championListPick = data;
    makeChampionCardPick();
});

// Search Bar
$(".search_tab_ET").on("input", function() {
    text = $(".search_tab_ET").val();
    searchChampion($(".champion_list_pick").children());
    searchChampion($(".champion_list_ban").children());
});

function searchChampion(championListSearch) {
    for (i in championListSearch) {
        if (championListSearch[i].id != undefined) {
            if (championListSearch[i].id.toLowerCase().includes(text.toLowerCase())) {
                $("#" + championListSearch[i].id).css("display", "flex");
            } else {
                $("#" + championListSearch[i].id).css("display", "none");
            };
        };
    }
}