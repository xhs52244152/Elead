define([
    'erdcloud.kit',
    'text!' + ELMP.resource('project-plan/components/RelevanceList/RequireRelevance/index.html'),
    ELMP.resource('project-plan/mixins/common-mixins.js')
    // 'css!' + ELMP.resource('project-plan/components/RelevanceList/style.css')
], function (ErdcKit, template, commonMixins) {
    return {
        name: 'Requirement_component',
        template: template,
        props: {
            poid: String
        },
        mixins: [commonMixins],
        data() {
            return {
                readonly: false,
                selectList: [],
                lefttableList: [],
                showList: true, // 显示列表还是表单数据
                i18nMappingObj: {
                    edit: this.getI18nByKey('edit'),
                    pleaseEnter: this.getI18nByKey('pleaseEnter'),
                    pleaseSelect: this.getI18nByKey('pleaseSelect'),
                    pleaseUpload: this.getI18nByKey('pleaseUpload'),
                    enable: this.getI18nByKey('enable'),
                    disable: this.getI18nByKey('disable'),
                    comfirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    deleteAssociation: this.getI18nByKey('deleteAssociation'),
                    deleteSucess: this.getI18nByKey('deleteSuccess'),
                    pleaseCheckSelect: this.getI18nByKey('pleaseSelectData'),
                    comfirmSelect: this.getI18nByKey('confirm'),
                    whetherDelete: this.getI18nByKey('whetherDelete'),
                    checkDelete: this.getI18nByKey('deleteConfirm'),
                    add: this.getI18nByKey('add')
                },
                i18nLocalePath: ELMP.resource('project-plan/locale/index.js'),
                state: '', // 表单状态
                relevanList: []
            };
        },
        computed: {
            slotsField() {
                return [
                    // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                    {
                        prop: 'operation',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'erd.cloud.ppm.plan.entity.Task#name', // 注意：视图表格的attrName是类型+属性名的，因为不同类型可能存在同样的属性，不能截取
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'erd.cloud.ppm.plan.entity.Task#updateTime', //
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.plan.entity.Task#number', //
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.plan.entity.Task#createBy', //erd.cloud.ppm.plan.entity.Task#updateBy
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.plan.entity.Task#updateBy', //erd.cloud.ppm.plan.entity.Task#updateBy
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.plan.entity.Task#lifecycleStatus.status', //erd.cloud.ppm.plan.entity.Task#updateBy
                        type: 'default'
                    }
                ];
            },
            slotsNameList() {
                return this.slotsField?.map((ite) => {
                    return `column:${ite.type}:${ite.prop}:content`;
                });
            },
            viewTableConfig() {
                const that = this;
                let { poid } = this;
                let config = {
                    tableKey: 'TaskRequirementLinkView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            data: { relationshipRef: poid },
                            // 更多配置参考axios官网
                            transformResponse: [
                                function (data) {
                                    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                    // 对接收的 data 进行任意转换处理
                                    let resData = data;
                                    try {
                                        resData = data && JSON.parse(data);
                                    } catch (err) {
                                        console.error('err===>', err);
                                    }
                                    return resData;
                                }
                            ]
                        },
                        toolbarConfig: {
                            fuzzySearch: {
                                show: true // 是否显示普通模糊搜索，默认显示
                            },
                            secondaryBtn: [
                                {
                                    type: 'default',
                                    class: '',
                                    icon: '',
                                    label: this.i18nMappingObj.add,
                                    onclick: () => {
                                        that.addPlanRelev();
                                    }
                                },
                                {
                                    type: 'default',
                                    class: '',
                                    icon: '',
                                    label: this.i18nMappingObj.deleteAssociation,
                                    onclick: () => {
                                        this.batchDelete();
                                    }
                                }
                            ]
                        },

                        fieldLinkConfig: {
                            fieldLink: true,
                            // 是否添加列超链接
                            fieldLinkName: 'erd.cloud.ppm.plan.entity.Task#name' // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                        }
                        // slotsField: this.slotsField
                    }
                };
                return config;
            },
            defaultTableHeight() {
                return document.documentElement.clientHeight - 152;
            }
        },
        methods: {
            fnCallback() {},
            // 复选框全选
            selectAllEvent(data) {
                this.selectList = data.records;
            },
            // 复选框改变
            selectChangeEvent(data) {
                this.selectList = data.records;
            },
            // 批量删除
            batchDelete() {
                if (!this.selectList.length) {
                    this.$message({
                        type: 'info',
                        message: this.i18nMappingObj.pleaseCheckSelect
                    });
                    return;
                }
                let oidList = this.selectList.map((item) => {
                    return item.oid;
                });
                let params = {
                    category: 'DELETE',
                    oidList,
                    className: this.selectList[0]?.idKey
                };
                this.deleteData(params, 'batch');
            },
            deleteData(params, type = '') {
                this.$confirm(this.i18nMappingObj.whetherDelete, this.i18nMappingObj.checkDelete, {
                    distinguishCancelAndClose: true,
                    confirmButtonText: this.i18nMappingObj.comfirmSelect,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    this.deleteByIdsRequest(params).then((resp) => {
                        if (resp.success) {
                            this.$refs.famViewTable.refreshTable('default');
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj.deleteSucess
                            });
                            if (type === 'batch') {
                                this.selectList = [];
                            }
                        }
                    });
                });
            },
            hanlderCancel() {},
            handlerSaveApplication() {},
            handlerDelete() {},
            getValueMeth(row, slot) {
                const { idKey } = row;
                const slotArr = slot.match(/#(\S*):/);
                const slotStr = slotArr ? `${idKey}#${slotArr[1]}` : '';
                return row[slotStr];
            },
            create() {
                this.state = 'create';
                // this.showList = tr
            },
            edit() {
                this.state = 'edit';
                // this.showList = false;
            },
            addPlanRelev() {
                //   this.lefttableList.unshift(this.lefttableList[0])
                let tableData = this.$refs['famViewTable'].$refs['FamAdvancedTable'].tableData;
                if (this.lefttableList.length) {
                    tableData.unshift(this.lefttableList[0]);
                } else {
                    this.tableData.unshift([
                        {
                            attrName: 'erd.cloud.ppm.plan.entity.Task#number',
                            displayName: 'PL000001',
                            label: 'erd.cloud.ppm.plan.entity.Task#number',
                            tooltip: 'PL000001',
                            value: 'PL000001',
                            visible: true
                        }
                    ]);
                }
            }
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js'))
        }
    };
});
