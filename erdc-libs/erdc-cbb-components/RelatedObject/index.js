define([
    'text!' + ELMP.resource('erdc-cbb-components/RelatedObject/index.html'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (template, cbbUtils) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'RelatedObject',
        template,
        components: {
            FamAssociationObject: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAssociationObject/index.js')
            ),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        props: {
            title: String,
            // 外部url参数
            urlConfig: [Object, Function],
            // 自定义列头
            leftTableColumns: [Array, Function],
            visible: Boolean,
            // 大类参数
            viewTypesList: [Array, Function],
            // 要过滤的数据 (接受对象的编码)
            excluded: [String, Array],
            // 是否是默认视图
            defaultView: Boolean,
            // 自定义参数appName
            appName: String
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/RelatedObject/locale/index.js'),
                // 选中大类
                className: '',
                // 选中小类oid
                typeOid: '',
                // 小类数组
                childTypes: [],
                viewTypes: [
                    {
                        label: this?.i18n?.['文档'] || '文档',
                        className: 'erd.cloud.cbb.doc.entity.EtDocument',
                        tableKey: 'DocumentView'
                    },
                    {
                        label: this?.i18n?.['部件'] || '部件',
                        className: 'erd.cloud.pdm.part.entity.EtPart',
                        tableKey: 'partForm'
                    },
                    {
                        label: this?.i18n?.['模型'] || '模型',
                        className: 'erd.cloud.pdm.epm.entity.EpmDocument',
                        tableKey: 'epmDocumentView'
                    }
                ]
            };
        },
        computed: {
            innerTitle() {
                return this.title || this.i18n['增加对象'];
            },
            defaultUrlConfig() {
                const defaultUrlConfig = {
                    data: {
                        addTypeCondition: false,
                        conditionDtoList: [
                            {
                                attrName: `${this.className}#lifecycleStatus.status`,
                                oper: 'NE',
                                value1: 'DRAFT'
                            },
                            {
                                attrName: `${this.className}#typeReference`,
                                oper: 'EQ',
                                value1: _.find(this.childTypes, { typeOid: this.typeOid })?.typeOid || ''
                            }
                        ]
                    }
                };
                if (_.isArray(this.excludedList) && this.excludedList?.length) {
                    defaultUrlConfig.data.conditionDtoList.push({
                        attrName: `${this.className}#identifierNo`,
                        oper: 'NOT_IN',
                        value1: this.excludedList?.join()
                    });
                }
                return defaultUrlConfig;
            },
            innerUrlConfig() {
                const urlConfig = _.isFunction(this.urlConfig) ? this.urlConfig(this) : this.urlConfig;
                return { ...this.defaultUrlConfig, ...urlConfig };
            },
            tableKey() {
                return _.find(this.viewTypes, { className: this.className })?.tableKey;
            },
            innerLeftTableColumns() {
                return _.isFunction(this.leftTableColumns)
                    ? this.leftTableColumns(this.defaultLeftTableColumns)
                    : _.isArray(this.leftTableColumns) && this.leftTableColumns.length
                      ? this.leftTableColumns
                      : this.defaultLeftTableColumns;
            },
            defaultLeftTableColumns() {
                return [
                    {
                        minWidth: '48',
                        width: '48',
                        type: 'seq',
                        align: 'center',
                        fixed: 'left'
                    },
                    {
                        minWidth: '40',
                        width: '40',
                        type: 'checkbox',
                        align: 'center',
                        fixed: 'left'
                    },
                    {
                        prop: 'icon',
                        title: this.i18n['图标'],
                        align: 'center',
                        width: 48
                    },
                    {
                        prop: 'identifierNo',
                        title: this.i18n['编码']
                    },
                    {
                        prop: 'name',
                        title: this.i18n['名称']
                    },
                    {
                        prop: 'version',
                        title: this.i18n['版本']
                    },
                    {
                        prop: 'lifecycleStatus.status',
                        title: this.i18n['生命周期状态']
                    },
                    {
                        prop: 'containerRef',
                        title: this.i18n['上下文']
                    }
                ];
            },
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            excludedList() {
                const excludedList = !_.isArray(this.excluded) ? [this.excluded] : this.excluded;
                return _.compact(excludedList);
            }
        },
        watch: {
            className: {
                handler: function (nv) {
                    if (nv) {
                        this.typeOid = '';
                        this.viewTypeChange();
                    }
                },
                immediate: true
            }
        },
        created() {
            this.getViewTypes();
        },
        methods: {
            // 暂时写死部件,因为只适配部件
            getIcon(row) {
                return row.attrRawList?.find((item) => item.attrName.includes('icon'))?.value || row.icon;
            },
            // 获取大类
            getViewTypes() {
                _.isFunction(this.viewTypesList)
                    ? (this.viewTypes = this.viewTypesList(this.viewTypes))
                    : !_.isEmpty(this.viewTypesList) && (this.viewTypes = this.viewTypesList);
                return (this.className = this.viewTypes[0]?.className);
            },
            // 大类改变
            viewTypeChange() {
                this.loadChildTypes().then((res) => {
                    if (res.success) {
                        this.childTypes = res.data;
                        // 设置初始化值
                        this.$nextTick(() => {
                            this.typeOid = this.childTypes[0]?.typeOid;
                        });
                    }
                });
            },
            // 获取小类
            loadChildTypes() {
                const viewType = this.viewTypes.find((item) => item.className === this.className);
                const getAppName = (data) => {
                    if (data && data.appName) return data.appName;
                    if (data && data.className) {
                        const className = data.className;
                        const appName = this.$store.getters.appNameByClassName(className);
                        return appName;
                    }
                    return '';
                };
                const viewTypeAppName = getAppName(viewType);
                let appName = viewTypeAppName || this.appName || cbbUtils.getAppNameByResource();
                return this.$famHttp({
                    url: '/fam/type/typeDefinition/findAccessTypes',
                    method: 'GET',
                    appName,
                    data: {
                        typeName: this.className,
                        subTypeEnum: 'ALL',
                        accessControl: false,
                        containerRef: ''
                    }
                });
            },
            // 关联对象数据处理
            afterRequest({ data, callback }) {
                let result = _.map(ErdcKit.deepClone(data), (item) => {
                    return {
                        ...item,
                        ..._.reduce(
                            item?.attrRawList || [],
                            (prev, next) => {
                                return {
                                    ...prev,
                                    [next.attrName]: next?.displayName || '',
                                    [next.attrName.split('#').reverse()[0]]: next?.displayName || ''
                                };
                            },
                            {}
                        )
                    };
                });

                _.isFunction(this.$listeners['after-request'])
                    ? this.$emit('after-request', { data: result, callback, vm: this })
                    : callback(result);
            }
        }
    };
});
