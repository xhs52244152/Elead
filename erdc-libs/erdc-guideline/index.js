/**
 * @module erdcloud.help
 * @type {import('vue').ComponentOptions}
 * @description 帮助中心
 * @author qiuzhanyue
 * @date 2024/05/10
 */
define([
    ELMP.resource('erdc-guideline/help/useDrawer.js'),
    ELMP.resource('erdc-guideline/help/useDrawerComponent.js'),
    ELMP.resource('erdc-guideline/help/useHelpComponent.js'),
    ELMP.resource('erdc-guideline/help/useDrawerHeader.js'),
    ELMP.resource('erdc-guideline/help/useDefaultContentComponent.js'),
    ELMP.resource('erdc-guideline/help/useListContent.js'),
    ELMP.resource('erdc-guideline/help/useHelp.js'),
    ELMP.resource('erdc-guideline/help/useStaticContent.js'),
    ELMP.resource('erdc-guideline/help/useMarkdownContent.js'),
    ELMP.resource('erdc-guideline/help/useSkeleton.js'),
    ELMP.resource('erdc-guideline/matchHelpInfo.js'),
    'erdcloud.router',
    'erdcloud.store',
    'vue',
    'erdcloud.i18n',
    'erdcloud.kit',
    'css!' + ELMP.resource('erdc-guideline/style/helps.css')
], function (
    useDrawer,
    useDrawerComponent,
    useHelpComponent,
    useDrawerHeader,
    useDefaultContentComponent,
    useListContent,
    { useHelp, registerHelpShows },
    useStaticContent,
    useMarkdownContent,
    useSkeleton,
    matchHelpInfo
) {
    const ErdcI18n = require('erdcloud.i18n');

    ErdcI18n.registerI18n({
        i18nDirPath: ELMP.resource('erdc-guideline/locale'),
        global: true
    });

    return {
        useHelpComponent,
        useHelp,
        registerHelpShows,
        /**
         * 获取默认抽屉实例
         * @param {Object} [options]
         * @param {string} [options.title=''] - 标题
         * @param {Object} [options.help] - 当前帮助包信息
         * @param {ComponentOptions} [options.content] - 渲染内容，是一个Vue对象
         * @param {string} [options.size='380px'] - 抽屉大小
         * @param {boolean} [options.withHeader=false] - 抽屉大小
         * @param {boolean} [options.overflowVisible=true] - 抽屉展示溢出内容
         * @return {Vue}
         */
        useDrawerComponent,
        useDrawer,
        /**
         * 获得弹窗头组件
         * @return {ComponentOptions}
         */
        useDrawerHeader,
        useDefaultContent({ steps = [] } = {}) {
            return useDefaultContentComponent({ steps });
        },
        useStaticContent,
        /**
         * 默认帮助内容（markdown）
         * @param {string} markdownEntry - 帮助文件地址(markdown)，或markdown代码
         * @returns {function(): { loading: ComponentOptions, content: Promise<ComponentOptions>} }}
         */
        useMarkdownContent,
        useSkeleton,
        /**
         * 使用简单 DriverJs 实例
         * @description reference to https://driver.employleague.cn/
         * @param { Object|Array<{ element: string, popover: { className: string, title: string, description: string, position: string } }> } [stepsOrOptions] - Driver.js 步骤配置，或实例配置
         * @returns {Promise<Object>}
         */
        useDriverJs(stepsOrOptions) {
            return new Promise((resolve, reject) => {
                require([
                    '/erdc-thirdparty/platform/driver.js/dist/driver.min.js',
                    'css!/erdc-thirdparty/platform/driver.js/dist/driver.min.css'
                ], function (Driver) {
                    const driver = new Driver(!Array.isArray(stepsOrOptions) ? stepsOrOptions : {});
                    if (Array.isArray(stepsOrOptions)) {
                        driver.defineSteps(stepsOrOptions);
                    }
                    resolve(driver);
                }, function (error) {
                    reject(new Error('加载 driver.js 失败：' + error.message));
                });
            });
        },
        /**
         * 使用简单列表帮助组件
         * @returns { ComponentOptions }
         */
        useListContent,
        matchHelpInfo
    };
});
