define([
    'erdcloud.kit',
    'text!' + ELMP.resource('erdc-product-components/AddParticipantSelect/index.html'),
    'css!' + ELMP.resource('erdc-product-components/AddParticipantSelect/style.css')
], function (ErdcKit, template) {
    return {
        template,
        components: {
            // 基础表格
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamParticipantSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js'))
        },
        props: {
            visible: Boolean,
            labelVisible: {
                type: Boolean,
                default: true
            },
            leftSpan: {
                type: Number,
                default() {
                    return 3;
                }
            },
            rightSpan: {
                type: Number,
                default() {
                    return 21;
                }
            },
            queryParams: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            appName: String
        },
        data() {
            return {
                participantVal: '',
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-participant/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys(['principal']),
                queryScope: 'fullTenant'
            };
        },
        computed: {
            roleName() {
                return this.currentRoleName || '';
            }
        },
        methods: {
            fnGetFormData() {
                return {
                    participantType: this.participantVal?.type, // 参与者类型
                    selectVal: this.participantVal?.value, // 参与者
                    appName: this.appName
                };
            }
        }
    };
});
