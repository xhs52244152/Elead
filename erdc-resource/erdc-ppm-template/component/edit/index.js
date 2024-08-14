define([
    'text!' + ELMP.resource('erdc-ppm-template/component/edit/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-utils/index.js'),
    'erdcloud.store',
    ELMP.resource('ppm-store/index.js'),
    'css!' + ELMP.resource('erdc-ppm-template/views/list/style.css')
], function (template, ErdcKit, Utils, ErdcStore, ppmStore) {
    return {
        template,
        data() {
            return {
                formData: {},
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-ppm-template/locale/index.js'),
                i18nMappingObj: {
                    editProjectModule: this.getI18nByKey('editProjectModule'),
                    hoursTip: this.getI18nByKey('hoursTip'),
                    durationTip: this.getI18nByKey('durationTip'),
                    templateEditSuccessfully: this.getI18nByKey('templateEditSuccessfully')
                },
                fromRouteName: ''
            };
        },
        components: {
            CommonEditForm: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/EditForm/index.js'))
        },
        computed: {
            formModelMapper() {
                return {
                    'lifecycleStatus.status': (data) => {
                        return data['lifecycleStatus.status']?.displayName;
                    },
                    'templateInfo.templateReference': (data) => {
                        return data['templateInfo.templateReference']?.oid || '';
                    },
                    'typeReference': (data) => {
                        return data['typeReference']?.oid || '';
                    },
                    'productLineRef': (data) => {
                        return data['productLineRef']?.oid || '';
                    }
                };
            },
            configParameter() {
                return {
                    formHeight: 'calc(100% - 18px)', // 高度需要传单位
                    title: this.i18nMappingObj.editProjectModule,
                    layoutName: 'TEMPLATE_UPDATE',
                    className: 'erd.cloud.ppm.project.entity.Project',
                    showDetailForm: true, // 是否隐藏详细信息表单(此处考虑联动情况,即基本信息和详细信息不存在联动问题)
                    basicComponentName: 'commonBaseInfo',
                    basicComponent: ErdcKit.asyncComponent(
                        ELMP.resource('project-space/views/project-info/components/EditBasicInfo/index.js')
                    ),
                    basicComponentUrl: 'project-space/views/project-info/components/EditBasicInfo/index.js',
                    basicProps: {
                        showTemplate: false
                    },
                    goBack: this.goBack,
                    lookDetailName: 'projectInfo',
                    updateUrl: '/ppm/update',
                    getDetailUrl: '/ppm/attr', // 获取表单详情接口
                    backName: 'templateManagement', // 路由返回名称
                    saveDraft: false // 是否显示保存草稿按钮
                };
            },
            oid() {
                return this.$route.query.pid;
            }
        },
        beforeRouteEnter(to, from, next) {
            // 这里还无法访问到组件实例，this === undefined
            next((vm) => {
                vm.fromRouteName = vm.fromRouteName || from.name;
                vm.configParameter.backName = vm.fromRouteName;
            });
        },
        methods: {
            queryLayoutParams() {
                return {
                    name: 'TEMPLATE_UPDATE',
                    objectOid: this.$route.query.pid,
                    attrRawList: [
                        // {
                        //     attrName: 'layoutSelector',
                        //     value: 'TEMPLATE_UPDATE'
                        // }
                    ]
                };
            },
            // 回显数据处理
            echoData(val, cb) {
                let data = ErdcKit.deserializeAttr(val, {
                    valueMap: {
                        'lifecycleStatus.status': (e, data) => {
                            return data['lifecycleStatus.status']?.displayName;
                        },
                        'templateInfo.templateReference': (e, data) => {
                            return data['templateInfo.templateReference']?.oid || '';
                        },
                        'typeReference': (e, data) => {
                            return data['typeReference']?.oid || '';
                        }
                    }
                });
                cb(data);
            },
            beforeSubmit(data, next) {
                // 获取预估工时
                let predictDuration = data.attrRawList.find((item) => item.attrName === 'predictDuration')?.value || '';
                if (predictDuration && Utils.checkHours(predictDuration, this.i18nMappingObj.hoursTip)) return;
                // 获取工期
                let duration = data.attrRawList.find((item) => item.attrName === 'duration')?.value || '';
                if (duration && Utils.checkHours(duration, this.i18nMappingObj.durationTip)) return;

                data?.attrRawList.some((el) => {
                    if (el.attrName === 'projectManager' && Array.isArray(el.value)) {
                        el.value = el.value[0].oid;
                    }
                });
                data?.attrRawList?.push({
                    attrName: 'templateInfo.tmplTemplated',
                    value: true
                });
                // data.attrRawList = _.filter(data.attrRawList, (item) => item.value);
                next(data, this.i18nMappingObj.templateEditSuccessfully);
            },
            goBack() {
                let query = {
                    pid: this.oid,
                    template: true,
                    isTemplate: true,
                    componentRefresh: true
                };
                // 更新平台的store
                this.$store.dispatch('space/switchContextByObject', {
                    objectOid: ppmStore.state?.projectInfo?.oid,
                    force: true
                });
                // 修改项目后需要更新存在store的项目信息,等待平台更新后ppm在更新
                setTimeout(() => {
                    ppmStore.dispatch('fetchProjectInfo', { id: this.$route.query.pid });
                }, 600);

                setTimeout(() => {
                    // 如果是在业务模板页面编辑保存后关闭编辑页跳转列表
                    if (window.__currentAppName__ === 'erdc-bizadmin-web') {
                        this.$store.dispatch('route/delVisitedRoute', this.$route);
                        this.$router.push({
                            path: '/biz-template/template/objectTemplate',
                            query: {
                                typeName: 'erd.cloud.ppm.project.entity.Project'
                            }
                        });
                    }

                    const appName = 'erdc-project-web';
                    const targetPath = '/space/project-space/projectInfo';
                    // path组装query参数
                    let url = `/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(targetPath, query)}`;
                    window.open(url, appName);
                }, 500);
                // let query = {
                //     typeName: 'erd.cloud.ppm.project.entity.Project'
                // };
                // const appName = 'erdc-bizadmin-web';
                // const targetPath = '/biz-template/template/objectTemplate';
                // // path组装query参数
                // let url = `/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(targetPath, query)}`;
                // window.open(url, appName);
            },
            afterSubmit() {
                // this.$router.go(-1);
            },
            handleCancel() {
                // 如果是项目空间
                if (ErdcStore.state.route.resources.identifierNo === 'erdc-project-web') {
                    this.$router.push({
                        path: 'space/project-space/projectInfo',
                        query: {
                            pid: this.oid,
                            template: true,
                            isTemplate: true
                        }
                    });
                } else {
                    this.$router.push({
                        path: 'biz-template/template/objectTemplate',
                        query: {
                            typeName: 'erd.cloud.ppm.project.entity.Project'
                        }
                    });
                }
            },
            onFieldChange({ formData, field, nVal }) {
                // 执行自动计算
                let params = {
                    field,
                    oid: formData.oid,
                    formData: formData,
                    nVal
                };
                params.changeFields = ['timeInfo.scheduledStartTime', 'timeInfo.scheduledEndTime', 'duration'];
                params.fieldMapping = {
                    scheduledStartTime: 'timeInfo.scheduledStartTime',
                    scheduledEndTime: 'timeInfo.scheduledEndTime',
                    duration: 'duration'
                };
                Utils.fieldsChange(params);
                return formData;
            }
        }
    };
});
