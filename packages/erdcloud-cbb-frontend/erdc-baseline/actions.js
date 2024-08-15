define([ELMP.resource('erdc-pdm-common-actions/index.js')], function (commonActions) {
    let handleAction = function (action, row, vm) {
        const eventClick = {
            // 创建
            BASELINE_CREATE: vm.handleCreate,
            BASELINE_DELETE: vm.openDeleteDialog,
            BASELINE_RENAME: vm.openRenameDialog,
            BASELINE_REVERSION: vm.openReviseDialog,
            // BASELINE_SET_STATUS: vm.openChangeLifecycleDialog,
            BASELINE_MOVE: vm.openMoveDialog,
            BASELINE_SAVE_AS: vm.openSaveAsDialog,
            BASELINE_MODIFY_OWNER: vm.openChangeOwnerDialog,
            BASELINE_MERGE: vm.handleMerge,
            BASELINE_COMPARE: vm.handleInfoCompare,
            BASELINE_EDIT: vm.handleEdit,
            BASELINE_SAVE: vm.handleCheckIn,
            BASELINE_CANCEL_UPDATE: vm.handleUnCheckOut
        };
        if (action.name === 'BASELINE_CREATE') {
            eventClick?.[action.name] && eventClick?.[action.name](row);
        } else if (action.name === 'BASELINE_COMPARE') {
            eventClick?.[action.name] && eventClick?.[action.name](row);
        } else if (row && row.length) {
            vm.validatorBefore(action, row).then((config) => {
                if (config.flag && config.items) {
                    if (_.isFunction(vm.customActionMethod)) vm.customActionMethod(action, config.items);
                    else eventClick?.[action.name] && eventClick?.[action.name](config.items);
                }
            });
        } else if (_.isObject(row)) {
            eventClick?.[action.name] && eventClick?.[action.name](row);
        } else if (vm.isNeedPromptInfo) {
            vm.$message.warning(vm.i18n.selectTip);
        }
    };

    let actions = {
        // 创建
        BASELINE_CREATE(vm, data, n, action) {
            handleAction(action, data, vm);
        },
        BASELINE_DELETE(vm, data, n, action) {
            handleAction(action, data, vm);
        },
        BASELINE_RENAME(vm, row, inTable) {
            if (!inTable) {
                row = {
                    ...row,
                    containerRef: row.containerRef?.displayName,
                    folderRef: row.folderRef?.displayName
                };
            }

            if (_.isEmpty(row) && vm.isNeedPromptInfo) return vm.$message.warning(vm.i18n.selectTip);

            commonActions.rename(row, vm.baselineClassName, vm.refresh, {
                showCollect: false
            });
        },
        BASELINE_REVERSION(vm, row, inTable) {
            let successCallback = (oids) => {
                if (inTable) vm.refresh();
                else if (Array.isArray(oids) && oids.length === 1) {
                    vm.refresh(true);
                }
            };

            if (_.isEmpty(row) && vm.isNeedPromptInfo) return vm.$message.warning(vm.i18n.selectTip);

            commonActions.reversion(row, vm.baselineClassName, successCallback, { inTable });
            // handleAction(action, data, vm);
        },
        BASELINE_SET_STATUS(vm, row, inTable) {
            if (!inTable) {
                row = {
                    ...row,
                    'lifecycleStatus.status': row['lifecycleStatusOrigin']?.displayName
                };
            }

            if (_.isEmpty(row) && vm.isNeedPromptInfo) return vm.$message.warning(vm.i18n.selectTip);

            commonActions.setState(row, vm.baselineClassName, vm.refresh);
            // handleAction(action, data, vm);
        },
        BASELINE_MOVE(vm, row, inTable) {
            if (!inTable) {
                row = {
                    ...row,
                    attrRawList: [row.folderRefOrigin, row.containerRefOrigin],
                    folderRef: row.folderRefOrigin.displayName
                };
            }

            if (_.isEmpty(row) && vm.isNeedPromptInfo) return vm.$message.warning(vm.i18n.selectTip);

            commonActions.move(row, vm.baselineClassName, vm.refresh, { inTable, showCollect: false });
            // handleAction(action, data, vm);
        },
        BASELINE_SAVE_AS(vm, row, inTable) {
            if (!inTable) {
                // 需要处理folderData，要有attrRawList
                row = {
                    ...row,
                    attrRawList: [row.folderRef, row.containerRefOrigin],
                    folderRef: row.folderRef.displayName
                };
            }

            if (_.isEmpty(row) && vm.isNeedPromptInfo) return vm.$message.warning(vm.i18n.selectTip);

            commonActions.saveAs(row, vm.baselineClassName, vm.refresh, { inTable });
        },
        BASELINE_MODIFY_OWNER(vm, row, inTable) {
            if (!inTable) {
                row = {
                    ...row,
                    ownedByRef: row.ownedByRef_defaultValue?.[0]?.displayName || row.ownedByRef
                };
            }

            if (_.isEmpty(row) && vm.isNeedPromptInfo) return vm.$message.warning(vm.i18n.selectTip);
            
            commonActions.changeOwner(row, vm.baselineClassName, vm.refresh, { inTable, showCollect: false });
            // handleAction(action, data, vm);
        },
        BASELINE_MERGE(vm, data, n, action) {
            handleAction(action, data, vm);
        },
        BASELINE_COMPARE(vm, data, n, action) {
            handleAction(action, data, vm);
        },
        BASELINE_EDIT(vm, data, n, action) {
            handleAction(action, data, vm);
        },
        BASELINE_SAVE(vm, data, n, action) {
            handleAction(action, data, vm);
        },
        BASELINE_CANCEL_UPDATE(vm, data, n, action) {
            handleAction(action, data, vm);
        }
    };

    return actions;
});
