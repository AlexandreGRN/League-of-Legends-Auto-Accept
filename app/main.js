// Import

const {app, BrowserWindow} = require("electron")
const path = require("path")

// WINDOWS
// Main_Window
const createWindow = () => {
    // Create the window
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.loadFile("index.html")
}

// CREATE WINDOW
app.whenReady().then(() => {
    // Create the window
    createWindow()

    // MacOS Requirements (Needs to create the window again if necessary)
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

//CLOSE THE APP
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

console.log(__dirname.toString())