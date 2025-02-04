const electron = require('electron');

electron.contextBridge.exposeInMainWorld("electron",{
    automateLinkedin: () => console.log("Posted all the posts on Linkedin"),
})