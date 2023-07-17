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
var AutoAccept = false;
let currentWindow;

// MISC FUNCTIONS
// Sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Request function
async function request(url, method) {
    return new Promise((resolve, reject) => {
        const connector = new LCUConnector();
            connector.on('connect', (data) => {
            const {protocol, address, port, username, password} = data;
            const baseURL = `https://127.0.0.1:${port}${url}`;
            const headers = {
                'accept': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`
            };
            if (method == "GET") {
                axios.get(`${baseURL}`, {
                    headers: headers
                }).then((response) => {
                    resolve(response.data);
                });
            } else if (method == "POST") {
                axios.post(`${baseURL}`, '', {
                    headers: headers,
                    httpsAgent: new https.Agent({ rejectUnauthorized: false })
                }).then((response) => {
                    resolve(response.data);
                });
            };
        });
        connector.start();
    });
};



// -------------------- ACCEPT WINDOW --------------------
// Prepare the window
async function loadingAccept() {
    currentWindow.loadFile("../template/accept.html");
};
// Ipc communications
ipcMain.handle("checkForMatchAccept", async (event) => {
    while(AutoAccept) {
        var response = await request("/lol-gameflow/v1/gameflow-phase", "GET")
        console.log(response);
        if (response == "ReadyCheck") {
            request("/lol-lobby-team-builder/v1/ready-check/accept", "POST");
        };
        await sleep(5000);
    }
});
ipcMain.handle("matchAcceptBinary", async (event) => {
    AutoAccept = !AutoAccept;
    console.log(AutoAccept);
});


// -------------------- PICK WINDOW --------------------
// Prepare the window
async function loadingPick(){
    currentWindow.loadFile("../template/pick.html");
    console.log("loadingPick");
    currentWindow.webContents.on('did-finish-load', () => {
        console.log("sending championList");
        console.log(championList);
        console.log(selectedChampionList);
        currentWindow.webContents.send('championList', championList);
        currentWindow.webContents.send("selectedChampionList", selectedChampionList);
    });
};

// Ipc communications
ipcMain.handle("champion-clicked", async (event, championInfo) => {
    selectedChampionList.push(championInfo);
});
ipcMain.handle("champion-clicked_remove", async (event, championInfo) => {
    selectedChampionList.splice(selectedChampionList.indexOf(championInfo), 1);
});
ipcMain.on("championListLoadingResult", (event, championListFinish) => {
    championList = championListFinish;
    loadingAccept();
});



// BASICS WINDOWS FUNCTIONS
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
app.whenReady().then(async () => {
    // Create the window
    createWindow("../template/loading.html");
    // MacOS Requirements (Needs to create the window again if necessary)
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        };
    });
});
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    };
});

// Change Window
ipcMain.handle("changeWindow", async (event, data) => {
    if(data == "pick") {
        console.log("window changed to pick");
        loadingPick();
    } else if (data == "accept") {
        console.log("window changed to accept");
        loadingAccept();
    } else if (data == "ban") {
        //loadingBan();
    };
});
