import * as path from 'path';
import * as webpack from 'webpack';
// import memoryfs from 'memory-fs';

// 测试时的引用模板
export default (fixture: string) => {
    const compiler = webpack([
        {
            context: __dirname,
            entry: `./${fixture}`,
            output: {
                path: path.resolve(__dirname),
                filename: 'bundle.js',
            },
            module: {
                rules: [
                    {
                        test: /\.txt$/,
                        use: {
                            loader: path.resolve(__dirname, '../index.js'),
                            options: {
                                name: 'haoxubin',
                            },
                        },
                    },
                ],
            },
        },
    ]);

    // (compiler as any).outputFileSystem = new memoryfs();

    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                reject(err);
            }

            resolve(stats);
        });
    });
};
