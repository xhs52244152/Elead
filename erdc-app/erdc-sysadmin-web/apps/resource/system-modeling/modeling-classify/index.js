define(['text!' + ELMP.resource('system-modeling/modeling-classify/template.html'), 'EventBus'], function (template) {
    const ErdcKit = require('fam:kit');
    const EventBus = require('EventBus');

    return {
        template,
        components: {
            // 拖拽布局
            ResizableContainer: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js')),
            ClassifyTreeList: ErdcKit.asyncComponent(
                ELMP.resource('system-modeling/modeling-classify/components/ClassifyTreeList/index.js')
            ),
            TypeManageDetail: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/TypeManageDetail/index.js')),
            // 属性权限配置
            AttrPermissionSetting: ErdcKit.asyncComponent(
                ELMP.resource('erdc-type-components/AttrPermissionSetting/index.js')
            ),
            // 类型管理
            ClassifyDefineInfoForm: ErdcKit.asyncComponent(
                ELMP.resource('system-modeling/modeling-classify/components/ClassifyDefineInfoForm/index.js')
            ),
            // 类型管理详情
            ClassifyDefineInfo: ErdcKit.asyncComponent(
                ELMP.resource('system-modeling/modeling-classify/components/ClassifyDefineInfo/index.js')
            ), // 定义信息
            TypeManageAttr: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/TypeManageAttr/index.js')), // 属性
            TypeManageLayout: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/TypeManageLayout/index.js')) // 布局
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-modeling/modeling-classify/locale/index.js'),
                activeTab: {
                    name: 'classifyDefineInfo',
                    displayName: '定义信息',
                    components: [
                        {
                            refName: 'classifyDefineInfo',
                            detail: 'ClassifyDefineInfo',
                            props: {
                                readonly: true
                            }
                        }
                    ]
                },
                hasModify: '',
                moduleTitle: '',

                // 弹窗表单
                visible: false,
                formLoading: false,
                title: '',
                oid: '',
                formData: {},
                TypeData: [],
                formDataDetail: {},
                TypeDataDetail: [],
                type: '',
                parentFormData: {},
                parentId: '',
                appName: '',
                flexAttrs: {
                    // 分类管理属性信息查询接口
                    attrInfoUrl: '/fam/classify/getByOid',
                    // 隐藏属性权限配置，权限按钮
                    isPermissionBtn: false
                },
                isSetting: false,
                typeOid: '',
                containerOid: '',
                typeName: '',
                isApplication: false,
                Application: 'erd.cloud.foundation.tenant.entity.Application',
                isShare: false
            };
        },
        computed: {
            tabList() {
                return [
                    {
                        name: 'classifyDefineInfo',
                        isShow: true,
                        displayName: this.i18n.definingInformation,
                        components: [
                            {
                                refName: 'classifyDefineInfo',
                                detail: 'ClassifyDefineInfo',
                                props: {
                                    readonly: true
                                }
                            }
                        ]
                    },
                    {
                        name: 'attributes',
                        isShow: true,
                        components: [
                            {
                                refName: 'attributes',
                                detail: 'TypeManageAttr'
                            }
                        ]
                    },
                    {
                        name: 'layout',
                        isShow: true,
                        components: [
                            {
                                refName: 'layout',
                                detail: 'TypeManageLayout'
                            }
                        ]
                    }
                ];
            },
            isCreate() {
                return this.type === 'create';
            }
        },
        mounted() {
            EventBus.on('updateShowPermissionSettingFlag', this.handlerChangeShow);
        },
        methods: {
            nodeClick(typeData) {
                this.typeOid = typeData?.oid || '';
                this.$refs?.['typeManageDetail']?.fetchTypeDefById(typeData);

                this.isApplication = typeData.idKey === this.Application;

                // 只要有oid，就需要调接口查看详情
                if (typeData?.oid) {
                    this.getFormDataDetails(typeData?.oid, ({ formData, formDataDetail, parentId }) => {
                        if (this.isApplication) {
                            this.formDataDetail = {
                                ...formData,
                                ...formDataDetail
                            };
                        } else {
                            this.formDataDetail = { ...formData };
                            if (parentId) {
                                this.getFormDataDetails(parentId, (data) => {
                                    this.parentFormData = data.formData;
                                });
                            }
                        }
                    });
                }
                // 获取布局接口
                this.getFormConfigByClassName('erd.cloud.foundation.type.entity.ClassifyDefinition');
            },
            refreshTree(oid) {
                const { classifyTreeList } = this.$refs;
                classifyTreeList?.getTreeList(oid);
            },
            onSubmit() {
                this.$refs.classifyDefineInfoForm.submit().then((data) => {
                    let paramData = {};
                    const paramMap = ['typeName', 'code', 'sort'];
                    data.forEach((item) => {
                        if (paramMap.includes(item.attrName)) {
                            paramData[item.attrName] = item.value;
                        }
                    });
                    paramData.typePropertyValueVoList = data.filter(
                        (item) => !paramMap.includes(item.attrName) && !item.attrName.includes('_checked')
                    );
                    paramData.parentId = this.parentId;
                    paramData.appName = this.appName;

                    let url = '/fam/classify/add';
                    if (this.type === 'update') {
                        url = '/fam/classify/update';
                        paramData.oid = this.oid;
                    }

                    this.formLoading = true;
                    this.$famHttp({
                        url,
                        method: 'POST',
                        data: paramData
                    })
                        .then((resp) => {
                            const { data } = resp;
                            this.refreshTree(data?.oid || data);
                            this.$message({
                                type: 'success',
                                message: this.type === 'update' ? '更新分类成功' : '创建分类成功',
                                showClose: true
                            });

                            this.closeForm();
                        })
                        .catch((error) => {
                            console.error(error);
                            // this.$message({
                            //     type: 'error',
                            //     message: error?.data?.message || error,
                            //     showClose: true
                            // });
                        })
                        .finally(() => {
                            this.formLoading = false;
                        });
                });
            },
            // 树列表的编辑和创建
            onClick(data, type) {
                this.type = type;
                this.oid = data.oid;
                this.title = this.type === 'update' ? this.i18n.editClassify : this.i18n.createClassify;

                // 如果是查看，根据idKey判断是不是查看应用
                if (this.type !== 'check') {
                    this.visible = true;
                }
                // 只要有oid，就需要调接口查看详情
                if (this.oid) {
                    this.getFormDataDetails(this.oid, ({ formData, parentOid, parentId, formDataDetail }) => {
                        this.formData = ErdcKit.deepClone(formData);
                        this.parentId = data.idKey === this.Application ? '0' : this.isCreate ? this.oid : parentId;
                        this.appName = data.idKey === this.Application ? data.typeName : data.appName;
                        if (parentOid) {
                            if (this.isCreate) {
                                this.parentFormData = ErdcKit.deepClone(formData);
                            } else {
                                this.getFormDataDetails(parentOid, (data) => {
                                    this.parentFormData = data.formData;
                                });
                            }
                        }
                    });
                }

                // 获取布局接口
                this.getFormConfigByClassName('erd.cloud.foundation.type.entity.ClassifyDefinition');
                // 解决点击应用时，没有页签而导致页签无法正常显示的问题
                if (!this.tabList.map((item) => item.name).includes(this.activeTab.name)) {
                    this.activeTab = {
                        name: 'classifyDefineInfo',
                        displayName: this.i18n.definingInformation,
                        components: [
                            {
                                refName: 'classifyDefineInfo',
                                detail: 'ClassifyDefineInfo',
                                props: {
                                    readonly: true
                                }
                            }
                        ]
                    };
                }
            },
            closeForm() {
                this.visible = false;
                this.oid = '';
                this.parentId = '';
                this.formData = {};
                this.type = '';
                this.appName = '';
            },
            // 获取表单详情
            getFormDataDetails(oid, cb) {
                let formData = {};
                let parentOid = '';
                let parentId = '';
                let formDataDetail = {};
                this.$famHttp({
                    url: `/fam/classify/getByOid?oid=${oid}`,
                    method: 'GET'
                })
                    .then((resp) => {
                        const { data } = resp;
                        this.moduleTitle = data?.name || data?.displayName;
                        this.isShare = data.isShare;

                        _.keys(data).forEach((key) => {
                            if (['typeName', 'sort', 'code'].includes(key)) {
                                formData[key] = data[key];
                            }
                        });
                        _.values(data?.propertyMap || {}).forEach((item) => {
                            let propertyValue = item?.propertyValue || {};
                            if (!_.isEmpty(propertyValue?.languageJson)) {
                                formData[propertyValue.name] = {
                                    attrName: propertyValue.name,
                                    value: propertyValue?.languageJson
                                };
                            } else {
                                formData[propertyValue.name] = propertyValue.value;
                            }
                            if (item.isExtends) {
                                formData[propertyValue.name + '_checked'] = !!propertyValue.isExtends;

                                // 创建且非应用节点时 属性默认继承
                                if (this.isCreate && data?.parentRef) {
                                    formData[propertyValue.name + '_checked'] = true;
                                }
                            }
                        });
                        if (this.isApplication) {
                            formDataDetail.displayName = data?.name || data?.displayName;
                            formDataDetail.typeName = data?.typeName || '';
                        }
                        parentOid = data?.parentRef || '';
                        parentId = data?.parentId || '';
                    })
                    .catch((error) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: error?.data?.message || error,
                        //     showClose: true
                        // });
                    })
                    .finally(() => {
                        cb && cb({ formData, parentOid, parentId, formDataDetail });
                    });
            },
            // 获取布局
            getFormConfigByClassName(className) {
                this.$famHttp({
                    url: `/fam/type/property/listByClassName`,
                    data: {
                        className
                    }
                })
                    .then(({ data }) => {
                        this.TypeData = data;
                    })
                    .catch((error) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: error?.data?.message || error,
                        //     showClose: true
                        // });
                    });
            },
            // 点击定义信息中的编辑
            onClickEdit() {
                this.$refs.classifyTreeList.onEdit();
            },
            handlerChangeShow(event, flag, typeOid, containerOid, name) {
                this.isSetting = flag;
                this.typeOid = typeOid;
                this.containerOid = containerOid;
                this.typeName = name;
            }
        }
    };
});
