define([ELMP.resource('product-space/locale/index.js')], function (locale) {
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');
    const ErdcHttp = require('erdcloud.http');
    const ErdcI18n = require('erdcloud.i18n');
    const _ = require('underscore');
    const getObjectMapping = ErdcStore.getters?.['pdmProductStore/getObjectMapping'];
    const productMapping = getObjectMapping({ objectName: 'product' });
    const templateMapping = getObjectMapping({ objectName: 'template' });
    const i18n = ErdcI18n.wrap(locale);

    return {
        [productMapping?.className]: () => {
            // 是否模板
            const { value: tmplTemplated } =
                ErdcStore?.state?.space?.object?.rawData?.['templateInfo.tmplTemplated'] || {};

            return {
                create: {
                    title: i18n?.['创建产品库'],
                    layoutName: 'CREATE',
                    slots: {
                        formBefore: ErdcKit.asyncComponent(ELMP.resource('erdc-pdm-components/BasicInfo/index.js'))
                    },
                    props: {
                        formBefore: {
                            containerRef: ErdcStore?.state?.space?.context?.oid || '',
                            onFieldChange({ currentData, setFormData }, { field }, newVal) {
                                if (field === 'typeReference' && newVal) {
                                    ErdcHttp({
                                        url: '/fam/type/typeDefinition/getTypeDefById',
                                        data: {
                                            oid: newVal
                                        },
                                        method: 'get'
                                    }).then((res) => {
                                        let { success, data } = res || {};
                                        if (success) {
                                            let { propertyMap = {} } = data || {};
                                            _.each(propertyMap, (value) => {
                                                if (value.name === 'lifecycleTemplateName') {
                                                    let { propertyValue = {} } = value || {};
                                                    if (propertyValue && propertyValue?.value) {
                                                        setTimeout(() => {
                                                            setFormData({
                                                                ...currentData,
                                                                'lifecycleStatus.lifecycleTemplateRef':
                                                                    propertyValue.value,
                                                                'lifecycleStatus': {
                                                                    lifecycleTemplateRef: propertyValue.value
                                                                }
                                                            });
                                                        }, 0);
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        },
                        formProps: {
                            schemaMapper: {
                                ownedByRef: ({ props }) => {
                                    props.isgetdisable = false;
                                }
                            }
                        }
                    },
                    hooks: {
                        // eslint-disable-next-line no-unused-vars
                        beforeSubmit({ formData, next, isSaveDraft }) {
                            const data = JSON.parse(JSON.stringify(formData));
                            data.typeReference = _.find(data.attrRawList, { attrName: 'typeReference' }).value;
                            data.attrRawList = data.attrRawList.filter(
                                (item) =>
                                    !['lifecycleStatus', 'lifecycleStatus.lifecycleTemplateRef'].includes(item.attrName)
                            );
                            data.containerRef = ErdcStore.state?.app?.container?.oid;

                            // 应后端要求，创建对象增加appName参数
                            data.appName = 'PDM';

                            next(data);
                        }
                    }
                },
                detail: {
                    showSpecialAttr: true,
                    title: function (formData) {
                        return formData?.name;
                    },
                    layoutName: 'DETAIL',
                    props: {
                        formProps: {
                            schemaMapper: {
                                'templateInfo.templateReference': (templateReference) => {
                                    tmplTemplated && (templateReference.hidden = true);
                                }
                            }
                        }
                    },
                    actionKey: tmplTemplated ? templateMapping?.actionToolBarName : productMapping?.actionTableName,
                    keyAttrs: function (formData) {
                        return [
                            {
                                name: formData?.ownedByRef_defaultValue?.[0]?.displayName || '',
                                img: ELMP.resource('erdc-pdm-components/Images/info_f.png'),
                                label: i18n?.['产品经理']
                            },
                            {
                                name: formData?.['lifecycleStatus.status'] || '',
                                img: ELMP.resource('erdc-pdm-components/Images/info_o.png'),
                                label: i18n?.['生命周期状态']
                            },
                            {
                                name: formData?.updateBy_defaultValue?.[0]?.displayName || '',
                                img: ELMP.resource('erdc-pdm-components/Images/info_s.png'),
                                label: i18n?.['修改者']
                            },
                            {
                                name: formData?.updateTime || '',
                                img: ELMP.resource('erdc-pdm-components/Images/info_t.png'),
                                label: i18n?.['修改时间']
                            }
                        ];
                    },
                    tabs: (() => {
                        let tabs = [{ name: i18n?.['详情信息'], activeName: 'detail' }];
                        if (!tmplTemplated) {
                            tabs.push({
                                name: i18n?.['成品列表'],
                                activeName: 'endItemsList',
                                component: ErdcKit.asyncComponent(
                                    ELMP.resource('product-space/components/ProductEndItemsList/index.js')
                                )
                            });
                        }
                        return tabs;
                    })(),
                    slots: {
                        titleAfter: {
                            template: `<erd-tag size="mini">{{status}}</erd-tag>`,
                            props: {
                                formData: {
                                    type: Object,
                                    default: () => {
                                        return {};
                                    }
                                }
                            },
                            computed: {
                                status() {
                                    return this.formData.lifecycleStatus?.status || '';
                                }
                            }
                        }
                    },
                    modelMapper: {
                        'lifecycleStatus.status': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'templateInfo.templateReference': (data, { displayName }) => {
                            return displayName;
                        },
                        'lifecycleStatus.lifecycleTemplateRef': (data, { displayName }) => {
                            return displayName;
                        },
                        'typeReference': (data, { displayName }) => {
                            return displayName || '';
                        }
                    },
                    hooks: {
                        // beforeEcho({ rawData, next }) {
                        //     let data = ErdcKit.deserializeAttr(rawData, {
                        //         valueMap: {
                        //             'lifecycleStatus.status': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'templateInfo.templateReference': ({ displayName }) => {
                        //                 return displayName;
                        //             },
                        //             'lifecycleStatus.lifecycleTemplateRef': ({ displayName }) => {
                        //                 return displayName;
                        //             },
                        //             'typeReference': ({ displayName }) => {
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
                        //             }
                        //         }
                        //     });
                        //     next(data);
                        // }
                    }
                },
                edit: {
                    isNotTabs: true,
                    title: function (formData) {
                        return formData.name;
                    },
                    layoutName: 'UPDATE',
                    editableAttr: ['typeReference'],
                    slots: {
                        formBefore: ErdcKit.asyncComponent(ELMP.resource('erdc-pdm-components/BasicInfo/index.js'))
                    },
                    props: {
                        formBefore: {
                            containerRef: ErdcStore?.state?.space?.context?.oid || ''
                        },
                        formProps: {
                            schemaMapper: {
                                'ownedByRef': ({ props }) => {
                                    props.isgetdisable = false;
                                },
                                'templateInfo.templateReference': (templateReference) => {
                                    tmplTemplated && (templateReference.hidden = true);
                                }
                            }
                        }
                    },
                    modelMapper: {
                        'lifecycleStatus.lifecycleTemplateRef': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'templateInfo.templateReference': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'typeReference': (data, { oid }) => {
                            return oid || '';
                        }
                    },
                    hooks: {
                        // beforeEcho: function ({ rawData, next }) {
                        //     let data = ErdcKit.deserializeAttr(rawData, {
                        //         valueMap: {
                        //             'lifecycleStatus.lifecycleTemplateRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'templateInfo.templateReference': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'typeReference': ({ oid }) => {
                        //                 return oid || '';
                        //             },
                        //             'ownedByRef': ({ users }) => {
                        //                 return users;
                        //             }
                        //         }
                        //     });

                        //     next(data);
                        // },
                        // eslint-disable-next-line no-unused-vars
                        beforeSubmit({ formData, next, isSaveDraft }) {
                            const data = JSON.parse(JSON.stringify(formData));
                            data.attrRawList = data.attrRawList.filter(
                                (item) =>
                                    !['lifecycleStatus', 'lifecycleStatus.lifecycleTemplateRef'].includes(item.attrName)
                            );
                            data.attrRawList = data.attrRawList.filter(
                                (item) => !_.isUndefined(item.value) && !_.isNull(item.value)
                            );
                            data.containerRef = ErdcStore.state?.app?.container?.oid;
                            next(data);
                        }
                    }
                }
            };
        }
    };
});
