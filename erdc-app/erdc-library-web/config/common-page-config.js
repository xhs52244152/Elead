define([ELMP.resource('library-space/locale/index.js')], function (locale) {
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');
    const ErdcHttp = require('erdcloud.http');
    const ErdcI18n = require('erdcloud.i18n');
    const _ = require('underscore');
    const getObjectMapping = ErdcStore.getters?.['pdmLibraryStore/getObjectMapping'];
    const libraryMapping = getObjectMapping({ objectName: 'library' });
    const templateMapping = getObjectMapping({ objectName: 'template' });
    const i18n = ErdcI18n.wrap(locale);

    return {
        [libraryMapping?.className]: () => {
            // 是否模板
            const { value: tmplTemplated } =
                ErdcStore?.state?.space?.object?.rawData?.['templateInfo.tmplTemplated'] || {};

            return {
                create: {
                    title: i18n?.['创建资源库'],
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
                        beforeSubmit: function ({ formData, next, vm }) {
                            formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                            formData.containerRef = vm.$store?.state?.app?.container?.oid;
                            delete formData.oid;
                            let tip = i18n?.['资源库创建成功'];

                            // 应后端要求，创建对象增加appName参数
                            formData.appName = 'PDM';

                            next(formData, tip);
                        }
                    }
                },
                edit: {
                    isNotTabs: true,
                    title: function (formData) {
                        return formData.name;
                    },
                    editableAttr: ['typeReference'],
                    layoutName: 'UPDATE',
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
                        beforeSubmit: function ({ formData, next, vm }) {
                            formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                            formData.containerRef = vm.$store?.state?.app?.container?.oid;
                            let tip = i18n?.['资源库编辑成功'];

                            // 适配子类型，增加typeReference参数
                            formData.typeReference = vm.innerTypeReference;
                            next(formData, tip);
                        }
                    }
                },
                detail: {
                    showSpecialAttr: true,
                    title: function (formData) {
                        return formData.name;
                    },
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
                                    return (
                                        this.formData?.lifecycleStatus?.status ||
                                        this.formData?.['lifecycleStatus.status'] ||
                                        ''
                                    );
                                }
                            }
                        }
                    },
                    props: {
                        formProps: {
                            schemaMapper: {
                                'templateInfo.templateReference': (templateReference) => {
                                    tmplTemplated && (templateReference.hidden = true);
                                }
                            }
                        }
                    },
                    actionKey: tmplTemplated ? templateMapping?.actionToolBarName : libraryMapping?.actionTableName,
                    keyAttrs: function (formData) {
                        return [
                            {
                                name: formData?.ownedByRef_defaultValue?.[0]?.displayName || '',
                                img: ELMP.resource('erdc-pdm-components/Images/info_f.png'),
                                label: i18n?.['库管员']
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
                    layoutName: 'DETAIL',
                    modelMapper: {
                        'lifecycleStatus.status': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'lifecycleStatus.lifecycleTemplateRef': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'templateInfo.templateReference': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'typeReference': (data, { displayName }) => {
                            return displayName || '';
                        }
                    },
                    hooks: {
                        // beforeEcho: function ({ rawData, next }) {
                        //     let data = ErdcKit.deserializeAttr(rawData, {
                        //         valueMap: {
                        //             'lifecycleStatus.status': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'lifecycleStatus.lifecycleTemplateRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'templateInfo.templateReference': ({ displayName }) => {
                        //                 return displayName || '';
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
                }
            };
        }
    };
});
