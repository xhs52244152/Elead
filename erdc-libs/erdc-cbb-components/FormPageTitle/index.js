define(['text!' + ELMP.resource('erdc-cbb-components/FormPageTitle/index.html')], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'FormPageTitle',
        template,
        components: {
            FamPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        props: {
            // 是否显示右侧按钮
            isShowPulldown: Boolean,
            // pulldown名称
            pulldownName: {
                type: String,
                default: ''
            },
            // pulldown列表
            pulldownList: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            // 是否显示tag标签
            isShowTag: Boolean,
            // 标签名称
            tagName: {
                type: String,
                default: ''
            },
            title: {
                type: String,
                default: ''
            },
            customClass: {
                type: String,
                default: ''
            }
        },
        computed: {
            // 内部pulldown名称
            innerPulldownName() {
                return this.pulldownName || this.i18n['operation'] || '';
            }
        }
    };
});
