#!/usr/bin/env node

import yargs from "yargs";
import uploadCommand, { uploadCommandBuilder } from "./commands/upload";

yargs
    .command('push [vsix]', 'uploads the extension in the current directory',
        uploadCommandBuilder, uploadCommand)
    .demandCommand(1)
    .scriptName('vspxr')
    .help('h').argv;