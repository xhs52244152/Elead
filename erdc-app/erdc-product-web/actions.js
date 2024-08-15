// 存放全局注册的方法
define([
    ELMP.resource('product-space/locale/index.js'),
    'erdc-kit',
    ELMP.resource('erdc-pdm-common-actions/index.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (locale, ErdcKit, commonActions, cbbUtils) {
    const ErdcStore = require('erdcloud.store');
    const ErdcI18n = require('erdcloud.i18n');
    const getObjectMapping = ErdcStore.getters?.['pdmProductStore/getObjectMapping'];
    const productMapping = getObjectMapping({ objectName: 'product' });
    const i18n = ErdcI18n.wrap(locale);

    let actions = {
        /**
         * 产品库-详情-配置组
         * @param { Object } vm - 页面实例
         * @param { Object } data - 数据新增
         */
        // 产品库创建
        PDM_PRODUCT_CREATE: (vm) => {
            return vm.$router.push({
                path: '/container/product-space/create',
                query: {
                    title: vm?.i18n?.['创建产品库']
                }
            });
        },
        // 产品库编辑
        PDM_PRODUCT_LIST_UPDATE: (vm, data, isTemplate = false) => {
            const name = data?.[`${productMapping?.className}#name`] || data?.name || '';

            let appName = 'erdc-product-web';
            let targetPath = '/space/product-space/edit';
            let query = {
                pid: data?.oid || '',
                title: ErdcI18n?.translate('编辑产品库', { name }, i18n),
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
        // 复制产品库
        PDM_PRODUCT_LIST_COPY: (vm, data) => {
            const name = data?.[`${productMapping?.className}#name`] || data?.name || '';
            vm.$router.push({
                path: '/space/product-space/copy',
                query: {
                    pid: data?.oid || '',
                    title: ErdcI18n?.translate('复制产品库', { name }, i18n)
                }
            });
        },
        // 另存为模板
        PDM_PRODUCT_LIST_SAVEAS: (vm, data) => {
            const name = data?.[`${productMapping?.className}#name`] || data?.name || '';
            return vm.$router.push({
                path: '/space/product-space/saveas',
                query: {
                    pid: data?.oid || '',
                    title: ErdcI18n?.translate('产品库另存为模板', { name }, i18n)
                }
            });
        },
        // 产品库模板详情编辑
        PDM_PRODUCT_TEMPLATE_EDIT_ACTTION: (vm, data) => {
            return actions['PDM_PRODUCT_LIST_UPDATE'](vm, data, true);
        },
        // 产品库模板列表编辑
        PDM_PRODUCT_MODEL_UPDATE: (vm, data) => {
            return actions['PDM_PRODUCT_LIST_UPDATE'](vm, data, true);
        },
        // 产品库模板列表删除
        PDM_PRODUCT_MODEL_DEL: (vm, data) => {
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
        // 产品库导入
        PDM_PRODUCT_IMPORT: async (vm) => {
            let className = productMapping?.className;
            let typeInfo = await cbbUtils.getTypeByClassName(className);
            const importTypeList = [
                {
                    label: '产品库',
                    value: className,
                    business: {
                        import: 'ProductImport'
                    },
                    templateData: function getTemplateData() {
                        ErdcKit.downFile({
                            url: '/context/container/getImportTemplate/ProductImport'
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
        // 产品库导出
        PDM_PRODUCT_EXPORT: (vm, data) => {}
    };

    return actions;
});
