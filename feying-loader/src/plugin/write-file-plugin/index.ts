import { Compiler, compilation } from 'webpack';
import * as fs from 'fs';

type Compilation = compilation.Compilation;

type WriteFilePluginProps = {
    name?: string;
    type?: string[];
};

class WriteFilePlugin {
    props: WriteFilePluginProps;
    constructor(options: WriteFilePluginProps) {
        this.props = options;
    }

    apply(compiler: Compiler) {
        compiler.plugin(
            'done',
            (compilation: Compilation, callback: Function) => {
                console.log('hello Wrold!');
                compilation.assets.forEach
            
                callback();
            },
        );
    }
}

export default WriteFilePlugin;
