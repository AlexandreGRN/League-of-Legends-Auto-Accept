var championList = []

async function getChampionsInfos2() {
    for (i in championList) {
        champName = championList[i].championName;
        $(".champion_list").append("<div id='" + champName + "' class='champion'><img src='" + championList[i].championImageUrl + "'><p>" + champName + "</p></div>");
        $("#" + champName).click(function(){
            ipcRenderer.invoke("champion-clicked", $(this).attr("id"));
        });
    };
};


$(document).ready(async function(){
    // Get all champions from the database
    ipcRenderer.on('championList', (data) => {
        championList = data;
        getChampionsInfos2();
    });
});
