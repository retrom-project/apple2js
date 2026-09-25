const path = require('path');
const webpack = require('webpack');

const root = path.resolve(__dirname, '../..');
const upstream = require('../../webpack.config.js').default[0];
const { library: _library, ...upstreamOutput } = upstream.output;

const retromConfig = {
    ...upstream,
    mode: 'production',
    devtool: false,
    entry: { retrom: path.join(root, 'js/retrom.ts') },
    output: {
        ...upstreamOutput,
        filename: 'retrom.bundle.js',
        path: path.join(root, '.retrom-build/site/dist'),
        publicPath: 'dist/',
    },
    plugins: [
        ...(upstream.plugins ?? []),
        new webpack.NormalModuleReplacementPlugin(
            /^\.\.\/roms\/cards\/disk2$/,
            path.join(__dirname, 'empty-disk2-rom.ts')
        ),
    ],
};
const worklet = require('../../webpack.config.js').default[1];
module.exports = [retromConfig, {
    ...worklet,
    mode: 'production',
    devtool: false,
    output: {...worklet.output, path: path.join(root, '.retrom-build/site/dist')},
}];
