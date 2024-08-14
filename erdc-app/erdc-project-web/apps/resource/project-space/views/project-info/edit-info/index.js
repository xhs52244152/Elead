define([
    'vue',
    'erdcloud.kit',
    ELMP.resource('project-space/views/project-info/components/InfoDetail/index.js'),
    ELMP.resource('project-space/views/project-info/components/RelatedObjects/index.js'),
    'text!' + ELMP.resource('project-space/views/project-info/edit-info/index.html'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    'css!' + ELMP.resource('project-space/views/project-info/style.css')
], function (Vue, ErdcKit, infoDetail, relatedObjects, template, Utils, store, projectUtils) {
    return {
        template,
        data() {
            return {
                activeTab: 'infoDetail',
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-space/views/project-info/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    editProject: this.getI18nByKey('editProject'),
                    infoDetail: this.getI18nByKey('infoDetail'),
                    relatedObjects: this.getI18nByKey('relatedObjects'),
                    updateSuccess: this.getI18nByKey('updateSuccess'),
                    hoursTip: this.getI18nByKey('hoursTip'),
                    draft: this.getI18nByKey('draft'),
                    durationTip: this.getI18nByKey('durationTip')
                },
                componentId: 'infoDetail',
                oid: this.$route.query.pid,
                configParameter: {
                    formHeight: '100%',
                    title: '',
                    className: 'erd.cloud.ppm.project.entity.Project',
                    layoutName: '',
                    showDetailForm: true, // 是否隐藏详细信息表单(此处考虑联动情况,即基本信息和详细信息不存在联动问题)
                    basicComponentName: 'commonBaseInfo',
                    basicComponent: ErdcKit.asyncComponent(
                        ELMP.resource('project-space/views/project-info/components/EditBasicInfo/index.js')
                    ),
                    basicComponentUrl: 'project-space/views/project-info/components/EditBasicInfo/index.js',
                    updateUrl: '/ppm/update',
                    backName: '', // 路由返回名称
                    getDetailUrl: '/ppm/attr', // 获取表单详情接口
                    lookDetailName: 'projectInfo', // 编辑成功后查看详情路由的名称
                    saveDraft: false // 是否显示保存草稿按钮
                },
                fromRouteName: '',
                editableAttr: ['identifierNo'],
                formData: {
                    test: '编辑的'
                },
                height: '100%',
                tabHeight: 'calc(100% - 20px)'
            };
        },
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js')),
            CommonEditForm: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/EditForm/index.js')),
            infoDetail,
            relatedObjects
        },
        beforeRouteEnter(to, from, next) {
            // 这里还无法访问到组件实例，this === undefined

            next((vm) => {
                vm.fromRouteName = vm.fromRouteName || from.name;
                vm.configParameter.backName = vm.fromRouteName;
            });
        },
        created() {
            if (this.$route.meta?.hideSubMenus) {
                this.height = 'calc(100% - 0px)';
                this.tabHeight = 'calc(100% - 62px)';
                this.configParameter.formHeight = 'calc(100% - 30px)';
            } else {
                this.height = 'calc(100% - 52px)';
                this.tabHeight = 'calc(100% - 60px)';
                this.configParameter.formHeight = 'calc(100% - 30px)';
            }
            // if (this.$route.query.status === this.i18nMappingObj.draft) {
            //     this.configParameter.layoutName === 'CREATE';
            // } else if (store.state?.projectInfo?.['templateInfo.tmplTemplated']) {
            //     this.configParameter.layoutName === 'TEMPLATE_UPDATE';
            // } else {
            //     this.configParameter.layoutName === 'UPDATE';
            // }
        },
        // computed: {
        //     oid() {
        //         return this.$route.query.pid;
        //     }
        // },
        methods: {
            fieldsChange(params) {
                params.changeFields = ['timeInfo.scheduledStartTime', 'timeInfo.scheduledEndTime', 'duration'];
                params.fieldMapping = {
                    scheduledStartTime: 'timeInfo.scheduledStartTime',
                    scheduledEndTime: 'timeInfo.scheduledEndTime',
                    duration: 'duration'
                };
                projectUtils.fieldsChange(params);
            },
            saveInfo(obj) {
                this.$famHttp({
                    url: '/ppm/update',
                    data: obj,
                    method: 'post',
                    className: obj.className || store.state.classNameMapping.project
                })
                    .then((res) => {
                        if (res.code === '200') {
                            this.$message({
                                message: this.i18nMappingObj['update'],
                                type: 'success',
                                showClose: true
                            });
                            this.$router.push({
                                name: 'projectList'
                            });

                            // this.$emit('onsubmit', this.oid);
                        }
                    })
                    .catch((err) => {
                        this.$message({
                            message: err?.data?.message,
                            type: 'error',
                            showClose: true
                        });
                    })
                    .finally(() => {
                        this.loading = false;
                    });
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
                        },
                        'organizationRef': (e, data) => {
                            return data['organizationRef']?.oid || '';
                        },
                        'productLineRef': (e, data) => {
                            return data['productLineRef']?.oid || '';
                        },
                        'projectManager': ({ users }) => {
                            return users;
                        }
                    }
                });

                cb(data);
            },
            beforeSubmit(val, cb, draft) {
                // 获取预估工时
                let predictDuration = val.attrRawList.find((item) => item.attrName === 'predictDuration')?.value || '';
                if (predictDuration && Utils.checkHours(predictDuration, this.i18nMappingObj.hoursTip)) return;
                // 获取工期
                let duration = val.attrRawList.find((item) => item.attrName === 'duration')?.value || '';
                if (duration && Utils.checkHours(duration, this.i18nMappingObj.durationTip)) return;

                val?.attrRawList.forEach((el) => {
                    if (el.attrName === 'projectManager' && Array.isArray(el.value)) {
                        el.value = el.value[0].oid;
                    }
                });
                // 保存草稿
                if (draft) {
                    val.attrRawList = _.filter(val.attrRawList, (item) => item.value);
                    val.isDraft = true;
                }
                cb(val, '项目编辑成功');
            },
            afterSubmit() {
                // this.$store.dispatch('route/delVisitedRoute', this.$route);
                // this.$router.push({
                //     name: 'projectList'
                // });
            },
            handleClick(val) {
                this.componentId = val;
            }
        }
    };
});
