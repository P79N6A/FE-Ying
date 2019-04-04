import { Compiler, compilation } from 'webpack';
import * as path from 'path';

// 目前还不知道能干嘛 放着吧

type Compilation = compilation.Compilation;

type WriteFilePluginProps = {
    outputFilePath: string;
};

class WriteFilePlugin {
    props: WriteFilePluginProps;
    constructor(options: WriteFilePluginProps) {
        this.props = options;
    }

    apply(compiler: Compiler) {
        compiler.plugin(
            'afterEmit',
            async (compilation: Compilation) => {
                for (let filename in compilation.assets) {
                    const bundle = require(path.resolve(this.props.outputFilePath, filename));
                    console.log(bundle.default);
                }
            },
        );
    }
}

export default WriteFilePlugin;
