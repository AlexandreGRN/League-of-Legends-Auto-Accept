// Import
const {app, BrowserWindow, ipcMain, ipcRenderer, webContents, protocol} = require("electron");
const path = require("path");
const axios = require("axios");
const LCUConnector = require('lcu-connector');
const https = require("https");
const { start } = require("repl");
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// Create the champion list
var championList = [];
var selectedChampionList = [];

// Misc functions
async function prepareAppPick() {
    createWindow("../template/loading.html");
    currentWindow.webContents.on('did-finish-load', () => {
        currentWindow.webContents.send('championListLoading', championList);
    });
};
async function finishLoadingPick(){
    currentWindow.loadFile("../template/pick.html");
    currentWindow.webContents.on('did-finish-load', () => {
        currentWindow.webContents.send('championList', championList);
        currentWindow.webContents.send("selectedChampionList", selectedChampionList);
    });
};

async function prepareAppAccept() {
    createWindow("../template/loading.html");
    startAccept();
};
async function startAccept() {
    currentWindow.loadFile("../template/accept.html");
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
    prepareAppAccept();

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
    selectedChampionList.splice(selectedChampionList.indexOf(championInfo), 1);
});

// IPC championListLoadingResult
ipcMain.on("championListLoadingResult", (event, championListFinish) => {
    championList = championListFinish;
    finishLoadingPick();
});

// Check for match accept
ipcMain.handle("checkForMatchAccept", async (event) => {
    var response = await basicRequest("/lol-gameflow/v1/gameflow-phase");
});

async function basicRequest(url) {
    const connector = new LCUConnector();
        connector.on('connect', (data) => {
        const {protocol, address, port, username, password} = data;
        const baseURL = `https://127.0.0.1:${port}${url}`;
        axios.get(`${baseURL}`, {
            headers: {
                Accept: "application/json",
                Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`
            }
        }).then((response) => {
            if (response.data == "ReadyCheck") {
                console.log("Match found");
                basicRequestPost("/lol-lobby-team-builder/v1/ready-check/accept")
            };
        }).catch((error) => {
            console.log(error);
        });
    });
    connector.start();
}

async function basicRequestPost(url) {
    const connector = new LCUConnector();
        connector.on('connect', (data) => {
        const {protocol, address, port, username, password} = data;
        const baseURL = `https://127.0.0.1:${port}${url}`;
        const headers = {
            'accept': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`
        };
        axios.post(`${baseURL}`, '', {
            headers: headers,
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        }).then((response) => {
            console.log(response.data);
        }).catch((error) => {
            console.log(error);
        });
    });
    connector.start();
}