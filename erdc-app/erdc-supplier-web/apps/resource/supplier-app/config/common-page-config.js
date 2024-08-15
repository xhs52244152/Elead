define(['erdc-kit', 'erdcloud.store', 'underscore'], function () {
    const ErdcKit = require('erdc-kit');
    const FamStore = require('erdcloud.store');
    const getViewTableMapping =
        FamStore.getters?.['pdmSupplierStore/getViewTableMapping'] ||
        (() => {
            return {};
        });
    const supplierMapping = getViewTableMapping({ tableName: 'supplier' });
    const _ = require('underscore');

    return {
        'erd.cloud.pdm.manufacturer.entity.EtManufacturer': () => {
            // 上下文ContainerKey
            const containerKey = 'erd.cloud.foundation.core.container.entity.ScalableContainer';

            return {
                create: {
                    title: '创建供应商',
                    layoutName: 'CREATE',
                    slots: {
                        formBefore: ErdcKit.asyncComponent(ELMP.resource('erdc-pdm-components/BasicInfo/index.js')),
                        formSlots: {
                            files: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/UploadFileList/index.js'))
                        }
                    },
                    props: {
                        formBefore(vm) {
                            return {
                                formConfigs: [
                                    {
                                        field: 'typeReference',
                                        component: 'custom-select',
                                        label: '类型',
                                        required: true,
                                        props: {
                                            clearable: true,
                                            placeholder: '请选择类型',
                                            defaultSelectFirst: true,
                                            row: {
                                                componentName: 'virtual-select',
                                                clearNoData: true,
                                                requestConfig: {
                                                    url: '/fam/type/typeDefinition/findAccessTypes',
                                                    viewProperty: 'displayName',
                                                    valueProperty: 'typeOid',
                                                    params: {
                                                        typeName: supplierMapping?.className,
                                                        containerRef: FamStore?.state?.space?.context?.oid || ''
                                                    }
                                                }
                                            }
                                        },
                                        // 数据变化时触发回调
                                        listeners: {
                                            callback: ({ selected: data }) => {
                                                if (data?.typeOid && _.isFunction(vm?.renderLayoutForm)) {
                                                    vm.renderLayoutForm(data?.typeName || '', data?.typeOid || '');
                                                }
                                            }
                                        },
                                        col: 12
                                    },
                                    {
                                        field: 'containerRef',
                                        component: 'custom-select',
                                        label: '上下文',
                                        required: true,
                                        props: {
                                            clearable: false,
                                            filterable: true,
                                            placeholderLangKey: 'pleaseSelect',
                                            row: {
                                                componentName: 'virtual-select',
                                                requestConfig: {
                                                    // 请求接口的配置对象
                                                    url: '/fam/listByKey',
                                                    params: {
                                                        className: containerKey
                                                    },
                                                    viewProperty: 'displayName', // 显示的label的key（如果里面也配置，取里面的）
                                                    valueProperty: 'oid' // 显示value的key（如果里面也配置，取里面的）
                                                    // 其他的请求配置，比如参数，请求拦截，响应拦截等等，axios支持的都可以
                                                },
                                                clearNoData: true
                                            }
                                        },
                                        col: 12
                                    },
                                    {
                                        field: 'name',
                                        component: 'erd-input',
                                        label: '供应商名称',
                                        required: true,
                                        props: {
                                            maxlength: 64,
                                            clearable: true,
                                            placeholder: '请输入供应商名称'
                                        },
                                        col: 12
                                    },
                                    {
                                        field: 'abbreviation',
                                        component: 'erd-input',
                                        label: '供应商简称',
                                        props: {
                                            maxlength: 64,
                                            clearable: true,
                                            placeholder: '请输入供应商简称'
                                        },
                                        col: 12
                                    },
                                    {
                                        field: 'manufacturerTypeEnum',
                                        component: 'custom-select',
                                        label: '供应商类型',
                                        props: {
                                            clearable: true,
                                            placeholder: '请选择供应商类型',
                                            defaultSelectFirst: true,
                                            row: {
                                                componentName: 'custom-virtual-enum-select',
                                                enumClass: 'erd.cloud.pdm.manufacturer.enums.ManufacturerTypeEnum'
                                            }
                                        },
                                        col: 12
                                    }
                                ]
                            };
                        },
                        formSlotsProps() {
                            return {
                                files: {
                                    className: supplierMapping?.className
                                }
                            };
                        }
                    },
                    hooks: {
                        beforeSubmit: function ({ formData, next, vm }) {
                            let contentSet = [];
                            formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                            formData.containerRef = vm?.$store?.state?.app?.container?.oid;
                            // 组装附件格式
                            ({ value: contentSet } = _.find(
                                formData.attrRawList,
                                (item) => item.attrName === 'files'
                            ) || { value: [] });
                            contentSet = _.filter(contentSet, (item) => item.role !== 'PRIMARY');
                            // 去除默认附件数据源
                            formData.attrRawList = _.filter(
                                formData.attrRawList,
                                (item) => !['typeReference', 'files'].includes(item.attrName)
                            );
                            formData = {
                                ...formData,
                                contentSet
                            };
                            delete formData.oid;
                            let tip = '供应商创建成功';
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
                        formBefore: ErdcKit.asyncComponent(ELMP.resource('erdc-pdm-components/BasicInfo/index.js')),
                        formSlots: {
                            files: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/UploadFileList/index.js'))
                        }
                    },
                    props: {
                        formBefore: {
                            formConfigs: [
                                {
                                    field: 'typeReference',
                                    component: 'custom-select',
                                    label: '类型',
                                    readonly: true,
                                    props: {
                                        clearable: true,
                                        placeholder: '请选择类型',
                                        defaultSelectFirst: true,
                                        row: {
                                            componentName: 'virtual-select',
                                            clearNoData: true,
                                            requestConfig: {
                                                url: '/fam/type/typeDefinition/findAccessTypes',
                                                viewProperty: 'displayName',
                                                valueProperty: 'typeOid',
                                                params: {
                                                    typeName: supplierMapping?.className,
                                                    containerRef: FamStore?.state?.space?.context?.oid || ''
                                                }
                                            }
                                        }
                                    },
                                    col: 12
                                },
                                {
                                    field: 'containerRef',
                                    component: 'custom-select',
                                    label: '上下文',
                                    readonly: true,
                                    props: {
                                        clearable: false,
                                        filterable: true,
                                        placeholderLangKey: 'pleaseSelect',
                                        row: {
                                            componentName: 'virtual-select',
                                            requestConfig: {
                                                // 请求接口的配置对象
                                                url: '/fam/listByKey',
                                                params: {
                                                    className: containerKey
                                                },
                                                viewProperty: 'displayName', // 显示的label的key（如果里面也配置，取里面的）
                                                valueProperty: 'oid' // 显示value的key（如果里面也配置，取里面的）
                                                // 其他的请求配置，比如参数，请求拦截，响应拦截等等，axios支持的都可以
                                            },
                                            clearNoData: true
                                        }
                                    },
                                    col: 12
                                },
                                {
                                    field: 'name',
                                    component: 'erd-input',
                                    label: '供应商名称',
                                    required: true,
                                    props: {
                                        maxlength: 64,
                                        clearable: true,
                                        placeholder: '请输入供应商名称'
                                    },
                                    col: 12
                                },
                                {
                                    field: 'abbreviation',
                                    component: 'erd-input',
                                    label: '供应商简称',
                                    props: {
                                        maxlength: 64,
                                        clearable: true,
                                        placeholder: '请输入供应商简称'
                                    },
                                    col: 12
                                },
                                {
                                    field: 'manufacturerTypeEnum',
                                    component: 'custom-select',
                                    label: '供应商类型',
                                    props: {
                                        clearable: true,
                                        placeholder: '请选择供应商类型',
                                        defaultSelectFirst: true,
                                        row: {
                                            componentName: 'custom-virtual-enum-select',
                                            enumClass: 'erd.cloud.pdm.manufacturer.enums.ManufacturerTypeEnum'
                                        }
                                    },
                                    col: 12
                                }
                            ]
                        },
                        formSlotsProps(vm) {
                            return {
                                files: {
                                    className: supplierMapping?.className,
                                    oid: vm?.formData?.oid,
                                    isCheckout: true
                                }
                            };
                        }
                    },
                    hooks: {
                        beforeEcho: function ({ rawData, next }) {
                            let data = ErdcKit.deserializeAttr(rawData, {
                                valueMap: {
                                    typeReference: ({ oid }) => {
                                        return oid || '';
                                    },
                                    containerRef: ({ oid }) => {
                                        return oid || '';
                                    }
                                }
                            });
                            next(data);
                        },
                        beforeSubmit: function ({ formData, next, vm }) {
                            let contentSet = [];
                            formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                            formData.containerRef = vm?.$store?.state?.app?.container?.oid;
                            // 组装附件格式
                            ({ value: contentSet } = _.find(
                                formData.attrRawList,
                                (item) => item.attrName === 'files'
                            ) || { value: [] });
                            contentSet = _.filter(contentSet, (item) => item.role !== 'PRIMARY');
                            // 去除默认附件数据源
                            formData.attrRawList = _.filter(
                                formData.attrRawList,
                                (item) => !['typeReference', 'files'].includes(item.attrName)
                            );
                            formData = {
                                ...formData,
                                contentSet
                            };
                            let tip = '供应商编辑成功';
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
                        },
                        formSlots: {
                            files: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/UploadFileList/index.js'))
                        }
                    },
                    props: {
                        formSlotsProps(vm) {
                            return {
                                files: {
                                    className: supplierMapping?.className,
                                    oid: vm?.formData?.oid,
                                    readonly: true
                                }
                            };
                        }
                    },
                    tabs: [
                        {
                            name: '详情信息',
                            activeName: 'detail'
                        },
                        {
                            name: '联系人',
                            activeName: 'linkManList',
                            component: ErdcKit.asyncComponent(ELMP.resource('supplier-components/SupplierLinkMan/index.js')),
                            basicProps: {}
                        }
                    ],
                    actionKey: 'PDM_LIBRARY_LIST_MENU',
                    keyAttrs: function (formData) {
                        return [
                            {
                                name: formData?.ownedByRef?.[0]?.displayName || '',
                                img: ELMP.resource('erdc-pdm-components/Images/info_f.png'),
                                label: '供应商管理员'
                            },
                            {
                                name: formData?.['lifecycleStatus.status'] || '',
                                img: ELMP.resource('erdc-pdm-components/Images/info_o.png'),
                                label: '生命周期状态'
                            },
                            {
                                name: formData?.updateBy?.[0]?.displayName || '',
                                img: ELMP.resource('erdc-pdm-components/Images/info_s.png'),
                                label: '联系人'
                            },
                            {
                                name: formData?.updateTime || '',
                                img: ELMP.resource('erdc-pdm-components/Images/info_t.png'),
                                label: '修改时间'
                            }
                        ];
                    },
                    layoutName: 'DETAIL',
                    hooks: {
                        beforeEcho: function ({ rawData, next }) {
                            let data = ErdcKit.deserializeAttr(rawData, {
                                valueMap: {
                                    'lifecycleStatus.status': ({ displayName }) => {
                                        return displayName || '';
                                    },
                                    'typeReference': ({ displayName }) => {
                                        return displayName || '';
                                    },
                                    'containerRef': ({ displayName }) => {
                                        return displayName || '';
                                    },
                                    'manufacturerTypeEnum': ({ displayName }) => {
                                        return displayName || '';
                                    },
                                    'ownedByRef': ({ users }) => {
                                        return users;
                                    },
                                    'updateBy': ({ users }) => {
                                        return users;
                                    }
                                }
                            });

                            next(data);
                        }
                    }
                }
            };
        }
    };
});
