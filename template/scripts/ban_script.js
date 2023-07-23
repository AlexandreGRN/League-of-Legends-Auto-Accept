// Variables
var championListBan = []

// Make the champion card of all the character in the game
async function makeChampionCardBan() {
    for (i in championListBan) {
        // Create the champion card
        champName = championListBan[i].championName;
        champURL = championListBan[i].championImageUrl;
        champCard = "<div id='" + champName + "_ban" + "' class='champion'><img src='" + champURL + "'><p>" + champName + "</p></div>"
        $(".champion_list_ban").append(champCard);

        // Champion card click event
        $("#" + champName + "_ban").click(function(){
            if ($("#" + $(this).attr("id") + "_selected").length == 0) {
                ipcRenderer.invoke("champion-clicked", {championName: $(this).attr("id"), championImageUrl: $(this).children("img").attr("src")});
                $(".selected_champion_list_ban").append("<div id='" + $(this).attr("id") + "_selected" + "' class='champion'><img src='" + $(this).children("img").attr("src") + "'><p>" + ($(this).attr("id")).split("_")[0] + "</p></div>");
                $("#" + $(this).attr("id") + "_selected").click(function(){
                    ipcRenderer.invoke("champion-clicked-remove", {championName: $(this).attr("id"), championImageUrl: $(this).children("img").attr("src")});
                    $(this).remove();
                });
            };
        });
    };
};

ipcRenderer.on('championListBan', (data) => {
    championListBan = data;
    makeChampionCardBan();
});
