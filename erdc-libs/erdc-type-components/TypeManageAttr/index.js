define([
    'text!' + ELMP.resource('erdc-type-components/TypeManageAttr/template.html'),
    'css!' + ELMP.resource('erdc-type-components/TypeManageAttr/style.css'),
    'erdc-kit',
    'erdcloud.kit',
    'fam:http',
    'underscore',
    'EventBus'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');
    const FamUtils = require('erdc-kit');
    const EventBus = require('EventBus');

    return {
        template,
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-type-components/TypeManageAttr/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    all: this.getI18nByKey('全部'),
                    model: this.getI18nByKey('模型属性'),
                    standard: this.getI18nByKey('标准属性'),
                    soft: this.getI18nByKey('软属性'),
                    enter: this.getI18nByKey('请输入'),
                    showName: this.getI18nByKey('显示名称'),
                    internalName: this.getI18nByKey('内部名称'),
                    type: this.getI18nByKey('所属类型'),
                    belongClassify: this.getI18nByKey('所属分类'),
                    dataType: this.getI18nByKey('数据类型'),
                    classify: this.getI18nByKey('属性分类'),
                    operation: this.getI18nByKey('操作'),
                    create: this.getI18nByKey('创建'),
                    edit: this.getI18nByKey('编辑'),
                    remove: this.getI18nByKey('删除'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    successfullyDelete: this.getI18nByKey('删除成功'),
                    deleteFailed: this.getI18nByKey('删除失败'),
                    cancel: this.getI18nByKey('取消'),
                    confirm: this.getI18nByKey('确认'),
                    detail: this.getI18nByKey('详情'),
                    addAttr: this.getI18nByKey('创建属性'),
                    editAttr: this.getI18nByKey('编辑属性'),
                    attrConfig: this.getI18nByKey('属性权限配置'),
                    permission: this.getI18nByKey('权限'),
                    export: this.getI18nByKey('export'),
                    nonCurrentTenant: this.getI18nByKey('nonCurrentTenant'),
                    extendAttr: this.getI18nByKey('继承属性'),
                    globalAttr: this.getI18nByKey('全局属性'),
                    customAttr: this.getI18nByKey('自定义属性')
                },
                searchValue: '',
                formPageData: [],
                isShow: true,
                dialogVisible: false,
                title: '',
                openType: 'create',
                rowData: {}, // 编辑时当前行数据
                rowPropertyMap: {},
                pagination: {
                    pageSize: 10, // 每页多少条数据
                    currentPage: 1, // 第几页
                    total: 0 // 总共有多少条数据
                },
                viewData: [],
                detailTitle: '',
                categoryData: '',
                useComponentName: 'custom-select', // 组件名
                typeInfoData: {},
                isFlex: false,
                isIba: false,
                isPermissionBtn: true,
                appName: '',
                exportVisible: false,
                requestConfig: {},
                abstractType: false
            };
        },
        props: {
            oid: {
                type: String,
                default: ''
            },
            moduleTitle: {
                type: String,
                default: ''
            },
            type: {
                type: String,
                default: ''
            },
            // 拓展属性
            flexAttrs: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            useForm: {
                type: String,
                default: 'type'
            }
        },
        watch: {
            oid(newV, oldV) {
                this.fetchTypeDefById(this?.flexAttrs?.attrInfoUrl, newV);
                this.getTypeAttrList(newV);
            },
            flexAttrs: {
                immediate: true,
                deep: true,
                handler(nv) {
                    if (nv && Object.keys(nv).length) {
                        // 暂时屏蔽分类管理中的属性权限配置，权限按钮
                        this.isPermissionBtn = nv?.isPermissionBtn;
                    }
                }
            }
        },
        components: {
            TypeAttrConfig: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/TypeAttrConfig/index.js')), // 编辑子类型
            SingleAttrPermissionSetting: ErdcKit.asyncComponent(
                ELMP.resource('erdc-type-components/SingleAttrPermissionSetting/index.js')
            ), // 编辑子类型
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamExport: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamExport/index.js'))
        },
        computed: {
            columns: {
                get() {
                    return [
                        {
                            prop: 'seq', // 列数据字段key
                            type: 'seq', // 特定类型
                            title: ' ',
                            width: 52,
                            align: 'center' //多选框默认居中显示
                        },
                        {
                            prop: 'icon',
                            // title: '图标',
                            width: 48,
                            align: 'center' //多选框默认居中显示
                        },
                        {
                            prop: 'displayName', // 显示名称
                            title: this.i18nMappingObj?.['showName'],
                            props: {
                                sortable: true,
                                'sort-type': 'string'
                            }
                            // sort: true,// 是否需要排序
                            // sortFixRight : true,// 排序图标是否居右侧定位 默认顺序平铺
                            // filter: {
                            //     // 自定义类型
                            //     type : 'custom',
                            //     value : ''
                            // }
                        },
                        {
                            prop: 'attrName', // 内部名称
                            title: this.i18nMappingObj?.['internalName'],
                            props: {
                                sortable: true,
                                'sort-type': 'string'
                            }
                            // sort: true,// 是否需要排序
                            // sortFixRight : true,// 排序图标是否居右侧定位 默认顺序平铺
                            // filter: {
                            //     // 自定义类型
                            //     type : 'custom',
                            //     value : ''
                            // }
                        },
                        {
                            prop: 'typeDisplayName', // 所属分类 / 所属类型
                            title: !this.isPermissionBtn
                                ? this.i18nMappingObj?.['belongClassify']
                                : this.i18nMappingObj?.['type'],
                            props: {
                                sortable: true,
                                'sort-type': 'string'
                            }
                            // sort: true,// 是否需要排序
                            // sortFixRight : true,// 排序图标是否居右侧定位 默认顺序平铺
                        },
                        {
                            prop: 'dataTypeDto.displayName', // 数据类型
                            title: this.i18nMappingObj?.['dataType'],
                            props: {
                                sortable: true,
                                'sort-type': 'string'
                            }
                            // sort: true,// 是否需要排序
                            // sortFixRight : true,// 排序图标是否居右侧定位 默认顺序平铺
                        },
                        {
                            prop: 'categoryName', // 属性分类
                            title: this.i18nMappingObj?.['classify'],
                            props: {
                                sortable: true,
                                'sort-type': 'string'
                            }
                            // sort: true,// 是否需要排序
                            // sortFixRight : true,// 排序图标是否居右侧定位 默认顺序平铺
                        },
                        {
                            prop: 'oper', // 操作
                            title: this.i18nMappingObj?.['operation'],
                            width: 128,
                            sort: false,
                            fixed: 'right'
                        }
                    ];
                },
                set(val) {}
            },
            isDisabled() {
                if (this.typeInfoData && Object.keys(this.typeInfoData).length) {
                    let { isClassify, isFlex, isIba, isVirtual } = this.typeInfoData;
                    let isTrue = !(isClassify || isFlex || isIba || isVirtual);
                    return isTrue;
                }
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            // 初始值
            init() {
                const data = new FormData();
                data.append('realType', 'erd.cloud.core.enums.AttributeCategory');
                this.categoryData = data;
                this.fetchTypeDefById(this?.flexAttrs?.attrInfoUrl, this.oid);
                this.getTypeAttrList(this.oid);
            },
            // 获取基本信息
            fetchTypeDefById(url = '/fam/type/typeDefinition/getTypeDefById', oid) {
                this.$famHttp({
                    url,
                    data: {
                        oid
                    },
                    method: 'get'
                }).then(({ data }) => {
                    this.typeInfoData = data;
                    this.abstractType = data.abstractType;
                    this.appName = data?.appName || '';
                });
            },
            // 搜索
            search() {
                FamUtils.debounceFn(() => {
                    let [...arr] = this.formPageData;

                    this.filterColumns(this.searchValue, arr);
                }, 300);
            },
            // 过滤数据
            filterColumns(val, data) {
                if (!val) {
                    this.viewData = this.formPageData;
                    return true;
                }
                const searchData = [];
                const res = val.replace(/\s/gi, '');
                let searchArr = data;
                searchArr.forEach((e) => {
                    let { displayName, attrName, typeDisplayName, categoryName, dataTypeDto } = e;
                    const dataTypeDisplayName = dataTypeDto?.displayName || '';
                    if (
                        displayName?.includes(res) ||
                        attrName?.includes(res) ||
                        typeDisplayName?.includes(res) ||
                        categoryName?.includes(res) ||
                        dataTypeDisplayName?.includes(res)
                    ) {
                        if (searchData.indexOf(e) == '-1') {
                            searchData.push(e);
                        }
                    }
                });

                this.viewData = searchData;
            },

            // 获取属性类型、属性分类
            async getTypeAttrList(oid) {
                const attributeListRes = await this.getAttrList(oid);
                let attributeList = attributeListRes?.data || [];
                if (attributeList.length) {
                    let data = new FormData();
                    data.append('realType', 'erd.cloud.core.enums.AttributeCategory');
                    const enumDataListRes = await this.getEnumDataList(data);
                    const enumDataList = enumDataListRes?.data;
                    if (enumDataList?.length) {
                        attributeList = attributeList.map((item) => {
                            const tempObj = enumDataList.find((subItem) => subItem.name === item.attrCategory);
                            if (tempObj) {
                                item.categoryName = tempObj.value;
                            }
                            return item;
                        });
                    }
                    this.formPageData = attributeList;
                    this.viewData = attributeList;
                } else {
                    this.formPageData = attributeList;
                    this.viewData = attributeList;
                }
            },
            getAttrList(typeDefinitionId) {
                return this.$famHttp({
                    url: '/fam/type/attribute/listTypeAttributeDtoByTypeDefinitionIds',
                    data: {
                        typeDefinitionId
                    },
                    method: 'get'
                });
            },
            getEnumDataList(data) {
                return this.$famHttp({
                    url: '/fam/type/component/enumDataList',
                    data,
                    method: 'post',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
                    }
                });
            },
            // 排序
            sortMethod: function ({ data, column, property, order }) {
                // // 根据升/降序进行排序
                if (order === 'asc') {
                    // 升序排序
                    return data;
                } else {
                    // 降序排序
                    return data.sort((a, b) => {
                        // 判断是否为字符串类型
                        if (typeof a[property] === 'string' && typeof b[property] === 'string') {
                            // 如果都是字符串类型，则比较首字母
                            return b[property].localeCompare(a[property], 'zh-Hans-CN', { sensitivity: 'base' });
                        } else {
                            // 否则使用默认比较方法
                            return b[property] - a[property];
                        }
                    });
                }
            },
            customSortMethod: function (sortList) {
                // const sortItem = sortList[0] ?? {};
                // // 取出第一个排序的列
                // const { property, order } = sortItem;
            },
            // 清除筛选功能
            clearFilter: function (data) {
                this.formPageData = this.formPageData.map((item) => {
                    item.show = true;
                    return item;
                });
            },
            // 客制化排序
            customSubmit: function (type, data) {
                // 关闭筛选面板
                this.$refs['erdTable']?.togglePopShow(data.prop);
            },
            // 详情
            onDetail(data) {
                this.title = this.i18nMappingObj.detail;
                this.dialogVisible = true;
                this.openType = 'detail';
                this.rowData = data.row;
            },
            goBack() {
                this.isShow = true;
            },
            // 创建
            onCreate() {
                this.title = this.i18nMappingObj.addAttr;
                this.dialogVisible = true;
                this.openType = 'create';
            },
            // 属性权限配置
            onAttrConfig() {
                EventBus.emit('updateShowPermissionSettingFlag', true, this.oid, '', this.moduleTitle);
            },
            // 编辑
            onEdit(data) {
                this.title = this.i18nMappingObj.editAttr;
                this.dialogVisible = true;
                this.openType = 'edit';
                this.rowData = data.row;
            },
            onSubmit() {
                this.init();
            },
            // 删除
            onDelete(data) {
                let oid = data.row.oid;
                this.$confirm(this.i18nMappingObj['confirmDelete'], this.i18nMappingObj['confirmDelete'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/type/attribute/delete',
                        params: {
                            typeAttributeDefinitionId: oid
                        },
                        method: 'delete'
                    }).then((res) => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['successfullyDelete'],
                            showClose: true
                        });
                        this.init();
                    });
                });
            },
            onEditPermission(data) {
                this.$refs.PermissionSettingDialog.showOrHidePermissionDialog(
                    true,
                    this.oid,
                    data.row.oid,
                    data.row.displayName
                );
            },
            getIconByLineData(row) {
                let icon = 'erd-iconfont erd-icon-';
                if (row.isExtends) {
                    icon += 'process';
                } else if (row.globalAttrId) {
                    icon += 'global-attributes';
                } else {
                    icon += 'custom-attributes';
                }
                return icon;
            },
            onExport() {
                const { typeName, serviceInfoRef } = this.typeInfoData;
                this.requestConfig = {
                    data: {
                        tableSearchDto: {
                            className: this.$store.getters.className('typeDefinition')
                        },
                        customParams: {
                            typeName,
                            serviceName: serviceInfoRef,
                            isTree: false
                        }
                    }
                };
                this.exportVisible = true;
            },
            contentMethod({ row, column, type }) {
                if (type === 'header') {
                    for (let item of this.column) {
                        if (item.prop === column.field) {
                            if (item.toolTipsAble || item.tips || !column.title) {
                                return null;
                            }
                            return column.title;
                        }
                    }
                }
                if (column.property === 'icon') {
                    let tooltipName = '';
                    if (row.isExtends) {
                        tooltipName = 'extendAttr';
                    } else if (row.globalAttrId) {
                        tooltipName = 'globalAttr';
                    } else {
                        tooltipName = 'customAttr';
                    }
                    return this.i18nMappingObj[tooltipName];
                }
            }
        }
    };
});
