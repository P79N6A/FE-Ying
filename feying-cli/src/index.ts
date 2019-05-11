#!/usr/bin/env node

import config, { setConfig, saveConfig } from './config';
import {
    updateTemplate,
    initTemplate,
    chooseTempate,
} from './scripts/template';
import { addPage } from './scripts/page';

import { createFromTemalate } from './scripts/create';

const program = require('commander');
const fs = require('fs');
const path = require('path');

program.version(require('../package').version).usage('<command> [options]');

export interface ICmd {
    options: ICmdOptions[];
    [key: string]: any;
}

export interface ICmdOptions {
    long: string;
}

const create = async (name: string, cmd: ICmd) => {
    if (!cmd) {
        // @ts-ignore
        cmd = name;
        // @ts-ignore
        name = undefined;
    }

    setConfig({
        ...config,
        ...cleanArgs(cmd),
        name,
        path: name ? path.resolve(process.cwd(), name) : process.cwd(),
    }, true);

    if (!fs.existsSync(config.path)) {
        fs.mkdirSync(config.path);
    }

    const templateConfig = await chooseTempate(config);
    setConfig(templateConfig);

    await initTemplate(config);

    await createFromTemalate(config);

    await saveConfig();
};

program
    .command('create <app-name>')
    .description('create a new miniApp project')
    .action(create);

program
    .command('init')
    .description('create a new miniApp in currnet dir')
    .action(create);

program
    .command('update')
    .description('update template')
    .action(async () => {
        await updateTemplate();
    });

program
    .command('add page  <page-name>')
    .description('Add a new Page with Name.')
    .action(async () => {
        await addPage();
    });

program.parse(process.argv);

// commander passes the Command object itself as options,
// extract only actual options into a fresh object.
function cleanArgs(cmd: ICmd) {
    const args = {};
    cmd.options.forEach(o => {
        const key = o.long.replace(/^--/, '');
        // if an option is not present and Command has a method with the same name
        // it should not be copied
        if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
            // @ts-ignore
            args[key] = cmd[key];
        }
    });
    return args;
}

if (program.args.length === 0) program.help();
