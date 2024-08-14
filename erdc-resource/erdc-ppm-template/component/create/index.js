define([
    'text!' + ELMP.resource('erdc-ppm-template/component/create/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('erdc-ppm-template/locale/index.js'),
    'css!' + ELMP.resource('erdc-ppm-template/views/list/style.css')
], function (template, ErdcKit, Utils, i18nMappingObj) {
    return {
        template,
        data() {
            return {
                formData: {}
                // 国际化locale文件地址
                // i18nLocalePath: ELMP.resource('erdc-ppm-template/component/locale/index.js'),
                // i18nMappingObj: {
                //     createProjectModule: this.getI18nByKey('createProjectModule'),
                //     saveDraftAfterTip: this.getI18nByKey('saveDraftAfterTip'),
                //     hoursTip: this.getI18nByKey('hoursTip'),
                //     durationTip: this.getI18nByKey('durationTip'),
                //     templateCreatedSuccessfully: this.getI18nByKey('templateCreatedSuccessfully')
                // }
            };
        },
        computed: {
            configParameter() {
                return {
                    title: i18nMappingObj.createProjectModule,
                    formHeight: 'calc(100% - 18px)', // 高度需要传单位
                    layoutName: 'TEMPLATE_CREATE',
                    className: 'erd.cloud.ppm.project.entity.Project',
                    showDetailForm: false, // 是否隐藏详细信息表单(此处考虑联动情况,即基本信息和详细信息不存在联动问题)
                    basicComponentName: 'commonBaseInfo',
                    basicComponent: ErdcKit.asyncComponent(
                        ELMP.resource('project-space/views/project-info/components/CreateBasicInfo/index.js')
                    ),
                    basicComponentUrl: 'project-space/views/project-info/components/CreateBasicInfo/index.js',
                    basicProps: {
                        showTemplate: false
                    },
                    createUrl: '/ppm/create',
                    goBack: this.goBack,
                    backName: 'templateManagement', // 路由返回名称
                    lookDetailName: 'projectInfo', // 创建成功后查看详情路由的名称
                    contineCreateName: 'projectTemplateCreate', // 创建成功后继续创建当前路由名称
                    saveDraft: false, // 是否显示保存草稿按钮
                    saveDraftAfterTip: i18nMappingObj.saveDraftAfterTip // 保存草稿后提示信息
                };
            }
        },
        components: {
            CommonForm: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/CreateForm/index.js'))
        },
        methods: {
            beforeSubmit(data, next) {
                // 获取预估工时
                let predictDuration = data.attrRawList.find((item) => item.attrName === 'predictDuration')?.value || '';
                if (predictDuration && Utils.checkHours(predictDuration, i18nMappingObj.hoursTip)) return;
                // 获取工期
                let duration = data.attrRawList.find((item) => item.attrName === 'duration')?.value || '';
                if (duration && Utils.checkHours(duration, i18nMappingObj.durationTip)) return;

                data?.attrRawList?.push({
                    attrName: 'templateInfo.tmplTemplated',
                    value: true
                });
                data?.attrRawList?.push({
                    attrName: 'templateInfo.tmplEnabled',
                    value: true
                });
                // data.attrRawList = _.filter(data.attrRawList, (item) => item.value);
                // 保存草稿
                // if (draft) data.isDraft = true;
                next(data, false, i18nMappingObj.templateCreatedSuccessfully);
            },
            goBack() {
                // ErdcKit.switchApp('erdc-bizadmin-web', {
                //     fullPath: '/business/template?typeName=erd.cloud.ppm.project.entity.Project'
                // });
                this.$router.push({
                    path: '/biz-template/template/objectTemplate',
                    query: {
                        typeName: 'erd.cloud.ppm.project.entity.Project'
                    }
                });
                // ErdcKit.open('/business/template/objectTemplate', {
                //     appName: 'erdc-bizadmin-web',
                //     query: {
                //         typeName: 'erd.cloud.ppm.project.entity.Project'
                //     },
                //     params: {
                //         typeName: 'erd.cloud.ppm.project.entity.Project'
                //     }
                // });
                // this.$store.dispatch('route/delVisitedRoute', this.$route);
            },
            afterSubmit() {
                // ErdcKit.open('/business/template', '_self', 'erdc-bizadmin-web');
                // this.$store.dispatch('route/delVisitedRoute', this.$route);
            },
            onFieldChange({ formData, field, nVal }) {
                // 执行自动计算
                let params = {
                    field,
                    oid: '',
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
