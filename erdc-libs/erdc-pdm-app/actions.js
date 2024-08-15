// 存放全局注册的方法

define([
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    ELMP.resource('erdc-pdm-common-actions/index.js'),
    ELMP.resource('erdc-pdm-app/store/index.js')
], function (utils, commonActions, store) {
    const contextPathConfig = {
        'erd.cloud.pdm.core.container.entity.PdmProduct': '/product',
        'erd.cloud.pdm.core.container.entity.Library': '/library'
    };

    return {
        // 文件夹创建文件夹
        PDM_FOLDER_CREATE: (vm) => {
            let { onCreate } = vm?.folderListDetailRef || {};
            if (_.isFunction(onCreate)) {
                onCreate();
            }
        },
        // 文件夹创建文档
        PDM_FOLDER_CREATE_DOC: (vm) => {
            let containerRouteName = contextPathConfig[vm.className] || '';
            vm.$router.push({
                path: `/space${containerRouteName}/erdc-document/document/create`,
                query: {
                    pid: vm.$route?.query?.pid || '',
                    folderId: vm.currentFolderObject?.key,
                    origin: 'folder'
                }
            });
        },
        // 文件夹创建部件
        PDM_FOLDER_CREATE_PART: (vm) => {
            let containerRouteName = contextPathConfig[vm.className] || '';
            vm.$router.push({
                path: `/space${containerRouteName}/erdc-part/part/create`,
                query: {
                    pid: vm.$route?.query?.pid || '',
                    folderId: vm.currentFolderObject?.key,
                    origin: 'folder'
                }
            });
        },
        // 文件夹创建模型
        PDM_FOLDER_CREATE_EPM_DOCUMENT: (vm) => {
            let containerRouteName = contextPathConfig[vm.className] || '';
            vm.$router.push({
                path: `/space${containerRouteName}/erdc-epm-document/epmDocument/create`,
                query: {
                    pid: vm.$route?.query?.pid || '',
                    folderId: vm.currentFolderObject?.key,
                    origin: 'folder'
                }
            });
        },
        // 文件夹列表编辑文档，部件，基线等
        MENU_MODULE_FOLDER_EDIT: async (vm, data) => {
            if (data.idKey === 'erd.cloud.foundation.core.folder.entity.SubFolder') {
                // 编辑文件夹
                let { onEdit } = vm?.folderListDetailRef || {};
                return _.isFunction(onEdit) && onEdit(data);
            }

            let typeName = data?.oid?.split(':')[1] || data?.typeName,
                path = utils.getEditRoutePath(typeName, vm?.className),
                query = { pid: vm.$route?.query?.pid || '' };

            if (!path) return;
            // 无需检出的对象:变更对象

            let noCheckOutObject = [
                store.state.tableViewMaping.prChange.className,
                store.state.tableViewMaping.ecrChange.className,
                store.state.tableViewMaping.ecnChange.className,
                store.state.tableViewMaping.ecaChange.className
            ];
            let oid = data?.oid;
            if (!noCheckOutObject.includes(data.idKey) && data['status'] !== 'DRAFT') {
                // 做一步检出操作
                try {
                    let className = data?.oid?.split(':')?.[1];
                    // 这里用的是object.js里的方法
                    const resp = await utils.handleCheckOut({ oid, className });
                    if (resp) {
                        oid = resp;
                    }
                } catch (error) {
                    vm.$message.error(error.message);
                }
            }

            query.oid = oid || '';
            return vm.$router.push({
                path,
                query
            });
        },
        // 文件夹列表移除文档，部件，基线等
        MENU_MODULE_FOLDER_DELETE(vm, data) {
            let typeName = data?.oid?.split(':')[1] || data?.typeName;
            // 文件夹对象里版本返回了branchId,设置个branchVid属性是为了兼容控件取字段判断
            vm.$set(data, 'branchVid', data?.branchId);
            if (
                [
                    store.state.tableViewMaping.part.className,
                    store.state.tableViewMaping.document.className,
                    store.state.tableViewMaping.epmDocument.className,
                    store.state.tableViewMaping.baseline.className
                ].includes(typeName)
            ) {
                commonActions.handleDelete(vm?.folderListDetailRef, data, { inTable: true });
            } else {
                let { onDelete } = vm?.folderListDetailRef || {};
                return _.isFunction(onDelete) && onDelete(data);
            }
        },
        // 文件夹批量下载
        PDM_FOLDER_BATCH_DOWNLOAD_FILE(vm, row) {
            // 没勾选时
            if (_.isEmpty(row)) {
                let params = {};
                let successCallback = () => {};
                params = {
                    folderId: vm.currentFolderObject?.key
                };
                commonActions.batchDownload([], 'erd.cloud.pdm.core.container.entity.Library', successCallback, params);
            } else {
                let data = [];
                let tableData = [];
                let idKeyList = [];
                // 勾选时
                tableData = Array.isArray(row) ? row : [row];
                // 勾选时,要判断勾选的有没有除了图文档和文档以外的东西
                data = tableData.filter((item) => {
                    if (
                        ![
                            store.state.tableViewMaping.document.className,
                            store.state.tableViewMaping.epmDocument.className
                        ].includes(item.idKey)
                    ) {
                        idKeyList.push(item);
                    }
                    return [
                        store.state.tableViewMaping.document.className,
                        store.state.tableViewMaping.epmDocument.className
                    ].includes(item.idKey);
                });
                if (!_.isEmpty(idKeyList)) {
                    vm.$message({
                        message: '文件夹列表下仅支持文档或模型对象的下载',
                        type: 'info',
                        showClose: true,
                        duration: 2000,
                        customClass: 'batchDownLoadTip'
                    });
                }
                let successCallback = () => {};
                !_.isEmpty(data) &&
                    commonActions.batchDownload(data, 'erd.cloud.pdm.core.container.entity.Library', successCallback);
            }
        }
    };
});
