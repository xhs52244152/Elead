define([
    ELMP.func('erdc-epm-document/config/operateAction.js'),
    ELMP.func('erdc-epm-document/config/viewConfig.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    ELMP.func('erdc-epm-document/locale/index.js')
], function (operateAction, viewCfg, cbbUtils, locale) {
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');
    const ErdcHttp = require('erdcloud.http');
    const ErdcI18n = require('erdcloud.i18n');
    const i18n = ErdcI18n.wrap(locale);
    const ErdcRouter = require('erdcloud.router');
    const { $router, $route } = ErdcRouter.app;

    // 部件描述关系 / 部件参考关系
    function relationObj(data, responseData) {
        const { currentOid, masterRef, currentClassName, isRoleB, isOid, relationObjActive } = data;
        const oid = isRoleB ? (isOid ? currentOid : masterRef) : currentOid;
        let params = {
            className: currentClassName,
            attrRawList: [
                {
                    attrName: 'roleAObjectRef',
                    value: isRoleB ? responseData : oid
                },
                {
                    attrName: 'roleBObjectRef',
                    value: isRoleB ? oid : responseData
                }
            ]
        };
        ErdcHttp({
            url: 'fam/create',
            className: viewCfg.epmDocumentViewTableMap.className,
            data: params,
            method: 'POST'
        }).then(() => {
            $router.push({
                path: `${$route?.meta?.prefixRoute}/epmDocument/detail`,
                query: {
                    ..._.pick($route.query, (value, key) => {
                        return ['pid', 'typeOid'].includes(key) && value;
                    }),
                    //原来的oid
                    oid: currentOid,
                    // 跳转详情后要进到那个tab页
                    activeName: 'relationObj',
                    relationObjActive,
                    componentRefresh: true
                }
            });
        });
    }
    // 部件CAD图档
    function partLinkEpm(responseData, currentRoute) {
        ErdcHttp({
            url: '/fam/attr',
            methods: 'get',
            className: viewCfg.epmDocumentViewTableMap.className,
            params: {
                oid: responseData,
                className: viewCfg.epmDocumentViewTableMap.className
            }
        }).then((res) => {
            let params = {
                className: currentRoute.query?.currentClassName,
                attrRawList: [
                    {
                        attrName: 'roleAObjectRef',
                        value: res?.data?.rawData?.vid?.value
                    },
                    {
                        attrName: 'roleBObjectRef',
                        value: currentRoute.query?.currentVid
                    }
                ]
            };
            ErdcHttp({
                url: 'fam/create',
                className: viewCfg.epmDocumentViewTableMap.className,
                data: params,
                method: 'POST'
            }).then(() => {
                const { prefixRoute, resourceKey } = currentRoute?.meta || {};
                $router.push({
                    path: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/detail`,
                    query: {
                        ..._.pick(currentRoute.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        }),
                        //原来的oid
                        oid: currentRoute.query?.currentOid,
                        // 跳转详情后要进到那个tab页
                        activeName: 'relationObj',
                        relationObjActive: currentRoute.query?.relationObjActive,
                        componentRefresh: true
                    }
                });
            });
        });
    }

    // 保存时是否需要检入
    let handleCheckIn = null;
    function getCheckIn(note) {
        return function (oid) {
            return ErdcHttp({
                url: '/fam/common/checkin',
                params: {
                    note: note,
                    oid: oid
                },
                className: viewCfg.epmDocumentViewTableMap.className,
                method: 'PUT'
            }).finally(() => {
                handleCheckIn = null;
            });
        };
    }

    return (customConfig) => {
        return {
            [viewCfg.epmDocumentViewTableMap.className]: () => {
                let defaultConfig = {
                    showSpecialAttr: true,
                    create: {
                        title: i18n.createModel,
                        editableAttr: ['containerRef'],
                        layoutName: 'CREATE',
                        showDraftBtn: true,
                        slots: {
                            formBefore: ErdcKit.asyncComponent(
                                ELMP.func('erdc-epm-document/components/BasicInfo/index.js')
                            ),
                            formSlots: {
                                'main-source': ErdcKit.asyncComponent(
                                    ELMP.func('erdc-epm-document/components/MainContentSource/index.js')
                                ),
                                'attach-file': ErdcKit.asyncComponent(
                                    ELMP.resource('erdc-cbb-components/UploadFileList/index.js')
                                )
                            }
                        },
                        props: {
                            formSlotsProps() {
                                return {
                                    'main-source': {
                                        className: viewCfg.epmDocumentViewTableMap.className
                                    },
                                    'attach-file': {
                                        className: viewCfg.epmDocumentViewTableMap.className
                                    }
                                };
                            }
                        },
                        hooks: {
                            // 关闭
                            beforeCancel: function ({ goBack, vm }) {
                                const { prefixRoute, resourceKey } = vm.$route?.meta || {};

                                if (vm.$route.query?.parentOid) {
                                    vm.$router.push({
                                        path: `${prefixRoute}/epmDocument/detail`,
                                        query: {
                                            ..._.pick(vm.$route.query, (value, key) => {
                                                return ['pid', 'typeOid'].includes(key) && value;
                                            }),
                                            oid: vm.$route.query.rootOid,
                                            // 跳转详情后要进到那个tab页
                                            activeName: 'structure',
                                            title: i18n.viewModel,
                                            className: viewCfg.epmDocumentViewTableMap.className
                                        }
                                    });
                                } else if (vm.$route.query?.workspaceOid) {
                                    //从工作区相关对象页面 新增跳转过来
                                    vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                        vm.$router.push({
                                            path: `${prefixRoute.split(resourceKey)[0]}erdc-workspace/workspace/detail`,
                                            query: {
                                                ..._.pick(vm.$route.query, (value, key) => {
                                                    return ['pid', 'typeOid'].includes(key) && value;
                                                }),
                                                oid: vm.$route.query?.workspaceOid,
                                                activeName: 'relationObj',
                                                componentRefresh: true
                                            }
                                        });
                                    });
                                } else {
                                    goBack();
                                }
                            },
                            async beforeSubmit({ formData, next, isSaveDraft, vm }) {
                                //草稿校验名称不能为空
                                if (isSaveDraft) {
                                    let nameOptions = formData.attrRawList.find((item) => item.attrName == 'name');
                                    //没有触发过名称、触发过名称再清空
                                    if (!nameOptions || !nameOptions?.value) {
                                        return vm.$message.warning(i18n['名称不能为空']);
                                    }
                                }

                                const containerRef = ErdcStore?.state?.space?.context?.oid;
                                let temp = {};
                                const attrRawList = formData.attrRawList.filter((item) => {
                                    if (
                                        item.attrName === 'containerRef' ||
                                        item.attrName === 'typeReference' ||
                                        item.attrName === 'folderRef'
                                    ) {
                                        temp[item.attrName] = item.value;
                                    }
                                    return (
                                        !_.isUndefined(item.value) &&
                                        !_.isNull(item.value) &&
                                        item.attrName !== 'containerRef' &&
                                        item.attrName !== 'typeReference' &&
                                        item.attrName !== 'folderRef'
                                    );
                                });
                                if (vm.$route.query?.workspaceOid) {
                                    //从工作区相关对象页面 新增跳转过来
                                    attrRawList.push(
                                        ...[
                                            {
                                                attrName: 'isAddToWorkspace',
                                                value: true
                                            },
                                            {
                                                attrName: 'workspaceOid',
                                                value: vm.$route.query?.workspaceOid
                                            }
                                        ]
                                    );
                                }
                                const main =
                                    await vm?.$refs?.detail?.[0]?.$refs?.['main-source']?.[0]?.submit(isSaveDraft);
                                if (!main.status) return;

                                const attachFile =
                                    await vm?.$refs?.detail?.[0]?.$refs?.['attach-file']?.[0]?.submit(isSaveDraft);
                                if (!attachFile.status) return;

                                const params = {
                                    attrRawList,
                                    className: viewCfg.epmDocumentViewTableMap.className,
                                    typeReference: temp.typeReference,
                                    containerRef: temp.containerRef ?? containerRef,
                                    folderRef: temp.folderRef,
                                    contentSet: []
                                };
                                const name = attrRawList.filter((item) => item.attrName === 'name')[0]?.value;
                                const docType = main?.attrRawList.filter((item) => item.attrName === 'docType')[0]
                                    ?.value;
                                params.attrRawList.push(...(main?.attrRawList || []), {
                                    attrName: 'cadName',
                                    value: name + '.' + docType
                                });

                                if (!_.isEmpty(main.fileData)) {
                                    params.contentSet.push(main.fileData);
                                    // 后端校验需要一个假的mainContent数据
                                    attrRawList.push({
                                        attrName: 'mainContent',
                                        value: 'OR:xxx:111'
                                    });
                                }

                                !_.isEmpty(attachFile.data) && params.contentSet.push(...attachFile.data);

                                if (isSaveDraft) {
                                    params.isDraft = true;
                                }

                                let createSuccessTip = (name) => {
                                    return ErdcI18n.translate('isCreatedSuccess', { name }, i18n);
                                };
                                const tip = isSaveDraft ? createSuccessTip(i18n.draft) : createSuccessTip(i18n.model);

                                // 应后端要求，创建对象增加appName参数
                                params.appName = 'PDM';

                                next(params, tip);
                            },
                            afterSubmit({ responseData, vm, cancel }) {
                                const { prefixRoute, resourceKey } = vm.$route?.meta || {};

                                // 结构插入新得,创建完部件,就得调插入接口
                                if (vm.$route.query?.parentOid) {
                                    let data = {
                                        brotherMasterOid: '',
                                        childOidList: [responseData],
                                        filterVo: {},
                                        parentOid: vm.$route.query?.parentOid
                                    };
                                    ErdcHttp({
                                        url: '/fam/struct/batch-create-byIds',
                                        data,
                                        className: responseData.split(':')[1],
                                        method: 'POST'
                                    })
                                        .then((res) => {
                                            let { success } = res || {};
                                            if (success) {
                                                // 跳转到详情页(如果是根节点,那就拿插入后的oid去跳转)
                                                let jumpOid = '';
                                                // 如果是根节点的话,就拿到更新后的oid
                                                if (vm.$route.query?.isRoot) {
                                                    jumpOid = res?.data?.rawData?.oid?.value;
                                                } else {
                                                    // 如果不是的话,就拿根节点跳转就好咯
                                                    jumpOid = vm.$route.query?.rootOid;
                                                }
                                                vm.$router.push({
                                                    path: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/detail`,
                                                    query: {
                                                        ..._.pick(vm.$route.query, (value, key) => {
                                                            return ['pid', 'typeOid'].includes(key) && value;
                                                        }),
                                                        oid: jumpOid,
                                                        // 跳转详情后要进到那个tab页
                                                        activeName: 'structure',
                                                        title: i18n.viewPart,
                                                        className: viewCfg.epmDocumentViewTableMap.className
                                                    }
                                                });
                                            }
                                        })
                                        .catch(() => {
                                            vm.$router.push({
                                                path: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/detail`,
                                                query: {
                                                    ..._.pick(vm.$route.query, (value, key) => {
                                                        return ['pid', 'typeOid'].includes(key) && value;
                                                    }),
                                                    oid: vm.$route.query.rootOid,
                                                    // 跳转详情后要进到那个tab页
                                                    activeName: 'structure',
                                                    title: i18n.viewPart,
                                                    className: viewCfg.epmDocumentViewTableMap.className
                                                }
                                            });
                                        });
                                } else if (vm.$route.query?.currentOid) {
                                    if (vm.$route.query.origin == 'part') {
                                        partLinkEpm(responseData, vm.$route);
                                    } else {
                                        let isOid = vm.$route.query.isOid === 'true' || vm.$route.query.isOid === true;
                                        relationObj({ ...vm.$route.query, isOid }, responseData);
                                    }
                                } else if (vm.$route.query?.workspaceOid) {
                                    // 从工作区相关对象页面 新增跳转过来
                                    vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                        vm.$router.push({
                                            path: `${prefixRoute.split(resourceKey)[0]}erdc-workspace/workspace/detail`,
                                            query: {
                                                ..._.pick(vm.$route.query, (value, key) => {
                                                    return ['pid', 'typeOid'].includes(key) && value;
                                                }),
                                                oid: vm.$route.query?.workspaceOid,
                                                activeName: 'relationObj',
                                                componentRefresh: true
                                            }
                                        });
                                    });
                                } else if (vm.$route.query.origin === 'back') {
                                    cancel && cancel();
                                } else if (vm.$route.query.origin === 'folder') {
                                    vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                        vm.$router.push({
                                            ...vm?.from,
                                            query: _.pick(vm.$route.query, (value, key) => {
                                                return ['pid', 'typeOid'].includes(key) && value;
                                            }),
                                            params: {
                                                componentRefresh: true
                                            }
                                        });
                                    });
                                } else {
                                    vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                        vm.$router.push({
                                            path: `${prefixRoute}/epmDocument/list`,
                                            query: _.pick(vm.$route.query, (value, key) => {
                                                return ['pid', 'typeOid'].includes(key) && value;
                                            })
                                        });
                                    });
                                }
                            }
                        }
                    },
                    edit: {
                        title: function (formData, caption) {
                            return ErdcI18n.translate('editSomes', { name: caption }, i18n);
                        },
                        layoutName: 'UPDATE',
                        isNotTabs: true,
                        showDraftBtn: true,
                        slots: {
                            formBefore: ErdcKit.asyncComponent(
                                ELMP.func('erdc-epm-document/components/BasicInfo/index.js')
                            ),
                            formSlots: {
                                'main-source': ErdcKit.asyncComponent(
                                    ELMP.func('erdc-epm-document/components/MainContentSource/index.js')
                                ),
                                'attach-file': ErdcKit.asyncComponent(
                                    ELMP.resource('erdc-cbb-components/UploadFileList/index.js')
                                )
                            }
                        },
                        props: {
                            formBefore: {
                                containerRef: ErdcStore?.state?.space?.context?.oid || ''
                            },
                            formSlotsProps(vm) {
                                const state = vm?.formData?.['iterationInfo.state'] || '';
                                let stateValue = typeof state === 'string' ? state : state?.value;
                                return {
                                    'attach-file': {
                                        roleType: 'SECONDARY',
                                        className: viewCfg.epmDocumentViewTableMap.className,
                                        oid: vm?.containerOid,
                                        isCheckout: stateValue === 'WORKING'
                                    },
                                    'main-source': {
                                        className: viewCfg.epmDocumentViewTableMap.className,
                                        currentData: {
                                            authoringApplication: vm?.formData?.authoringApplication,
                                            docType: vm?.formData?.docType
                                        }
                                    }
                                };
                            },
                            formProps: {
                                // 自定义组装formData数据
                                customAssemblyData(data) {
                                    const { rawData } = data || {};
                                    return {
                                        folderShow: rawData?.folderRef
                                    };
                                }
                            }
                        },
                        modelMapper: {
                            containerRef: (data, { oid }) => {
                                return oid || '';
                            },
                            typeReference: (data, { oid }) => {
                                return oid || '';
                            },
                            folderRef: (data, { value }) => {
                                return value || '';
                            },
                            folderShow: (data, { displayName }) => {
                                return displayName || '';
                            }
                        },
                        hooks: {
                            // beforeEcho: function ({ rawData, next }) {
                            //     let data = ErdcKit.deserializeAttr(rawData, {
                            //         valueMap: {
                            //             containerRef: ({ oid }) => {
                            //                 return oid || '';
                            //             },
                            //             typeReference: ({ oid }) => {
                            //                 return oid || '';
                            //             },
                            //             folderRef: ({ value }) => {
                            //                 return value || '';
                            //             }
                            //         }
                            //     });

                            //     data.typeReferenceShow = rawData.typeReference.displayName;
                            //     data.folderShow = rawData.folderRef.displayName;
                            //     next(data);
                            // },
                            // 关闭
                            beforeCancel: function ({ formData, vm }) {
                                const { prefixRoute, resourceKey } = vm.$route?.meta || {};
                                if (vm.$route.query?.workspaceOid) {
                                    //从工作区相关对象页面 新增跳转过来
                                    vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                        vm.$router.push({
                                            path: `${prefixRoute.split(resourceKey)[0]}erdc-workspace/workspace/detail`,
                                            query: {
                                                ..._.pick(vm.$route.query, (value, key) => {
                                                    return ['pid', 'typeOid'].includes(key) && value;
                                                }),
                                                oid: vm.$route.query?.workspaceOid,
                                                activeName: 'relationObj',
                                                componentRefresh: true
                                            }
                                        });
                                    });
                                } else {
                                    vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                        // 编辑页点击关闭，草稿状态返回列表页、正常对象返回详情页
                                        if (formData['lifecycleStatus.status'] === 'DRAFT') {
                                            vm.$router.push({
                                                path: `${prefixRoute}/epmDocument/list`,
                                                query: {
                                                    ..._.pick(vm.$route.query, (value, key) => {
                                                        return ['pid', 'typeOid'].includes(key) && value;
                                                    })
                                                }
                                            });
                                        } else {
                                            vm.$router.push({
                                                path: `${prefixRoute}/epmDocument/detail`,
                                                query: {
                                                    ..._.pick(vm.$route.query, (value, key) => {
                                                        return ['pid', 'typeOid'].includes(key) && value;
                                                    }),
                                                    oid: vm.$route.query?.oid,
                                                    routeRefresh: true,
                                                    routeKey: vm?.containerOid
                                                }
                                            });
                                        }
                                    });
                                }
                            },
                            async beforeSubmit({ formData, next, isSaveDraft, sourceData, vm }) {
                                //草稿校验名称不能为空
                                if (isSaveDraft) {
                                    let nameOptions = formData.attrRawList.find((item) => item.attrName == 'name');
                                    //没有触发过名称、触发过名称再清空
                                    if (!nameOptions || !nameOptions?.value) {
                                        return vm.$message.warning(i18n['名称不能为空']);
                                    }
                                }

                                let temp = {};
                                const attrRawList = formData.attrRawList.filter((item) => {
                                    if (
                                        item.attrName === 'containerRef' ||
                                        item.attrName === 'typeReference' ||
                                        item.attrName === 'folderRef'
                                    ) {
                                        temp[item.attrName] = item.value;
                                    }
                                    return (
                                        !_.isUndefined(item.value) &&
                                        !_.isNull(item.value) &&
                                        item.attrName !== 'containerRef' &&
                                        item.attrName !== 'typeReference' &&
                                        item.attrName !== 'idKey' &&
                                        item.attrName !== 'folderRef'
                                    );
                                });
                                if (vm.$route.query?.workspaceOid) {
                                    //从工作区相关对象页面 新增跳转过来
                                    attrRawList.push(
                                        ...[
                                            {
                                                attrName: 'isAddToWorkspace',
                                                value: true
                                            },
                                            {
                                                attrName: 'workspaceOid',
                                                value: vm.$route.query?.workspaceOid
                                            }
                                        ]
                                    );
                                }
                                const main =
                                    await vm?.$refs?.detail?.[0]?.$refs?.['main-source']?.[0]?.submit(isSaveDraft);
                                if (!main.status) return;

                                const attachFile =
                                    await vm?.$refs?.detail?.[0]?.$refs?.['attach-file']?.[0]?.submit(isSaveDraft);
                                if (!attachFile.status) return;

                                const params = {
                                    oid: formData.oid ?? '',
                                    attrRawList,
                                    className: viewCfg.epmDocumentViewTableMap.className,
                                    typeReference: temp.typeReference,
                                    containerRef: vm.$store?.state?.app?.container?.oid,
                                    folderRef: temp.folderRef,
                                    contentSet: []
                                };
                                const name = attrRawList.filter((item) => item.attrName === 'name')[0]?.value;
                                const docType = main?.attrRawList.filter((item) => item.attrName === 'docType')[0]
                                    ?.value;
                                params.attrRawList.push(...(main?.attrRawList || []), {
                                    attrName: 'cadName',
                                    value: name + '.' + docType
                                });

                                if (!_.isEmpty(main.fileData)) {
                                    params.contentSet.push(main.fileData);
                                    // 后端校验需要一个假的mainContent数据
                                    params.attrRawList.push({
                                        attrName: 'mainContent',
                                        value: 'OR:xxx:111'
                                    });
                                }

                                !_.isEmpty(attachFile.data) && params.contentSet.push(...attachFile.data);
                                if (isSaveDraft) {
                                    params.isDraft = true;
                                }

                                // 草稿移除编码参数
                                if (sourceData?.['lifecycleStatus.status']?.value === 'DRAFT') {
                                    params.attrRawList = params.attrRawList.filter((item) => {
                                        return !['identifierNo'].includes(item.attrName);
                                    });
                                }

                                // 草稿状态的对象编辑保存不需要调用检入接口
                                if (!isSaveDraft && sourceData?.['lifecycleStatus.status']?.value !== 'DRAFT') {
                                    const props = {
                                        visible: true,
                                        type: 'save',
                                        className: viewCfg.epmDocumentViewTableMap.className,
                                        title: i18n.save,
                                        customSubmit: (vm) => {
                                            if (vm.radio === '3') {
                                                handleCheckIn = getCheckIn(vm.note);
                                            }
                                            vm.toggleShow();
                                            next(params);
                                        }
                                    };
                                    operateAction.mountDialogSave(props);
                                } else {
                                    next(params);
                                }
                            },
                            afterSubmit: async function ({ responseData, vm, isSaveDraft }) {
                                const pathName = isSaveDraft ? 'epmDocument/list' : 'epmDocument/detail';
                                const { prefixRoute, resourceKey } = vm.$route?.meta || {};

                                if (handleCheckIn) {
                                    let checkinResp = await handleCheckIn(responseData);
                                    if (!checkinResp?.success) return;
                                }
                                if (vm.$route.query?.workspaceOid) {
                                    //从工作区相关对象页面 新增跳转过来
                                    vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                        vm.$router.push({
                                            path: `${prefixRoute.split(resourceKey)[0]}erdc-workspace/workspace/detail`,
                                            query: {
                                                ..._.pick(vm.$route.query, (value, key) => {
                                                    return ['pid', 'typeOid'].includes(key) && value;
                                                }),
                                                oid: vm.$route.query?.workspaceOid,
                                                activeName: 'relationObj',
                                                componentRefresh: true
                                            }
                                        });
                                    });
                                } else {
                                    vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                        vm.$router.push({
                                            path: `${prefixRoute}/${pathName}`,
                                            query: {
                                                ..._.pick(vm.$route.query, (value, key) => {
                                                    return ['pid', 'typeOid'].includes(key) && value;
                                                }),
                                                oid: responseData,
                                                title: i18n.modelDetail,
                                                className: viewCfg.epmDocumentViewTableMap.className
                                            }
                                        });
                                    });
                                }
                            }
                        }
                    },
                    detail: {
                        title: function (formData, caption) {
                            return caption;
                        },
                        layoutName: 'DETAIL',
                        actionKey: viewCfg.epmDocumentViewTableMap.detailActionName,
                        actionParams: {
                            inTable: false,
                            isBatch: false
                        },
                        props: {
                            commonPageTitleProps(vm) {
                                return {
                                    showBackButton: !!vm?.$route?.query?.backButton
                                };
                            },
                            formSlotsProps(vm) {
                                const state = vm?.formData?.['iterationInfo.state'] || '';
                                let stateValue = typeof state === 'string' ? state : state?.value;
                                return {
                                    'main-source': {
                                        className: viewCfg.epmDocumentViewTableMap.className,
                                        oid: vm?.containerOid,
                                        readonly: true,
                                        isEpm: true
                                    },
                                    'attach-file': {
                                        roleType: 'SECONDARY',
                                        className: viewCfg.epmDocumentViewTableMap.className,
                                        oid: vm?.containerOid,
                                        isCheckout: stateValue === 'WORKING'
                                    }
                                };
                            },
                            formProps(formVue) {
                                return formVue
                                    ? {
                                          modelMapper: {
                                              'lifecycleStatus.status': (data, { displayName }) => {
                                                  return displayName || '';
                                              }
                                          }
                                      }
                                    : {};
                            }
                        },
                        modelMapper: {
                            'containerRef': (data, row) => {
                                return row || '';
                            },
                            'typeReference': (data, { displayName }) => {
                                return displayName || '';
                            },
                            'folderRef': (data, row) => {
                                return row || '';
                            },
                            'classifyReference': (data, row) => {
                                return row?.displayName || '';
                            },
                            'lock.locker': (data, e) => {
                                return e || '';
                            },
                            'lifecycleStatus.status': (data, { displayName }) => {
                                return displayName || '';
                            },
                            'templateInfo.templateReference': (data, { displayName }) => {
                                return displayName;
                            },
                            'lifecycleStatus.lifecycleTemplateRef': (data, { displayName }) => {
                                return displayName;
                            },
                            'iterationInfo.state': (data, { displayName }) => {
                                return displayName || '';
                            },
                            'teamRef': (data, { displayName }) => {
                                return displayName;
                            },
                            'teamTemplateRef': (data, { displayName }) => {
                                return displayName;
                            },
                            'securityLabel': (data, { displayName }) => {
                                return displayName ?? '';
                            },
                            'defaultTraceCode': (data, { displayName }) => {
                                return displayName ?? '';
                            },
                            'docType': (data, { displayName }) => {
                                return displayName ?? '';
                            }
                        },
                        hooks: {
                            goBack: function ({ goBack, vm }) {
                                if (vm?.$route?.query?.fromAppName) {
                                    // 从别的浏览器页签跳过来的
                                    window.open('', vm?.$route?.query?.fromAppName);
                                    return;
                                }
                                if (!!vm?.$route?.query?.backButton && vm?.from?.path?.indexOf('workflow') >= 0) {
                                    return vm.$store
                                        .dispatch('route/delVisitedRoute', vm.$route)
                                        .then((visitedRoutes) => {
                                            vm.$router.replace(
                                                visitedRoutes.find((item) => item.path === vm?.from?.path) || vm?.$route
                                            );
                                        });
                                }
                                return goBack();
                            }
                            // beforeEcho({ rawData, next }) {
                            //     let data = ErdcKit.deserializeAttr(rawData, {
                            //         valueMap: {
                            //             'containerRef': (row) => {
                            //                 return row || '';
                            //             },
                            //             'typeReference': ({ displayName }) => {
                            //                 return displayName || '';
                            //             },
                            //             'folderRef': (row) => {
                            //                 return row || '';
                            //             },
                            //             'classifyReference': (row) => {
                            //                 return row?.displayName || '';
                            //             },
                            //             'lock.locker': (e) => {
                            //                 return e || '';
                            //             },
                            //             'lifecycleStatus.status': ({ displayName }) => {
                            //                 return displayName || '';
                            //             },
                            //             'templateInfo.templateReference': ({ displayName }) => {
                            //                 return displayName;
                            //             },
                            //             'lifecycleStatus.lifecycleTemplateRef': ({ displayName }) => {
                            //                 return displayName;
                            //             },
                            //             'iterationInfo.state': ({ displayName }) => {
                            //                 return displayName || '';
                            //             },
                            //             'ownedByRef': ({ users }) => {
                            //                 return users;
                            //             },
                            //             'createBy': ({ users }) => {
                            //                 return users;
                            //             },
                            //             'updateBy': ({ users }) => {
                            //                 return users;
                            //             },
                            //             'teamRef': ({ displayName }) => {
                            //                 return displayName;
                            //             },
                            //             'teamTemplateRef': ({ displayName }) => {
                            //                 return displayName;
                            //             },
                            //             'securityLabel': ({ displayName }) => {
                            //                 return displayName ?? '';
                            //             },
                            //             'defaultTraceCode': ({ displayName }) => {
                            //                 return displayName ?? '';
                            //             },
                            //             'docType': ({ displayName }) => {
                            //                 return displayName ?? '';
                            //             }
                            //         }
                            //     });

                            //     next(data);
                            // }
                        },
                        showBackButton: false,
                        slots: {
                            titleBefore: {
                                template: `<fam-icon :value='vm?.formData?.icon' class="text-16 mr-normal"></fam-icon>`,
                                components: {
                                    FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
                                },
                                props: {
                                    vm: {
                                        type: Object,
                                        default: () => {
                                            return {};
                                        }
                                    }
                                }
                            },
                            titleAfter: {
                                template: `
                                    <div class="flex align-items-center">
                                        <erd-tag type="danger" v-if="locker">{{ $t('editBy', { name: locker }) }}</erd-tag>
                                        <erd-tag size="mini" v-else>{{status}}</erd-tag>
                                    </div>
                                `,
                                props: {
                                    formData: {
                                        type: Object,
                                        default: () => {
                                            return {};
                                        }
                                    }
                                },
                                data() {
                                    return {
                                        i18nPath: ELMP.func('erdc-epm-document/locale/index.js')
                                    };
                                },
                                computed: {
                                    status() {
                                        const value = this.formData?.['lifecycleStatus.status'];
                                        return value;
                                    },
                                    // 检出者
                                    locker() {
                                        // 当前用户信息
                                        const userInfo = ErdcStore?.state?.user || {};
                                        // 检出者
                                        const lockerObj = this.formData?.['lock.locker'];
                                        const bool = userInfo && userInfo.id === lockerObj?.value?.id;
                                        const value = bool ? this.$t('you') : lockerObj?.displayName;
                                        return value;
                                    }
                                }
                            },
                            customBtn: {
                                template: `
                                    <erd-button 
                                        v-if="!isLatest"
                                        class="mr-normal" 
                                        @click="latestVersion" 
                                    >${i18n.toLatestVersion}</erd-button>
                                `,
                                props: {
                                    formData: {
                                        type: Object,
                                        default: () => {
                                            return {};
                                        }
                                    },
                                    vm: Object
                                },
                                data() {
                                    return {
                                        isLatest: true
                                    };
                                },
                                computed: {
                                    oid() {
                                        return this.vm?.containerOid;
                                    }
                                },
                                watch: {
                                    oid: {
                                        handler(val) {
                                            if (!val || val?.indexOf('EpmReferenceLink') != -1) return;
                                            this.getCurrentVersionStatus(val);
                                        },
                                        immediate: true
                                    }
                                },
                                methods: {
                                    getCurrentVersionStatus(oid) {
                                        return this.$famHttp({
                                            url: '/epm/common/is/latest/version',
                                            params: {
                                                oid,
                                                className: viewCfg.epmDocumentViewTableMap.className
                                            },
                                            method: 'get'
                                        }).then((resp) => {
                                            if (resp.success) {
                                                this.isLatest = resp.data;
                                            }
                                        });
                                    },
                                    latestVersion() {
                                        this.$famHttp({
                                            url: '/epm/common/to/latest',
                                            params: {
                                                oid: this.oid,
                                                className: viewCfg.epmDocumentViewTableMap.className
                                            },
                                            method: 'GET'
                                        }).then((res) => {
                                            if (res.success) {
                                                // epmDocumentUtil.goToDetail(res.data.rawData);
                                                let data = res.data.rawData;
                                                const oid = data['oid'].value || '';
                                                oid && this.handleDetail(oid);
                                            }
                                        });
                                    },
                                    // 详情
                                    handleDetail(oid) {
                                        this.$router.push({
                                            path: `${this.$route?.meta?.prefixRoute}/epmDocument/detail`,
                                            query: {
                                                ..._.pick(this.$route.query, (value, key) => {
                                                    return ['pid', 'typeOid'].includes(key) && value;
                                                }),
                                                oid,
                                                className: viewCfg.epmDocumentViewTableMap.className,
                                                title: i18n.modelDetail
                                            }
                                        });
                                    }
                                }
                            },
                            formSlots: {
                                'attach-file': ErdcKit.asyncComponent(
                                    ELMP.resource('erdc-cbb-components/UploadFileList/index.js')
                                ),
                                'context': {
                                    template: `
                                        <erd-show-tooltip
                                            class="w-100p"
                                            placement="top"
                                            :content="containerObj.displayName"
                                            :enterable="false"
                                            :flex="false"
                                            :open-delay="100"
                                        >
                                            <template v-slot:show-tooltip-title>
                                                <span class="title_text">
                                                    <a href="javascript:;" @click="goDetail">
                                                        {{containerObj.displayName}}
                                                    </a>
                                                </span>
                                            </template>
                                        </erd-show-tooltip>
                                    `,
                                    props: {
                                        data: {
                                            type: Object,
                                            default: () => {
                                                return {};
                                            }
                                        }
                                    },
                                    computed: {
                                        containerObj() {
                                            return this.data?.['containerRef'] || {};
                                        }
                                    },
                                    methods: {
                                        // 进入资源库空间
                                        goDetail() {
                                            cbbUtils.handleGoToSpace(this.data);
                                        }
                                    }
                                },
                                'folder': {
                                    template: `
                                        <erd-show-tooltip
                                            class="w-100p"
                                            placement="top"
                                            :content="folderRef.displayName"
                                            :enterable="false"
                                            :flex="false"
                                            :open-delay="100"
                                        >
                                            <template v-slot:show-tooltip-title>
                                                <span class="title_text">
                                                    <a href="javascript:;" @click="goFolder">
                                                        {{folderRef.displayName}}
                                                    </a>
                                                </span>
                                            </template>
                                        </erd-show-tooltip>
                                    `,
                                    props: {
                                        data: {
                                            type: Object,
                                            default: () => {
                                                return {};
                                            }
                                        }
                                    },
                                    computed: {
                                        folderRef() {
                                            return this.data?.['folderRef'] || {};
                                        }
                                    },
                                    methods: {
                                        // 进入资源库空间
                                        goFolder() {
                                            cbbUtils.handleGoToSpace(this.data, 'folder');
                                        }
                                    }
                                },
                                'lifecyle-status': ErdcKit.asyncComponent(
                                    ELMP.resource('erdc-cbb-components/LifecyleStep/index.js')
                                ),
                                'main-source': ErdcKit.asyncComponent(
                                    ELMP.resource(
                                        'erdc-cbb-components/MainContentSource/components/MainContent/index.js'
                                    )
                                )
                            }
                        },
                        tabs: [
                            {
                                name: i18n.property,
                                activeName: 'detail'
                            },
                            {
                                name: i18n.visual,
                                activeName: 'Visualization',
                                component: ErdcKit.asyncComponent(
                                    ELMP.resource('erdc-cbb-components/Visualization/index.js')
                                ),
                                basicProps(vm) {
                                    return {
                                        showTools: !vm?.formData?.['templateInfo.tmplTemplated']
                                    };
                                }
                            },
                            {
                                name: i18n.structure,
                                activeName: 'structure',
                                component: ErdcKit.asyncComponent(
                                    ELMP.func('erdc-document/components/PdmObjectConstruction/index.js')
                                )
                            },
                            {
                                name: i18n.relationObj,
                                activeName: 'relationObj',
                                component: ErdcKit.asyncComponent(
                                    ELMP.func('erdc-epm-document/components/EpmRelationObject/index.js')
                                )
                            },
                            {
                                name: i18n.team,
                                activeName: 'team',
                                component: ErdcKit.asyncComponent(
                                    ELMP.func('erdc-epm-document/components/EpmDocumentTeam/index.js')
                                )
                            },
                            {
                                name: i18n.change,
                                activeName: 'change',
                                basicProps: {
                                    className: viewCfg.epmDocumentViewTableMap.className
                                },
                                component: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/Change/index.js'))
                            },
                            {
                                name: i18n.history,
                                activeName: 'historyRecord',
                                basicProps: {
                                    className: viewCfg.epmDocumentViewTableMap.className,
                                    toolActionConfig: viewCfg.EPMHistoryOperate || {},
                                    viewTableConfig: (config) => {
                                        config.columns.splice(2, 0, {
                                            attrName: 'visualizationInitUrl',
                                            label: i18n.visualizationInitUrl // 可视化初始化URL
                                        });
                                        return {
                                            ...config
                                        };
                                    }
                                },
                                component: ErdcKit.asyncComponent(
                                    ELMP.resource('erdc-cbb-components/HistoryRecord/index.js')
                                )
                            },
                            {
                                name: i18n.processInfo,
                                activeName: 'processInformation',
                                basicProps: {
                                    className: viewCfg.epmDocumentViewTableMap.className
                                },
                                component: ErdcKit.asyncComponent(
                                    ELMP.resource('erdc-cbb-components/ProcessInfo/index.js')
                                )
                            },
                            {
                                name: i18n.used,
                                activeName: 'used',
                                basicProps: {
                                    className: viewCfg.epmDocumentViewTableMap.className
                                },
                                component: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/InUse/index.js'))
                            }
                        ]
                    }
                };

                if (customConfig && _.isFunction(customConfig)) {
                    return customConfig(viewCfg.epmDocumentViewTableMap.className, defaultConfig);
                } else return defaultConfig;
            }
        };
    };
});
