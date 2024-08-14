define([
    'erdcloud.kit',
    'text!' + ELMP.resource('project-space/views/project-info/components/InfoDetail/index.html'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('project-space/views/project-info/util/index.js'),
    'css!' + ELMP.resource('project-space/views/project-info/style.css')
], function (ErdcKit, template, store, util) {
    return {
        template,
        props: {
            // 对象oid
            oid: String
        },
        data() {
            return {
                className: store.state.projectInfo.typeName || store.state.classNameMapping.project,
                visible: false,
                openType: store.state.projectInfo['templateInfo.tmplTemplated'] ? 'TEMPLATE_DETAIL' : 'DETAIL',
                formData: {},
                projectId: ''
            };
        },
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js'))
        },
        watch: {
            oid: {
                handler(val) {
                    // 查询表单信息
                    if (val) {
                        this.projectId = val;
                        this.getData(val);
                    }
                },
                immediate: true
            }
        },
        computed: {
            queryLayoutParams() {
                return { name: this.openType };
            },
            schemaMapper() {
                // const formData = this.formData;
                // const that = this;
                // return {
                //     'templateInfo.templateReference': function (schema, { widget, updateSchema }) {
                //         updateSchema('props.row.requestConfig.data.projectType', formData?.projectType);
                //     }
                // };
            }
        },
        created() {},
        mounted() {},
        methods: {
            /**
             * 收集表单数据，用于外部调用
             */
            getFormData() {
                return {};
            },
            // 查询接口请求
            fetchGetFormData(oid) {
                return new Promise((resolve, reject) => {
                    let className = oid.split(':')[1];
                    this.$famHttp({
                        url: '/ppm/attr',
                        method: 'get',
                        className,
                        data: {
                            oid: oid
                        }
                    })
                        .then((resp) => {
                            if (resp.code === '200') {
                                resolve(resp.data?.rawData || {});
                            } else {
                                reject();
                            }
                        })
                        .catch(() => {
                            reject();
                        });
                });
            },
            getData(id) {
                this.fetchGetFormData(id).then((data) => {
                    // 处理数据回显
                    this.handleRenderData(data);
                });
            },
            // 处理回显数据
            handleRenderData(data) {
                let originData = JSON.parse(JSON.stringify(ErdcKit.deserializeAttr(data)));

                let lifecycleStatusValue = data['lifecycleStatus.status']?.value;
                this.formData = ErdcKit.deserializeAttr(data, {
                    valueMap: {
                        'lifecycleStatus.status': (e, data) => {
                            return data['lifecycleStatus.status']?.displayName;
                        },
                        'templateInfo.templateReference': (e, data) => {
                            return data['templateInfo.templateReference'].displayName;
                        },
                        'typeReference': (e, data) => {
                            return data['typeReference']?.displayName;
                        },
                        'typeRef': (e, data) => {
                            return data['typeReference']?.oid || '';
                        },
                        'projectManager': ({ users }) => {
                            return users;
                        },
                        'organizationRef': (e, data) => {
                            return data['organizationRef']?.displayName || '';
                        },
                        'productLineRef': (e, data) => {
                            return data['productLineRef']?.displayName || '';
                        },
                        'timeInfo.scheduledStartTime': (e, data) => {
                            return data['timeInfo.scheduledStartTime'].displayName;
                        },
                        'timeInfo.scheduledEndTime': (e, data) => {
                            return data['timeInfo.scheduledEndTime'].displayName;
                        },
                        'timeInfo.actualStartTime': (e, data) => {
                            return data['timeInfo.actualStartTime'].displayName;
                        },
                        'timeInfo.actualEndTime': (e, data) => {
                            return data['timeInfo.actualEndTime'].displayName;
                        }
                    }
                });

                this.formData['lifecycleStatus.value'] = lifecycleStatusValue;

                let storeFormData = JSON.parse(JSON.stringify(this.formData));
                storeFormData.productLineRef = originData.productLineRef?.key
                    ? 'OR:' + originData.productLineRef.key + ':' + originData.productLineRef?.id
                    : '';
                store.commit('setProjectInfo', storeFormData);

                let typeReference = 'OR:' + originData.typeReference?.key + ':' + originData.typeReference?.id;
                if (!store.state.projectInfo['templateInfo.tmplTemplated']) {
                    util.getType(typeReference).then((res) => {
                        this.className = res;
                    });
                }

                this.$emit('ready', this.formData);
            }
        }
    };
});
