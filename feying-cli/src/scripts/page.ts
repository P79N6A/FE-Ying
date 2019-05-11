import { generate } from './generate';
import config, { IConfig } from '../config';
const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');

export const addPage = async () => {
    console.log(config);
    
    const answers = await inquirer.prompt([
        {
            name: 'name',
            message: '请输入page名称',
            type: 'input',
        },
    ]);
    if (answers.name) {
        const name = answers.name;
        if (fs.existsSync(path.resolve(config.path, `src/pages/${name}`))) {
            console.log(name + ' 界面已存在, 请检查后再添加!');
            return;
        }
        await generate({
            sourceFile: path.resolve(
                __dirname,
                `../../template/${
                    config.templateName
                }/.fly/modules/page-template`,
            ),
            targetFile: path.resolve(config.path, `src/pages/${name}`),
            render: true,
            data: answers,
        });

        const jsonPath = path.resolve(config.path, `src/app.json`);
        const appJSON = require(jsonPath);
        appJSON.pages.push(`pages/${name}/index`);
        fs.writeFileSync(jsonPath, JSON.stringify(appJSON, null, 4));
    }
};
