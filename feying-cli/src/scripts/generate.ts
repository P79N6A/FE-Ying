import { Readable, Writable } from 'stream';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';

const ejs = require('ejs');
const ncp = require('ncp');
const toString = require('stream-to-string');

// 这些类型的文件会使用ejs渲染
const renderFile = [
    'ts',
    'js',
    'jsx',
    'tsx',
    'vue',
    'html',
    'wxml',
    'wxss',
    'css',
    'less',
    'scss',
    'json',
    'md',
];

const defaultIgnoreFile = ['.git'];

export const generate = async (options: {
    sourceFile: string;
    targetFile: string;
    render?: boolean;
    data?: any;
    ignoreFile?: string[];
}) => {
    const {
        sourceFile,
        targetFile,
        render = false,
        data = {},
        ignoreFile = [],
    } = options;
    if (fs.existsSync(sourceFile)) {
        await new Promise(resolve => {
            ncp(
                sourceFile,
                targetFile,
                {
                    clobber: true,
                    filter: (path: string) => {
                        const name = path.split('/').pop();
                        return (
                            name &&
                            !defaultIgnoreFile.includes(name) &&
                            !ignoreFile.includes(name)
                        );
                    },
                    transform: async (
                        read: Readable & { path: string },
                        write: Writable,
                    ) => {
                        // console.log(
                        //     '=> ',
                        //     chalk.green(
                        //         read.path.split(pConfig.template).pop()!,
                        //     ),
                        // );
                        const fileType = read.path.split('.').pop();
                        if (fileType && renderFile.includes(fileType)) {
                            const str = await toString(read);
                            try {
                                write.write(
                                    render ? ejs.render(str, data) : str,
                                );
                                write.end();
                            } catch (e) {
                                console.log(read.path, chalk.red(e));
                            }
                        } else {
                            read.pipe(write);
                        }
                    },
                },
                (err: Error) => {
                    if (err) {
                        console.log('err', err);
                    }
                    resolve();
                },
            );
        });
    } else {
        console.error('源文件不存在: ', sourceFile);
        return;
    }
};
