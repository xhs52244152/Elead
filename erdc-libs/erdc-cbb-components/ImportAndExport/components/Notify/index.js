define([ELMP.resource('erdc-cbb-components/ImportAndExport/locale/index.js')], function (locale) {
    const ErdcKit = require('erdc-kit');
    const ErdcI18n = require('erdcloud.i18n');
    const i18n = ErdcI18n.wrap(locale);

    const defaultOptions = {
        dangerouslyUseHTMLString: true,
        position: 'bottom-left'
    };

    const goTo = function (vm, notify, options, params) {
        let defaultGoTo = (vm, notify, params) => {
            notify.close();
            let appName = 'erdc-portal-web',
                targetPath = '/biz-import-export/myImportExport',
                query = params || {};

            // 不同应用需要window.open，同应用直接push
            if (window.__currentAppName__ === appName) {
                vm.$router.push({
                    path: targetPath,
                    query
                });
            } else {
                // path组装query参数
                let url = `/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(targetPath, query)}`;
                window.open(url, appName);
            }
        };

        if (options.goTo) return options.goTo(vm, notify, defaultGoTo);
        else defaultGoTo(vm, notify, params);
    };

    const onExportSuccess = function (options) {
        let vm = options.vm || this;
        const h = vm.$createElement;

        let notify = vm.$notify({
            title: ErdcI18n?.translate('导出成功', { name: '' }, i18n),
            message: h(
                'div',
                {
                    attrs: {
                        class: 'flex flex-column'
                    }
                },
                [
                    h(
                        'span',
                        {
                            attrs: {
                                class: 'text-sm mt-4 truncate'
                            }
                        },
                        [
                            i18n?.['请您下载文件，或者前往'],
                            h(
                                'span',
                                {
                                    attrs: {
                                        class: 'color-primary cursor-pointer'
                                    },
                                    on: {
                                        click: () => goTo(vm, notify, options, { activeTabName: 'taskTabPanelExport' })
                                    }
                                },
                                [i18n?.['“工作台>我的导入导出”']]
                            ),
                            i18n?.['下载']
                        ]
                    )
                ]
            ),
            type: 'success',
            ...defaultOptions,
            ..._.omit(options, 'vm', 'download', 'goTo')
        });
    };

    const onExportProcess = function (options) {
        let vm = options.vm || this;

        vm.$notify({
            title: '导出中',
            message: `
                <div class="flex flex-column">
                    <span class="text-sm mt-4 truncate">请您下载文件，或者前往<span class="color-primary cursor-pointer">“工作台>我的导入导出”</span>下载</span>
                    <span class="text-sm color-primary mt-4 cursor-pointer truncate" onclick="with">下载文件</span>
                </div>
            `,
            type: 'success',
            ...defaultOptions,
            ..._.omit(options, 'vm', 'download', 'goTo')
        });
    };

    const onExportError = function (options) {
        let vm = options.vm || this;
        const h = vm.$createElement;

        let notify = vm.$notify({
            title: options.title || ErdcI18n?.translate('导出失败', { name: '' }, i18n),
            message: h(
                'div',
                {
                    attrs: {
                        class: 'flex flex-column'
                    }
                },
                [
                    h(
                        'span',
                        {
                            attrs: {
                                class: 'text-sm mt-4 truncate'
                            }
                        },
                        [i18n?.['请前往“工作台>我的导入导出”查看失败原因']]
                    ),
                    h(
                        'span',
                        {
                            attrs: {
                                class: 'text-sm color-primary mt-4 cursor-pointer truncate'
                            },
                            on: {
                                click: () => goTo(vm, notify, options, { activeTabName: 'taskTabPanelExport' })
                            }
                        },
                        [i18n?.['前往我的导入导出']]
                    )
                ]
            ),
            type: 'error',
            ...defaultOptions,
            ..._.omit(options, 'vm', 'download', 'goTo')
        });
    };

    const onImportSuccess = function (options) {
        let vm = options.vm || this;
        const h = vm.$createElement;

        let notify = vm.$notify({
            title: i18n?.['导入成功标题'],
            message: h(
                'span',
                {
                    attrs: {
                        class: 'text-sm mt-4 truncate'
                    }
                },
                [
                    ErdcI18n?.translate('导入成功内容', { name: options?.name || '' }, i18n),
                    ', ',
                    h('span', {}, [
                        i18n?.['可以前往'],
                        h(
                            'span',
                            {
                                attrs: {
                                    class: 'color-primary cursor-pointer'
                                },
                                on: {
                                    click: () => goTo(vm, notify, options, { activeTabName: 'taskTabPanelImport' })
                                }
                            },
                            [i18n?.['“工作台>我的导入导出”']]
                        ),
                        i18n?.['查看状态']
                    ])
                ]
            ),
            type: 'success',
            ...defaultOptions,
            ..._.omit(options, 'vm', 'download', 'goTo', 'name')
        });
    };

    const onImportProcess = function (options) {
        let vm = options.vm || this;

        vm.$notify({
            title: '导入中',
            message: `
                <div class="flex flex-column">
                    <span class="text-sm mt-4 truncate">请您下载文件，或者前往<span class="color-primary cursor-pointer">“工作台>我的导入导出”</span>下载</span>
                    <span class="text-sm color-primary mt-4 cursor-pointer truncate">下载文件</span>
                </div>
            `,
            type: 'success',
            ...defaultOptions,
            ..._.omit(options, 'vm', 'download', 'goTo')
        });
    };

    const onImportError = function (options) {
        let vm = options.vm || this;
        const h = vm.$createElement;

        let notify = vm.$notify({
            title: i18n?.['文件导入校验失败'],
            message: h(
                'div',
                {
                    attrs: {
                        class: 'flex flex-column'
                    }
                },
                [
                    h(
                        'span',
                        {
                            attrs: {
                                class: 'text-sm mt-4 truncate'
                            }
                        },
                        [i18n?.['请前往“工作台>我的导入导出”查看失败原因']]
                    ),
                    h(
                        'span',
                        {
                            attrs: {
                                class: 'text-sm color-primary mt-4 cursor-pointer truncate'
                            },
                            on: {
                                click: () => goTo(vm, notify, options, { activeTabName: 'taskTabPanelImport' })
                            }
                        },
                        [i18n?.['前往我的导入导出']]
                    )
                ]
            ),
            type: 'success',
            ...defaultOptions,
            ..._.omit(options, 'vm', 'download', 'goTo')
        });
    };

    return {
        onExportSuccess,
        onExportProcess,
        onExportError,
        onImportSuccess,
        onImportProcess,
        onImportError
    };
});
