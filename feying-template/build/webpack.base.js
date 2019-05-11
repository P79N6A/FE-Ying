const path = require('path');
const AtopWebpackPlugin = require('@byted/atop-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function resolve(dir) {
    return path.join(__dirname, '..', dir);
}

module.exports = {
    entry: './src/app.ts',
    output: {
        path: resolve('dist'),
        chunkFilename: '[name].js',
    },
    resolve: {
        extensions: ['.js', '.json', '.ts'],
        alias: {
            '@': resolve('src'),
        },
    },
    optimization: {
        runtimeChunk: {
            name: 'manifest',
        },
        splitChunks: {
            cacheGroups: {
                commons: {
                    name: 'vendor',
                    chunks: 'initial',
                    minChunks: 2,
                },
                default: false,
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: [
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
            {
                test: /\.tsx$/,
                use: [
                    {
                        loader: 'ts-loader',
                    },
                    {
                        loader: '@byted/atop-tsx-loader',
                    },
                ],
            },
            {
                test: /\.(css|less|wxss)$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: require.resolve('css-loader'),
                    },
                    {
                        loader: require.resolve('postcss-loader'),
                        options: {
                            plugins: () => [
                                require('postcss-mpvue-wxss')({
                                    remToRpx: 2,
                                }),
                                require('autoprefixer')(),
                            ],
                        },
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            javascriptEnabled: true,
                        },
                    },
                ],
            },
            {
                test: /\.(wxml|html)$/,
                loader: 'html-loader',
                exclude: /node_modules/,
                options: {
                    attrs: ['image:src', 'link:href'],
                },
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10,
                    name: '/assets/[name].[ext]',
                },
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].wxss',
        }),
        new AtopWebpackPlugin({
            chunks: ['manifest', 'vendor'],
            autoFindPages: false,
        }),
    ],
};
