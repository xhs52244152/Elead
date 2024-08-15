define([
    ELMP.resource('erdc-guideline/help/useDrawer.js'),
    ELMP.resource('erdc-guideline/help/useStaticContent.js'),
    ELMP.resource('erdc-guideline/help/useMarkdownContent.js'),
    ELMP.resource('erdc-guideline/matchHelpInfo.js'),
    'erdcloud.router',
    'erdcloud.i18n'
], function (useDrawer, useStaticContent, useMarkdownContent, matchHelpInfo) {
    const router = require('erdcloud.router');
    const ErdcI18n = require('erdcloud.i18n');

    const helpMap = {};

    const showHelp = function (help) {
        const route = router.currentRoute;
        const targetKey = Object.keys(helpMap).find(
            (key) => key === route.path || new RegExp(key, 'i').test(route.path)
        );
        if (targetKey && helpMap[targetKey]) {
            helpMap[targetKey](help);
        } else if (help && typeof help.showHelp === 'function') {
            help.showHelp(help);
        }
    };

    /**
     * @description 获取指定帮助。传入帮助资源包名来指定目标资源包，或者根据matchHelp等其它配置项动态决定
     * @param {Object|string} [options]
     * @param {(helps: Array<Object>) => void} [options.matchHelp] - 自定义匹配帮助的函数
     * @param {(route: import('vue-router').Router, help: Object) => void} [options.matchRoute] - 自定义匹配帮助的函数
     * @param {string} [options.helpCode] - 指定帮助资源包名
     * @return {Promise<any>}
     */
    function useHelp({ matchHelp, matchRoute, helpCode } = {}) {
        let _helpCode = typeof arguments[0] === 'string' ? arguments[0] : helpCode || null;
        const help = matchHelpInfo({
            matchHelp,
            matchRoute,
            helpCode: _helpCode,
            lang: ErdcI18n.currentLanguage()
        });
        const { currentRoute } = router;
        return new Promise((resolve, reject) => {
            if (!help) {
                const error = new Error('未找到帮助信息，请检查帮助包配置及在线情况，或配置项 matchHelp 与 matchRoute');
                error.code = 'ERDC_HELP_NOT_FOUND';
                reject(error);
                return;
            }
            const { entry = ELMP.resource(`${help.code}/index.js`) } = help;
            const entryUrl =
                typeof entry === 'object'
                    ? ELMP.resource(
                          entry[
                              Object.keys(entry).find(
                                  (rule) => rule === currentRoute.path || new RegExp(rule, 'i').test(currentRoute.path)
                              )
                          ] || `${help.code}/index.js`
                      )
                    : entry;

            if (/\.html$/i.test(entryUrl)) {
                resolve({
                    showHelp() {
                        useDrawer({ title: help.title }).render(useStaticContent(entryUrl)).show();
                    }
                });
            } else if (/\.md/i.test(entryUrl)) {
                resolve({
                    showHelp() {
                        useDrawer({ title: help.title }).render(useMarkdownContent(entryUrl)).show();
                    }
                });
            } else if (/\.js$/.test(entryUrl)) {
                require([entryUrl], function (helpEntry) {
                    typeof helpEntry === 'function'
                        ? resolve(helpEntry({ route: currentRoute, help }))
                        : resolve(helpEntry);
                }, function (error) {
                    let err = new Error('加载帮助失败：' + error.message);
                    err.code = 'ERDC_HELP_LOAD_FAILED';
                    reject(err);
                });
            } else {
                const err = new Error('帮助文件类型不支持');
                err.code = 'ERDC_HELP_TYPE_NOT_SUPPORT';
                reject(err);
            }
        });
    }

    return {
        helpMap,
        useHelp,
        showHelp,
        registerHelpShows(routePath, handler) {
            helpMap[routePath] = handler;
        }
    };
});
