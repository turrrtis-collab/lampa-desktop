const fs = require('fs');
const { spawn } = require('child_process');

window.api = {
    fileExists: (path) => fs.existsSync(path),
    spawnProcess: (path, args) => spawn(path, args)
};

window.nodeModule = window.module;
delete window.module;
delete window.exports;
