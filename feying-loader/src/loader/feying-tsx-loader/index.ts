import { getOptions } from 'loader-utils';
// import * as path from 'path';

export default function(source: string){
    const options = getOptions(this);

    const { name } = options;

    source = source.replace(/\[name\]/g, name);

    this.callback(null,source);
    // console.log(_source);
    // return `export default ${JSON.stringify(_source)}`
}