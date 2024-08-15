define([
    ELMP.func('erdc-part/config/operateAction.js'),
    ELMP.func('erdc-part/config/viewConfig.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    ELMP.func('erdc-part/locale/index.js')
], function (operateAction, viewCfg, cbbUtils, locale) {
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');
    const ErdcHttp = require('erdcloud.http');
    const ErdcI18n = require('erdcloud.i18n');
    const i18n = ErdcI18n.wrap(locale);
    const ErdcRouter = require('erdcloud.router');
    const { $router, $route } = ErdcRouter.app || {};

    // 部件描述关系 / 部件参考关系
    function relationObj(data, responseData) {
        const { currentOid, masterRef, currentClassName, isRoleB, isOid, relationObjActive } = data;
        const oid = isRoleB ? (isOid ? currentOid : masterRef) : currentOid;
        const { prefixRoute, resourceKey } = $route?.meta || {};
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
            className: viewCfg.partViewTableMap.className,
            data: params,
            method: 'POST'
        }).then(() => {
            $router.push({
                path: `${prefixRoute.split(resourceKey)[0]}erdc-document/document/detail`,
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
                className: viewCfg.partViewTableMap.className,
                method: 'PUT'
            });
        };
    }
    // 结构跳转
    function structureJump() {
        this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
            const { prefixRoute, resourceKey } = this.$route?.meta || {};
            this.$router.push({
                path: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/detail`,
                query: {
                    ..._.pick(this.$route.query, (value, key) => {
                        return ['pid', 'typeOid'].includes(key) && value;
                    }),
                    activeName: 'structure',
                    oid: this.$route.query.rootOid,
                    componentRefresh: true,
                    routeRefresh: true
                }
            });
        });
    }

    /**
     * @param {(className:string, config:Object) => Object} customConfig - 修改自定义配置函数
     * */
    return (customConfig) => {
        return {
            [viewCfg.partViewTableMap.className]: () => {
                let defaultCreateConfig = {
                    title: i18n.createPart,
                    editableAttr: ['containerRef'],
                    layoutName: 'CREATE',
                    showDraftBtn: !$route?.query?.isNotNeedDraf,
                    slots: {
                        formBefore: ErdcKit.asyncComponent(ELMP.func('erdc-part/components/BasicInfo/index.js')),
                        formSlots: {
                            'attach-file': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/UploadFileList/index.js')
                            )
                        }
                    },
                    props: {
                        formBefore: {
                            containerRef: ErdcStore?.state?.space?.context?.oid || ''
                        },
                        formSlotsProps() {
                            return {
                                'attach-file': {
                                    className: viewCfg.partViewTableMap.className
                                }
                            };
                        }
                    },
                    hooks: {
                        // 关闭
                        beforeCancel: function ({ goBack, vm }) {
                            if (vm.$route.query.parentOid) {
                                structureJump.call(vm);
                            } else {
                                goBack();
                            }
                        },
                        beforeSubmit: async function ({ formData, next, isSaveDraft, vm }) {
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
                            let attrRawList = formData.attrRawList.filter((item) => {
                                if (
                                    item.attrName === 'containerRef' ||
                                    item.attrName === 'typeReference' ||
                                    item.attrName === 'classifyReference' ||
                                    item.attrName === 'folderRef'
                                ) {
                                    temp[item.attrName] = item.value;
                                }
                                // 后端要求value格式不要对象,要是字符串
                                if (_.isObject(item.value)) {
                                    item.value = item?.value?.value;
                                }
                                return (
                                    !_.isUndefined(item.value) &&
                                    !_.isNull(item.value) &&
                                    item.attrName !== 'containerRef' &&
                                    item.attrName !== 'typeReference' &&
                                    item.attrName !== 'classifyReference' &&
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

                            // 从附件组件中获取附件数据
                            const attachFile =
                                await vm?.$refs?.detail?.[0]?.$refs?.['attach-file']?.[0]?.submit(isSaveDraft);
                            if (!attachFile.status) return;

                            const params = {
                                attrRawList,
                                className: viewCfg.partViewTableMap.className,
                                typeReference: temp.typeReference,
                                containerRef: temp.containerRef ?? containerRef,
                                folderRef: temp.folderRef,
                                classifyReference: temp.classifyReference,
                                contentSet: []
                            };
                            !_.isEmpty(attachFile.data) && params.contentSet.push(...attachFile.data);

                            if (isSaveDraft) {
                                params.isDraft = true;
                            }

                            // 应后端要求，创建对象增加appName参数
                            params.appName = 'PDM';

                            next(params);
                        },
                        afterSubmit({ responseData, vm, cancel }) {
                            const { prefixRoute, resourceKey } = vm.$route?.meta || {};
                            // 结构插入新得,创建完部件,就得调插入接口
                            if (vm.$route.query.parentOid) {
                                let data = {
                                    brotherMasterOid: vm.$route.query.brotherMasterOid,
                                    childOidList: [responseData],
                                    filterVo: {},
                                    parentOid: vm.$route.query?.parentOid,
                                    bomViewOid: vm.$route.query?.bomViewOid,
                                    viewOid: vm.$route.query?.viewOid
                                };
                                ErdcHttp({
                                    url: '/part-yty/bom/create',
                                    data,
                                    className: responseData.split(':')[1],
                                    method: 'POST'
                                })
                                    .then((res) => {
                                        let { success } = res || {};
                                        if (success) {
                                            structureJump.call(vm);
                                        }
                                    })
                                    .catch(() => {
                                        structureJump.call(vm);
                                    });
                            } else if (vm.$route.query.currentOid) {
                                let isOid = vm.$route.query.isOid === 'true' || vm.$route.query.isOid === true;
                                relationObj({ ...vm.$route.query, isOid }, responseData);
                            } else if (vm.$route.query.workspaceOid) {
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
                                        path: 'part/list',
                                        query: _.pick(vm.$route.query, (value, key) => {
                                            return ['pid', 'typeOid'].includes(key) && value;
                                        })
                                    });
                                });
                            }
                        }
                    }
                };
                let defaultEditConfig = {
                    title: i18n?.editPart,
                    layoutName: 'UPDATE',
                    isNotTabs: true,
                    showDraftBtn: true,
                    slots: {
                        formBefore: ErdcKit.asyncComponent(ELMP.func('erdc-part/components/BasicInfo/index.js')),
                        formSlots: {
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
                                    className: viewCfg.partViewTableMap.className,
                                    oid: vm?.containerOid,
                                    isCheckout: stateValue === 'WORKING'
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
                        },
                        classifyReference: (data, { displayName }) => {
                            return displayName || '';
                        }
                    },
                    hooks: {
                        // beforeEcho: function ({ rawData, next, data }) {
                        //     // 根据分类属性联动带出的业务管理配置属性
                        //     if (!_.isEmpty(data.classifyRawData)) {
                        //         rawData = { ...rawData, ...data.classifyRawData };
                        //     }
                        //     let result = ErdcKit.deserializeAttr(rawData, {
                        //         valueMap: {
                        //             containerRef: ({ oid }) => {
                        //                 return oid || '';
                        //             },
                        //             typeReference: ({ oid }) => {
                        //                 return oid || '';
                        //             },
                        //             folderRef: ({ value }) => {
                        //                 return value || '';
                        //             },
                        //             classifyReference: ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             defaultUnit: (row, { defaultUnit }) => {
                        //                 return {
                        //                     value: defaultUnit?.value ?? ''
                        //                 };
                        //             }
                        //         }
                        //     });

                        //     result.typeReferenceShow = rawData.typeReference.displayName;
                        //     result.folderShow = rawData.folderRef.displayName;
                        //     next(result);
                        // },
                        // 关闭
                        beforeCancel: function ({ formData, vm }) {
                            const { prefixRoute, resourceKey } = vm.$route?.meta || {};
                            //从工作区相关对象页面 新增跳转过来
                            if (vm.$route.query?.workspaceOid) {
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
                                    if (formData['lifecycleStatus.status'] === 'DRAFT') {
                                        vm.$router.push({
                                            path: 'part/list',
                                            query: _.pick(vm.$route.query, (value, key) => {
                                                return ['pid', 'typeOid'].includes(key) && value;
                                            })
                                        });
                                    } else {
                                        const { prefixRoute, resourceKey } = vm.$route?.meta || {};
                                        vm.$router.push({
                                            path: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/detail`,
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
                        beforeSubmit: async function ({ formData, next, isSaveDraft, sourceData, vm }) {
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
                                    // item.attrName === 'classifyReference' ||
                                    item.attrName === 'folderRef'
                                ) {
                                    temp[item.attrName] = item.value;
                                }
                                // 后端要求value格式不要对象,要是字符串
                                if (_.isObject(item.value)) {
                                    item.value = item?.value?.value;
                                }
                                // 分类数据格式处理
                                if (item.attrName === 'classifyReference') {
                                    item.value = item.value.includes('OR:')
                                        ? item.value
                                        : sourceData?.classifyReference?.oid || '';
                                }
                                return (
                                    !_.isUndefined(item.value) &&
                                    !_.isNull(item.value) &&
                                    item.attrName !== 'containerRef' &&
                                    item.attrName !== 'typeReference' &&
                                    item.attrName !== 'idKey' &&
                                    item.attrName !== 'folderRef'
                                    // item.attrName !== 'classifyReference'
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
                            const attachFile =
                                await vm?.$refs?.detail?.[0]?.$refs?.['attach-file']?.[0]?.submit(isSaveDraft);
                            if (!attachFile.status) return;

                            const params = {
                                oid: formData.oid ?? '',
                                attrRawList,
                                className: viewCfg.partViewTableMap.className,
                                typeReference: temp.typeReference,
                                containerRef: vm.$store?.state?.app?.container?.oid,
                                folderRef: temp.folderRef,
                                classifyReference: temp.classifyReference || sourceData?.classifyReference?.oid || '',
                                contentSet: []
                            };
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
                                    className: viewCfg.partViewTableMap.className,
                                    title: i18n?.['保存'],
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
                        async afterSubmit({ responseData, vm, isSaveDraft }) {
                            const { prefixRoute, resourceKey } = vm.$route?.meta || {};
                            const path = isSaveDraft ? 'part/list' : 'part/detail';

                            let newData = null;
                            if (handleCheckIn) {
                                newData = await handleCheckIn(responseData);
                                if (!newData?.success) {
                                    return;
                                }
                                responseData = newData?.data;
                                handleCheckIn = null;
                            }
                            if (vm.$route.query.workspaceOid) {
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
                                        path,
                                        query: {
                                            ..._.pick(vm.$route.query, (value, key) => {
                                                return ['pid', 'typeOid'].includes(key) && value;
                                            }),
                                            oid: responseData,
                                            title: i18n?.partDetail,
                                            className: viewCfg.partViewTableMap.className
                                        }
                                    });
                                });
                            }
                        }
                    }
                };
                let defaultDetailConfig = {
                    title: function (formData, caption) {
                        return caption;
                    },
                    layoutName: 'DETAIL',
                    actionKey: viewCfg.partViewTableMap.rowActionName,
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
                                'attach-file': {
                                    className: viewCfg.partViewTableMap.className,
                                    oid: vm?.containerOid,
                                    isCheckout: stateValue === 'WORKING'
                                }
                            };
                        },
                        formProps(formVue) {
                            return formVue
                                ? {
                                      modelMapper: {
                                          //防止页面显示成对象在网页上 报错
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
                                              return row?.oid || '';
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
                                          // 'ownedByRef': (data, { users }) => {
                                          //     return users;
                                          // },
                                          // 'createBy': (data, { users }) => {
                                          //     return users;
                                          // },
                                          // 'updateBy': (data, { users }) => {
                                          //     return users;
                                          // },
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
                            return row?.oid || '';
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
                                return vm.$store.dispatch('route/delVisitedRoute', vm.$route).then((visitedRoutes) => {
                                    vm.$router.replace(
                                        visitedRoutes.find((item) => item.path === vm?.from?.path) || vm?.$route
                                    );
                                });
                            }
                            return goBack();
                        }
                        // beforeEcho({ rawData, next, data }) {
                        //     // 根据分类属性联动带出的业务管理配置属性
                        //     if (!_.isEmpty(data.classifyRawData)) {
                        //         rawData = { ...rawData, ...data.classifyRawData };
                        //     }
                        //     let result = ErdcKit.deserializeAttr(rawData, {
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
                        //                 return row?.oid || '';
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
                        //             }
                        //         }
                        //     });

                        //     next(result);
                        // }
                    },
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
                                    i18nPath: ELMP.func('erdc-part/locale/index.js')
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
                                >${i18n?.toLatestVersion}</erd-button>
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
                                        if (!val) return;
                                        this.getCurrentVersionStatus(val);
                                    },
                                    immediate: true
                                }
                            },
                            methods: {
                                getCurrentVersionStatus(oid) {
                                    let className = oid?.split(':')?.[1];
                                    return this.$famHttp({
                                        url: '/part/common/is/latest/version',
                                        className,
                                        params: {
                                            oid
                                        },
                                        method: 'get'
                                    }).then((resp) => {
                                        if (resp.success) {
                                            this.isLatest = resp.data;
                                        }
                                    });
                                },
                                latestVersion() {
                                    let className = this.oid?.split(':')?.[1];
                                    this.$famHttp({
                                        url: '/part/common/to/latest',
                                        className,
                                        params: {
                                            oid: this.oid
                                        },
                                        method: 'GET'
                                    }).then((res) => {
                                        if (res.success) {
                                            cbbUtils.goToDetail.call(this, res.data.rawData);
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
                            'classify-reference': {
                                template: `
                                    <erd-show-tooltip
                                        class="w-100p"
                                        placement="top"
                                        :content="classifyReference"
                                        :enterable="false"
                                        :flex="false"
                                        :open-delay="100"
                                    >
                                        <template v-slot:show-tooltip-title>
                                            <span class="title_text">{{classifyReference}}</span>
                                        </template>
                                    </erd-show-tooltip>
                                `,
                                props: {
                                    vm: {
                                        type: Object,
                                        default: () => {
                                            return {};
                                        }
                                    }
                                },
                                computed: {
                                    classifyReference() {
                                        return this.vm?.sourceData?.classifyReference?.displayName || '--';
                                    }
                                }
                            },
                            'lifecyle-status': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/LifecyleStep/index.js')
                            )
                        }
                    },
                    tabs: [
                        {
                            name: i18n?.property,
                            activeName: 'detail'
                        },
                        {
                            name: i18n?.visual,
                            activeName: 'Visualization',
                            component: ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/Visualization/index.js')
                            ),
                            basicProps(vm) {
                                return {
                                    // 部件这里根据有无图纸判断是否可以启动转图任务
                                    showTools: vm?.formData?.['defaultDerivedImageOid']
                                };
                            }
                        },
                        {
                            name: i18n?.structure,
                            activeName: 'structure',
                            component: ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/ObjectConstruction/index.js')
                            )
                        },
                        {
                            name: i18n?.relationObj,
                            activeName: 'relationObj',
                            component: ErdcKit.asyncComponent(
                                ELMP.func('erdc-part/components/PartRelationObject/index.js')
                            )
                        },
                        {
                            name: i18n?.team,
                            activeName: 'team',
                            component: ErdcKit.asyncComponent(ELMP.func('erdc-part/components/PartTeam/index.js'))
                        },
                        {
                            name: i18n?.change,
                            activeName: 'change',
                            basicProps: {
                                className: viewCfg.partViewTableMap.className
                            },
                            component: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/Change/index.js'))
                        },
                        {
                            name: i18n?.history,
                            activeName: 'historyRecord',
                            basicProps: {
                                className: viewCfg.partViewTableMap.className,
                                toolActionConfig: viewCfg.partHistoryOperate || {}
                            },
                            component: ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/HistoryRecord/index.js')
                            )
                        },
                        {
                            name: i18n?.processInfo,
                            activeName: 'processInformation',
                            basicProps: {
                                className: viewCfg.partViewTableMap.className
                            },
                            component: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/ProcessInfo/index.js'))
                        },
                        {
                            name: i18n?.used,
                            activeName: 'used',
                            component: ErdcKit.asyncComponent(ELMP.func('erdc-part/components/PartInUse/index.js'))
                        },
                        {
                            name: i18n?.replace,
                            activeName: 'partReplace',
                            component: ErdcKit.asyncComponent(ELMP.func('erdc-part/components/PartReplace/index.js'))
                        },
                        {
                            name: i18n?.bomView,
                            activeName: 'bomView',
                            component: ErdcKit.asyncComponent(ELMP.resource('erdc-pdm-components/BomView/index.js')),
                            basicProps: (vm) => {
                                return {
                                    info: {
                                        masterRef: vm?.formData?.masterRef
                                    },
                                    className: viewCfg.partViewTableMap.className
                                };
                            }
                        }
                    ]
                };
                if (customConfig) {
                    return customConfig(viewCfg.partViewTableMap.className, {
                        create: defaultCreateConfig,
                        edit: defaultEditConfig,
                        detail: defaultDetailConfig
                    });
                }
                return {
                    create: defaultCreateConfig,
                    edit: defaultEditConfig,
                    detail: defaultDetailConfig
                };
            }
        };
    };
});
