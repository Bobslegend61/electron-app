const electron = require("electron");
const path = require("path");
const url =require("url");

const {app, BrowserWindow, Menu, ipcMain} = electron;

// set env
process.env.node_env = "production";

let mainWindow;
let addWindow;

// liste for app ready state
app.on("ready", () => {
    // create new window
    mainWindow = new BrowserWindow({});

    // load html file into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "mainwindow.html"),
        protocol: "file:",
        slashes: true
    }));

    // Quit app when closed
    mainWindow.on("closed", () => {
        app.quit();
    });

    // build menu from templete
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)

    // insert menu
    Menu.setApplicationMenu(mainMenu);
});


// handle create add window
function createAddWindow() {
    // create new add window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: "Add Shoping List Item"
    });

    // load html file into addwindow
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, "addwindow.html"),
        protocol: "file:",
        slashes: true
    }));

    // garbage collection handle
    addWindow.on("closed", () => {
        addWindow = null;
    });
 
}

// catch item add
ipcMain.on("item:add", (e, item) => {
    mainWindow.webContents.send("item:add", item);
    addWindow.close();
});


// create menu templete
const mainMenuTemplate = [
    {
        label: "File",
        submenu: [
            {
                label: "Add item",
                click() {
                    createAddWindow();
                }
            },
            {
                label: "Clear items",
                click() {
                    mainWindow.webContents.send("item:clear");
                }
            },
            {
                label: "Quit",
                accelerator: process.platform == "darwin" ? "Commant+Q" : "Ctrl+Q",
                click() {
                    app.quit();
                }
            }
        ]
    }
];

// check if mac add empty object
if(process.platform == "darwin") {
    mainMenuTemplate.unshift({});
}

// add developer tools item if not in prod
if(process.env.node_env !== "production") {
    mainMenuTemplate.push({
        label: "Developer Tools",
        submenu: [
            {
                label: "Toggle DevTools",
                accelerator: process.platform == "darwin" ? "Commant+I" : "Ctrl+I",
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: "reload"
            }
        ]
    })
}