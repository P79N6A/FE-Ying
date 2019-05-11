import * as path from 'path';
import * as fs from 'fs';
import config, { IConfig } from '../config';
import { generate } from './generate';
import { getTemplateConfig } from './template';

const inquirer = require('inquirer');

// 向项目中添加模块 文件覆盖
// @ts-ignore
export const addModule = async (
    moduleName: string,
    pConfig: IConfig,
) => {
    const templatePath = path.resolve(
        __dirname,
        `../../template/${pConfig.template}`,
    );
    if (pConfig.modules.includes(moduleName)) {
        const answer = await inquirer.prompt([
            {
                name: 'overwrite',
                message: `本地已添加过 ${moduleName} 模块, 确定覆盖么?`,
                type: 'confirm',
            },
        ]);
        if (!answer.overwrite) {
            return;
        }
    }
    const moduleDir = path.resolve(templatePath, '.fly/modules/', moduleName);
    if (!fs.existsSync(moduleDir)) {
        console.error(
            `${moduleName} 模块在 ${
                pConfig.template
            } 模板中不存在! 请检查后再添加!`,
        );
        return;
    }

    const { templateConfig } = await getTemplateConfig(pConfig);

    const renderData = Object.assign({}, pConfig, templateConfig);

    const files = fs.readdirSync(moduleDir);
    await files.reduce(
        async (pre, f) => {
            await pre;
            return await generate({
                sourceFile: path.resolve(moduleDir, f),
                targetFile: path.resolve(config.path, f),
                render: true,
                data: renderData,
            });
        },
        null as any,
    );
    return true;
};
