async function getChampionList() {
    var a = await axios.get('https://ddragon.leagueoflegends.com/cdn/13.13.1/data/en_US/champion.json')
    return a.data.data
}

async function getChampionImageUrl(ChampName){
    var a = await axios.get('https://ddragon.leagueoflegends.com/cdn/13.13.1/img/champion/' + ChampName + '.png')
    return a.config.url
}

async function getChampionNames() {
    var championList = await getChampionList()
    var championNames = []
    for (i in championList) {
        championNames.push(i)
    }
    return championNames

}

async function getChampionsInfos() {
    var championsNamesList = await getChampionNames();
    var championsInfos = []
    for (i in championsNamesList) {
        championsInfos.push({championName: championsNamesList[i], championImageUrl: await getChampionImageUrl(championsNamesList[i])})
    }
    return championsInfos
}

async function getChampionsInfos2() {
    var championListInfo = await getChampionsInfos()
    console.log(championListInfo.length)
        for (i in championListInfo) {
            $(".champion_list").append("<div class='champion'><img src='" + championListInfo[i].championImageUrl + "'><p>" + championListInfo[i].championName + "</p></div>");
    }
}


$(document).ready(async function(){

    // Get all champions from the database
    championListInfo = getChampionsInfos2()
    console.log("finished")

});