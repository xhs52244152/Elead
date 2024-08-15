define(['text!' + ELMP.resource('erdc-cbb-components/ImportAndExport/components/EmptyTemplate/index.html')], function (
    template
) {
    const ErdcKit = require('erdc-kit');
    const TreeUtil = require('TreeUtil');

    return {
        name: 'EmptyTemplate',
        template,
        components: {
            DefaultTemplate: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/ImportAndExport/components/DefaultTemplate/index.js')
            ),
            Transfer: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/ImportAndExport/components/Transfer/index.js')
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
            }
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/ImportAndExport/locale/index.js'),
                baseInfoUnfold: true,
                transferUnfold: true,
                cateUnfold: true,
                formData: {
                    classify: []
                },
                // 类型列表
                typeReferenceList: [],
                // 类型属性列表
                typeAttributeList: [],
                // 分类列表
                classifyList: [],
                // 分类属性列表
                classAttributeList: [],
                // 选中类型属性数据
                typeAttrInfo: [],
                // 选中分类属性数据,
                classAttrInfo: {}
            };
        },
        computed: {
            formConfigs() {
                let { isShowClassify, classifyList, filterNodeMethod } = this;

                let config = [
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

                if (isShowClassify)
                    config.push({
                        field: 'classify',
                        component: 'erd-tree-select',
                        label: this.i18n?.['分类'],
                        props: {
                            data: JSON.parse(JSON.stringify(classifyList)),
                            filterNodeMethod,
                            filterable: true,
                            multiple: true,
                            nodeKey: 'oid',
                            checkRelation: 'irrelevance',
                            props: {
                                label: 'displayName',
                                children: 'children',
                                disabled: 'disabled'
                            }
                        },
                        col: 12
                    });

                return config;
            },
            // 当前选中类型数据
            typeReferenceInfo() {
                return _.find(this.typeReferenceList, { typeOid: this.formData?.typeReference || '' }) || {};
            },
            // 是否加载分类列表
            isGetClassify() {
                const { classifyEnable, classifyCode } = this.typeReferenceInfo || {};
                return classifyEnable && classifyCode;
            },
            // 是否显示分类属性面板
            isShowClassify() {
                return this.typeReferenceInfo?.classifyEnable && !!this.classifyList?.length;
            },
            initClassAttrInfo() {
                return this.formData.classifyReference?.oid && this.classAttributeList?.length && new Date().getTime();
            },
            // 分类选项禁用处理
            computedClassifyList() {
                let { classifyList, formData } = this;
                let selectedOids = formData.classify.map((item) => item.oid);
                let copyClassifyList = JSON.parse(JSON.stringify(classifyList));
                TreeUtil.doPreorderTraversal(copyClassifyList, {
                    childrenField: 'children',
                    every: (node) => {
                        this.$set(node, 'disabled', !selectedOids.includes(node.oid));
                    }
                });

                return copyClassifyList;
            }
        },
        watch: {
            'isGetClassify': {
                handler: function (nv) {
                    // 获取分类列表
                    if (nv) {
                        this.getClassify(nv);
                    }
                },
                immediate: true
            },
            'formData.typeReference': {
                handler: function (nv) {
                    // 获取可选类型属性列表
                    if (nv) {
                        const type = 'type';
                        this.getsAttributesList({ type, typeDefinitionId: nv });
                    }
                    this.typeAttrInfo = [];
                    this.classAttrInfo = {};
                    let { setSearchKey } = this.$refs?.templateRef?.$refs?.transferRef || {};
                    _.isFunction(setSearchKey) && setSearchKey('');
                    ({ setSearchKey } = this.$refs?.classifyTransferRef || {});
                    _.isFunction(setSearchKey) && setSearchKey('');
                },
                immediate: true
            },
            'formData.classifyReference.oid': {
                handler: function (nv) {
                    // 获取可选分类属性列表
                    if (nv) {
                        const type = 'classify';
                        this.getsAttributesList({ type, typeDefinitionId: nv });
                    }
                    const { setSearchKey } = this.$refs?.classifyTransferRef || {};
                    _.isFunction(setSearchKey) && setSearchKey('');
                },
                immediate: true
            },
            'typeAttributeList': {
                handler: function (nv) {
                    this.typeAttrInfo = _.filter(nv, (item) => item?.isRequired) || [];
                },
                immediate: true
            },
            'initClassAttrInfo': {
                handler: function (nv) {
                    if (nv && !_.isArray(this.classAttrInfo?.[this.formData.classifyReference.oid])) {
                        const val = _.filter(this.classAttributeList, (item) => item?.isRequired) || [];
                        this.$set(this.classAttrInfo, this.formData.classifyReference.oid, val);
                    }
                },
                immediate: true
            },
            'classAttrInfo': {
                handler: function (nv) {
                    // let classifyReference =
                    //     _.filter(this.typeAttrInfo, (item) => item?.value === 'classifyReference') || [];
                    // if (_.some(nv, (value) => _.isArray(value) && value?.length)) {
                    //     if (!classifyReference?.length) {
                    //         classifyReference =
                    //             _.filter(this.typeAttributeList, (item) => item?.value === 'classifyReference') || [];
                    //     }
                    //     this.typeAttrInfo = _.union(this.typeAttrInfo, classifyReference);
                    // } else {
                    //     this.typeAttrInfo = _.difference(this.typeAttrInfo, classifyReference);
                    // }
                },
                immediate: true,
                deep: true
            },
            'typeAttrInfo': {
                handler: function (nv, ov) {
                    let classifyReference = _.find(ov, { value: 'classifyReference' });
                    if (!_.isEmpty(classifyReference)) {
                        classifyReference = _.find(nv, { value: 'classifyReference' });
                        if (_.isEmpty(classifyReference)) {
                            _.each(this.classAttrInfo, (value, key) => {
                                key && this.$set(this.classAttrInfo, key, []);
                            });
                        }
                    }
                },
                immediate: true,
                deep: true
            }
        },
        created() {
            this.getTypeReferenceList();
        },
        methods: {
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
            // 获取分类
            getClassify(rootType) {
                this.$famHttp({
                    url: '/fam/classify/tree',
                    params: {
                        rootType
                    }
                }).then((res) => {
                    this.classifyList = _.map(res?.data, (item) => ({
                        ...item,
                        children: item.children ?? []
                    }));

                    // 默认选中第一个分类
                    if (_.isArray(this.classifyList) && this.classifyList?.length) {
                        const [classifyInfo] = this.classifyList;
                        if (_.isArray(classifyInfo?.children) && classifyInfo?.children?.length) {
                            const [subClassifyInfo] = classifyInfo.children;
                            this.$set(this.formData, 'classifyReference', subClassifyInfo || {});
                        } else {
                            if (this.classifyList.length === 1) this.classifyList[0].parentId = '';
                            this.$set(this.formData, 'classifyReference', classifyInfo || {});
                        }
                    }
                });
            },
            // 获取可选属性列表
            getsAttributesList({ type, typeDefinitionId }) {
                this.$famHttp({
                    url: '/fam/type/attribute/listTypeAttributeDtoByTypeDefinitionIds',
                    params: {
                        typeDefinitionId
                    }
                }).then((res) => {
                    const data = res?.data || [];
                    const attributeList = type === 'type' ? 'typeAttributeList' : 'classAttributeList';
                    this[attributeList] = _.map(data, (item) => {
                        const constraintDefinitionDto = item?.constraintDefinitionDto || {};
                        return {
                            label: item?.displayName || '',
                            value: item?.attrName || '',
                            isRequired: constraintDefinitionDto?.isRequired === true
                        };
                    });
                });
            },
            // 分类搜索
            filterNodeMethod(value, data) {
                return data?.displayName?.toString()?.search(value) >= 0;
            },
            // 校验
            verify() {
                let valid = true;
                let message = null;

                if (_.isEmpty(this.formData?.typeReference)) {
                    valid = false;
                    message = this.i18n?.['请选择类型'];
                }

                if (!this.typeAttrInfo?.length) {
                    valid = false;
                    message = this.i18n?.['可选类型属性不能为空'];
                }

                // // 选中分类，可选分类属性必填
                // const classifyReference = _.find(this.typeAttrInfo, { value: 'classifyReference' });
                // if (!_.isEmpty(classifyReference)) {
                //     if (_.every(this.classAttrInfo, value => !value?.length)) {
                //         valid = false;
                //         message = this.i18n?.['可选分类属性不能为空'];
                //     }
                // }

                return { valid, message };
            },
            // 获取数据
            getData() {
                const data = {};

                const baseInfo = _.find(this.typeReferenceList, { typeOid: this.formData?.typeReference }) || {};

                data.typeName = baseInfo?.typeName || '';
                data.tableSearchDto = {
                    className: data.typeName
                };
                const customParams = {
                    displayName: this.displayName,
                    baseColumnList: _.map(this.typeAttrInfo, (item) => ({
                        attrName: item?.value,
                        displayName: item?.label,
                        name: item?.value
                    })),
                    selectValues: [
                        {
                            viewProperty: baseInfo.displayName,
                            valueProperty: baseInfo.typeOid
                        }
                    ]
                };

                // 数据处理，增加附件字段
                customParams.baseColumnList.push({
                    attrName: 'ResourceFile',
                    displayName: '附件',
                    name: 'ResourceFile'
                });

                let classAttrInfoCopy = _.pick(this.classAttrInfo, (value) => _.isArray(value) && value?.length);
                let selectedClassifyOids = this.formData.classify.map((item) => item.oid);
                Object.keys(classAttrInfoCopy).forEach((key) => {
                    if (!selectedClassifyOids.includes(key)) delete classAttrInfoCopy[key];
                });

                if (!_.isEmpty(classAttrInfoCopy)) {
                    const classifies = _.map(classAttrInfoCopy, (value, key) => {
                        const { data: classify } = this.$refs?.treeSelectRef?.$refs?.tree?.getNode(key) || {};
                        return {
                            ..._.pick(classify || {}, 'oid', 'typeName'),
                            displayName: classify?.code || '',
                            classifyAttrs: _.map(value, (item) => ({
                                attrName: item?.value,
                                displayName: item?.label,
                                name: item?.value
                            }))
                        };
                    });
                    customParams.classifies = classifies;
                }

                data.customParams = customParams;

                return ErdcKit.deepClone(data) || {};
            }
        }
    };
});
