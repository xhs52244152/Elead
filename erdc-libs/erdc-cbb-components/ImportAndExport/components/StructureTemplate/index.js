define([
    'text!' + ELMP.resource('erdc-cbb-components/ImportAndExport/components/StructureTemplate/index.html'),
    ELMP.resource('erdc-cbb-components/ImportAndExport/locale/index.js'),
    ELMP.resource('erdc-pdm-app/store/index.js')
], function (template, locale, store) {
    const ErdcKit = require('erdc-kit');
    const ErdcI18n = require('erdcloud.i18n');
    const i18n = ErdcI18n.wrap(locale);

    return {
        name: 'StructureTemplate',
        template,
        components: {
            DefaultTemplate: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/ImportAndExport/components/DefaultTemplate/index.js')
            )
        },
        props: {
            className: {
                type: String,
                required: true
            },
            containerRef: String,
            displayName: {
                type: String,
                default: '空模板'
            },
            numberClassName: String
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/ImportAndExport/locale/index.js'),
                baseInfoUnfold: true,
                transferUnfold: true,
                formData: {},
                // 类型列表
                typeReferenceList: [],
                // 类型属性列表
                typeAttributeList: [],
                // 视图列表
                viewList: [],
                // 选中全量属性数据
                viewInfo: {}
            };
        },
        computed: {
            AttrsList() {
                const partClassName = store.state.tableViewMaping.part.className;
                const numberClassName = this.numberClassName || partClassName;
                return [
                    {
                        label: i18n?.['名称'],
                        value: `${partClassName}#name`,
                        isRequired: false
                    },
                    {
                        label: i18n?.['编码'],
                        value: `${numberClassName}#identifierNo`,
                        isRequired: true
                    }
                ];
            },
            ViewList() {
                const bomViewClassName = 'erd.cloud.pdm.part.entity.EtPartBomView';
                return [
                    {
                        label: i18n?.['视图'],
                        value: `${bomViewClassName}#viewRef`,
                        isRequired: true
                    }
                ];
            },
            requiredAttrs() {
                return this.typeAttributeList.filter((item) => item.isRequired);
            },
            formConfigs() {
                return [
                    {
                        field: 'typeReference',
                        component: 'custom-select',
                        label: this.i18n?.['类型'],
                        required: true,
                        props: {
                            clearable: false,
                            filterable: true,
                            placeholderLangKey: 'pleaseSelect',
                            row: {
                                componentName: 'constant-select',
                                clearNoData: true,
                                viewProperty: 'displayName',
                                valueProperty: 'typeOid',
                                referenceList: this.typeReferenceList
                            }
                        },
                        col: 12
                    }
                ];
            },
            initViewInfo() {
                return this.formData?.view && this.typeAttributeList?.length && new Date().getTime();
            }
        },
        watch: {
            'formData.typeReference': {
                handler: function (nv) {
                    // 获取可选类型属性列表
                    if (nv) {
                        this.getsAttributesList({ typeDefinitionId: nv });
                    }
                    const { setSearchKey } = this.$refs?.templateRef?.$refs?.transferRef || {};
                    _.isFunction(setSearchKey) && setSearchKey('');
                },
                immediate: true
            },
            'formData.view': {
                handler: function () {
                    const { setSearchKey } = this.$refs?.templateRef?.$refs?.transferRef || {};
                    _.isFunction(setSearchKey) && setSearchKey('');

                    // 更新可选字段信息
                    this.typeAttributeList = [...this.typeAttributeList];
                },
                immediate: true
            },
            'initViewInfo': {
                handler: function (nv) {
                    if (nv && !_.isArray(this.viewInfo?.[this.formData.view])) {
                        const val = _.filter(this.typeAttributeList, (item) => item?.isRequired) || [];
                        this.$set(this.viewInfo, this.formData.view, val);
                    }
                },
                immediate: true
            }
        },
        created() {
            this.getTypeReferenceList();
            this.getViewList();
        },
        methods: {
            // 获取可选属性列表
            getsAttributesList({ typeDefinitionId }) {
                const { AttrsList } = this;
                this.$famHttp({
                    url: '/fam/type/attribute/listTypeAttributeDtoByTypeDefinitionIds',
                    params: {
                        typeDefinitionId
                    }
                }).then((res) => {
                    let data = _.map(res?.data, (item) => {
                        const constraintDefinitionDto = item?.constraintDefinitionDto || {};
                        return {
                            label: item?.displayName || '',
                            value: item?.attrName || '',
                            isRequired: constraintDefinitionDto?.isRequired === true
                        };
                    });
                    data = AttrsList.concat(data);
                    this.typeAttributeList = data;
                });
            },
            // 获取类型
            getTypeReferenceList() {
                this.$famHttp({
                    url: '/fam/type/typeDefinition/findAccessTypes',
                    params: {
                        typeName: this.className,
                        containerRef: this.containerRef || '',
                        accessControl: false
                    }
                }).then((res) => {
                    this.typeReferenceList = res?.data || [];

                    // 默认选中第一个类型
                    if (_.isArray(this.typeReferenceList) && this.typeReferenceList?.length) {
                        const [typeReferenceInfo] = this.typeReferenceList;
                        this.$set(this.formData, 'typeReference', typeReferenceInfo?.typeOid || '');
                    }
                });
            },
            // 获取视图列表
            getViewList() {
                this.$famHttp({
                    url: '/context/view/all',
                    className: 'erd.cloud.pdm.part.view.entity.View'
                }).then((res) => {
                    this.viewList = res?.data || [];

                    // 默认选中第一个类型
                    if (_.isArray(this.viewList) && this.viewList?.length) {
                        const [viewList] = this.viewList;
                        this.$set(this.formData, 'view', viewList?.oid || '');
                    }
                });
            },
            // 获取数据
            getData() {
                const { ViewList } = this;

                const data = {};

                const baseInfo = _.find(this.typeReferenceList, { typeOid: this.formData?.typeReference }) || {};

                data.typeName = baseInfo?.typeName || '';
                data.tableSearchDto = {
                    className: data.typeName
                };

                const customParams = {
                    displayName: this.displayName,
                    baseColumnList: _.chain(this.requiredAttrs)
                        .map((item) => ({ attrName: item?.value, displayName: item?.label, name: item?.value }))
                        .value(),
                    selectValues: [
                        {
                            viewProperty: baseInfo.displayName,
                            valueProperty: baseInfo.typeOid
                        }
                    ]
                };

                const viewInfoCopy = _.pick(this.viewInfo, (value) => _.isArray(value) && value.length);
                if (!_.isEmpty(viewInfoCopy)) {
                    const classifies = _.map(viewInfoCopy, (value, key) => {
                        let classifyAttrs = [];
                        // 排除固定字段
                        classifyAttrs =
                            _.difference(
                                value,
                                _.filter(value, (item) => _.find(this.requiredAttrs, { value: item?.value }))
                            ) || [];
                        classifyAttrs =
                            _.map(classifyAttrs, (item) => ({
                                attrName: item?.value,
                                displayName: item?.label,
                                name: item?.value
                            })) || [];
                        return {
                            ...(_.pick(_.find(this.viewList, { oid: key }), 'name', 'displayName', 'oid') || {}),
                            classifyAttrs: classifyAttrs
                        };
                    });
                    customParams.classifies = classifies;
                }

                data.customParams = customParams;

                return data;
            },
            // 校验
            verify() {
                let valid = true;
                let message = null;
                if (!this.formData?.typeReference) {
                    valid = false;
                    message = this.i18n?.['请选择类型'];
                }
                if (!this.formData?.view) {
                    valid = false;
                    message = this.i18n?.['请选择视图'];
                }

                if (_.isEmpty(this.viewInfo) || _.every(this.viewInfo, (value) => !value?.length)) {
                    valid = false;
                    message = this.i18n?.['可选类型属性不能为空'];
                }
                return { valid, message };
            }
        }
    };
});
