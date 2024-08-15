define([
    'text!' + ELMP.resource('erdc-type-components/TypeManageAttrGroup/template.html'),
    'css!' + ELMP.resource('erdc-type-components/TypeManageAttrGroup/style.css'),
    'erdc-kit',
    'erdcloud.kit',
    'fam:http',
    'underscore'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');
    const FamUtils = require('erdc-kit');

    return {
        template,
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-type-components/TypeManageAttrGroup/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    all: this.getI18nByKey('全部'),
                    model: this.getI18nByKey('模型属性'),
                    standard: this.getI18nByKey('标准属性'),
                    soft: this.getI18nByKey('软属性'),
                    enter: this.getI18nByKey('请输入'),
                    showName: this.getI18nByKey('显示名称'),
                    internalName: this.getI18nByKey('内部名称'),
                    name: this.getI18nByKey('名称'),
                    description: this.getI18nByKey('描述'),
                    type: this.getI18nByKey('所属类型'),
                    classify: this.getI18nByKey('属性分类'),
                    operation: this.getI18nByKey('操作'),
                    create: this.getI18nByKey('创建'),
                    edit: this.getI18nByKey('编辑'),
                    remove: this.getI18nByKey('删除'),
                    cancel: this.getI18nByKey('取消'),
                    confirm: this.getI18nByKey('确认'),
                    delGroup: this.getI18nByKey('删除属性组'),
                    confirmDel: this.getI18nByKey('确认删除'),
                    copyType: this.getI18nByKey('拷贝到本类型'),
                    copyGroup: this.getI18nByKey('拷贝属性组'),
                    confirmCopy: this.getI18nByKey('确认拷贝'),
                    detail: this.getI18nByKey('详情'),
                    createGroup: this.getI18nByKey('创建属性组'),
                    editGroup: this.getI18nByKey('编辑属性组'),
                    successDel: this.getI18nByKey('删除成功'),
                    failDel: this.getI18nByKey('删除失败')
                },
                searchValue: '',
                formData: [],
                viewData: [],
                dialogVisible: false,
                title: '',
                openType: '',
                rowPropertyMap: {},
                maxHeight: 0,
                heightDiff: 234,
                defaultTableHeight: 450
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
            TypeAttrGroupConfig: ErdcKit.asyncComponent(
                ELMP.resource('erdc-type-components/TypeAttrGroupConfig/index.js')
            ), // 编辑子类型
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        computed: {
            columns: {
                get() {
                    return [
                        {
                            prop: 'seq', // 列数据字段key
                            type: 'seq', // 特定类型
                            title: ' ',
                            width: 48,
                            align: 'center' //多选框默认居中显示
                        },
                        {
                            prop: 'icon',
                            // title: '图标',
                            width: 48,
                            align: 'center' //多选框默认居中显示
                        },
                        {
                            prop: 'displayName',
                            title: this.i18nMappingObj?.['showName']
                        },
                        {
                            prop: 'internalDisplayName',
                            title: this.i18nMappingObj?.['name']
                        },
                        {
                            prop: 'description',
                            title: this.i18nMappingObj?.['description'],
                            minWidth: 180,
                            width: 180
                        },
                        {
                            prop: 'oper',
                            title: this.i18nMappingObj?.['operation'],
                            width: 120,
                            sort: false,
                            fixed: 'right'
                        }
                    ];
                },
                set() {}
            }
        },
        created() {
            //获取浏览器高度并计算得到表格所用高度。 减去表格外的高度
            let maxHeight = document.documentElement.clientHeight - this.heightDiff;
            this.maxHeight = maxHeight || this.defaultTableHeight;
        },
        mounted() {
            this.init();
        },
        methods: {
            getTypeAttrList(oid) {
                this.$famHttp({
                    url: '/fam/type/group/list',
                    data: { typeReference: oid },
                    method: 'get'
                }).then((resp) => {
                    if (resp.code == 200) {
                        _.each(resp.data, (item) => {
                            if (item.contextRef != oid) {
                                item['isExtends'] = true;
                            } else {
                                item['isExtends'] = false;
                            }
                        });
                        this.viewData = this.formData = resp.data;
                    }
                });
            },
            init() {
                this.getTypeAttrList(this.oid);
            },
            // 搜索
            search(val) {
                FamUtils.debounceFn(() => {
                    let [...arr] = this.formData;
                    this.filterColumns(val, arr);
                }, 300);
            },
            // 过滤数据
            filterColumns(val, data) {
                if (!val) {
                    this.viewData = this.formData;
                    return true;
                }
                const searchData = [];
                const res = val.replace(/\s/gi, '');
                let searchArr = data;
                searchArr.forEach((e) => {
                    let { displayName, name, description } = e;
                    if (displayName.includes(res) || name.includes(res) || description.includes(res)) {
                        if (searchData.indexOf(e) == '-1') {
                            searchData.push(e);
                        }
                    }
                });

                this.viewData = searchData;
            },
            onDetail(data) {
                this.title = this.i18nMappingObj?.['detail'];
                this.dialogVisible = true;
                this.openType = 'detail';
                this.rowData = data.row;
            },
            onCreate() {
                this.title = this.i18nMappingObj?.['createGroup'];
                this.dialogVisible = true;
                this.openType = 'create';
                this.rowData = {};
            },
            onEdit(data) {
                this.title = this.i18nMappingObj?.['editGroup'];
                this.dialogVisible = true;
                this.openType = 'edit';
                this.rowData = data.row;
            },
            onSubmit() {
                this.init();
            },
            onDelete(data) {
                let { oid } = data.row;
                if (oid) {
                    this.$confirm(this.i18nMappingObj['delGroup'], this.i18nMappingObj['confirmDel'], {
                        confirmButtonText: this.i18nMappingObj['confirm'],
                        cancelButtonText: this.i18nMappingObj['cancel'],
                        type: 'warning'
                    }).then(() => {
                        this.$famHttp({
                            url: '/fam/delete',
                            method: 'DELETE',
                            params: { oid }
                        }).then(() => {
                            this.init();
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj?.['successDel']
                            });
                        });
                    });
                }
            },
            onCopy(data) {
                let { oid } = data.row;
                let val = new FormData();
                val.append('groupOid', oid);
                val.append('typeReference', this.oid);
                this.$confirm(this.i18nMappingObj['copyGroup'], this.i18nMappingObj['confirmCopy'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/type/group/copyAsTypeRef',
                        data: val,
                        method: 'post'
                    }).then(() => {
                        this.init();
                        this.$message({
                            type: 'success',
                            message: '拷贝成功'
                        });
                    });
                });
            },
            getIconObj(row) {
                let className = 'font-18 erd-iconfont erd-icon-';
                let tooltip = '';
                if (row?.isExtends) {
                    className += 'process';
                    tooltip = this.i18n.inheritAttrGroup;
                } else {
                    className += 'custom-attributes';
                    tooltip = this.i18n.customAttrGroup;
                }
                return { value: className, tooltip };
            }
        }
    };
});
