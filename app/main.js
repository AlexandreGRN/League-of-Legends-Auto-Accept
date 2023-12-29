// npx electron-packager . lol --platform=win32 --arch=x64
// Import
const {app, BrowserWindow, ipcMain, ipcRenderer, webContents, protocol} = require("electron");
const path = require("path");
const axios = require("axios");
const LCUConnector = require('lcu-connector');
const https = require("https");

// Variables
var selectedPickChampionList = {};
var selectedBanChampionList = {};
var AutoAccept = false;
var AutoPick = false;
var AutoBan = false;
var AvailableChampionList = [];
var AllBannableChampionsList = [];
var PUUID = 0;
let status;
let currentWindow;
var patchVersion = "13.20.1";

/* ---------- MISC FUNCTIONS ----------*/
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

/* ----------END OF MISC FUNCTIONS ---------- */

/* ---------- BASICS WINDOWS FUNCTIONS ---------- */
// Create the window depending on the html file we want to load
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
// When the app is ready, create the window
app.whenReady().then(async () => {
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

/* ---------- END OF BASICS WINDOWS FUNCTIONS ---------- */


/* ---------- Ipc communications Binary ---------- */
ipcMain.handle("matchAcceptBinary", async (event) => {
    AutoAccept = !AutoAccept;
});
ipcMain.handle("matchPickBinary", async (event) => {
    AutoPick = !AutoPick;
});
ipcMain.handle("matchBanBinary", async (event) => {
    AutoBan = !AutoBan;
});
/* ---------- END OF Ipc communications Binary ---------- */

/* ---------- LOADING ---------- */
// check if the client is launched and get the PUUID and the patch version than start the real app (end loading)
ipcMain.handle("testLolClientLaunched", async (event) => {
    response1 = undefined, response2 = undefined;
    while (response1 == undefined || response2 == undefined) {
        [response1, response2] = await Promise.all([request("/lol-summoner/v1/current-summoner", "GET"), request("/lol-patch/v1/game-version", "GET")]);
    }
    PUUID = response1.summonerId;
    patchVersion = response2.split(".")[0] + "." + response2.split(".")[1] + ".1";
    currentWindow.webContents.send("LolClientIsLaunched", patchVersion);
});

// Get the list of all champions and the list of all champions owned by the player
// Assign all the champions name to other important variables like the Id (used to pick and ban)
ipcMain.handle("loadingChampions", async (event, championList) => {
    loadingAccept();
    response = undefined;
    while (response == undefined) {
        response = await request(`/lol-champions/v1/inventories/${PUUID}/champions-minimal`, "GET");
    };
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
    checkStatus();
});

// Check the gameflow status of the game and do the actions depending on the status
async function checkStatus(){
    while(true) {
        status = await request("/lol-gameflow/v1/gameflow-phase", "GET");
        if (status == undefined) {continue;}
        if (status == "ReadyCheck" && AutoAccept) {
            request("/lol-lobby-team-builder/v1/ready-check/accept", "POST");
        };
        if (status == "ChampSelect" && (AutoPick || AutoBan)) {
            inChampSelect();
            await sleep(100);
        }
        if (status == "InProgress") {
            await sleep(15000);
        }
    }
}

/* ---------- END OF LOADING ---------- */


/* ---------- ACCEPT TAB ---------- */
// Launch the APP
async function loadingAccept() {
    currentWindow.loadFile("../template/index.html");
};

/* ---------- END OF ACCEPT TAB ---------- */


/* ---------- PICK WINDOW ---------- */
ipcMain.handle("champion-clicked-pick", async (event, championInfo) => {
    selectedPickChampionList[championInfo.championName] = championInfo;
});
ipcMain.handle("champion-clicked-pick-remove", async (event, championInfo) => {
    delete selectedPickChampionList[championInfo.championName];
});

/* ---------- END OF PICK WINDOW ---------- */


/* ---------- BAN WINDOW ---------- */
// Ipc communications
ipcMain.handle("champion-clicked-ban", async (event, championInfo) => {
    selectedBanChampionList[championInfo.championName] = championInfo;
});
ipcMain.handle("champion-clicked-ban-remove", async (event, championInfo) => {
    delete selectedBanChampionList[championInfo.championName];
});

/* ---------- END OF BAN WINDOW ---------- */


/* ---------- CHAMPION SELECT WINDOW ---------- */
// GET CHAMPION ID
// Chose the champion to pick (return the lol-ID of the champion)
async function pickChampionIds (bans, intentList) {
    return new Promise((resolve, reject) => {
        for (i in selectedPickChampionList) {
            if (!bans.includes(parseInt(selectedPickChampionList[i].championId)) && !intentList.includes(parseInt(selectedPickChampionList[i].championId))) {
                resolve(selectedPickChampionList[i].championId);
            }
        }
        resolve(0);
    });
}
// Chose the champion to ban (return the lol-ID of the champion)
async function banChampionIds (bans, intentList) {
    return new Promise((resolve, reject) => {
        for (i in selectedBanChampionList) {
            if (!bans.includes(parseInt(selectedBanChampionList[i].championId)) && !intentList.includes(parseInt(selectedBanChampionList[i].championId))) {
                resolve(selectedBanChampionList[i].championId);
            }
        }
        resolve(0);
    });
}

// GET INFO LIST
// Get the personal actions of the player (bans and picks)
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
// Get the bans and picks of the champ select
async function getBansAndPicks (bans) {
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
// Get the intent pick list of all the players
async function intentPickList(myTeam, cellId){
    intentList = [];
    myTeam.forEach((player) => {
        if (player.cellId != cellId) {
            intentList.push(player.championPickIntent)
        }
    });
    return intentList;
}

// REQUESTS
// Make body requests for bans
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

// Make body requests for picks
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

// Main function of the champ select
async function inChampSelect () {
    //Get infos
    response = await request("/lol-champ-select/v1/session", "GET");
    if (response == undefined || response.actions == undefined) {return 0;}
    //Variables
    var actions = response.actions;
    var cellId = response.localPlayerCellId;
    var personalActions = await getPersonalActions(actions, cellId);
    var bans = await getBansAndPicks(response.bans);
    for (i in personalActions) {
        // Ban phase
        if (personalActions[i].type == "ban" && personalActions[i].completed == false && AutoBan) {
            var action = personalActions[i];
            var intentList = await intentPickList(response.myTeam, cellId);
            var banChampionId = await banChampionIds(bans, intentList);
            if (banChampionId == 0 && banChampionId == undefined) {return 0;}
            requestBody = await makeBanRequestBody(action, banChampionId).catch((error) => {console.log(error);return 0});
            if (requestBody != 0 && selectedBanChampionList.length != 0) {
                await request("/lol-champ-select/v1/session/actions/" + action.id, "PATCH", requestBody).catch((error) => {return 0});
            }
        }

        // Pick phase
        else if (personalActions[i].type == "pick" && personalActions[i].completed == false && AutoPick) {
            var action = personalActions[i];
            var intentList = await intentPickList(response.myTeam, cellId);
            var pickChampionId = await pickChampionIds(bans, intentList);
            if (pickChampionId == 0 && pickChampionId == undefined) {return 0;}
            requestBody = await makePickRequestBody(action, pickChampionId).catch((error) => {console.log(error);return 0});
            if (requestBody != 0 && selectedPickChampionList.length != 0) {
                await request("/lol-champ-select/v1/session/actions/" + action.id, "PATCH", requestBody).catch((error) => {return 0});
            }
        }
    };
}
