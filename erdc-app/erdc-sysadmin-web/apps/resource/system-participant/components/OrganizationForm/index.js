define([
    'text!' + ELMP.resource('system-participant/components/OrganizationForm/template.html'),
    'erdcloud.kit',
    'fam:store',
    ELMP.resource('system-participant/api.js'),
    'underscore'
], function (template, ErdcKit) {
    const store = require('fam:store');
    const api = require(ELMP.resource('system-participant/api.js'));

    return {
        template,
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource(`erdc-components/FamAdvancedForm/index.js`))
        },
        props: {
            oid: String,
            defaultValue: {
                type: Object,
                default() {
                    return {};
                }
            },
            editable: {
                type: Boolean,
                default: false
            },
            readonly: {
                type: Boolean,
                default() {
                    return false;
                }
            }
        },
        data() {
            return {
                form: this.defaultValue,
                showForm: false,
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-participant/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    'departmentNo',
                    'parentDepartment',
                    'departmentName',
                    'departmentStatus',
                    'teamLeader',
                    'website',
                    'postalAddress',
                    'description',
                    '请输入',
                    '请选择',
                    'pleaseInputName',
                    '正常',
                    '不正常'
                ])
            };
        },
        computed: {
            formId() {
                return this.readonly ? 'DETAIL' : this.editable ? 'UPDATE' : 'CREATE';
            }
        },
        watch: {
            oid: {
                immediate: true,
                handler(oid) {
                    if (oid) {
                        this.fetchOrganization();
                    }
                }
            }
        },
        mounted() {
            // 如果不是编辑，直接展示表单，否则编辑情况下先等详情查询完再展示
            if (!this.editable) {
                this.showForm = true;
            }
        },
        methods: {
            submit(isDraft = true) {
                const $form = this.$refs.form;
                return new Promise((resolve, reject) => {
                    $form
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                let attrRawList = $form.serializeEditableAttr();
                                const className = store.getters.className('organization');
                                // 处理请求参数
                                attrRawList.forEach((item) => {
                                    if (item.attrName === 'parentRef') {
                                        item.value = item.value?.oid || '';
                                    }
                                    if (item.attrName.includes('I18nJson')) {
                                        item.value = item.value?.value || '';
                                    }
                                    if (item.attrName === 'leaderIds') {
                                        item.value = _.isArray(item.value) ? (item.value || []).join(',') : item.value;
                                    }
                                });
                                // 关联项（团队负责人）
                                // let relationList = []
                                // _.forEach(this.form.leaders, userKey => {
                                //     relationList.push({
                                //         action: "CREATE",
                                //         attrRawList: [
                                //             {
                                //                 attrName: "roleBObjectRef",
                                //                 value: userKey
                                //             },
                                //             { attrName: 'deptUserType', value: 'DEPT_LEADER' },
                                //             { attrName: 'status', value: '0' }
                                //         ],
                                //         className: store.getters.className('organizationLink')
                                //     })
                                // })
                                let params = {
                                    attrRawList,
                                    className,
                                    isDraft,
                                    associationField: 'roleAObjectRef'
                                    // relationList: relationList
                                };
                                // 更新
                                if (this.editable) {
                                    params.action = 'UPDATE';
                                    params.oid = this.oid;
                                }
                                this.saveOrganization(params)
                                    .then((response) => {
                                        resolve(response);
                                    })
                                    .catch(reject);
                            } else {
                                reject(new Error('请填入正确的部门信息'));
                            }
                        })
                        .catch(reject);
                });
            },
            saveOrganization(payload) {
                return new Promise((resolve, reject) => {
                    if (this.editable) {
                        // 编辑
                        api.updateOrganization(payload)
                            .then((response) => {
                                const { success, message } = response;
                                if (success) {
                                    this.$message.success('更新成功');
                                    resolve(response);
                                } else {
                                    reject(new Error(message));
                                }
                            })
                            .catch((err) => {
                                // this.$message({
                                //     type: 'error',
                                //     message: err?.message || err
                                // })
                            });
                    } else {
                        // 新增
                        api.createOrganization(payload)
                            .then((response) => {
                                const { success, message } = response;
                                if (success) {
                                    this.$message.success('创建成功');
                                    resolve(response);
                                } else {
                                    reject(new Error(message));
                                }
                            })
                            .catch((err) => {
                                // this.$message({
                                //     type: 'error',
                                //     message: err?.message || err
                                // })
                            });
                    }
                });
            },
            // 根据oid查询部门详情
            fetchOrganization() {
                // const loading = this.$loading({
                //     target: 'body',
                //     body: true,
                //     fullscreen: true,
                //     lock: true,
                //     background: 'rgba(255, 255, 255, 0.6)',
                //     customClass: '',
                // });
                this.fetchOrganizationByOId(this.oid).then(({ data }) => {
                    const { rawData } = data;
                    this.extractOrganizationAttr(rawData);
                    // loading.close()
                });
            },
            fetchOrganizationByOId(oid) {
                return api.fetchOrganizationByOId(oid);
            },
            // 反序列字段key值
            extractOrganizationAttr(rawData) {
                this.form = ErdcKit.deserializeAttr(rawData, {
                    valueMap: {
                        parentRef({ displayName = null, value, oid }) {
                            return {
                                name: displayName,
                                displayName,
                                oid,
                                id: value?.id
                            };
                        },
                        leaderIds(e, { leaders = {} }) {
                            return leaders.users;
                        },
                        parentPath({ displayName = null, value, oid }) {
                            return displayName;
                        }
                    }
                });
                // 新选人组件回显参数配置
                this.form.leaderIds = (rawData?.leaders?.users || [])?.map(item => item.oid) || {};
                this.form['leaderIds_defaultValue'] = ErdcKit.deepClone(rawData?.leaders?.users);
                let temp = this.form?.parentRef?.displayName || '';
                if (this.form?.parentRef) {
                    this.form.parentRef.name = this.form?.parentPath || temp;
                }
                this.showForm = true;
            },
            resolveWidget(widget) {
                if (widget && widget.schema && widget.schema.props && widget.schema.props.name === 'parent-ref') {
                    widget.schema.field = 'parentRef';
                }
                return widget;
            }
        }
    };
});
