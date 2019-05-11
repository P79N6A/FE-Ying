import * as path from 'path';
import * as fs from 'fs';

import rimraf = require('rimraf');

const CONFIG_NAME = 'fly.config.json';

let filePath = path.resolve(process.cwd(), CONFIG_NAME); // 当前工程目录下的配置文件

export interface IConfig {
    name: string;
    path: string;
    git: boolean;

    // 模板信息
    template: string;
    templatePath?: string;
    templateName: string;

    // 项目已安装模块
    modules: string[];

    dist: string;
}

const config: IConfig = {
    name: '',
    git: true,
    typescript: false,
    dist: 'dist',
    appid: '',
    sentry: false,
    log: false,
    lint: false,
    path: process.cwd(),
    template: '',
    templateName: '',
    modules: [],
} as IConfig;

export const getConfg = () => {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath).toString();
        try {
            setConfig(JSON.parse(content)); // 将当前项目的配置放到内存中
        } catch (e) {}
    } else {
        // saveConfig();
    }
};

export const setConfig = (options: Partial<IConfig>, relocation = false) => {
    // 根据项目名字重定位 项目文件夹地址
    if (options.name && relocation) {
        // 删除旧文件
        if (fs.existsSync(filePath)) {
            rimraf.sync(filePath);
        }

        filePath = path.resolve(process.cwd(), options.name, CONFIG_NAME);
        config.path = path.resolve(process.cwd(), options.name);
    }
    Object.assign(config, options);
};

export const saveConfig = () => {
    fs.writeFileSync(
        filePath,
        JSON.stringify({ ...config, path: undefined }, null, 2),
    );
};

// 读取一下之前可能存在的配置
getConfg();

export default config;
