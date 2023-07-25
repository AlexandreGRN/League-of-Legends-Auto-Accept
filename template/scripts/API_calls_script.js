var championList = [];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getChampionsList() {
    var a = await axios.get('https://ddragon.leagueoflegends.com/cdn/13.13.1/data/en_US/champion.json');
    return a.data.data;
};
async function getChampionImageUrl(ChampName){
    var a = await axios.get('https://ddragon.leagueoflegends.com/cdn/13.13.1/img/champion/' + ChampName + '.png');
    return a.config.url;
};
async function getChampionNames() {
    var championList = await getChampionsList();
    var championNames = [];
    for (i in championList) {
        championNames.push(i);
    };
    return championNames;
  
};
async function makeChampionInfosList() {
    var championsNamesList = await getChampionNames();
    var championsInfos = [];
    for (i in championsNamesList) {
        championsInfos.push({championName: championsNamesList[i], championImageUrl: await getChampionImageUrl(championsNamesList[i])});
    };
    return championsInfos;
};

async function errorMSG() {
    await sleep(5000);
    $('.loader').css("top", "61%");
    await sleep(500);
    $('#main').css("display", "table");
    
};

$(document).ready(async function() {
    errorMSG();
    championList = await makeChampionInfosList();
    ipcRenderer.invoke("testLaunched");
    ipcRenderer.on("isLaunched", (event, data) => {
        ipcRenderer.invoke("checkStatus");
        ipcRenderer.invoke("loadingChampions", championList);
        ipcRenderer.invoke('loadingFinished');
    });
});