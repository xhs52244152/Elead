/*
    类型基本信息配置
    先引用 kit组件
    LifecycleForm: FamKit.asyncComponent(ELMP.resource('biz-lifecycle/components/LifecycleForm/index.js')), // 类型基本信息配置


    <lifecycle-form
    :visible.sync="basicInforConfigVisible"
    :title="'添加基本信息配置'">
    </lifecycle-form>

    返回参数

 */
define([
    'text!' + ELMP.resource('biz-lifecycle/components/LifecycleForm/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'vuedraggable',
    ELMP.resource('biz-lifecycle/components/LifecycleInformation/index.js'),
    'css!' + ELMP.resource('biz-lifecycle/components/LifecycleForm/style.css')
], function (template, fieldTypeMapping, VueDraggable, LifecycleInformation) {
    const FamKit = require('fam:kit');

    return {
        template,
        mixins: [fieldTypeMapping],
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            // title: {
            //     type: String,
            //     default: () => {
            //         return ''
            //     }
            // },
            // create、update、check
            type: {
                type: String,
                default: () => {
                    return 'check';
                }
            },
            data: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            treeData: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        components: {
            LifecycleInformation,
            PhaseInformation: FamKit.asyncComponent(
                ELMP.resource('biz-lifecycle/components/PhaseInformation/index.js')
            ),
            HistoryVersion: FamKit.asyncComponent(ELMP.resource('biz-lifecycle/components/HistoryVersion/index.js')),
            AddPhase: FamKit.asyncComponent(ELMP.resource('biz-lifecycle/components/AddPhase/index.js')),
            VueDraggable,
            FamEmpty: FamKit.asyncComponent(ELMP.resource('erdc-components/FamEmpty/index.js'))
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-lifecycle/components/LifecycleForm/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    edit: this.getI18nByKey('编辑'),
                    moreOper: this.getI18nByKey('更多操作'),
                    enable: this.getI18nByKey('启用'),
                    disable: this.getI18nByKey('停用'),
                    delete: this.getI18nByKey('删除'),
                    deleteMinVersion: this.getI18nByKey('删除最新小版本'),
                    addPhase: this.getI18nByKey('添加阶段'),
                    addStatus: this.getI18nByKey('添加状态'),
                    save: this.getI18nByKey('保存'),
                    return: this.getI18nByKey('返回'),
                    lifecycleInfor: this.getI18nByKey('生命周期信息'),
                    phaseInformation: this.getI18nByKey('阶段信息'),
                    versionHistory: this.getI18nByKey('历史版本'),
                    failedGetHeader: this.getI18nByKey('获取权限列表表头失败'),
                    createLifecycle: this.getI18nByKey('创建生命周期'),
                    failedLifecycleDetails: this.getI18nByKey('获取生命周期详情失败'),
                    failedVersionHistory: this.getI18nByKey('获取历史版本失败'),
                    checkFailure: this.getI18nByKey('检入失败'),
                    enableSuccess: this.getI18nByKey('启用模板成功'),
                    enableFailed: this.getI18nByKey('启用模板失败'),
                    stopSuccess: this.getI18nByKey('停用模板成功'),
                    stopFailed: this.getI18nByKey('停用模板失败'),
                    deleteSuccess: this.getI18nByKey('删除成功'),
                    deleteFailed: this.getI18nByKey('删除失败'),
                    onlyOneDelete: this.getI18nByKey('当前模板只有一个版本，删除将会删除整个模板。确定删除吗'),
                    minRemoveSuccess: this.getI18nByKey('删除最新小版本成功'),
                    updateSuccessfully: this.getI18nByKey('更新成功'),
                    createSuccessfully: this.getI18nByKey('创建成功'),
                    updateFailed: this.getI18nByKey('更新失败'),
                    createFailed: this.getI18nByKey('创建失败'),
                    checkOutFailed: this.getI18nByKey('检出失败'),
                    lifecycleTemplate: this.getI18nByKey('暂无生命周期模板')
                },
                iconClass: 'edit2',
                phaseArr: [
                    // {
                    //     id: '1',
                    //     displayName: '阶段1'
                    // },
                ],
                activeTab: 'LifecycleInformation',
                componentHeight: '100%',
                tagWidth: 'auto',
                tagDisplay: 'none',
                title: '',
                formData: {},
                phaseOid: '', // 当前阶段信息
                addPhaseVisible: false,
                phaseFormData: {
                    state: ''
                },
                newData: {},
                selectPhase: [],
                historyData: [],

                phaseEnum: [],
                phaseEnumData: [],
                aclEnumData: [],

                checkoutId: '',
                isEditing: false,
                isEditPerson: true,
                editPerson: '',
                isEmpty: true,
                height: 0
            };
        },
        watch: {
            searchValue(val) {
                this.$refs.tree.filter(val);
            },
            formData: {
                handler: function (n, o) {
                    this.$nextTick(() => {
                        setTimeout(() => {
                            this.tagWidth = `${document.getElementById('lifecycle-form-content')?.clientWidth + 12}px`;
                        }, 50);
                    });
                },
                deep: true
            },
            isEmpty() {
                this.$nextTick(() => {
                    this.resetHeight();
                });
            }
        },
        computed: {
            queryParams() {
                return {
                    data: {
                        appName: this.data.appName,
                        isGetVirtualRole: true,
                        roleType: 'All'
                    }
                };
            },
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            formType: {
                get() {
                    this.$nextTick(() => {
                        if (this.$refs.header.clientHeight && this.$refs.phase.clientHeight) {
                            this.componentHeight = `calc(100vh - ${
                                this.$refs.header.clientHeight + this.$refs.phase.clientHeight + 76 + 25
                            }px)`;
                        }
                    });
                    if (this.type != 'check') {
                        this.isEditing = false;
                    }
                    return this.type;
                },
                set(value) {
                    this.$emit('update:type', value);
                }
            },
            key: {
                get() {
                    return this.checkoutId || this.data?.key || '';
                },
                set(val) {
                    this.$emit('update:data', val);
                }
            },
            isDelete() {
                return this.data?.delete === undefined ? true : this.data?.delete;
            },
            isEdit() {
                return this.data?.edit === undefined ? true : this.data?.edit;
            },
            oid() {
                return this.data?.oid || '';
            },
            tabList() {
                const unShowPhase = !this.formData?.lifecycleStates?.length;
                const unShowHistory = this.formType == 'create' || this.formType == 'update';
                return [
                    {
                        name: 'LifecycleInformation',
                        label: this.i18nMappingObj['lifecycleInfor'],
                        title: this.i18nMappingObj['lifecycleInfor'],
                        componentName: 'LifecycleInformation'
                    },
                    {
                        name: 'PhaseInformation',
                        label: this.i18nMappingObj['phaseInformation'],
                        title: this.i18nMappingObj['phaseInformation'],
                        unShow: unShowPhase,
                        componentName: 'PhaseInformation'
                    },
                    {
                        name: 'HistoryVersion',
                        label: this.i18nMappingObj['versionHistory'],
                        title: this.i18nMappingObj['versionHistory'],
                        unShow: unShowHistory,
                        componentName: 'HistoryVersion'
                    }
                ];
            }
        },
        mounted() {
            window.addEventListener('resize', this.debounceReset);
        },
        beforeDestryed() {
            window.removeEventListener('resize', this.debounceReset);
        },
        methods: {
            debounceReset: _.debounce(function () {
                this.resetHeight();
            }, 100),
            resetHeight() {
                const height = document.querySelector('.life-tabs-container')?.clientHeight || 0;
                if (height) {
                    this.height = height - 40 + 'px';

                    // 高度变化 滚动条不能及时更新, 加定时器手动修改后才正常
                    setTimeout(() => {
                        this.height = height - 40 - 1 + 'px';
                    }, 200);
                }
            },
            // 获取枚举
            getEnumData(Enum) {
                return new Promise((resolve, reject) => {
                    const enumData = new FormData();
                    enumData.append('realType', Enum);
                    // 获取枚举默认配置
                    let config = this.fnComponentHandle('enum-select', true)?.componentConfigs || {};
                    config['data'] = enumData;
                    this.$famHttp(config)
                        .then((resp) => {
                            let resultData = resp?.data || [];
                            resultData.forEach((item) => {
                                item.slotName = `column:default:${item.value}`;
                            });

                            this.phaseEnum = resultData.map((item) => item.value) || [];
                            this.phaseEnumData = resultData || [];
                            resolve();
                        })
                        .catch((err) => {
                            resolve();
                            // this.$message({
                            //     type: 'error',
                            //     message: err?.data?.message || err?.data || err
                            // });
                        });
                });
            },
            // 获取权限表头
            getAclSpec() {
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        url: '/fam/lifecycle/aclSpec/all',
                        method: 'GET'
                    })
                        .then((resp) => {
                            let { data } = resp || [];
                            data.forEach((item) => {
                                item.slotName = `column:default:${item.value}`;
                            });
                            // this.formData.aclEnumData = data
                            this.aclEnumData = data || [];
                            resolve();
                        })
                        .catch((error) => {
                            resolve();
                            console.error(error);
                            // this.$message({
                            //     type: 'error',
                            //     message: error?.data?.message || this.i18nMappingObj['failedGetHeader']
                            // });
                        });
                });
            },
            /**
             * 刷新生命周期数据
             */
            async refresh(type) {
                this.isEmpty = !!this.data?.isEmpty;
                if (this.isEmpty) return;
                if (this.formType == 'check') {
                    this.newData = this.data;
                }

                if (type == 'tree') {
                    this.checkoutId = '';
                }
                // 状态
                await this.getEnumData('erd.cloud.core.lifecycle.enums.SuccessionEnum');
                // 权限
                await this.getAclSpec();
                this.getData();
            },
            /**
             * 获取详情
             * @returns
             */
            getData() {
                if (this.formType == 'create') {
                    this.$nextTick(() => {
                        this.title = this.i18nMappingObj['createLifecycle'];
                        // 创建的初始化数据
                        this.formData = {
                            stateSuccessions: [],
                            lifecycleStates: [],
                            aclSpecs: [],
                            appName: this.data.appName || '',
                            basic: false,
                            enabled: true,
                            isUsed: false,
                            routing: true,
                            aclEnumData: this.aclEnumData,
                            phaseEnum: this.phaseEnum,
                            phaseEnumData: this.phaseEnumData
                        };
                        this.activeTab = 'LifecycleInformation';
                    });
                    return;
                }
                let url = '/fam/lifecycle/lastIteration' + '?branchOId=' + this.key;
                if (this.formType == 'checkHistory') {
                    url = '/fam/lifecycle/iteration' + `?templateOId=` + this.oid;
                }
                this.$famHttp({
                    url,
                    method: 'get'
                })
                    .then((resp) => {
                        let { data } = resp;
                        this.title = data?.displayName || '';
                        this.formData = data || {};
                        this.formData.containerRef = this.$store?.state?.app?.container?.oid || '';

                        this.$set(this.formData, 'aclEnumData', this.aclEnumData);
                        this.$set(this.formData, 'phaseEnum', this.phaseEnum);
                        this.$set(this.formData, 'phaseEnumData', this.phaseEnumData);

                        // 编辑时不切换到详情页签，其他操作均切换
                        if (this.formType != 'update' || this.activeTab == 'HistoryVersion') {
                            this.activeTab = 'LifecycleInformation';
                            this.phaseOid = '';
                        } else {
                            if (this.activeTab == 'PhaseInformation') {
                                this.tagBtn(this.formData.lifecycleStates[0]);
                            }
                        }

                        this.formData.lifecycleStates?.forEach((item) => {
                            this.formData.phaseEnum.forEach((key) => {
                                if (!Object.keys(item).includes(key)) {
                                    this.$set(item, key, false);
                                }
                            });
                        });
                        this.transFormat(this.formData, 'stateSuccessions', 'lifecycleStates', 'stateTableData');

                        // 获取历史版本数据
                        this.getHistoryData();

                        // 处理接口返回 aclSpecs 为空数组时，导致保存无法保存上选择的权限控制内容的问题
                        if (
                            this.formData.aclSpecs &&
                            !this.formData.aclSpecs.length &&
                            this.formData?.lifecycleStates &&
                            this.formData?.lifecycleStates.length
                        ) {
                            this.formData?.lifecycleStates.forEach((item) => {
                                let obj = {
                                    stateRef: item.oid,
                                    accessRoleList: {
                                        accessRoleInfoList: []
                                    }
                                };
                                this.formData.aclSpecs.push(obj);
                            });
                        }

                        this.isEditing = false;
                        // 当前登录人
                        const loginInfo = this.$store.state.app.user;
                        if (this.formType == 'check' && this.formData.iterationInfo.state === 'WORKING') {
                            this.editPerson = this.formData?.locker?.displayName || '';
                            this.isEditing = true;
                        }

                        // 判断当前登录人是否为编辑者
                        if (this.isEditing) {
                            if (this.formData?.locker.oid != loginInfo.oid) {
                                this.isEditPerson = false;
                            }
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                        // this.$message({
                        //     type: 'error',
                        //     message: error?.data?.message || this.i18nMappingObj['failedLifecycleDetails']
                        // });
                    });
            },
            /**
             * 匹配列表项对应的值
             * @param {*} data 待处理的数据，formData
             * @param {*} roleA 列表项的数据
             * @param {*} roleB 列表的数据属性
             * @param {*} targetName 列表的数据属性
             */
            transFormat(data, roleA, roleB, targetName) {
                // 设置一个新的属性,表示流转条件列表
                if (targetName && !data[targetName]) {
                    this.$set(data, targetName, []);
                }
                this.$set(data, targetName, []);

                // 获取所有的阶段的oid
                const stateRefs = data?.[roleB]?.map((item) => item.oid);
                stateRefs?.forEach((roleRef) => {
                    // 获取列表的最初数据
                    let targetList = JSON.parse(JSON.stringify(data?.[roleB]));
                    // 处理初始数据
                    targetList.forEach((value) => {
                        let attrArr = [];
                        data?.[roleA] &&
                            data?.[roleA].forEach((item) => {
                                if (item.roleARef == roleRef && value.oid == item.roleBRef) {
                                    attrArr.push(item.name);
                                }
                            });
                        data.phaseEnum.forEach((key) => {
                            if (!Object.keys(value).includes(key)) {
                                this.$set(value, key, false);
                            }
                        });
                        attrArr.forEach((key) => {
                            this.$set(value, key, true);
                        });
                    });
                    data[targetName].push({
                        roleBRef: roleRef,
                        [roleB]: targetList
                    });
                });
            },
            getHistoryData() {
                this.$famHttp({
                    url: '/fam/lifecycle/history' + `?branchOId=${this.formData?.vid}`,
                    method: 'GET'
                })
                    .then((resp) => {
                        let { data } = resp;
                        data.forEach((item) => {
                            item.containerRef = this.$store?.state.app?.container;
                        });
                        this.historyData = data;
                    })
                    .catch((error) => {
                        console.error(error);
                        // this.$message({
                        //     type: 'error',
                        //     message: error?.data?.message || this.i18nMappingObj['failedVersionHistory']
                        // });
                    });
            },
            onEdit() {
                // 与树列表点击创建和查看回调方法一样，统一数据处理
                // 调用检入接口
                if (this.isEditing) {
                    if (this.isEditPerson) {
                        this.$emit('onsubmit', this.data, 'update');
                        this.formType = 'update';
                        return;
                    }
                    return this.$message({
                        type: 'error',
                        message: `${this.$t('isEditingBy', { user: this.editPerson })}`,
                        showClose: false
                    });
                }
                this.$famHttp({
                    url: '/fam/lifecycle/checkout' + `?branchOId=${this.key}`,
                    method: 'PUT'
                })
                    .then((resp) => {
                        this.checkoutId = resp.data || '';
                        this.$emit('onsubmit', this.data, 'update');
                        this.formType = 'update';
                        // 检出成功之后，使用新的版本号查找新的数据
                        this.$emit('onrefresh', resp.data, 'check');
                    })
                    .catch((error) => {
                        console.error(error);
                        // this.$message({
                        //     type: 'error',
                        //     message: error?.data?.message || this.i18nMappingObj['checkFailure'],
                        //     showClose: true
                        // });
                    });

                // this.$emit('onsubmit', this.data, 'update')
                // this.formType = 'update'
            },
            /**
             * 启用
             */
            onEnabled() {
                this.$famHttp({
                    url: '/fam/lifecycle/template/enabled' + `?branchOId=${this.formData?.vid}`,
                    method: 'GET'
                })
                    .then((resp) => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['enableSuccess']
                        });
                        this.refresh();
                    })
                    .catch((error) => {
                        console.error(error);
                        // this.$message({
                        //     type: 'error',
                        //     message: error?.data?.message || this.i18nMappingObj['enableFailed'],
                        //     showClose: true
                        // });
                    });
            },
            /**
             * 停用
             */
            onDisable() {
                this.$famHttp({
                    url: '/fam/lifecycle/template/disable' + `?branchOId=${this.formData?.vid}`,
                    method: 'GET'
                })
                    .then((resp) => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['stopSuccess']
                        });
                        this.refresh();
                    })
                    .catch((error) => {
                        console.error(error);
                        // this.$message({
                        //     type: 'error',
                        //     message: error?.data?.message || this.i18nMappingObj['stopFailed']
                        // });
                    });
            },
            /**
             * 删除
             */
            onDelete() {
                this.$confirm(this.i18nMappingObj['confirmDelete'], this.i18nMappingObj['confirmDelete'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then((_) => {
                    this.$famHttp({
                        url: '/fam/lifecycle/delete',
                        params: {
                            branchOId: this.formData?.vid
                        },
                        method: 'DELETE'
                    })
                        .then((resp) => {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj['deleteSuccess'],
                                showClose: true
                            });
                            this.$emit('onrefresh');
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                });
            },
            /**
             * 删除最小版本
             */
            onDeleteMin() {
                this.$confirm(
                    this.historyData.length > 1
                        ? this.i18nMappingObj['confirmDelete']
                        : this.i18nMappingObj['onlyOneDelete'],
                    this.i18nMappingObj['confirmDelete'],
                    {
                        showConfirmButton: true,
                        showCancelButton: true,
                        confirmButtonText: this.i18nMappingObj['ok'],
                        type: 'warning'
                    }
                ).then((resp) => {
                    this.$famHttp({
                        url: '/fam/lifecycle/deleteLast',
                        params: {
                            branchOId: this.formData?.vid
                        },
                        method: 'DELETE'
                    })
                        .then((resp) => {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj['minRemoveSuccess'],
                                showClose: true
                            });
                            if (this.historyData.length > 1) {
                                this.refresh();
                            } else {
                                this.$emit('onrefresh');
                            }
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                });
            },
            /**
             * tab切换
             * @param {*} node
             */
            activeChange(node) {
                this.resetHeight();
                // 如果是阶段信息，则需要判断是否已经选择过阶段，如果没有选择过阶段，则默认选择第一个阶段
                if (node.name == 'PhaseInformation') {
                    let flag = false;
                    this.formData?.lifecycleStates?.forEach((item) => {
                        if (item.active) {
                            flag = true;
                        }
                    });

                    if (!flag) {
                        this.phaseOid = this.formData.lifecycleStates[0].oid;
                        this.$set(this.formData.lifecycleStates[0], 'active', true);
                    }
                }
            },
            /**
             * tab组件的回调函数
             * @param {*} data 回调数据
             * @param {*} type 触发回调的类型
             */
            onSubmit(data, type) {
                this.$emit('onsubmit', data, type);
                this.formType = type;
            },
            /**
             * 添加阶段
             */
            addPhase() {
                this.submit(() => {
                    this.selectPhase = this.formData?.lifecycleStates?.map((item) => item.oid);
                    this.addPhaseVisible = true;
                });
            },
            /**
             * 删除阶段
             */
            closeBtn(data) {
                this.$confirm(this.i18nMappingObj['confirmDelete'], this.i18nMappingObj['confirmDelete'], {
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: this.i18nMappingObj['ok'],
                    type: 'warning'
                })
                    .then(() => {
                        this.formData?.lifecycleStates?.forEach((item, index) => {
                            if (item.oid === data.oid) {
                                this.formData.lifecycleStates.splice(index, 1);
                                if (data.active) {
                                    this.tagBtn(this.formData.lifecycleStates[0]);
                                }
                            }
                        });
                        this.formData.stateTableData.forEach((item, index) => {
                            if (item.roleBRef === data.oid) {
                                this.formData.stateTableData.splice(index, 1);
                            }
                        });

                        this.formData.stateTableData?.forEach((item, index) => {
                            item.lifecycleStates?.forEach((value, i) => {
                                if (value.oid === data.oid) {
                                    item.lifecycleStates.splice(i, 1);
                                }
                            });
                        });
                    })
                    .catch(() => {});
            },
            /**
             * 点击阶段
             * @param {*} data 点击阶段tag的数据
             */
            tagBtn(data) {
                this.$nextTick(() => {
                    this.formData.lifecycleStates.forEach((item) => {
                        if (item.oid == data.oid) {
                            this.phaseOid = item.oid;
                            this.$set(item, 'active', true);
                        } else {
                            this.$set(item, 'active', false);
                        }
                    });
                    this.activeTab = 'PhaseInformation';
                });
            },
            /**
             * 保存
             */
            onSave() {
                if (!this.formData.lifecycleStates.length) {
                    return this.$message({
                        type: 'warning',
                        message: '生命周期至少有一个阶段'
                    });
                }
                this.submit(() => {
                    let stateSuccessions = [];
                    let stateRefs = [];
                    let aclSpecs = [];
                    let processes = [];

                    this.formData?.lifecycleStates?.forEach((item) => {
                        stateRefs.push(item.oid);
                    });

                    // stateSuccessions = this.formData?.stateSuccessions || []
                    this.formData?.stateSuccessions?.forEach((item) => {
                        stateSuccessions.push({
                            name: item.name,
                            roleARef: item.roleARef,
                            roleBRef: item.roleBRef
                        });
                    });
                    this.formData?.aclSpecs?.forEach((item) => {
                        let obj = {
                            stateRef: item.stateRef,
                            accessRoleList: {
                                accessRoleInfoList: item?.accessRoleList?.accessRoleInfoList || []
                            }
                        };
                        aclSpecs.push(obj);
                    });

                    // TODO封板前注释
                    this.formData?.processes?.forEach((item) => {
                        if (item.engineModelKey) {
                            let obj = {
                                stateRef: item.stateRef,
                                processRef: item.processRef,
                                engineModelKey: item.engineModelKey
                            };
                            processes.push(obj);
                        }
                    });
                    let data = {
                        // ...this.formData,
                        basic: this.formData?.basic || false,
                        branchOId: this.formType == 'create' ? '' : this.formData?.vid, // 检出后id
                        master: {
                            description: this.formData?.description || '',
                            routing: this.formData?.routing || false,
                            enabled: this.formData?.enabled || false,
                            name: this.formData?.name || '',
                            code: this.formData?.code || '',
                            supportedClass: this.formData?.supportedClass || '', // 对象类型
                            isUsed: this.formData?.isUsed || false,
                            appName: this.formData?.appName || ''
                        },
                        appName: this.formData?.appName || '',
                        stateSuccessions,
                        stateRefs,
                        aclSpecs,
                        processes
                    };

                    // 特殊字段,需要去掉
                    // delete data.isUsed

                    let url = '/fam/lifecycle/update';
                    let method = 'PUT';
                    if (this.formType == 'create') {
                        url = '/fam/lifecycle/create';
                        method = 'POST';
                    }
                    this.$famHttp({
                        url,
                        method,
                        data
                    })
                        .then((resp) => {
                            this.$message({
                                type: 'success',
                                message:
                                    this.formType == 'update'
                                        ? this.i18nMappingObj['updateSuccessfully']
                                        : this.i18nMappingObj['createSuccessfully'],
                                showClose: true
                            });
                            // 保存成功清空检出id
                            this.checkoutId = resp.data || '';
                            // 刷新树列表
                            if (this.formType == 'update') {
                                this.$emit('onsubmit', this.data, 'check');
                                this.$emit('onrefresh', resp.data, 'update');
                            } else {
                                this.$emit('onrefresh', resp.data, 'create');
                            }
                        })
                        .catch((error) => {
                            console.error(error);
                            // this.$message({
                            //     type: 'error',
                            //     message:
                            //         error?.data?.message ||
                            //         (this.formType == 'update'
                            //             ? this.i18nMappingObj['updateFailed']
                            //             : this.i18nMappingObj['createFailed']),
                            //     showClose: true
                            // });
                        });
                });
            },
            /**
             * 取消
             */
            onCancel() {
                if (this.formType == 'create') {
                    this.$emit('onrefresh', this.key);
                } else {
                    this.$famHttp({
                        url: '/fam/lifecycle/undoCheckout' + `?branchOId=${this.key}`,
                        method: 'GET'
                    })
                        .then((resp) => {
                            // 取消成功之后，使用新的版本号查找新的数据
                            this.checkoutId = resp.data || '';
                            this.$emit('onsubmit', this.data, 'check');
                            this.$emit('onrefresh', resp.data);
                        })
                        .catch((error) => {
                            // this.$message({
                            //     type: 'error',
                            //     message: error?.data?.message || this.i18nMappingObj['checkOutFailed']
                            // });
                        });
                    // this.$emit('onsubmit', this.data, 'check')
                }
            },
            /**
             * 生命周期表单校验
             * @param {*} cb 校验通过的回调
             * @returns
             */
            submit(cb) {
                const LifecycleInformationForm =
                    this.$refs?.LifecycleInformation[0]?.$refs?.LifecycleInformationForm || false;
                if (LifecycleInformationForm) {
                    return new Promise((resolve, reject) => {
                        LifecycleInformationForm.submit().then(({ valid }) => {
                            if (valid) {
                                cb && cb();
                            } else {
                                reject();
                            }
                        });
                    });
                } else {
                    if (this.formData.name) {
                        cb && cb();
                    }
                }
            },
            /**
             * 查看历史版本返回最新
             */
            onReturn() {
                this.$emit('onsubmit', this.newData, 'check');
            },
            /***************/
            /**
             * 添加状态
             * @param {*} data 状态数据
             */
            addPhaseSubmit(data) {
                if (!this.formData.phaseEnum) {
                    this.formData.phaseEnum = [];
                }
                data.forEach((item) => {
                    this.formData.phaseEnum.forEach((key) => {
                        if (!Object.keys(item).includes(key)) {
                            this.$set(item, key, false);
                        }
                    });
                });
                // 阶段信息
                if (!this.formData.lifecycleStates) {
                    this.formData.lifecycleStates = [];
                }
                this.formData.lifecycleStates = [...this.formData.lifecycleStates, ...data];

                // 阶段列表
                if (!this.formData.stateTableData) {
                    this.formData.stateTableData = [];
                }
                this.transFormat(this.formData, 'stateSuccessions', 'lifecycleStates', 'stateTableData');

                // // 阶段
                // if(!this.formData.stateSuccessions) {
                //     this.formData.stateSuccessions = []
                // }
                // this.formData.stateSuccessions.push(data)
                // 权限控制 stateRef
                if (!this.formData.aclSpecs) {
                    this.formData.aclSpecs = [];
                }
                const accessList = data.map((item) => {
                    let obj = {
                        stateRef: item.roleBRef,
                        accessRoleList: {
                            accessRoleInfoList: []
                        }
                    };
                    return obj;
                });
                this.formData.aclSpecs = [...this.formData.aclSpecs, ...accessList];

                // stateRefs
                if (!this.formData.stateRefs) {
                    this.formData.stateRefs = [];
                }
                let stateRefs = data.map((item) => item.oid);
                this.formData.stateRefs = [...this.formData.stateRefs, ...stateRefs];

                // 默认选中
                this.tagBtn(data[data.length - 1]);
                this.activeTab = 'PhaseInformation';

                // processes
                if (!this.formData.processes) {
                    this.formData.processes = [];
                }
                const processesList = data.map((item) => {
                    let obj = {
                        stateRef: item.roleBRef,
                        processRef: ''
                    };
                    return obj;
                });
                this.formData.processes = [...this.formData.processes, ...processesList];
            }
        }
    };
});
