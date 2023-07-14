// Import

const {app, BrowserWindow, ipcMain, ipcRenderer, webContents} = require("electron");
const path = require("path");
const axios = require("axios");

// Create the champion list
var championList = [];
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
        championsInfos.push({championName: championsNamesList[i], championImageUrl: await getChampionImageUrl(championsNamesList[i]), favorite: false});
    };
    return championsInfos;
};
// --- End of champion list creation


// Misc functions
async function prepareApp() {
    createWindow("../template/loading.html");
    championList = await makeChampionInfosList();
    currentWindow.loadFile("../template/pick.html");
    currentWindow.webContents.on('did-finish-load', () => {
        currentWindow.webContents.send('championList', championList);
    });
};

async function championListBridge(){
    return championList;
};


// BASICS WINDOWS FUNCTIONS
// main window template
let currentWindow;
function createWindow (htmlFile) {
    // Create the window
    currentWindow = new BrowserWindow({
        title: "Loading",
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            enableRemoteModule: true,
            preload: path.join(__dirname, "preload.js")
        },
        frame: false,
        resizable: false
    });
    currentWindow.loadFile(htmlFile);
};
// CREATE WINDOW
app.whenReady().then(async () => {
    // Create the window
    prepareApp();
    // MacOS Requirements (Needs to create the window again if necessary)
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        };
    });
});

// CLOSE THE APP
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    };
});

// IPC COMMUNICATION
// IPC champion-clicked
ipcMain.handle("champion-clicked", async (event, championName) => {
    console.log(championName);
});
