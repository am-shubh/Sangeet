// Dependencies
const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let win;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        show: true,
        width: 1024, 
        height: 800,
        minWidth: 1024,
        maxWidth: 1024,
        minHeight: 800,
        maxHeight: 800,
        center: true,
        autoHideMenuBar: true,
        title: "Sangeet"
    })

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'dist/sangeet/index.html'),
        protocol: 'file:',
        slashes: true
    }))


    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
}

app.on('ready', createWindow)