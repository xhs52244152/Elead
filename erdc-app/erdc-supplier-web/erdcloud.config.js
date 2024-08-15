const path = require('path');

module.exports = {
    /**
     * 是否是胖包模式，包括本地运行、构建打包
     * 支持命令行参数（--fatDist）
     * @property {boolean} fatDist
     * @default false
     */
    fatDist: false,
    /**
     * 自定义文件收集
     *
     * @example
     * // Object 形式
     * const collectFolderConfig1 = {
     *   'libs/folder1/': 'src/folder1/**',
     *   'libs/folder2/': 'src/folder2/**',
     * };
     * // 数组形式
     * const collectFolderConfig2 = [
     *   ['libs/folder1/', 'src/folder1/**'],
     *   ['libs/folder2/', ['src/folder2/**', !src/folder2/excluded/**]],
     * ];
     *
     * @typedef {Object} CollectFolderConfig
     * @property {Object<string, string>} - key 是一个字符串，代表一组静态资源；value 是一个 glob 语法字符串，代表文件来源规则
     * @property {Array<Array<string|Array<string>>>} - 数组中每个元素也是数组，第一个元素是一个字符串，代表一组静态资源；第二个元素是一个 glob字符串或数组，代表文件来源规则
     */
    collectFolder: {},
    /**
     * 开发服务器参数
     * @property {object} devServer
     */
    devServer: {
        /**
         * 依赖的资源路径
         * 支持命令行参数（--root)
         * 1. string - 一个绝对路径
         * 2. dependency - 使用 node_modules 目录下的资源
         * 3. remote - 使用 proxy 远程服务上的资源
         * @property {string|'dependency'|'remote'} root
         * @default 'remote'
         */
        root: path.resolve(__dirname, '../../packages'),
        /**
         * 开发服务器运行端口，被占用情况下自增
         * 支持命令行参数（--port)
         * @property {number|string} port
         * @default 1005
         */
        port: 1005,
        /**
         * 后端代理，通常这一项是必填的
         * 支持命令行参数（--proxy)
         * @property {string} proxy
         */
        proxy: 'http://fam-fusion.apps.paas.sz.ddns.e-lead.cn/'
    }
};
