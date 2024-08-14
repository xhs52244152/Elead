define([
    'vue',
    'erdcloud.kit',
    'text!' + ELMP.resource('project-space/views/project-info/create-info/index.html'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    'css!' + ELMP.resource('project-space/views/project-info/style.css')
], function (Vue, ErdcKit, template, Utils, store, projectUtils) {
    return {
        template,
        data() {
            return {
                formData: {},
                fromRouteName: '',
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-space/views/project-info/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    hoursTip: this.getI18nByKey('hoursTip'),
                    durationTip: this.getI18nByKey('durationTip')
                }
            };
        },
        components: {
            CommonCreateForm: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/CreateForm/index.js'))
        },
        created() {},
        computed: {
            configParameter() {
                return {
                    formHeight: 'calc(100% - 2px)', // 高度需要传单位
                    title: '创建项目',
                    className: 'erd.cloud.ppm.project.entity.Project',
                    // layoutName: store.state?.projectInfo?.['templateInfo.tmplTemplated'] ? 'TEMPLATE_CREATE' : 'CREATE',
                    layoutName: 'CREATE',
                    showDetailForm: false, // 是否隐藏详细信息表单(此处考虑联动情况,即基本信息和详细信息不存在联动问题)
                    basicComponentName: 'commonBaseInfo', // 基础组件名称
                    basicComponent: ErdcKit.asyncComponent(
                        ELMP.resource('project-space/views/project-info/components/CreateBasicInfo/index.js')
                    ),
                    basicComponentUrl: 'project-space/views/project-info/components/CreateBasicInfo/index.js', // 基础组件地址
                    createUrl: '/ppm/create', // 创建接口
                    backName: '', // 路由返回名称
                    lookDetailName: 'projectInfo', // 创建成功后查看详情路由的名称
                    contineCreateName: 'projectCreate', // 创建成功后继续创建当前路由名称
                    saveDraft: true, // 是否显示保存草稿按钮
                    saveDraftAfterTip: '草稿保存成功，您可以在“工作台”查看' // 保存草稿后提示信息
                };
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
            fieldsChange(params) {
                params.oid = '';
                params.changeFields = ['timeInfo.scheduledStartTime', 'timeInfo.scheduledEndTime', 'duration'];
                params.fieldMapping = {
                    scheduledStartTime: 'timeInfo.scheduledStartTime',
                    scheduledEndTime: 'timeInfo.scheduledEndTime',
                    duration: 'duration'
                };
                projectUtils.fieldsChange(params);
            },
            beforeSubmit(data, next, draft) {
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

                data.attrRawList = _.filter(data.attrRawList, (item) => item.value);
                // 保存草稿
                if (draft) data.isDraft = true;
                let tip = draft ? '草稿创建成功' : '项目创建成功';
                next(data, draft, tip);
            },
            afterSubmit() {
                // this.$store.dispatch('route/delVisitedRoute', this.$route);
                // this.$router.push({
                //     name: 'projectList'
                // });
            }
        }
    };
});
