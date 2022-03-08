#!/usr/bin/env node

import child_process from 'child_process';
if (process.platform === "win32") {
    child_process.exec('npm config set "msvs_version" "2019"');
    child_process.exec('npm config set "msbuild_path" "C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Enterprise\\MSBuild\\Current\\Bin\\MSBuild.exe"');
}

function out(cmd) {
    return (err, stdout, stderr) => {
        console.log("Command: " + cmd);
        if (err) {
            console.error("Process exited with code: " + err.code + "\n" + err.name + err.message)
        }
        console.log(stdout);
        console.log(stderr);
    }
}

child_process.exec('npm run install --prefix vspXr-server', out("install server"));
child_process.exec('npm run install --prefix vspXr-extension', out("install extension"));
child_process.exec('npm run install --prefix vspXr-cli', out("install cli"));
child_process.exec('npm run install-ui --prefix vspXr-extension', out("installui extension"));
