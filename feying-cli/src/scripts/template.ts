import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import rimraf = require('rimraf');
import { IConfig } from '../config';

const inquirer = require('inquirer');
const git = require('git-promise');

export enum ETemplateType {
    FromLocal = 'from-local',
    FromGit = 'from-git',
}

const templates = {
    miniApp: {
        git: 'git@code.byted.org:pgcfe/atop-template.git',
    },
    miniAppJs: {
        git: 'git@code.byted.org:pgcfe/atop-template-js.git',
    },
};

const localTemplates = getLocalTemplates() || [];

function getLocalTemplates() {
    const tmplatePath = path.resolve(__dirname, '../../template/');
    if (!fs.existsSync(tmplatePath)) {
        // console.log(
        //     `本地模板不存在, 请使用 ${chalk.yellowBright(
        //         'fly-project template list',
        //     )} 检查可用模板`,
        // );
    } else {
        const localTemplatesPath = fs.readdirSync(tmplatePath);

        return localTemplatesPath
            .map(e => e && e.split('/').pop()!)
            .filter(e => e);
    }
}

// 选择模板地址
export const chooseTempate = async (config: IConfig) => {
    if (!config.template) {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'template',
                message: '选择一个项目模板',
                choices: Array.from(
                    new Set([
                        ...Object.keys(templates),
                        ...localTemplates,
                    ]).values(),
                ),
            },
        ]);
        if (answers.template.indexOf('from-') === -1) {
            answers.templateName = answers.template;
        }
        return answers;
    }
    return {};
};

// 获取git模板 也可以clone本地
export const getTemplate = async (name: string, gitPath: string) => {
    try {
        // 克隆git模板仓库
        const templatePath = path.resolve(__dirname, `../../template/${name}`);

        if (fs.existsSync(templatePath)) {
            console.log('已经存在');
        }

        console.log(`⬇️  DownLoad Template ${name} ...`);
        await git(`clone ${gitPath} ${templatePath}`);
        console.log(chalk.green(`✔️ DownLoad Template ${name} Success`));
    } catch (e) {
        console.log(chalk.yellowBright('初始化模板异常', e));
    }
};

// 获取模板
export const initTemplate = async (config: IConfig) => {
    let path = '';
    const name = config.templateName!;

    // 本地已有模板, 不用在获取
    if (localTemplates.includes(name)) {
        return;
    }
    if (
        config.template === ETemplateType.FromLocal ||
        config.template === ETemplateType.FromGit
    ) {
        path = config.templatePath!;
    } else if (config.template in templates) {
        // 默认模板
        // @ts-ignore
        path = templates[config.template].git;
    } else {
        console.log(
            chalk.yellowBright(` ${chalk.white(config.template)} 模板不存在`),
        );
    }
    await getTemplate(name, path);
};

// 获取模板的配置
export const getTemplateConfig = async (config: IConfig) => {
    const filePath = path.resolve(
        __dirname,
        `../../template/${config.template}/.fly/config.js`,
    );
    if (fs.existsSync(filePath)) {
        let templateConfig = require(filePath);
        if (typeof templateConfig === 'function') {
            templateConfig = await templateConfig();
        }
        return {
            filePath,
            templateConfig,
        };
    }
    return {};
};

// 添加模板到CLI, 存在则提示覆盖
export const addTemplate = async (name: string, templatePath: string) => {
    if (localTemplates.includes(name)) {
        const answer = await inquirer.prompt([
            {
                name: 'overwrite',
                message: `本地已有 ${name} 模板, 确定覆盖么?`,
                type: 'confirm',
            },
        ]);
        if (answer.overwrite) {
            const templatePath = path.resolve(
                __dirname,
                `../../template/${name}`,
            );
            rimraf.sync(templatePath);
        } else {
            return;
        }
    }
    await getTemplate(name, templatePath);
};

export const showTemplates = async () => {
    console.log(chalk.gray(' 内置模板列表:'));
    for (const t in templates) {
        console.log(chalk.yellowBright(`   ${t}`));
    }
    if (localTemplates.length) {
        console.log(chalk.gray(' 本地模板列表:'));
        localTemplates.forEach(t => console.log(chalk.yellowBright(`   ${t}`)));
    }
};

// 更新本地模板
export const updateTemplate = async () => {
    console.log(`🗃 ${chalk.yellowBright('开始更新模板')} `);
    await addTemplate('miniApp', templates.miniApp.git);
    await addTemplate('miniAppJs', templates.miniAppJs.git);
    console.log(`🎉  Successfully update Template.`);
};
