/**
 * 创建菜单
 * **/
define(['text!' + ELMP.resource('system-menu/components/CreatMenu/index.html')], function (template) {
    const store = require('fam:store');
    return {
        template,
        data: function () {
            return {
                i18nPath: ELMP.resource('system-menu/locale/index.js'),
                // @deprecated
                i18nMappingObj: {
                    creatMenu: this.getI18nByKey('创建菜单'),
                    enter: this.getI18nByKey('请输入'),
                    name: this.getI18nByKey('名称'),
                    code: this.getI18nByKey('编码'),
                    level: this.getI18nByKey('排序'),
                    appName: this.getI18nByKey('所属应用'),
                    href: this.getI18nByKey('链接'),
                    icon: this.getI18nByKey('图标'),
                    isShow: this.getI18nByKey('是否显示'),
                    target: this.getI18nByKey('展示方式'),
                    operation: this.getI18nByKey('操作'),
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否'),
                    number_required_msg: this.getI18nByKey('number_required_msg'),
                    munber_max_msg: this.getI18nByKey('munber_max_msg'),
                    sselectIcon: this.getI18nByKey('选择图标'),
                    IconTips: this.getI18nByKey('IconTips'),
                    pleaseSelet: this.getI18nByKey('请选择'),
                    successAdd: this.getI18nByKey('菜单新增成功'),
                    wxts: this.getI18nByKey('温馨提示'),
                    submit: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    failedAdd: this.getI18nByKey('新增菜单失败'),
                    iframePage: this.getI18nByKey('iframe 弹框页面'),
                    iframeInPage: this.getI18nByKey('iframe 嵌入页面'),
                    newTagPage: this.getI18nByKey('新标签页面'),
                    systemInPage: this.getI18nByKey('系统内置页面'),
                    systemPopPage: this.getI18nByKey('系统弹窗页面'),
                    oneMenuDrawer: this.getI18nByKey('一级菜单抽屉')
                },
                visibleDialog: false,
                loading: false
            };
        },
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            // 当前操作的oid
            oid: {
                type: String,
                default: () => {
                    return '';
                }
            },
            // 所属父级应用
            appName: String,
            // 当前菜单等级
            menuLevel: {
                type: Number,
                default: () => {
                    return 0;
                }
            }
        },
        //  计算属性
        computed: {
            dialogVisible: function () {
                this.visibleDialog = this.visible;
                return this.visible;
            },
            appList: function () {
                return store.state.app.appNames || [];
            },

            // 展示方式
            targetOptions: function () {
                // TDDO -- 替换数据字典
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
                        customClass: 'w-auto',
                        required: true,
                        props: {},
                        col: 12
                    },
                    {
                        field: 'icon',
                        component: 'FamIconSelect',
                        label: this.i18nMappingObj.icon,
                        labelLangKey: this.i18nMappingObj.icon,
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
                        slots: {
                            component: 'creatmenuisshow'
                        },
                        col: 12
                    },
                    {
                        field: 'target',
                        label: this.i18nMappingObj.target,
                        labelLangKey: this.i18nMappingObj.target,
                        slots: {
                            component: 'creatmenutarget'
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
                        readonly: !!this.oid,
                        label: this.i18nMappingObj.appName,
                        labelLangKey: this.i18nMappingObj.appName,
                        slots: {
                            component: 'menuApp'
                        },
                        col: 12
                    }
                ];
            },

            formData() {
                return {
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
                    appName: this.appName || (store?.state?.app?.appNames || [])[0]?.displayName || ''
                };
            }
        },

        methods: {
            // 创建菜单
            create: function () {
                this.loading = true;
                this.$famHttp({
                    url: '/fam/create',
                    method: 'post',
                    data: {
                        className: 'erd.cloud.foundation.core.menu.entity.Resource',
                        appName: this.formData.appName || 'plat',
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
                                attrName: 'appName',
                                value: this.formData.appName || ''
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
                            // 所属父 parentOid
                            {
                                attrName: 'parentRef',
                                value: this.oid || 'OR:erd.cloud.foundation.core.menu.entity.Resource:-1'
                            },
                            this.formData.name
                        ]
                    }
                })
                    .then(() => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj.successAdd
                        });
                        // this.$confirm(this.i18nMappingObj.successAdd, this.i18nMappingObj.wxts, {
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
                    })
                    .catch((error) => {
                        this.$message({
                            message: error?.data?.message || this.i18nMappingObj.failedAdd,
                            type: 'error'
                        });
                    })
                    .finally(() => {
                        this.loading = false;
                    });
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
                            this.create();
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
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
                this.close();
            }
        },
        components: {}
    };
});
