// 存放全局注册的方法
define([ELMP.resource('erdc-cbb-components/utils/index.js'), 'underscore', 'erdcloud.store'], function (utils) {
    const _ = require('underscore');
    const FamStore = require('erdcloud.store');
    const getViewTableMapping =
        FamStore.getters?.['pdmSupplierStore/getViewTableMapping'] ||
        (() => {
            return {};
        });
    const supplierMapping = getViewTableMapping({ tableName: 'supplier' });

    return {
        /**
         * 供应商-详情-配置组
         * @param { Object } vm - 页面实例
         * @param { Object } data - 数据新增
         */
        // 供应商创建
        SUPPLIER_CREATE: (vm) => {
            return vm.$router.push({
                name: 'supplierCreate',
                query: {
                    title: '创建供应商'
                }
            });
        },
        // 供应商编辑
        SUPPLIER_UPDATE: (vm, data) => {
            return vm.$router.push({
                name: 'supplierSpaceEdit',
                params: {
                    pid: data?.oid || ''
                },
                query: {
                    title: data?.[(vm?.isList ? `${supplierMapping?.className}#` : '') + 'name'] || ''
                }
            });
        },
        // 复制供应商
        PDM_SUPPLIER_LIST_COPY: (vm, data) => {
            return vm.$router.push({
                name: 'supplierSpaceCopy',
                params: {
                    pid: data?.oid || ''
                },
                query: {
                    type: 'COPY',
                    title: '复制供应商'
                }
            });
        },
        // 另存为模板
        PDM_SUPPLIER_LIST_SAVEAS: (vm, data) => {
            return vm.$router.push({
                name: 'supplierSpaceSaveas',
                params: {
                    pid: data?.oid || ''
                },
                query: {
                    type: 'SAVEAS',
                    title: '供应商另存为模板'
                }
            });
        },
        // 供应商模板详情编辑
        PDM_SUPPLIER_TEMPLATE_EDIT_ACTTION: (vm, data) => {
            return vm.$router.push({
                name: 'supplierSpaceEdit',
                params: {
                    pid: data?.oid || ''
                },
                query: {
                    title: data?.name || ''
                }
            });
        },
        // 供应商模板列表编辑
        PDM_SUPPLIER_MODEL_UPDATE: (vm, data) => {
            return vm.$router.push({
                name: 'supplierSpaceEdit',
                params: {
                    pid: data?.oid || ''
                },
                query: {
                    title: data?.name || ''
                }
            });
        },
        // 供应商模板列表删除
        PDM_SUPPLIER_MODEL_DEL: (vm, data) => {
            vm.$confirm(vm.i18nMappingObj['permanentlyDeleted'], vm.i18nMappingObj['tip'], {
                confirmButtonText: vm.i18nMappingObj['confirm'],
                cancelButtonText: vm.i18nMappingObj['cancel'],
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
                        vm.$message.success(vm.i18nMappingObj['success']);
                        vm.$refs['famAdvancedTable'].fnRefreshTable();
                    }
                });
            });
        },
        // 文件夹创建文件夹
        PDM_FOLDER_CREATE: (vm) => {
            let { onCreate } = vm?.folderListDetailRef || {};
            if (_.isFunction(onCreate)) {
                onCreate();
            }
        },
        // 文件夹创建文档
        PDM_FOLDER_CREATE_DOC: (vm) => {
            let name = '';
            if (supplierMapping?.className === vm?.className) {
                name = '/supplier/:pid/documentCreate';
            } else {
                name = '/pdmProduct/:pid/documentCreate';
            }
            return vm.$router.push({
                name,
                params: {
                    pid: vm.$route?.params?.pid || '',
                    folderId: vm.currentFolderObject?.key
                }
            });
        },
        // 文件夹创建部件
        PDM_FOLDER_CREATE_PART: (vm) => {
            let name = '';
            if (supplierMapping?.className === vm?.className) {
                name = '/supplier/:pid/createPart';
            } else {
                name = '/pdmProduct/:pid/createPart';
            }
            return vm.$router.push({
                name,
                params: {
                    pid: vm.$route?.params?.pid || '',
                    folderId: vm.currentFolderObject?.key,
                    origin: 'back'
                }
            });
        },
        // 文件夹创建模型
        PDM_FOLDER_CREATE_EPM_DOCUMENT: (vm) => {
            let name = '';
            if (supplierMapping?.className === vm?.className) {
                name = '/supplier/:pid/createEpmDocument';
            } else {
                name = '/pdmProduct/:pid/createEpmDocument';
            }
            return vm.$router.push({
                name,
                params: {
                    pid: vm.$route?.params?.pid || '',
                    folderId: vm.currentFolderObject?.key,
                    origin: 'back'
                }
            });
        },
        // 文件夹列表编辑文档，部件，基线
        MENU_MODULE_FOLDER_EDIT: (vm, data) => {
            let name = utils.getEditRoutePath(data?.typeName, vm?.className),
                params = { pid: vm.$route?.params?.pid || '' };

            if (!name) return;

            params.oid = data?.oid || '';
            return vm.$router.push({
                name,
                params
            });
        },
        // 供应商添加联系人
        SUPPLIER_CONTACT_CREATE: (vm) => {
            _.isFunction(vm?.popover) && vm?.popover({ field: 'supplierAddContact', visible: true, title: 'jjjjjj' });
        }
    };
});
