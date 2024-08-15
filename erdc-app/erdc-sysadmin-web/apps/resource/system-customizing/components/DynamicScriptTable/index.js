define(['text!' + ELMP.resource('system-customizing/components/DynamicScriptTable/index.html'), 'erdc-kit'], function (
    template,
    utils
) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-customizing/views/CustomScripting/locale/index.js'),
                i18nMappingObj: {
                    dynamicScriptManagement: this.getI18nByKey('动态脚本管理'),
                    enable: this.getI18nByKey('启用'),
                    disable: this.getI18nByKey('禁用'),
                    tipsTitle: this.getI18nByKey('提示'),
                    deleteSuccess: this.getI18nByKey('删除成功'),
                    enableSuccess: this.getI18nByKey('启用成功'),
                    disableSuccess: this.getI18nByKey('禁用成功')
                },
                isLoading: false
            };
        },
        computed: {
            viewTableConfig() {
                return {
                    viewTableTitle: this.i18nMappingObj.dynamicScriptManagement,
                    tableKey: 'groovyViewTable',
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        tableRequestConfig: {
                            transformResponse: [
                                function (data) {
                                    let resData = data;
                                    try {
                                        resData = data && JSON.parse(data);
                                        resData.data.records = resData.data.records.filter((item) => {
                                            return item.attrRawList.some((subItem) => {
                                                if (subItem.attrName.includes('iterationInfo.latest')) {
                                                    return subItem.value;
                                                }
                                            });
                                        });
                                    } catch (error) {
                                        console.error(error);
                                    }
                                    return resData;
                                }
                            ]
                        },
                        columnWidths: {
                            operation: window.LS.get('lang_current') === 'en_us' ? 100 : 65
                        },

                        // 工具栏
                        toolbarConfig: {
                            valueKey: 'attrName',
                            fuzzySearch: {
                                show: false // 是否显示普通模糊搜索，默认显示
                            },

                            // 基础筛选
                            basicFilter: {
                                show: true // 是否显示基础筛选，默认不显示
                            },
                            actionConfig: {
                                name: 'MENU_MODULE_GROOVY',
                                containerOid: this.$store.state.space?.context?.oid || '',
                                className: this.$store.getters.className('groovyScript')
                            }
                        },
                        tableBaseConfig: {
                            // 表格UI的配置(使用驼峰命名)，使用的是vxe表格，可参考官网API（https://vxetable.cn/）
                            rowConfig: {
                                isCurrent: true,
                                isHover: true
                            },
                            align: 'left', // 全局文本对齐方式
                            columnConfig: {
                                resizable: true // 是否允许调整列宽
                            },
                            showOverflow: true // 溢出隐藏显示省略号
                        },
                        fieldLinkConfig: {
                            // 超链接事件
                            linkClick: (row) => {
                                this.handleDownload(row);
                            }
                        },

                        // 分页
                        pagination: {
                            indexKey: 'pageIndex', // 参数pageIndex key (默认pageIndex)
                            sizeKey: 'pageSize' // 参数pageSize key (默认pageSize)
                        },

                        // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                        slotsField: [
                            {
                                prop: 'operation', // 当前字段使用插槽
                                type: 'default'
                            },
                            {
                                prop: `${this.$store.getters.className('groovyScript')}#enabled`,
                                type: 'default'
                            }
                        ],
                        tableBaseEvent: {
                            scroll: _.throttle(() => {
                                let arr =
                                    _.chain(this.$refs)
                                        .pick((value, key) => key.indexOf('FamActionPulldown') > -1)
                                        .values()
                                        .value() || [];
                                this.$nextTick(() => {
                                    _.each(arr, (item) => {
                                        let [sitem = {}] = item?.$refs?.actionPulldowm || [];
                                        sitem.hide && sitem.hide();
                                    });
                                });
                            }, 100)
                        }
                    }
                };
            },
            // 插槽名称
            slotName() {
                return {
                    enabled: `column:default:${this.$store.getters.className('groovyScript')}#enabled:content`
                };
            }
        },
        filters: {
            filterStatus(val) {
                let displayValue;
                const enabledObj = val?.attrRawList?.find((item) => item.attrName.includes('#enabled'));
                switch (enabledObj?.value) {
                    case 1:
                        displayValue = '启用';
                        break;
                    case 2:
                        displayValue = '禁用';
                        break;
                    default:
                        displayValue = '草稿';
                        break;
                }
                return displayValue;
            }
        },
        methods: {
            actionClick(type, data) {
                const eventClick = {
                    MENU_ACTION_GROOVY_CREATE: this.handleCreate,
                    MENU_ACTION_GROOVY_DELETE: this.handleDelete,
                    MENU_ACTION_GROOVY_UPDATE: this.handleUpdate,
                    MENU_ACTION_GROOVY_ENABLE: this.handleEnable,
                    MENU_ACTION_GROOVY_DISABLE: this.handleDisable,
                    MENU_ACTION_GROOVY_DOWNLOAD: this.handleDownload
                };
                eventClick?.[type.name] && eventClick?.[type.name](data);
            },

            // 获取功能按钮配置参数
            getActionConfig(row) {
                return {
                    name: 'MENU_MODULE_GROOVY_MORE',
                    objectOid: row.oid,
                    className: this.$store.getters.className('groovyScript')
                };
            },
            handleCreate() {
                this.$emit('changeDialogStatus', true, 'create');
            },
            handleDelete(row) {
                let displayName = this.getDisplayName(row);
                let confirmText = utils.setTextBySysLanguage({
                    CN: `您确定删除【${displayName}】吗？`,
                    EN: `Are you sure delete [${displayName}]?`
                });
                this.$confirm(confirmText, this.i18nMappingObj['tipsTitle'], {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel']
                })
                    .then(() => {
                        this.$famHttp({
                            url: `/common/delete`,
                            params: {
                                oid: row.masterRef
                            },
                            method: 'delete'
                        })
                            .then((resp) => {
                                const { success, message } = resp;
                                if (success) {
                                    this.$message.success(this.i18nMappingObj['deleteSuccess']);
                                    this.refreshTable();
                                } else {
                                    this.$message({
                                        type: 'error',
                                        message: message
                                    });
                                }
                            })
                            .catch((err) => {});
                    })
                    .catch(() => {});
            },
            async handleUpdate(row) {
                const detaiInfo = await this.getDetailInfoById(row);
                this.$emit('changeDialogStatus', true, 'update', detaiInfo);
            },
            handleEnable(row) {
                const ENABLE = 1;
                this.handleAbleStatus(row, ENABLE);
            },
            handleDisable(row) {
                const DISABLE = 2;
                this.handleAbleStatus(row, DISABLE);
            },
            handleAbleStatus(row, value) {
                let typeI18n = this.i18nMappingObj[value === 1 ? 'enable' : 'disable'];
                let displayName = this.getDisplayName(row);
                let confirmText = utils.setTextBySysLanguage({
                    CN: `您确定${typeI18n}【${displayName}】吗？`,
                    EN: `Are you sure delete [${displayName}]?`
                });
                this.$confirm(confirmText, this.i18nMappingObj['tipsTitle'], {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel']
                }).then(() => {
                    this.$famHttp({
                        url: '/common/update',
                        data: {
                            attrRawList: [
                                {
                                    attrName: 'enabled',
                                    value
                                }
                            ],
                            oid: row.masterRef,
                            className: 'erd.cloud.groovy.entity.GroovyScriptMaster',
                            typeReference: 'OR:erd.cloud.foundation.type.entity.TypeDefinition:1693882928666906625'
                        },
                        method: 'post'
                    })
                        .then((resp) => {
                            const { success, message } = resp;
                            if (success) {
                                const i18nkey = value === 1 ? 'enableSuccess' : 'disableSuccess';
                                this.$message.success(this.i18nMappingObj[i18nkey]);
                                this.refreshTable();
                            }
                        })
                        .catch((err) => {});
                });
            },
            getDisplayName(row) {
                let displayName = '';
                row.attrRawList.some((item) => {
                    if (item.attrName.includes('#displayName')) {
                        displayName = item.displayName;
                        return true;
                    }
                });
                return displayName;
            },
            async handleDownload(row) {
                const detaiInfo = await this.getDetailInfoById(row);
                this.handlerDownload(detaiInfo.fileId, detaiInfo.authorizeCode[detaiInfo.fileId]);
            },
            getDetailInfoById(row) {
                return this.$famHttp({
                    url: '/common/groovy/getGroovyScriptById',
                    params: {
                        oid: row.masterRef
                    },
                    method: 'get'
                })
                    .then((resp) => {
                        if (resp.success) {
                            return resp.data;
                        }
                    })
                    .catch((err) => {});
            },
            handlerDownload(fileId, authCode) {
                utils.downloadFile(fileId, authCode);
            },
            refreshTable() {
                this.$refs?.famViewTable?.getTableInstance('advancedTable', 'refreshTable')();
            }
        }
    };
});
