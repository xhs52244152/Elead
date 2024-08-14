define([ELMP.resource('erdc-app/ccc/index.js'), 'erdcloud.kit'], function (CCC, ErdcKit) {
    async function init() {
        await registerFormComponents();
    }
    function registerFormComponents() {
        return new Promise((resolve) => {
            // 因为微功能只能在路由，在工作台切换不同的微功能就会多次调用，所以在这加上判断，存在就不注册了
            if (CCC.state.widgets.find((item) => item.key === 'ProjectSelect')) return resolve();
            CCC.registerComponent({
                definition: {
                    name: 'ProjectSelect',
                    component: ErdcKit.asyncComponent(
                        ELMP.resource('ppm-component/ppm-components/ProjectSelect/index.js')
                    )
                }
            });
            CCC.registerWidgets([
                {
                    // 唯一标识
                    key: 'ProjectSelect',
                    // 部件显示名
                    name: '所属项目',
                    // 部件所属分类，在表单设计器有所体现
                    category: 'basic',
                    // 是否禁用此部件
                    disabled: false,
                    // 根据部件生成的 FamDynamicFormItem 参数模式
                    schema: {
                        // 表单组件
                        component: 'ProjectSelect',
                        // 是否必填
                        required: true,

                        // 表单组件的参数
                        props: {
                            label: '',
                            dataValue: ''
                        },

                        // 表单栅格
                        col: 12
                    },

                    configurations: CCC.useWidgetConfigs([
                        'field',
                        'required',
                        'readonly',
                        'label',
                        'clearable',
                        'component',
                        'defaultValue'
                    ])
                }
            ]);
            let componentsMap = {
                PlanSetSelect: ELMP.resource('ppm-component/ppm-components/PlanSetSelect/index.js'),
                ProjectAssignmentsSelect: ELMP.resource(
                    'ppm-component/ppm-components/ProjectAssignmentsSelect/index.js'
                )
            };
            CCC.registerComponent(
                Object.keys(componentsMap).map((componentName) => {
                    return {
                        definition: {
                            name: componentName,
                            resourceUrl: componentsMap[componentName],
                            sync: false
                        }
                    };
                })
            ).then(() => {
                resolve();
            });
        });
    }
    return {
        init
    };
});
