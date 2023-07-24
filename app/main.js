// Import
const {app, BrowserWindow, ipcMain, ipcRenderer, webContents, protocol} = require("electron");
const path = require("path");
const axios = require("axios");
const LCUConnector = require('lcu-connector');
const https = require("https");

// Variables
var selectedPickChampionList = [];
var selectedBanChampionList = [];
var AutoAccept = false;
var AutoPick = false;
var AutoBan = false;
var AvailableChampionList = [];
var AllBannableChampionsList = [];
var PUUID = 0;
let status;
let currentWindow;


// MISC FUNCTIONS
// Sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Request function
async function request(url, method, body = "") {
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
                    headers: headers,
                    httpsAgent: new https.Agent({ rejectUnauthorized: false })
                }).then((response) => {
                    resolve(response.data);
                }).catch((error) => {
                    resolve(undefined)
                });
            } else if (method == "POST") {
                axios.post(`${baseURL}`, '', {
                    headers: headers,
                    httpsAgent: new https.Agent({ rejectUnauthorized: false })
                }).then((response) => {
                    resolve(response.data);
                }).catch((error) => {
                    resolve(undefined)
                });
            } else if (method == "PATCH"){
                axios.patch(`${baseURL}`, body, {
                    headers: headers,
                    httpsAgent: new https.Agent({ rejectUnauthorized: false })
                }).then((response) => {
                    resolve(response.data);
                }).catch((error) => {
                    resolve(undefined)
                });
            }
        });
        connector.start();
    });
};

// BASICS WINDOWS FUNCTIONS
function createWindow (htmlFile) {
    // Create the window
    currentWindow = new BrowserWindow({
        title: "LoL Auto Accept",
        width: 1500,
        height: 1000,
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
    response = await request("/lol-summoner/v1/current-summoner", "GET").then((response) => {
        if (response == undefined){return 0;}
        PUUID = response.summonerId;
    });    
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

// Ipc communications Binary
ipcMain.handle("matchAcceptBinary", async (event) => {
    AutoAccept = !AutoAccept;
});
ipcMain.handle("matchPickBinary", async (event) => {
    AutoPick = !AutoPick;
});
ipcMain.handle("matchBanBinary", async (event) => {
    AutoBan = !AutoBan;
});

// -------------------- LOADING --------------------
ipcMain.handle("loadingChampions", async (event, championList) => {
    response = await request(`/lol-champions/v1/inventories/${PUUID}/champions-minimal`, "GET");
    response.sort((a, b) => a.alias.localeCompare(b.alias));
    for (i in response) {
        for (j in championList) {
            if (response[i].alias == championList[j].championName && response[i].active == true) {
                AllBannableChampionsList.push({championName: response[i].alias, inF2PRotation: response[i].freeToPlay, lolId: response[i].id, championImageUrl: championList[j].championImageUrl});
                if (response[i].purchased != 0) {
                    AvailableChampionList.push({championName: response[i].alias, inF2PRotation: response[i].freeToPlay, lolId: response[i].id, championImageUrl: championList[j].championImageUrl});
                }
            }
        }
    };
    currentWindow.webContents.send("championListPick", AvailableChampionList);
    currentWindow.webContents.send("championListBan", AllBannableChampionsList);
});
ipcMain.handle("loadingFinished", (event, championListFinish) => {
    loadingAccept();
});
ipcMain.handle("checkStatus", async (event) => {
    while(true) {
        status = await request("/lol-gameflow/v1/gameflow-phase", "GET");
        if (status != "InProgress"){
            if (status == undefined) {return 0;}
            if (status == "ReadyCheck" && AutoAccept) {
                request("/lol-lobby-team-builder/v1/ready-check/accept", "POST");
            };
            if (status == "ChampSelect" && (AutoPick || AutoBan)) {
                inChampSelect();
            }
            await sleep(1000);
        }
        if (status == "InProgress") {
            await sleep(15000);
        }
    }
});


// -------------------- ACCEPT TAB --------------------
// Launch the APP
async function loadingAccept() {
    currentWindow.loadFile("../template/index.html");
};

// -------------------- PICK WINDOW --------------------
ipcMain.handle("champion-clicked-pick", async (event, championInfo) => {
    selectedPickChampionList.push(championInfo);
});
ipcMain.handle("champion-clicked-pick-remove", async (event, championInfo) => {
    for (i in selectedPickChampionList) {
        if (selectedPickChampionList[i].championName + "_selected" == championInfo.championName) {
            selectedPickChampionList.splice(i, 1);
        };
    }
});


// -------------------- BAN WINDOW --------------------
// Ipc communications
ipcMain.handle("champion-clicked-ban", async (event, championInfo) => {
    selectedBanChampionList.push(championInfo);
});
ipcMain.handle("champion-clicked-ban-remove", async (event, championInfo) => {
    for (i in selectedBanChampionList) {
        if (selectedBanChampionList[i].championName + "_selected" == championInfo.championName) {
            selectedBanChampionList.splice(i, 1);
        };
    }
});


// Champ Select Functions
// Create Variables
async function pickChampionIds (bans) {
    return new Promise((resolve, reject) => {
        pickTargetIds = [];
        for (i in selectedPickChampionList) {
            for (j in AvailableChampionList) {
                if (selectedPickChampionList[i].championName == AvailableChampionList[j].championName) {
                    pickTargetIds.push(AvailableChampionList[j].lolId);
                }
            }
        }
        for (i in pickTargetIds){
            if (!bans.includes(pickTargetIds[i])) {
                resolve(pickTargetIds[i]);
            }
        }
        resolve(0);
    });
}
async function banChampionIds (bans) {
    return new Promise((resolve, reject) => {
        if (response == undefined) {return 0;}
        banTargetIds = [];
        for (i in selectedBanChampionList) {
            for (j in AllBannableChampionsList) {
                if (selectedBanChampionList[i].championName == AllBannableChampionsList[j].championName) {
                    banTargetIds.push(AllBannableChampionsList[j].lolId);
                }
            }
        }
        for (i in banTargetIds){
            if (!bans.includes(banTargetIds[i])) {
                resolve(banTargetIds[i]);
            }
        }
        resolve(0);
    });
}

async function getPersonalActions (actions, cellId) {
    var personalActions = [];
    for (i in actions) {
        for (j in actions[i]) {
            if((actions[i][j].actorCellId == cellId && actions[i][j].completed == false)) {
                personalActions.push(actions[i][j]);
            }
        }
    }
    return personalActions;
}
async function getBans (bans) {
    var bansList = [];
    for (i in bans) {
        if (Array.isArray(bans[i])) {
            for (j in bans[i]) {
                bansList.push(bans[i][j]);
            }
        }
    }
    return bansList;
}

// Make body requests
async function makeBanRequestBody (action, championId=1) {
    requestBody = {
        "actorCellId": action.actorCellId,
        "championId": championId,
        "completed": true,
        "id": action.id,
        "isAllyAction": true,
        "type": action.type
    };
    return requestBody;
}
async function makePickRequestBody (action, championId) {
    requestBody = {
        "actorCellId": action.actorCellId,
        "championId": championId,
        "completed": true,
        "id": action.id,
        "isAllyAction": action.isAllyAction,
        "type": action.type
    };
    return requestBody;
}

async function inChampSelect () {
    //Get infos
    response = await request("/lol-champ-select/v1/session", "GET");
    if (response.actions.length == 0) {return 0;}
    //Variables
    var actions = response.actions;
    var cellId = response.localPlayerCellId;
    var personalActions = await getPersonalActions(actions, cellId);
    var bans = await getBans(response.bans);
    for (i in personalActions) {
        // Ban phase
        if (personalActions[i].type == "ban" && personalActions[i].completed == false && AutoBan) {
            var action = personalActions[i];
            var banChampionId = await banChampionIds(bans);
            if (banChampionId == 0 && banChampionId == undefined) {return 0;}
            requestBody = await makeBanRequestBody(action, banChampionId).catch((error) => {console.log(error);return 0});
            if (requestBody != 0) {
                await request("/lol-champ-select/v1/session/actions/" + action.id, "PATCH", requestBody).catch((error) => {return 0});
            }
        }

        // Pick phase
        else if (personalActions[i].type == "pick" && personalActions[i].completed == false && AutoPick) {
            var action = personalActions[i];
            var pickChampionId = await pickChampionIds(bans);
            if (pickChampionId == 0 && pickChampionId == undefined) {return 0;}
            requestBody = await makePickRequestBody(action, pickChampionId).catch((error) => {console.log(error);return 0});
            if (requestBody != 0) {
                await request("/lol-champ-select/v1/session/actions/" + action.id, "PATCH", requestBody).catch((error) => {return 0});
            }
        }
    };
}
