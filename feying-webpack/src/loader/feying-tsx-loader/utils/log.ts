import * as fs from 'fs';
import * as path from 'path';
import * as CircularJson from 'circular-json-es6'

export function write(fileName:string, content:any) {
    if(!fs.existsSync(path.resolve(__dirname, '../debug/'))) {
        fs.mkdirSync(path.resolve(__dirname, '../debug/'))
    }
    fs.writeFileSync(
        path.resolve(__dirname, '../debug/' + fileName),
        CircularJson.stringify(content, null, 2),
    )
}