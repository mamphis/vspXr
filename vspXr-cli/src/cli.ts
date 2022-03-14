#!/usr/bin/env node

import yargs from "yargs";
import uploadCommand, { uploadCommandBuilder } from "./commands/upload";

// Setup the yargs parser. Currently only an Upload-Command is available
yargs
    // Upload Command. Uploads an extension to the specified registry 
    .command('push [vsix]', 'uploads the extension in the current directory',
        uploadCommandBuilder, uploadCommand)
    .demandCommand(1)
    .scriptName('vspxr')
    .help('h').argv;