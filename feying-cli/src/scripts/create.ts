import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import config, { IConfig } from '../config';
import { getTemplateConfig } from './template';
import { generate } from './generate';

const execa = require('execa');

export const createFromTemalate = async (pConfig: IConfig) => {
    console.log('✨', `Creating project in ${chalk.yellow(config.path)} ...`);

    const templateDir = path.resolve(
        __dirname,
        `../../template/${pConfig.templateName}/`,
    );

    const { templateConfig } = await getTemplateConfig(pConfig);

    const renderData = Object.assign({}, pConfig, templateConfig);

    const files = fs.readdirSync(templateDir);
    await files.reduce(
        async (pre, f) => {
            await pre;
            return await generate({
                sourceFile: path.resolve(templateDir, f),
                targetFile: path.resolve(config.path, f),
                render: true,
                data: renderData,
                ignoreFile: ['.fly'],
            });
        },
        null as any,
    );

    // init git
    console.log('🗃', 'Initializing git repository...');
    await execa('git', ['init'], {
        cwd: config.path,
    });

    console.log(`🎉  Successfully created project ${config.name}.`);

    console.log('👉  Get started with the following commands: \n');
    if (config.name) {
        console.log(chalk.cyan(` ${chalk.gray('$')} cd ${config.name}`));
    }
    console.log(chalk.cyan(` ${chalk.gray('$')} yarn `));
    console.log(chalk.cyan(` ${chalk.gray('$')} yarn dev `));
};
