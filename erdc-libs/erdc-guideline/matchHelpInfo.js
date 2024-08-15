define([], function () {
    const router = require('erdcloud.router');
    const store = require('erdcloud.store');
    const ErdcKit = require('erdcloud.kit');

    function getHelpInfo(helpResource) {
        return helpResource.erdcData?.help || {};
    }

    return function ({ matchHelp, matchRoute, helpCode, lang } = {}) {
        const { currentRoute } = router;
        const { path } = currentRoute;
        const originalHelps = store.state.mfe.helps || [];
        const helps = originalHelps.filter(function (h) {
            const helpInfo = getHelpInfo(h);
            return !helpInfo.lang || helpInfo.lang === lang;
        });

        function _matchHelp(helps) {
            let help;
            if (helpCode) {
                help = helps.find((i) => i.code === helpCode);
            } else if (matchHelp) {
                help = matchHelp(helps);
            } else {
                help = helps.find((h) => {
                    const helpInfo = getHelpInfo(h);
                    const entry = helpInfo.entry || {};
                    let matchRoutes = helpInfo.matchRoutes || [];
                    if (matchRoute) {
                        return matchRoute(currentRoute, {
                            ...h,
                            helpInfo
                        });
                    }

                    let matched = false;
                    if (entry && typeof entry === 'object') {
                        matched = Object.keys(entry).some((rule) => rule === path || new RegExp(rule, 'i').test(path));
                    }

                    return (
                        matched ||
                        matchRoutes.some((rule) => {
                            return rule === path || new RegExp(rule, 'i').test(path);
                        })
                    );
                });
            }
            const title = help ? ErdcKit.translateI18n(help.nameI18nJson || { value: help.name }) : '';
            return help
                ? {
                      code: help.code,
                      name: help.name,
                      title,
                      nameI18nJson: help.nameI18nJson,
                      ...getHelpInfo(help)
                  }
                : null;
        }

        // 如果匹配不到，尝试从未过滤国际化的资源包里重新匹配
        return _matchHelp(helps) || _matchHelp(originalHelps);
    };
});
