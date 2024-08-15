/**
 * 创建菜单
 * **/
define([
    'erdcloud.kit',
    'text!' + ELMP.resource('system-menu/components/UpdateMenu/index.html'),
    'erdc-kit',
    ELMP.resource('erdc-components/FamErdTable/index.js'),
    ELMP.resource('erdc-components/FamParticipantSelect/ParticipantTypes.js'),
    'css!./style.css'
], function (ErdcKit, template, utils, ErdTable, ParticipantTypes) {
    return {
        template,
        components: {
            // 基础表格
            ErdTable,
            // 参与人员控件
            FamParticipantSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js'))
        },
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: false
            },
            // 显示菜单
            isShowMenu: {
                type: Boolean,
                default: false
            },
            // 是否可读
            readonly: {
                type: Boolean,
                default: false
            },
            // 查看菜单
            lookMenu: {
                type: Boolean,
                default: false
            },

            // 当前操作的oid
            oid: {
                type: String | Array,
                default: ''
            },
            // 当前菜单名称
            menuName: {
                type: String,
                default: ''
            },
            // 当前菜单等级
            menuLevel: {
                type: Number,
                default: 0
            },

            // 菜单id
            menuId: {
                type: String,
                default: ''
            },

            // 当前新增编辑操作的父级id
            parentOid: {
                type: String,
                default: ''
            },
            queryParams: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 设置权限类型，分为单次修改与批量修改
            addPowerType: {
                type: String,
                default: ''
            }
        },
        data: function () {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 公用主页面国际化文件
                i18nLocalePath: ELMP.resource('system-menu/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    updateMenu: this.getI18nByKey('编辑菜单'),
                    lookMenu: this.getI18nByKey('查看菜单'),
                    updateMenuLimit: this.getI18nByKey('配置菜单权限'),
                    enter: this.getI18nByKey('请输入'),
                    name: this.getI18nByKey('名称'),
                    code: this.getI18nByKey('编码'),
                    level: this.getI18nByKey('排序'),
                    href: this.getI18nByKey('链接'),
                    icon: this.getI18nByKey('图标'),
                    isShow: this.getI18nByKey('是否显示'),
                    appName: this.getI18nByKey('所属应用'),
                    target: this.getI18nByKey('展示方式'),
                    operation: this.getI18nByKey('操作'),
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否'),
                    number_required_msg: this.getI18nByKey('number_required_msg'),
                    munber_max_msg: this.getI18nByKey('munber_max_msg'),
                    sselectIcon: this.getI18nByKey('选择图标'),
                    IconTips: this.getI18nByKey('IconTips'),
                    pleaseSelet: this.getI18nByKey('请选择'),
                    successUpdate: this.getI18nByKey('菜单更新成功'),
                    wxts: this.getI18nByKey('温馨提示'),
                    submit: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    close: this.getI18nByKey('关闭'),
                    edit: this.getI18nByKey('编辑'),
                    baseMsg: this.getI18nByKey('基本信息'),
                    menuAuth: this.getI18nByKey('配置菜单权限'),
                    userMenuAuth: this.getI18nByKey('当前菜单权限'),
                    failedUpdate: this.getI18nByKey('failedUpdate'),
                    participantType: this.getI18nByKey('参与者类型'),
                    participant: this.getI18nByKey('参与者'),
                    department: this.getI18nByKey('部门'),
                    phone: this.getI18nByKey('电话'),
                    email: this.getI18nByKey('邮箱'),
                    failedAdd: this.getI18nByKey('添加成员失败'),
                    addUser: this.getI18nByKey('添加成员'),
                    remove: this.getI18nByKey('移除'),
                    failedRemoveUser: this.getI18nByKey('移除人员失败'),
                    errorSelect: this.getI18nByKey('errorSelect'),
                    successAdd: this.getI18nByKey('成员添加成功'),
                    successRemove: this.getI18nByKey('移除成功'),
                    administrator: this.getI18nByKey('接口异常,请联系管理员'),
                    sure_delect: this.getI18nByKey('确认移除'),
                    getErrorMenu: this.getI18nByKey('获取菜单数据失败'),
                    iframePage: this.getI18nByKey('iframe 弹框页面'),
                    iframeInPage: this.getI18nByKey('iframe 嵌入页面'),
                    newTagPage: this.getI18nByKey('新标签页面'),
                    systemInPage: this.getI18nByKey('系统内置页面'),
                    systemPopPage: this.getI18nByKey('系统弹窗页面'),
                    oneMenuDrawer: this.getI18nByKey('一级菜单抽屉'),
                    菜单名称: this.getI18nByKey('菜单名称'),
                    编辑菜单: this.getI18nByKey('编辑菜单')
                },
                // ======================================== //
                visibleDialog: false,
                participantTypesMap: ParticipantTypes.reduce((pre, next) => {
                    pre[next.value] = next.name;
                    return pre;
                }, {}),
                formData: {
                    identifierNo: '',
                    name: {
                        attrName: 'nameI18nJson',
                        value: {
                            value: ''
                        }
                    },
                    sort: '',
                    icon: '',
                    isShow: '1',
                    target: 'open',
                    href: '',
                    appName: ''
                },
                unfold1: true,
                unfold2: true,
                tableHeight: 280,
                tableData: [],
                // 分页
                pagination: {
                    pageSize: 10,
                    pageIndex: 1,
                    total: 0
                },
                loading: false,
                queryScope: 'fullTenant',
                isFirstMenu: false,
                participantCache: {},
                removeIds: [],
                participantSelectType: 'ROLE',
                defaultTableData: []
            };
        },
        //  计算属性
        computed: {
            disableIds() {
                return this.tableData.map((item) => item.roleBObjectRef);
            },
            dialogVisible: function () {
                this.visibleDialog = this.visible;
                if (this.visible) {
                    // 获取菜单详情
                    this.getMenuDetial();
                }
                return this.visible;
            },

            // 展示方式
            targetOptions: function () {
                return [
                    // {
                    //     value: 'iframe',
                    //     label: this.i18nMappingObj.iframePage
                    // },
                    // {
                    //     value: 'iframe-sectio',
                    //     label: this.i18nMappingObj.iframeInPage
                    // },
                    {
                        value: 'link',
                        label: this.i18nMappingObj.newTagPage
                    },
                    {
                        value: 'open',
                        label: this.i18nMappingObj.systemInPage
                    }
                    // {
                    //     value: 'modal',
                    //     label: this.i18nMappingObj.systemPopPage
                    // },
                    // {
                    //     value: 'popbox',
                    //     label: this.i18nMappingObj.oneMenuDrawer
                    // }
                ];
            },

            // 是否显示
            isShowOptions: function () {
                return [
                    {
                        value: '1',
                        label: this.i18nMappingObj.yes
                    },
                    {
                        value: '0',
                        label: this.i18nMappingObj.no
                    }
                ];
            },

            formConfig: function () {
                return [
                    {
                        field: 'identifierNo',
                        component: 'erd-input',
                        label: this.i18nMappingObj.code,
                        labelLangKey: this.i18nMappingObj.code,
                        required: true,
                        readonly: this.isFirstMenu,
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj.enter
                        },
                        validators: [
                            { required: true, message: this.i18nMappingObj.number_required_msg, trigger: 'blur' },
                            { max: 100, message: this.i18nMappingObj.munber_max_msg, trigger: 'blur' }
                        ],
                        col: 12
                    },
                    {
                        field: 'name',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj.name,
                        labelLangKey: this.i18nMappingObj.name,
                        required: true,
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj.pleaseSelet
                        },
                        col: 12
                    },
                    {
                        field: 'sort',
                        component: 'erd-input-number',
                        label: this.i18nMappingObj.level,
                        labelLangKey: this.i18nMappingObj.level,
                        required: true,
                        props: {},
                        col: 12
                    },
                    {
                        field: 'icon',
                        component: 'FamIconSelect',
                        label: this.i18nMappingObj.icon,
                        labelLangKey: this.i18nMappingObj.icon,
                        readonly: this.isFirstMenu,
                        type: 'icon',
                        props: {
                            title: this.i18nMappingObj.sselectIcon,
                            visibleBtn: true,
                            btnName: this.i18nMappingObj.sselectIcon,
                            visibleTips: true,
                            tips: this.i18nMappingObj.IconTips
                        },
                        col: 12
                    },
                    {
                        field: 'isShow',
                        label: this.i18nMappingObj.isShow,
                        labelLangKey: this.i18nMappingObj.isShow,
                        readonly: this.isFirstMenu,
                        slots: {
                            component: 'updatemenuisshow',
                            readonly: 'updatemenuisshowReadonly'
                        },
                        col: 12
                    },
                    {
                        field: 'target',
                        label: this.i18nMappingObj.target,
                        labelLangKey: this.i18nMappingObj.target,
                        readonly: this.isFirstMenu,
                        slots: {
                            component: 'updatemenutarget',
                            readonly: 'onlyRead'
                        },
                        col: 12
                    },
                    {
                        field: 'href',
                        component: 'erd-input',
                        label: this.i18nMappingObj.href,
                        labelLangKey: this.i18nMappingObj.href,
                        props: {
                            clearable: true,
                            maxlength: 300
                        },
                        col: 12
                    },
                    {
                        field: 'appName',
                        component: 'custom-select',
                        disabled: true,
                        readonly: true,
                        label: this.i18nMappingObj.appName,
                        labelLangKey: this.i18nMappingObj.appName,
                        props: {
                            row: {
                                componentName: 'constant-select',
                                viewProperty: 'displayName',
                                valueProperty: 'identifierNo',
                                referenceList: this.$store.state?.app?.appNames || []
                            }
                        },
                        col: 12
                    }
                ];
            },

            // 获取国际化 放置计算属性
            column: function () {
                return [
                    {
                        title: ' ',
                        type: 'seq',
                        width: 48,
                        fixed: 'left',
                        align: 'center'
                    },
                    {
                        prop: 'participantType', // 列数据字段key
                        title: this.i18nMappingObj.participantType, // 列头部标题
                        minWidth: '150', // 列宽度
                        width: '150',
                        fixed: 'left'
                        // 筛选属性 有当前属性对应字段头部会自动添加筛选图标
                        // filter : {
                        //     type : 'filterInput',//  筛选类型 默认只提供4中 搜索[filterInput] 多选[filterCheckbox] 单选[filterSelect] 选择器+输入框[filterMergeSelect]
                        //     value : '',// 筛选器选择的值 自定义筛选的可忽略
                        //     submit : this.filterMethod// 筛选控件回调事件 自定义筛选的可忽略
                        // },
                    },
                    {
                        prop: 'participant', // 列数据字段key
                        title: this.i18nMappingObj.participant, // 列头部标题
                        minWidth: '230', // 列宽度
                        width: '230'
                    },
                    {
                        prop: 'department', // 列数据字段key
                        title: this.i18nMappingObj.department, // 列头部标题
                        minWidth: '', // 列宽度
                        width: ''
                    },
                    {
                        prop: 'phone', // 列数据字段key
                        title: this.i18nMappingObj.phone, // 列头部标题
                        minWidth: '140', // 列宽度
                        width: '140'
                    },
                    {
                        prop: 'email', // 列数据字段key
                        title: this.i18nMappingObj.email, // 列头部标题
                        minWidth: '200', // 列宽度
                        width: '200'
                    },
                    {
                        prop: 'operation', // 列数据字段key
                        title: this.i18nMappingObj.operation, // 列头部标题
                        minWidth: '90', // 列宽度
                        width: '90',
                        fixed: 'right'
                    }
                ];
            },

            // 权限菜单弹窗标题显示
            dialogTitle: function () {
                if (!this.isShowMenu && !this.lookMenu) {
                    return this.i18nMappingObj['编辑菜单'];
                } else if (this.lookMenu && this.readonly) {
                    return this.i18nMappingObj.lookMenu;
                } else if (this.addPowerType === 'single') {
                    return this.i18nMappingObj.updateMenuLimit;
                } else {
                    return this.i18nMappingObj['菜单名称'];
                }
            },
            participantVal: {
                get() {
                    return {
                        type: this.participantSelectValue.type,
                        value: this.participantSelectValue.value.map((item) => item.oid)
                    };
                },
                set(val) {}
            },
            participantSelectValue() {
                let list = [];
                this.tableData.forEach((item) => {
                    if (item.participantType === this.participantSelectType) {
                        list.push(item.principal || item.roleBObjectRef);
                    }
                });
                const value = this.tableData
                    .map((item) => {
                        return {
                            ...item,
                            displayName: item?.participant,
                            oid: item.roleBObjectRef || item.oid,
                            orgName: item.department
                        };
                    })
                    .filter((item) => list.includes(item.oid) || list.includes(item.roleBObjectRef));
                return {
                    type: this.participantSelectType,
                    value
                };
            },
            newTotal() {
                const newAddData = this.tableData.filter((item) => item.__NEW_ROW__);
                return newAddData.length || 0;
            }
        },
        mounted() {
            this.getTableList();
        },
        methods: {
            updatemenuisshowReadonly(value) {
                return this.isShowOptions.find((item) => +item.value === +value).label;
            },
            edit: function () {
                this.readonly = false;
            },

            // 数据更新接口
            updateService: function (data, errorMsg, batch) {
                this.loading = true;
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        url: batch ? '/fam/saveOrUpdate' : '/fam/update',
                        method: 'post',
                        data
                    })
                        .then((res) => {
                            resolve(res);
                        })
                        .catch((error) => {
                            this.$message({
                                message: error?.data?.message || errorMsg || this.i18nMappingObj.administrator,
                                type: 'error'
                            });
                            reject(error);
                        })
                        .finally(() => {
                            this.loading = false;
                        });
                });
            },
            // 查看菜单展示方式
            getOpen: function (val) {
                const openData = this.targetOptions.filter((item) => item.value === val);
                return openData[0]?.label || '-';
            },

            // 人员列表分页切换
            handlePageChange: function () {
                this.getTableList();
            },

            // size切换
            handleSizeChange: function () {
                this.pagination.pageIndex = 1;
                this.getTableList();
            },

            // 获取表格数据
            getTableList: function () {
                if (!this.menuId || this.addPowerType === 'multiple') return;
                this.$famHttp({
                    url: '/fam/resource/link/page',
                    method: 'post',
                    data: {
                        pageIndex: this.pagination.pageIndex,
                        pageSize: this.pagination.pageSize,
                        roleAObjectOId: typeof this.oid === 'string' ? this.oid : this.oid[0],
                        orderBy: 'createTime',
                        sortBy: 'desc'
                    }
                })
                    .then((res) => {
                        const list = res.data?.records || [];
                        const total = res.data?.total || 0;
                        this.pagination.total = Number(total);
                        this.participantsList = list.map((item) => {
                            // 各自人员类型对象 包含用户 角色 群组 组织
                            let userObj =
                                item?.userInfo || item?.roleDto || item?.organizationDto || item?.groupDto || {};
                            return {
                                id: item.id,
                                oid: item.oid,
                                participantType: item.linkName || '-', // 参与者类型
                                participant: userObj?.displayName || '-', // 参与者
                                roleBObjectRef: item.roleBObjectRef,
                                department: userObj?.orgName || '-', // 部门
                                phone: userObj?.mobile || '-', // 电话
                                email: userObj?.email || '-', // 电话 || '',// 邮箱
                                code: item.userInfo ? userObj?.code || '--' : ''
                            };
                        });
                        this.getTablePageData();
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            getTablePageData() {
                const { participantsList, pagination } = this;

                this.tableData = ErdcKit.deepClone(participantsList);
                this.defaultTableData = ErdcKit.deepClone(participantsList);
            },

            // 移除成员
            remove: function (data) {
                // 弹窗提醒
                const self = this;
                this.$confirm(
                    `${this.i18nMappingObj.sure_delect}【${data?.row?.participant || ''}】${
                        this.i18nMappingObj.userMenuAuth
                    }?`,
                    this.i18nMappingObj.wxts,
                    {
                        confirmButtonText: this.i18nMappingObj.submit,
                        cancelButtonText: this.i18nMappingObj.cancel,
                        type: 'warning'
                    }
                )
                    .then(() => {
                        self.$refs.erdTable.$refs.xTable.remove(data.row);
                        const index = self.tableData.findIndex(
                            (item) => item.roleBObjectRef === data.row.roleBObjectRef
                        );
                        self.tableData.splice(index, 1);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },

            // 添加成员
            userSearchSubmit: function () {
                const isArray = _.isArray(this.oid);
                let relationList = [];
                this.removeIds = [];
                const selectUser = this.tableData.filter((item) => item.__NEW_ROW__);
                this.defaultTableData.forEach((item) => {
                    const found = !this.tableData.some((ele) => ele.roleBObjectRef === item.roleBObjectRef);
                    if (found) {
                        this.removeIds.push(item.oid);
                    }
                });
                const createList = selectUser.map((item) => {
                    return {
                        action: 'CREATE',
                        attrRawList: [
                            {
                                attrName: 'roleBObjectRef',
                                value: item.roleBObjectRef
                            }
                        ],
                        className: 'erd.cloud.foundation.core.menu.entity.ResourceLink'
                    };
                });
                const removeList = this.removeIds?.map((item) => {
                    return {
                        action: 'DELETE',
                        oid: item,
                        className: 'erd.cloud.foundation.core.menu.entity.ResourceLink'
                    };
                });
                relationList = createList.concat(removeList);
                const batchAddPermission = {
                    className: 'erd.cloud.foundation.core.menu.entity.Resource',
                    rawDataVoList: []
                };
                if (isArray) {
                    _.each(this.oid, (item) => {
                        batchAddPermission.rawDataVoList.push({
                            className: 'erd.cloud.foundation.core.menu.entity.Resource',
                            oid: item.oid,
                            attrRawList: [],
                            associationField: 'roleAObjectRef',
                            relationList: createList
                        });
                    });
                }
                // 防抖
                utils.debounceFn(() => {
                    this.updateService(
                        isArray
                            ? batchAddPermission
                            : {
                                  className: 'erd.cloud.foundation.core.menu.entity.Resource',
                                  oid: this.oid,
                                  attrRawList: [],
                                  associationField: 'roleAObjectRef',
                                  relationList
                              },
                        '',
                        isArray
                    )
                        .then(() => {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj.successAdd
                            });
                            // 刷新表格
                            this.getTableList();
                            // 批量增加菜单权限成功后关闭弹窗
                            if (this.addPowerType === 'multiple') {
                                this.cancel();
                            }
                        }, this.i18nMappingObj.failedAdd)
                        .finally(() => {
                            //
                        });
                }, 200);
            },

            // 参与者类型筛选 -- TODO 暂时不做
            filterMethod: function () {
                // do nothing.
            },

            // 菜单展开收缩
            onsubmitPanel: function (type, data) {
                if (type === 1) {
                    const $from = $('#custom-from-update');
                    data ? $from.show(100) : $from.hide(100);
                }
                if (type === 2) {
                    const $div = $('#userAuth-wapper');
                    data ? $div.show(100) : $div.hide(100);
                }
            },

            // 获取菜单详情
            getMenuDetial: function () {
                if (!this.oid || typeof this.oid !== 'string') return;
                this.$famHttp({
                    url: '/fam/attr',
                    method: 'get',
                    data: {
                        className: 'erd.cloud.foundation.core.menu.entity.Resource',
                        oid: this.oid
                    }
                })
                    .then((res) => {
                        const data = res.data || {};
                        const rawData = data?.rawData || {};
                        const nameObj = {
                            attrName: rawData.nameI18nJson?.attrName || '',
                            value: rawData.nameI18nJson?.value || ''
                        };
                        this.isFirstMenu = rawData?.parentRef?.oid.includes('-1');
                        this.formData = {
                            identifierNo: rawData.identifierNo?.value || '',
                            name: nameObj,
                            sort: rawData.sort?.value + '' || '',
                            icon: rawData.icon?.value || '',
                            isShow: (rawData.isShow?.value ? '1' : '0') || '1',
                            target: rawData.target?.value || 'open',
                            href: rawData.href?.value || '',
                            appName: rawData.appName?.value || ''
                        };
                    })
                    .catch(() => {
                        this.$confirm(this.i18nMappingObj.getErrorMenu, this.i18nMappingObj.wxts, {
                            confirmButtonText: this.i18nMappingObj.submit,
                            showCancelButton: false,
                            closeOnClickModal: false,
                            type: 'error'
                        })
                            .then(() => {
                                this.close();
                            })
                            .catch(() => {
                                this.close();
                            });
                    });
            },

            // 更新菜单
            update: function () {
                this.updateService({
                    oid: this.oid,
                    className: 'erd.cloud.foundation.core.menu.entity.Resource',
                    appName: this.formData.appName,
                    isDraft: true,
                    attrRawList: [
                        {
                            attrName: 'identifierNo',
                            value: this.formData.identifierNo
                        },
                        {
                            attrName: 'href',
                            value: this.formData.href
                        },
                        {
                            attrName: 'target',
                            value: this.formData.target || 'open'
                        },
                        {
                            attrName: 'icon',
                            value: this.formData.icon
                        },
                        {
                            attrName: 'isShow',
                            value: this.formData.isShow || '0'
                        },
                        {
                            attrName: 'sort',
                            value: this.formData.sort
                        },
                        // 是否显示在主导航（0：否；1：是）
                        {
                            attrName: 'isMainNavigation',
                            value: '1'
                        },
                        // 主导航级联显示控制（0：否；1：是）
                        {
                            attrName: 'navigationLevel',
                            value: '1'
                        },
                        // 所属父oid
                        {
                            attrName: 'parentRef',
                            value: this.parentOid || null
                        },
                        this.formData.name
                    ]
                }).then(() => {
                    this.$message({
                        type: 'success',
                        message: this.i18nMappingObj.successUpdate
                    });

                    // this.$confirm(this.i18nMappingObj.successUpdate, this.i18nMappingObj.wxts, {
                    //     confirmButtonText: this.i18nMappingObj.submit,
                    //     showCancelButton : false,
                    //     type: 'success',
                    //     closeOnClickModal : false
                    // }).then(res=>{
                    //     // 关闭弹窗
                    //     this.cancel()
                    // }).catch(error=>{

                    // })
                    // 关闭弹窗
                    this.cancel();
                    // 回调父级
                    this.$emit('success', true);
                }, this.i18nMappingObj.failedUpdate);
            },

            // 关闭弹窗更新父组件参数
            close: function () {
                this.$emit('update:visible', false);
            },

            // 确认弹窗
            submit: function () {
                // 表单校验
                const { dynamicForm } = this.$refs;
                dynamicForm
                    ?.submit()
                    .then(({ valid }) => {
                        if (valid) {
                            this.update();
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });

                if (this.addPowerType === 'multiple' || this.addPowerType === 'single') {
                    this.userSearchSubmit();
                }
            },

            // 取消弹窗
            cancel: function () {
                // 重置数据
                this.formData = {
                    identifierNo: '',
                    name: {
                        attrName: 'nameI18nJson',
                        value: {
                            value: ''
                        }
                    },
                    sort: '',
                    icon: '',
                    isShow: '1',
                    target: 'open',
                    href: ''
                };
                this.tableData = [];
                this.close();
            },
            async handleParticipantInput({ type, value }) {
                this.participantSelectType = type;
            },
            handleParticipantChange(ids, objectList) {
                let newParticipant = [];
                const participantType = this.participantSelectType;
                objectList?.forEach((item) => {
                    const obj = {
                        id: null,
                        oid: null,
                        participantType: participantType,
                        participant: item.displayName,
                        department: item.orgName || '--',
                        phone: item.mobile || '--',
                        email: item.email || '--',
                        roleBObjectRef: item.oid,
                        __NEW_ROW__: true,
                        code: participantType === 'USER' ? item.code || '--' : ''
                    };
                    newParticipant.push(obj);
                });
                const tableData = ErdcKit.deepClone(this.tableData);
                newParticipant?.forEach((item) => {
                    const sameItem = tableData.find((el) => {
                        return (
                            (el?.participant || el?.roleBObjectRef) === item.participant &&
                            el.participantType === item.participantType
                        );
                    });
                    if (!sameItem) {
                        this.tableData.unshift(item);
                    }
                });
                let newTableData = [];
                if (newParticipant.length) {
                    this.tableData.forEach((item) => {
                        const sameItem = newParticipant.find((el) => {
                            return (
                                this.participantSelectType !== item.participantType ||
                                ((item?.participant || item?.roleBObjectRef) === el.participant &&
                                    el.participantType === item.participantType)
                            );
                        });
                        if (sameItem) {
                            newTableData.push(item);
                        }
                    });
                } else {
                    newTableData = this.tableData.filter((item) => item.participantType !== this.participantSelectType);
                }
                this.tableData = newTableData;
            }
        }
    };
});
