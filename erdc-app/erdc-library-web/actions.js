// 存放全局注册的方法
define([
    ELMP.resource('library-space/locale/index.js'),
    'erdc-kit',
    ELMP.resource('erdc-pdm-common-actions/index.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (locale, ErdcKit, commonActions, cbbUtils) {
    const ErdcStore = require('erdcloud.store');
    const ErdcI18n = require('erdcloud.i18n');
    const getObjectMapping = ErdcStore.getters?.['pdmLibraryStore/getObjectMapping'];
    const libraryMapping = getObjectMapping({ objectName: 'library' });
    const i18n = ErdcI18n.wrap(locale);

    let actions = {
        /**
         * 资源库-详情-配置组
         * @param { Object } vm - 页面实例
         * @param { Object } data - 数据新增
         */
        // 资源库创建
        PDM_LIBRARY_CREATE: (vm) => {
            return vm.$router.push({
                path: '/container/library-space/create',
                query: {
                    title: vm?.i18n?.['创建资源库']
                }
            });
        },
        // 资源库编辑
        PDM_LIBRARY_LIST_UPDATE: (vm, data, isTemplate = false) => {
            const name = data?.[`${libraryMapping?.className}#name`] || data?.name || '';

            let appName = 'erdc-library-web';
            let targetPath = '/space/library-space/edit';
            let query = {
                pid: data?.oid || '',
                title: ErdcI18n?.translate('编辑资源库', { name }, i18n),
                isTemplate: isTemplate === true
            };

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
        },
        // 复制资源库
        PDM_LIBRARY_LIST_COPY: (vm, data) => {
            const name = data?.[`${libraryMapping?.className}#name`] || data?.name || '';
            return vm.$router.push({
                path: '/space/library-space/copy',
                query: {
                    pid: data?.oid || '',
                    title: ErdcI18n?.translate('复制资源库', { name }, i18n)
                }
            });
        },
        // 另存为模板
        PDM_LIBRARY_LIST_SAVEAS: (vm, data) => {
            const name = data?.[`${libraryMapping?.className}#name`] || data?.name || '';
            return vm.$router.push({
                path: '/space/library-space/saveas',
                query: {
                    className:
                        ErdcKit.getObjectAttr(data && data.attrRawList ? data : { attrRawList: [] }, 'typeName')
                            ?.value || '',
                    pid: data?.oid || '',
                    title: ErdcI18n?.translate('资源库另存为模板', { name }, i18n)
                }
            });
        },
        // 资源库模板详情编辑
        PDM_LIBRARY_TEMPLATE_EDIT_ACTTION: (vm, data) => {
            return actions['PDM_LIBRARY_LIST_UPDATE'](vm, data, true);
        },
        // 资源库模板列表编辑
        PDM_LIBRARY_MODEL_UPDATE: (vm, data) => {
            return actions['PDM_LIBRARY_LIST_UPDATE'](vm, data, true);
        },
        // 资源库模板列表删除
        PDM_LIBRARY_MODEL_DEL: (vm, data) => {
            vm.$confirm(vm.i18n['permanentlyDeleted'], vm.i18n['tip'], {
                confirmButtonText: vm.i18n['confirm'],
                cancelButtonText: vm.i18n['cancel'],
                type: 'warning'
            }).then(() => {
                vm.$famHttp({
                    url: `/fam/delete?category=DELETE&oid=${data?.oid}`,
                    method: 'DELETE',
                    className: data?.oid?.split(':')?.[1],
                    data: {
                        category: 'DELETE',
                        oid: data?.oid || ''
                    }
                }).then((resp) => {
                    if (resp.success) {
                        vm.$message.success(vm.i18n['success']);
                        vm.$refs['famAdvancedTable'].fnRefreshTable();
                    }
                });
            });
        },
        // 资源库导入
        PDM_LIBRARY_IMPORT: async (vm) => {
            let className = libraryMapping?.className;
            let typeInfo = await cbbUtils.getTypeByClassName(className);
            const importTypeList = [
                {
                    label: '资源库',
                    value: className,
                    business: {
                        import: 'LibraryImport'
                    },
                    templateData: function getTemplateData() {
                        ErdcKit.downFile({
                            url: '/context/container/getImportTemplate/LibraryImport'
                        });
                    },
                    customParams: {
                        containerRef: ErdcStore.state?.app?.container?.oid,
                        className: className,
                        typeReference: typeInfo.typeOid,
                        appName: ErdcStore.getters.appNameByClassName(className)
                    }
                }
            ];
            // 调用通用导入方法
            commonActions.import(vm, { importTypeList });
        },
        // 资源库导出
        PDM_LIBRARY_EXPORT: (vm, data) => {}
    };

    return actions;
});
