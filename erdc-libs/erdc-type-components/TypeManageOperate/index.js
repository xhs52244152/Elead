define([
    'text!' + ELMP.resource('erdc-type-components/TypeManageOperate/template.html'),
    'css!' + ELMP.resource('erdc-type-components/TypeManageOperate/style.css'),
    'erdc-kit',
    'erdcloud.kit',
    'fam:http',
    'underscore'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const FamUtils = require('erdc-kit');

    return {
        template,
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-type-components/TypeManageOperate/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    enter: this.getI18nByKey('请输入'),
                    source: this.getI18nByKey('来源类'),
                    type: this.getI18nByKey('类型'),
                    operation: this.getI18nByKey('操作定义'),
                    authority: this.getI18nByKey('所属权限'),
                    modules: this.getI18nByKey('所属模块'),
                    priority: this.getI18nByKey('调用优先级'),
                    defineOperation: this.getI18nByKey('定义操作'),
                    instruction: this.getI18nByKey('操作说明'),
                    defineClass: this.getI18nByKey('定义类')
                },
                searchValue: '',
                formData: [],
                classServiceData: [], // 管理行为
                aopInterceptData: [], // AOP行为
                classList: [], // 管理行为
                aopList: [], // AOP行为
                dialogVisible: false,
                title: '',
                openType: '',
                rowPropertyMap: {},
                unfold: true,
                showInfo: true,
                tableHeight: ''
            };
        },
        props: {
            oid: {
                type: String,
                default: () => {
                    return '';
                }
            }
        },
        watch: {
            oid(newV) {
                this.getTypeAttrList(newV);
            }
        },
        components: {
            TypeAttrConfig: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/TypeAttrConfig/index.js')), // 编辑子类型
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        computed: {
            sourceColumns: {
                get() {
                    return [
                        {
                            type: 'seq',
                            title: ' ',
                            align: 'center',
                            width: '48'
                        },
                        {
                            prop: 'sourceTypeName',
                            title: this.i18nMappingObj?.['source']
                            // sort : true,
                            // sortFixRight : true,// 排序图标是否居右侧定位 默认顺序平铺
                        },
                        {
                            prop: 'className',
                            title: this.i18nMappingObj?.['defineClass']
                            // sort : true,
                            // sortFixRight : true,// 排序图标是否居右侧定位 默认顺序平铺
                        },
                        {
                            prop: 'name',
                            title: this.i18nMappingObj?.['operation']
                            // sort : true,
                            // sortFixRight : true,// 排序图标是否居右侧定位 默认顺序平铺
                        },
                        {
                            prop: 'description',
                            title: this.i18nMappingObj?.['instruction']
                        }
                    ];
                }
            },
            defineColumns: {
                get() {
                    return [
                        {
                            type: 'seq',
                            title: ' ',
                            align: 'center',
                            width: '48'
                        },
                        {
                            prop: 'sourceTypeName',
                            title: this.i18nMappingObj?.['source']
                            // sort : true,
                            // sortFixRight : true,// 排序图标是否居右侧定位 默认顺序平铺
                        },
                        {
                            prop: 'className',
                            title: this.i18nMappingObj?.['defineClass']
                            // sort : true,
                            // sortFixRight : true,// 排序图标是否居右侧定位 默认顺序平铺
                        },
                        {
                            prop: 'name',
                            title: this.i18nMappingObj?.['operation']
                            // sort : true,
                            // sortFixRight : true,// 排序图标是否居右侧定位 默认顺序平铺
                        },
                        {
                            prop: 'description',
                            title: this.i18nMappingObj?.['instruction']
                        }
                    ];
                }
            },
            classData: {
                get() {
                    return JSON.parse(JSON.stringify(this.classServiceData));
                }
            },
            aopData: {
                get() {
                    return JSON.parse(JSON.stringify(this.aopInterceptData));
                }
            }
        },
        mounted() {
            this.getTypeAttrList(this.oid);
            this.tableHeight = document.documentElement.clientHeight - 640;
        },
        methods: {
            showInfoFn(flag) {
                this.showInfo = flag;
            },
            getTypeAttrList(oid) {
                this.$famHttp({
                    url: '/fam/type/typeDefinition/find/action',
                    data: {
                        category: 'ClassService',
                        oid
                    },
                    method: 'get'
                }).then((resp) => {
                    this.classServiceData = resp.data;
                    this.classList = JSON.parse(JSON.stringify(this.classServiceData));
                });
                this.$famHttp({
                    url: '/fam/type/typeDefinition/find/action',
                    data: {
                        category: 'AopIntercept',
                        oid
                    },
                    method: 'get'
                }).then((resp) => {
                    this.aopInterceptData = resp.data;
                    this.aopList = JSON.parse(JSON.stringify(this.aopInterceptData));
                });
            },
            search(val) {
                FamUtils.debounceFn(() => {
                    let [...arr1] = this.classList;
                    let [...arr2] = this.aopList;
                    this.filterColumns(val, arr1, arr2);
                }, 300);
            },
            // 过滤数据
            filterColumns(val, data1, data2) {
                if (!val) {
                    this.classServiceData = this.classList;
                    this.aopInterceptData = this.aopList;
                    return true;
                }
                // const res = val.replace(/\s/gi, "");
                const res = val.trim();

                const searchData1 = [];
                data1.forEach((e) => {
                    let { sourceTypeName, className, name, description } = e;
                    if (
                        sourceTypeName.includes(res) ||
                        className.includes(res) ||
                        name.includes(res) ||
                        description.includes(res)
                    ) {
                        if (searchData1.indexOf(e) === -1) {
                            searchData1.push(e);
                        }
                    }
                });
                const searchData2 = [];
                data2.forEach((e) => {
                    let { sourceTypeName, className, name, description } = e;
                    if (
                        sourceTypeName.includes(res) ||
                        className.includes(res) ||
                        name.includes(res) ||
                        description.includes(res)
                    ) {
                        if (searchData2.indexOf(e) === '-1') {
                            searchData2.push(e);
                        }
                    }
                });
                this.classServiceData = searchData1;
                this.aopInterceptData = searchData2;
            }
        }
    };
});
