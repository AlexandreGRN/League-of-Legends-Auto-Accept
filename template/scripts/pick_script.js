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
                ipcRenderer.invoke("champion-clicked", {championName: $(this).attr("id"), championImageUrl: $(this).children("img").attr("src")});
                $(".selected_champion_list").append("<div id='" + $(this).attr("id") + "_selected" + "' class='champion'><img src='" + $(this).children("img").attr("src") + "'><p>" + $(this).attr("id") + "</p></div>");
                $("#" + $(this).attr("id") + "_selected").click(function(){
                    ipcRenderer.invoke("champion-clicked_remove", {championName: $(this).attr("id"), championImageUrl: $(this).children("img").attr("src")});
                    $(this).remove();
                });
            };
        });
    };
};

// Make the champion card of all the character selected
async function makeSelectedChampionCard(){
    for (i in selectedChampionList) {
        champName = championList[i].championName;
        champURL = championList[i].championImageUrl;
        champCard = "<div id='" + champName + "_selected" + "' class='champion'><img src='" + champURL + "'><p>" + champName + "</p></div>"
        $(".selected_champion_list").append(champCard);
        $("#" + champName + "_selected").click(function(){
            ipcRenderer.invoke("champion-clicked_remove", {championName: $(this).attr("id"), championImageUrl: $(this).children("img").attr("src")});
            $(this).remove();
        });
    };
}


$(document).ready(async function(){
    // Get all champions from the database
    // Then make the champion card
    ipcRenderer.on('championList', (data) => {
        championList = data;
        makeChampionCard();
    });
    // Then make the selected champion card
    ipcRenderer.on('selectedChampionList', (data) => {
        selectedChampionList = data;
        makeSelectedChampionCard();
    });
});


