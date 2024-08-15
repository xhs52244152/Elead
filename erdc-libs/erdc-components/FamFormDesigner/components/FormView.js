define([
    'text!' + ELMP.resource('erdc-components/FamFormDesigner/components/FormViewTemplate.html'),
    ELMP.resource('erdc-components/FamFormDesigner/CustomizeConfigurationMixin.js'),
    ELMP.resource('erdc-components/FamFormDesigner/components/FormViewItem.js'),
    ELMP.resource('erdc-components/FamDynamicForm/index.js'),
    'erdc-kit',
    'fam:store'
], function (template, CustomizeConfigurationMixin, FormViewItem, FamDynamicForm) {
    const FamKit = require('erdc-kit');

    return {
        template,
        mixins: [CustomizeConfigurationMixin],
        components: {
            FamUser: FamKit.asyncComponent(ELMP.resource('erdc-components/FamUser/index.js')),
            FormViewItem
        },
        props: {
            designer: Object,
            // 编辑器自身是否只读
            readonly: Boolean,
            // 判断是否在编辑器里边使用
            isDesignerForm: Boolean
        },
        data() {
            return {
                // 表单信息，提供给表单项填入内容的，目前没有用到
                form: {},
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    workArea: this.getI18nByKey('表单布局'),
                    createTime: this.getI18nByKey('创建时间'),
                    dragTips: this.getI18nByKey('请从左侧列表中选择一个组件, 然后用鼠标拖动组件放置于此处')
                }
            };
        },
        computed: {
            // 创建人
            user() {
                return this.designer?.formConfig?.createUser;
            },
            // 创建时间
            createTime() {
                return this.designer?.formConfig?.createTime;
            },
            // 表单是否只读模式，指的是所编辑的表单是否是只读（一般来说表单信息面板设置为详情模式则表示只读）
            formReadonly() {
                return this.designer?.formConfig?.type === 'DETAIL';
            }
        },
        watch: {
            'designer.widgetList': {
                immediate: true,
                handler() {
                    this.onWidgetListUpdate();
                }
            },
            user: {
                immediate: true,
                handler(user) {
                    if (user?.avatar) {
                        user.avatar = FamKit.imgUrlCreator(user.avatar);
                    }
                }
            }
        },
        methods: {
            onMouseMove() {
                this.$refs.scrollbar.update();
            },
            setSelected(widget) {
                this.designer.setSelected(widget);
            },
            onWidgetListUpdate() {
                this.$nextTick(() => {
                    this.$refs.scrollbar.update();
                });
            },
            lastLineChildClass: FamDynamicForm.methods.lastLineChildClass
        }
    };
});
