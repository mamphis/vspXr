# vspXr-server

This is the vspXr-Server. It is used to store extensions and save metadata.

## Prerequirements

- Install NodeJS
- Install Typescript

## Installation & Usage

Download the latest release of the vspXr-Server from the github page.

After unpacking the release you can copy the `.env.sample` file to `.env` and fill
the environment variables.

When you start the server with `node .` The server will create the temporary and the assets
directory. The server will listen on serveral routes to provide info about the registry 
(name and version), upload and info about the uploaded packages and downloads for assets (icons)
and the vsix files.
