define([
    ELMP.func('erdc-workspace/config/viewConfig.js'),
    ELMP.func('erdc-workspace/locale/index.js'),
    ELMP.resource('erdc-pdm-components/CoDesignConfig/index.js')
], function (viewCfg, locale, coDesignConfig) {
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');
    const ErdcI18n = require('erdcloud.i18n');
    const i18n = ErdcI18n.wrap(locale);
    const { isDesktop } = coDesignConfig;

    return (customConfig) => {
        return {
            [viewCfg.workspaceViewTableMap.className]: () => {
                let defaultEditConfig = {
                    isNotTabs: true,
                    title: function (formData, caption) {
                        return `${i18n.edit} ${caption}`;
                    },
                    layoutName: 'UPDATE',
                    slots: {
                        formBefore: ErdcKit.asyncComponent(ELMP.func('erdc-workspace/components/BasicInfo/index.js')),
                        formSlots: {
                            'work-space-source': ErdcKit.asyncComponent(
                                ELMP.func('erdc-workspace/components/WorkspaceSource/index.js')
                            )
                        }
                    },
                    props: {
                        formBefore: {
                            containerRef: ErdcStore?.state?.space?.context?.oid || ''
                        },
                        formProps: {
                            // 自定义组装formData数据
                            customAssemblyData(data) {
                                const { partConfigSpecRawVo, epmDocConfigSpecRawVo } = data || {};
                                return {
                                    parts_configType: partConfigSpecRawVo?.rawData?.configType,
                                    epmDoc_configType: epmDocConfigSpecRawVo?.rawData?.configType
                                };
                            }
                        }
                    },
                    modelMapper: {
                        name: (data, { displayName }) => {
                            return displayName || '';
                        },
                        containerRef: (data, { oid }) => {
                            return oid || '';
                        },
                        typeReference: (data, { displayName }) => {
                            return displayName || '';
                        },
                        partTargetSubfolderRef: (data, { value }) => {
                            return value || '';
                        },
                        epmDocTargetSubfolderRef: (data, { value }) => {
                            return value || '';
                        },
                        description: (data, { displayName }) => {
                            return displayName || '';
                        },
                        parts_configType: (data, { value }) => {
                            return value || '';
                        },
                        epmDoc_configType: (data, { value }) => {
                            return value || '';
                        }
                    },
                    hooks: {
                        // beforeEcho: function ({ rawData, next, data }) {
                        //     let { partConfigSpecRawVo, epmDocConfigSpecRawVo } = data;
                        //     let parts_configType = _.extend({}, partConfigSpecRawVo?.rawData?.configType, {
                        //         attrName: 'parts_configType'
                        //     });
                        //     let epmDoc_configType = _.extend({}, epmDocConfigSpecRawVo?.rawData?.configType, {
                        //         attrName: 'epmDoc_configType'
                        //     });
                        //     rawData = _.extend({}, rawData, { parts_configType, epmDoc_configType });
                        //     let formData = ErdcKit.deserializeAttr(rawData, {
                        //         valueMap: {
                        //             name: ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             containerRef: ({ oid }) => {
                        //                 return oid || '';
                        //             },
                        //             typeReference: ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             partTargetSubfolderRef: ({ value }) => {
                        //                 return value || '';
                        //             },
                        //             epmDocTargetSubfolderRef: ({ value }) => {
                        //                 return value || '';
                        //             },
                        //             description: ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             parts_configType: ({ value }) => {
                        //                 return value || '';
                        //             },
                        //             epmDoc_configType: ({ value }) => {
                        //                 return value || '';
                        //             }
                        //         }
                        //     });
                        //     formData['partConfigSpecRawVo'] = partConfigSpecRawVo?.rawData;
                        //     formData['epmDocConfigSpecRawVo'] = epmDocConfigSpecRawVo?.rawData;
                        //     next(formData);
                        // },
                        // eslint-disable-next-line no-unused-vars
                        async beforeSubmit({ formData, next, isSaveDraft, sourceData, vm }) {
                            const attrRawList = formData.attrRawList.filter((item) => {
                                return (
                                    !_.isUndefined(item.value) &&
                                    !_.isNull(item.value) &&
                                    item.attrName !== 'containerRef' &&
                                    item.attrName !== 'typeReference'
                                );
                            });
                            const source = await vm?.$refs?.detail?.[0]?.$refs?.['work-space-source']?.[0]?.submit();
                            let relationList = [];
                            for (var key in source) {
                                if (vm.formData[key]) {
                                    let item = vm.formData[key];
                                    relationList.push({
                                        attrRawList: source[key],
                                        className: item?.idKey?.value,
                                        oid: item?.oid?.value
                                    });
                                }
                            }
                            const params = {
                                oid: formData.oid ?? '',
                                attrRawList,
                                relationList,
                                className: viewCfg.workspaceViewTableMap.className,
                                typeReference: sourceData.typeReference?.oid,
                                containerRef: sourceData.containerRef?.oid
                            };
                            next(params);
                        },
                        afterSubmit: function ({ responseData, vm, cancel }) {
                            const originPath = vm.$route.query.originPath;
                            if (originPath === 'workspace/edit') {
                                vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                    vm.$router.replace({
                                        path: 'workspace/detail',
                                        query: {
                                            ..._.pick(vm.$route.query, (value, key) => {
                                                return ['pid', 'typeOid'].includes(key) && value;
                                            }),
                                            oid: responseData
                                        }
                                    });
                                });
                            } else {
                                cancel();
                            }
                        },
                        beforeCancel({ formData, goBack, vm }) {
                            if (vm.$route.query.origin == 'list') {
                                goBack();
                            } else {
                                vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                    vm.$router.replace({
                                        path: 'workspace/detail',
                                        query: {
                                            ..._.pick(vm.$route.query, (value, key) => {
                                                return ['pid', 'typeOid'].includes(key) && value;
                                            }),
                                            oid: formData?.oid
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
                    // eslint-disable-next-line no-unused-vars
                    icon: function (formData) {
                        return '';
                    },
                    layoutName: 'DETAIL',
                    actionKey: isDesktop
                        ? coDesignConfig.codesignWorkspaceViewTableMap.rowActionName
                        : viewCfg.workspaceViewTableMap.rowActionName,
                    actionParams: {
                        inTable: false,
                        isBatch: false
                    },
                    slots: {
                        formSlots: {
                            'work-space-source': ErdcKit.asyncComponent(
                                ELMP.func('erdc-workspace/components/WorkspaceSource/index.js')
                            ),
                            'info-description': {
                                template: `<div style="white-space:pre-wrap;">{{formData.description || ''}}</div>`,
                                props: {
                                    formData: {
                                        type: Object,
                                        default: () => {
                                            return {};
                                        }
                                    }
                                }
                            }
                        }
                    },
                    props: {
                        formProps: {
                            // 自定义组装formData数据
                            customAssemblyData(data) {
                                const { partConfigSpecRawVo, epmDocConfigSpecRawVo } = data || {};
                                return {
                                    parts_configType: partConfigSpecRawVo?.rawData?.configType,
                                    epmDoc_configType: epmDocConfigSpecRawVo?.rawData?.configType
                                };
                            }
                        }
                    },
                    modelMapper: {
                        name: (data, { displayName }) => {
                            return displayName || '';
                        },
                        containerRef: (data, { displayName }) => {
                            return displayName || '';
                        },
                        typeReference: (data, { displayName }) => {
                            return displayName || '';
                        },
                        partTargetSubfolderRef: (data, { displayName }) => {
                            return displayName || '';
                        },
                        epmDocTargetSubfolderRef: (data, { displayName }) => {
                            return displayName || '';
                        },
                        createTime: (data, { displayName }) => {
                            return displayName || '';
                        },
                        description: (data, { displayName }) => {
                            return displayName || '';
                        },
                        parts_configType: (data, { value }) => {
                            return value || '';
                        },
                        epmDoc_configType: (data, { value }) => {
                            return value || '';
                        }
                    },
                    hooks: {
                        // beforeEcho({ rawData, next, data }) {
                        //     let { partConfigSpecRawVo, epmDocConfigSpecRawVo } = data;
                        //     let parts_configType = _.extend({}, partConfigSpecRawVo.rawData.configType, {
                        //         attrName: 'parts_configType'
                        //     });
                        //     let epmDoc_configType = _.extend({}, epmDocConfigSpecRawVo.rawData.configType, {
                        //         attrName: 'epmDoc_configType'
                        //     });
                        //     rawData = _.extend({}, rawData, { parts_configType, epmDoc_configType });
                        //     const formData = ErdcKit.deserializeAttr(rawData, {
                        //         valueMap: {
                        //             name: ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             containerRef: ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             typeReference: ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             partTargetSubfolderRef: ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             epmDocTargetSubfolderRef: ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             createTime: ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             description: ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             parts_configType: ({ value }) => {
                        //                 return value || '';
                        //             },
                        //             epmDoc_configType: ({ value }) => {
                        //                 return value || '';
                        //             }
                        //         }
                        //     });
                        //     next(formData);
                        // }
                    },
                    showBackButton: false,
                    tabs: [
                        {
                            name: i18n.relationObj,
                            activeName: 'relationObj',
                            component: ErdcKit.asyncComponent(
                                ELMP.func('erdc-workspace/components/WorkspaceRelationObject/index.js')
                            )
                        },
                        {
                            name: i18n.baseInfo,
                            activeName: 'detail'
                        }
                    ]
                };

                if (customConfig) {
                    return customConfig(viewCfg.workspaceViewTableMap.className, {
                        showSpecialAttr: true,
                        edit: defaultEditConfig,
                        detail: defaultDetailConfig
                    });
                }

                return {
                    showSpecialAttr: true,
                    edit: defaultEditConfig,
                    detail: defaultDetailConfig
                };
            }
        };
    };
});
