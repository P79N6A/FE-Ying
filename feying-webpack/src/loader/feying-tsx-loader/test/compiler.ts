import * as path from 'path';
import * as webpack from 'webpack';
// import writeFilePlugin from '../../../plugin/test-plugin';

export default (fixture: string) => {
    const compiler = webpack([
        {
            mode:"development",
            context: __dirname,
            entry: `${fixture}`,
            output: {
                path: path.resolve(fixture, '../'), // 和输入同级
                filename: 'bundle.js',
                libraryTarget: "commonjs2",
            },
            module: {
                rules: [
                    {
                        test: [/\.ts$/, /\.tsx$/, /\.js$/],
                        use: {
                            loader: path.resolve(__dirname, '../index.js'),
                        },
                    },
                ],
            },
            // plugins: [new writeFilePlugin({outputFilePath: __dirname})],
        },
    ]);

    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                reject(err);
            }

            resolve(stats);
        });
    });
};
