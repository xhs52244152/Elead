define([
    ELMP.resource('erdc-pdm-common-actions/utils.js'),
    ELMP.resource('erdc-pdm-common-actions/locale/index.js'),
    ELMP.resource('erdc-pdm-common-actions/components/RenameDialog/index.js'),
    ELMP.resource('erdc-pdm-common-actions/components/CollectObjectDialog/index.js'),
    ELMP.resource('erdc-pdm-common-actions/components/SetStateDialog/index.js'),
    ELMP.resource('erdc-pdm-common-actions/components/DialogHandler/index.js'),
    ELMP.resource('erdc-pdm-components/ConfirmDialog/index.js'),
    ELMP.resource('erdc-pdm-common-actions/components/BatchDownloadDialog/index.js')
], function (
    utils,
    locale,
    renameDialog,
    collectObjectDialog,
    setStateDialog,
    dialogHandler,
    confirmDialog,
    BatchDownloadDialog
) {
    const EventBus = require('EventBus');
    const ErdcStore = require('erdcloud.store');
    const ErdcHttp = require('erdcloud.http');
    const ErdcI18n = require('erdcloud.i18n');
    const ErdcKit = require('erdc-kit');
    const Vue = require('vue');
    let i18n = ErdcI18n.wrap(locale);

    return {
        // 通用导出方法
        async export(vm, { exportType = 'viewExport', exportProps }) {
            let params = {};
            let { className } = exportProps;
            if (exportType === 'bomExport') {
                // BOM 结构导出
                let { vid, masterOid, views, oid, displayName, baseColumnList } = exportProps;
                // 获取templateId
                let { data: templateData } = await utils.getTemplateData('EmptyExportTemp');
                let templateId = templateData[0]?.oid;

                const maxCount = 500;
                params = {
                    templateId: templateId,
                    typeName: className,
                    businessName: 'BomViewExportTemp',
                    tableSearchDto: {
                        className,
                        tableKey: 'BomUsageLinkView',
                        pageSize: maxCount
                    },
                    maxDataCount: maxCount,
                    customParams: {
                        exportData: true,
                        oid,
                        vid,
                        masterOid,
                        displayName,
                        // bom结构导出特有参数
                        baseColumnList,
                        classifies: views.map((item) => ({
                            oid: item.oid || item.viewOid,
                            displayName: item.label,
                            classifyAttrs: []
                        }))
                    }
                };
            } else if (exportType === 'viewExport') {
                // 普通视图表格对象导出
                let { selection, requestData, columns } = exportProps;

                let identifierNoKey = `${className}#identifierNo`;

                let conditionDtoList =
                    selection.length > 0
                        ? [
                              {
                                  attrName: identifierNoKey,
                                  oper: 'IN',
                                  logicalOperator: 'AND',
                                  sortOrder: 0,
                                  isCondition: true,
                                  value1: selection.map((item) => item[identifierNoKey]).join(),
                                  children: []
                              }
                          ]
                        : [];

                let exportFields = [];
                columns.forEach((col) => {
                    if (!['seq', 'icon', 'checkbox', 'radio', 'operation'].includes(col.prop)) {
                        exportFields.push(col.prop);
                    }
                });

                params = {
                    tableSearchDto: {
                        ..._.pick(requestData, ...['className', 'containerRef', 'viewRef', 'tableKey']),
                        conditionDtoList: conditionDtoList.concat(requestData.conditionDtoList || [])
                    },
                    useDefaultExport: true,
                    exportFields
                };
            }

            ErdcHttp({
                url: '/fam/export',
                method: 'POST',
                className,
                data: params
            })
                .then(() => {
                    // 导出成功
                    utils.Notify.onExportSuccess({ vm });
                })
                .catch(() => {
                    // 导出失败
                    utils.Notify.onExportError({ vm });
                });
        },
        // 通用导入方法
        import(vm, { importTypeList, props }) {
            const extendProps = {
                visible: true,
                importTypeList,
                ...props
            };
            utils.renderImportAndExportDialog(extendProps);
        },
        // 创建变更（发起变更）-部件、文档、模型等列表
        handleCreateChange(vm, row, { inTable, type }) {
            const selectData = Array.isArray(row) ? row : [row];
            const rowData = selectData.map((item) => {
                let newRow = {};
                _.each(item?.attrRawList, (ite) => {
                    newRow[ite?.attrName?.split('#')?.[1] || ite?.attrName] = ite?.displayName || '';
                    newRow['selected'] = true;
                });
                return {
                    ...item,
                    ...newRow
                };
            });
            // 移除变更管理中创建存在的缓存
            localStorage.removeItem('saveOtherData');
            // 文档数据缓存
            localStorage.setItem('saveAsChangeData', JSON.stringify(rowData));

            const routeMap = {
                PR: 'erdc-change/change/prCreate',
                ECR: 'erdc-change/change/ecrCreate',
                ECN: 'erdc-change/change/ecnCreate'
            };

            const { prefixRoute, resourceKey } = vm.$route?.meta || {};
            vm.$router.push({
                path: `${prefixRoute.split(resourceKey)[0]}${routeMap[type]}`,
                query: {
                    ..._.pick(vm.$route.query, (value, key) => {
                        return ['pid', 'typeOid'].includes(key) && value;
                    }),
                    type: 'create'
                }
            });
        },
        // 撤销编辑
        handleReEdit(vm, row, { inTable, urlConfig, props = {}, className }) {
            const params = {
                props: {
                    visible: true,
                    type: 'reEdit',
                    title: i18n.tips,
                    confirmTitle: i18n.cancelEditTip,
                    tips: i18n.cancelEdit,
                    hasContent: false,
                    ...props
                },
                urlConfig: urlConfig || {
                    reCheckout: '/fam/common/undo/checkout'
                }
            };

            utils.renderConfirmDialog(params, () => {
                ErdcHttp({
                    url: params.urlConfig.reCheckout,
                    className: className || row.oid.split(':')?.[1],
                    data: {
                        oid: row.oid
                    },
                    method: 'GET'
                }).then((res) => {
                    vm.$message.success(i18n.operateSuccess);
                    if (inTable) {
                        vm.refresh();
                    } else if (res.data) {
                        vm.refresh(res.data);
                        let data = { oid: res.data };
                        EventBus.emit('refresh:structure', data);
                    }
                });
            });
        },
        // 删除（部件、文档、模型等带版本对象）
        handleDelete(vm, row, { inTable, props = {}, urlConfig, listRoutePath }) {
            let rowList = Array.isArray(row) ? row : [row];

            const params = {
                props: {
                    visible: true,
                    type: 'delete',
                    className: rowList[0]?.oid?.split(':')?.[1],
                    title: i18n.deleteConfirm,
                    confirmTitle: i18n.deleteTip,
                    tips: i18n.pleaseSelect,
                    rowList,
                    inTable: inTable,
                    deleteOptions: {
                        masterClassName: rowList[0]?.masterRef?.split(':')?.[1]
                    },
                    ...props
                },
                urlConfig: urlConfig || {
                    batchDelete: '/fam/deleteByIds'
                }
            };

            utils.renderConfirmDialog(params, () => {
                if (inTable || !listRoutePath) {
                    vm.refresh('default');
                } else {
                    vm.$store.dispatch('route/delVisitedRoute', vm.$route);
                    vm.$router.push({
                        path: listRoutePath,
                        query: _.pick(vm.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        })
                    });
                }
            });
        },
        // 普通删除（不带版本对象）
        normalDelete(vm, row, { inTable, listRoutePath, confirmConfig = {} }) {
            // 是否勾选数据
            let rowList = _.isArray(row) ? row : [row];
            if (!rowList || rowList.length < 1) {
                return vm.$message.warning(i18n.selectTip);
            }
            // 是否删除
            vm.$confirm(
                confirmConfig.message || i18n.deleteBatchTip,
                confirmConfig.title || i18n.deleteTip,
                confirmConfig.options || {
                    type: 'warning',
                    confirmButtonText: i18n.confirm,
                    cancelButtonText: i18n.cancel
                }
            ).then(() => {
                let oidList = rowList.map((item) => item.oid);
                let className = oidList[0].split(':')?.[1];
                ErdcHttp({
                    url: '/fam/deleteByIds',
                    method: 'delete',
                    params: {},
                    data: {
                        oidList,
                        className
                    }
                }).then(() => {
                    vm.$message({
                        type: 'success',
                        message: i18n.deleteSuccess,
                        showClose: true
                    });
                    if (inTable) vm.refresh();
                    else {
                        vm.$store.dispatch('route/delVisitedRoute', vm.$route);
                        vm.$router.push({
                            path: listRoutePath,
                            query: _.pick(vm.$route.query, (value, key) => {
                                return ['pid', 'typeOid'].includes(key) && value;
                            })
                        });
                    }
                });
            });
        },
        // 信息比较
        async handleInfoCompare(vm, row, { props = {}, routePath }) {
            await new Promise((resolve) => {
                require([ELMP.resource('erdc-cbb-components/InfoCompare/store.js')], function (store) {
                    ErdcStore.registerModule('infoCompare', store);
                    resolve();
                });
            });

            if (_.isArray(row) && row.length < 2) {
                return vm.$message.warning(i18n.checkTwoPieces);
            }

            if (_.isArray(row) && row.length > 10) {
                return vm.$message.warning(i18n.upToTen);
            }

            vm.$store.commit('infoCompare/SET_INFO_COMPARE', {
                className: props?.className || '',
                infoCompare: row || []
            });

            vm.$router.push({
                path: routePath,
                query: {
                    ..._.pick(vm.$route.query, (value, key) => {
                        return ['pid', 'typeOid'].includes(key) && value;
                    }),
                    ..._.pick(props, 'className', 'tableKey')
                }
            });
        },
        // 挂载复杂页面弹窗
        mountHandleDialog: utils.mountHandleDialog,
        // 批量编辑         用于复杂数据来源组合的表格渲染,这种情况无法通过刷新表格完成显示最新改动的需求,只能在更新请求成功后把更新动作覆盖到本地数据上
        async batchEdit(
            row,
            {
                validator = {
                    isNull: (rowArr) => (rowArr?.length ? Promise.resolve() : Promise.reject('请选择数据！'))
                },
                openDialog,
                className,
                coverLocalData,
                vm = new Vue()
            }
        ) {
            let { resolve, reject, promise } = utils.generatePromisCallback();
            let rowArr = utils.toRows(row);
            coverLocalData = _.isFunction(coverLocalData)
                ? coverLocalData
                : ({ oidMap = {}, updateData = {} }) => {
                      let emun = {};
                      Object.keys(oidMap).forEach((oldOid) => {
                          let newOid = oidMap[oldOid];
                          emun[newOid] = oldOid;
                          emun[oldOid] = newOid;
                      });
                      // 这里刷新表格和直接改数据相比 还是改数据简单一点
                      try {
                          (updateData?.rawDataVoList || []).forEach((updateItem) => {
                              let target = rowArr.find(
                                  (item) => emun[updateItem.oid] && item.oid === emun[updateItem.oid]
                              );
                              (updateItem?.attrRawList || []).forEach(({ attrName, value }) => {
                                  vm.$set(target, attrName, value);
                              });
                          });
                      } catch (error) {}
                  };
            openDialog = _.isFunction(openDialog)
                ? openDialog
                : () =>
                      utils.mountDialog({
                          template: `<BatchSetValue
                                :visible.sync="visible"
                                :table-data="tableData"
                                :class-name="className"
                                @set-value-success="setValueSuccess"
                                @update:visible="changeVisible"
                            ></BatchSetValue>`,
                          data() {
                              return {
                                  visible: true,
                                  className,
                                  tableData: ErdcKit.deepClone(rowArr)
                              };
                          },
                          components: {
                              BatchSetValue: ErdcKit.asyncComponent(
                                  ELMP.resource('erdc-cbb-components/BatchSetValue/index.js')
                              )
                          },
                          methods: {
                              async setValueSuccess(...args) {
                                  // 3 修改成功后覆盖本地
                                  try {
                                      await coverLocalData(...args);
                                      resolve(...args);
                                      this?.close?.();
                                  } catch (error) {
                                      reject(error);
                                  }
                              },
                              changeVisible(v) {
                                  if (!v) {
                                      reject('cancel');
                                      this?.close?.();
                                  }
                              }
                          }
                      });
            try {
                // 1 校验数据
                await utils.runPromiseArrSort(_.isArray(validator) ? validator : Object.values(validator));
                // 2 弹窗选择属性并修改
                openDialog();
            } catch (e) {}

            return promise;
        },
        // 重命名
        rename(row, className, successCallback, dialogProps = {}) {
            utils.mountHandleDialog(renameDialog, {
                props: {
                    rowList: utils.toRows(row),
                    className,
                    ...dialogProps
                },
                successCallback
            });
        },
        // 收集相关对象
        collectObject(row, className, successCallback, dialogProps) {
            utils.mountHandleDialog(collectObjectDialog, {
                props: {
                    tableData: utils.toRows(row),
                    className,
                    ...dialogProps
                },
                successCallback
            });
        },
        // 设置状态
        setState(row, className, successCallback, dialogProps = {}) {
            utils.mountHandleDialog(setStateDialog, {
                props: {
                    rowList: utils.toRows(row),
                    className,
                    ...dialogProps
                },
                successCallback
            });
        },
        // 另存为
        saveAs(row, className, successCallback, extendProps = {}) {
            const props = {
                visible: true,
                title: i18n.saveAs,
                className,
                type: 'saveAs',
                joinClassName: extendProps.inTable,
                rowList: Array.isArray(row) ? row : [row],
                ...extendProps
            };
            utils.mountHandleDialog(dialogHandler, { props, successCallback });
        },
        // 移动
        move(row, className, successCallback, extendProps = {}) {
            const props = {
                visible: true,
                title: i18n.move,
                className,
                type: 'move',
                joinClassName: extendProps.inTable,
                rowList: Array.isArray(row) ? row : [row],
                ...extendProps
            };
            utils.mountHandleDialog(dialogHandler, { props, successCallback });
        },
        // 更改所有者
        changeOwner(row, className, successCallback, extendProps = {}) {
            const joinClassName = Object.prototype.hasOwnProperty.call(extendProps, 'joinClassName')
                ? extendProps.joinClassName
                : extendProps.inTable;

            const props = {
                visible: true,
                type: 'owner',
                title: i18n.updateOwner,
                className,
                rowList: Array.isArray(row) ? row : [row],
                columns: [
                    {
                        prop: 'checkbox',
                        type: 'checkbox',
                        width: 40,
                        align: 'center'
                    },
                    {
                        prop: 'seq',
                        type: 'seq',
                        title: ' ',
                        width: '48',
                        align: 'center' //多选框默认居中显示
                    },
                    {
                        prop: 'name', // 属性key
                        title: i18n['name'], // 属性名称
                        joinClassName
                    },
                    {
                        prop: 'identifierNo', // 属性key
                        title: i18n['number'], // 属性名称
                        joinClassName
                    },
                    {
                        prop: 'ownedByRef', // 属性key
                        title: i18n['originalOwner'], // 属性名称
                        joinClassName
                    },
                    {
                        prop: 'owner', // 属性key
                        title: i18n?.['owner'], // 属性名称
                        editRender: {}
                    }
                ],
                ...extendProps
            };

            utils.mountHandleDialog(dialogHandler, { props, successCallback });
        },
        // 批量下载文件
        batchDownload(row, className, successCallback, extendProps = {}) {
            const props = {
                className,
                rowList: Array.isArray(row) ? row : [row],
                successCallback,
                ...extendProps
            };
            utils.mountHandleDialog(BatchDownloadDialog, { props });
        },
        // 修订
        reversion(row, className, successCallback, extendProps = {}) {
            const joinClassName = Object.prototype.hasOwnProperty.call(extendProps, 'joinClassName')
                ? extendProps.joinClassName
                : extendProps.inTable;

            const data = Array.isArray(row) ? row : [row];
            const oIds = data.map((i) => i.oid);
            ErdcHttp({
                url: '/fam/common/to/revision',
                className,
                data: oIds,
                method: 'POST'
            }).then((res) => {
                const props = {
                    visible: true,
                    type: 'reversion',
                    width: '800px',
                    className,
                    title: i18n?.reversionConfirm,
                    confirmTitle: i18n?.reversionTip,
                    tips: i18n?.selectReversionTip,
                    rowList: res?.data || [],
                    columns: [
                        {
                            prop: 'seq',
                            type: 'seq',
                            title: ' ',
                            width: '48',
                            align: 'center' //多选框默认居中显示
                        },
                        {
                            prop: 'name', // 属性key
                            title: i18n?.name, // 属性名称
                            joinClassName
                        },
                        {
                            prop: 'identifierNo', // 属性key
                            title: i18n?.number, // 属性名称
                            width: '180',
                            joinClassName
                        },
                        {
                            prop: 'version', // 属性key
                            title: i18n?.version, // 属性名称
                            width: '100',
                            joinClassName
                        },
                        {
                            prop: 'toVersion', // 属性key
                            title: i18n?.revisedVersion, // 属性名称
                            width: '160'
                        }
                    ]
                };

                utils.mountHandleDialog(confirmDialog, {
                    props,
                    successCallback,
                    urlConfig: {
                        batchRevision: '/fam/common/revision/batch'
                    }
                });
            });
        },
        // 结构比较
        compareStruct(row, path, vm, needBomView) {
            let rowList = Array.isArray(row) ? row : [row];

            if (_.isEmpty(rowList)) return vm.$message.info(i18n.selectOneDataTips);
            if (rowList.length > 2) return vm.$message.info(i18n.selectMoreDataTips);

            let query = {
                pid: vm.$route.query?.pid,
                compareA: rowList[0]?.oid || '',
                compareB: rowList[1]?.oid || '',
                compareKey: Date.now()
            };

            // BOM 视图处理
            if (needBomView) {
                query = {
                    ...query,
                    viewA: rowList[0]?.viewRef || '',
                    viewB: rowList[1]?.viewRef || ''
                };
            }

            vm.$router.push({
                path: `${vm.$route.meta.prefixRoute}/${path}`,
                query
            });
        }
    };
});
