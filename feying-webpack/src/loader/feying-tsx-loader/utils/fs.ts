import * as fs from 'fs';

// 判断文件是否存在
export function fsExistsSync(path: string) {
    try {
        fs.accessSync(path);
    } catch (e) {
        return false;
    }
    return true;
}
