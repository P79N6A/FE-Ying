const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');
module.exports = async (projectConfig, flyConfig, args) => {
    const answers = await inquirer.prompt([
        {
            name: 'name',
            message: '请输入page名称',
            type: 'input',
        },
    ]);
    if (answers.name) {
        const name = answers.name;
        if (fs.existsSync(path.resolve(flyConfig.path, `src/pages/${name}`))) {
            console.log(name + ' 界面已存在, 请检查后再添加!');
            return;
        }

        const cliPath = args.cliPath;
        const { generate } = require(path.resolve(
            cliPath,
            'utils/generate.js',
        ));

        await generate({
            sourceFile: path.resolve(__dirname, '../modules/page-template/'),
            targetFile: path.resolve(flyConfig.path, `src/pages/${name}`),
            render: true,
            data: answers,
        });

        const jsonPath = path.resolve(flyConfig.path, `src/app.json`);
        const appJSON = require(jsonPath);
        appJSON.pages.push(`pages/${name}/index`);
        fs.writeFileSync(jsonPath, JSON.stringify(appJSON, null, 4));
    }
};
