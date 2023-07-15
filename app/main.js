// Import
const {app, BrowserWindow, ipcMain, ipcRenderer, webContents} = require("electron");
const path = require("path");
const axios = require("axios");

// Create the champion list
var championList = [];
var selectedChampionList = [];

// Misc functions
async function prepareApp() {
    createWindow("../template/loading.html");
    currentWindow.webContents.on('did-finish-load', () => {
        currentWindow.webContents.send('championListLoading', championList);
    });
};

async function finishLoading() {
    currentWindow.loadFile("../template/pick.html");
    currentWindow.webContents.on('did-finish-load', () => {
        currentWindow.webContents.send('championList', championList);
        currentWindow.webContents.send("selectedChampionList", [{championName: 'Aatrox_selected', championImageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.13.1/img/champion/Aatrox.png'},{championName: 'Cassiopeia_selected',championImageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.13.1/img/champion/Cassiopeia.png'},{championName: 'Caitlyn_selected',championImageUrl: 'https://ddragon.leagueoflegends.com/cdn/13.13.1/img/champion/Caitlyn.png'}]);
    });
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
        }
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
ipcMain.handle("champion-clicked", async (event, championInfo) => {
    selectedChampionList.push(championInfo);
});

ipcMain.handle("champion-clicked_remove", async (event, championInfo) => {
    console.log(championInfo);
});

// IPC championListLoadingResult
ipcMain.on("championListLoadingResult", (event, championListFinish) => {
    championList = championListFinish;
    finishLoading();
});
