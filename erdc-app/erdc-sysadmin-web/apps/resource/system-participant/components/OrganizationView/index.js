define([
    'text!' + ELMP.resource('system-participant/components/OrganizationView/index.html'),
    'erdcloud.kit',
    'fam:store',
    'underscore',
    'css!' + ELMP.resource('system-participant/components/OrganizationView/style.css')
], function (template, ErdcKit) {
    const store = require('fam:store');

    return {
        template,
        props: {
            oid: String,
            currentOrganization: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                form: {
                    oid: null,
                    defaultValue: {},
                    visible: false,
                    loading: false,
                    editable: false
                },
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-participant/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys(['editOrg', 'teamMembers', 'ok', 'cancel', 'baseInfo']),
                readonly: true,
                unfold1: true,
                unfold2: true
            };
        },
        components: {
            OrganizationForm: ErdcKit.asyncComponent(
                ELMP.resource('system-participant/components/OrganizationForm/index.js')
            ),
            OrganizationRoleTable: ErdcKit.asyncComponent(
                ELMP.resource('system-participant/components/OrganizationRoleTable/index.js')
            )
        },
        computed: {
            // 特殊部门不显示操作按钮
            isShowOperBtn() {
                let specialOrg = store.getters.specialConstName('specialOrganization') || [];
                return !specialOrg.includes(this.currentOrganization?.identifierNo);
            },
            // 是否显示角色列表，一级部门才显示
            isShowRole() {
                return !this.currentOrganization?.parentKey;
            }
        },
        methods: {
            // 菜单展开收缩
            onsubmitPanel: function (type, data) {
                if (type == 1) {
                    const $from = $('#custom-org-form');
                    data ? $from.show(100) : $from.hide(100);
                }
                if (type == 2) {
                    const $div = $('#custom-role-table');
                    data ? $div.show(100) : $div.hide(100);
                }
            },
            fnEditOrg() {
                this.form.oid = this.currentOrganization?.oid;
                this.form.editable = true;
                this.form.visible = true;
            },
            onSubmit(formRef) {
                this.form.loading = true;
                this.$refs[formRef]
                    .submit()
                    .then((resp) => {
                        // 刷新数据（根据当前操作节点）
                        this.$refs['orgTree'].refreshNode(this.currentOrganization?.key);
                        this.closeOrganizationForm(formRef);
                    })
                    .catch((err) => {})
                    .finally(() => {
                        this.form.loading = false;
                    });
            },
            closeOrganizationForm() {
                this.form.editable = false;
                this.form.visible = false;
            }
        }
    };
});
