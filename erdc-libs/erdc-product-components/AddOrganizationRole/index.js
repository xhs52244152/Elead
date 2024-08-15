define([
    "erdcloud.kit",
    "text!" +
        ELMP.resource("erdc-product-components/AddOrganizationRole/index.html"),
    "css!" +
        ELMP.resource("erdc-product-components/AddOrganizationRole/style.css"),
], function (ErdcKit, template) {
    const store = require("fam:store");
    const _ = require("underscore");

    return {
        template,
        props: {
            currentRoleName: {
                type: String,
                default: "",
            },
            oldParticipantIds: {
                type: Array,
                default() {
                    return [];
                },
            },
            appName: String,
        },
        components: {
            // 基础表格
            FamErdTable: ErdcKit.asyncComponent(
                ELMP.resource("erdc-components/FamErdTable/index.js"),
            ),
            FamParticipantSelect: ErdcKit.asyncComponent(
                ELMP.resource("erdc-components/FamParticipantSelect/index.js"),
            ),
        },
        data() {
            return {
                participantVal: "",
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource(
                    "erdc-product-components/locale/index.js",
                ),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys(["roleName", "principal"]),
                formData: {
                    participantVal: null,
                },
            };
        },
        watch: {
            currentRoleName: {
                immediate: true,
                handler(newVal) {
                    this.$set(this.formData, "name", newVal);
                },
            },
            participantVal: {
                immediate: true,
                handler(newVal) {
                    this.$set(this.formData, "participantVal", newVal?.value);
                },
            },
        },
        computed: {
            roleName() {
                return this.currentRoleName || "";
            },
            formConfigs() {
                const _this = this;
                return [
                    {
                        field: "name",
                        component: "erd-input",
                        label: "角色名称",
                        readonly: true,
                        validators: [],
                        props: {},
                        col: 24,
                    },
                    {
                        field: "participantVal",
                        component: "FamParticipantSelect",
                        label: "参与者",
                        required: true,
                        validators: [
                            {
                                trigger: ["blur", "change"],
                                validator(rule, value, callback) {
                                    if (!_this.participantVal?.value) {
                                        callback(new Error("请选择参与者"));
                                    } else {
                                        callback();
                                    }
                                },
                            },
                        ],
                        props: {},
                        slots: {
                            component: "participantValComponent",
                        },
                        col: 24,
                    },
                ];
            },
            queryParams() {
                return {
                    params: {
                        className:
                            "erd.cloud.foundation.principal.entity.Group",
                        appName: this.appName
                    }
                }
            },
        },
        methods: {
            fnGetFormData(isValidator = false) {
                if (isValidator) {
                    return new Promise((resolve, reject) => {
                        const { dynamicForm } = this.$refs;
                        dynamicForm
                            .submit()
                            .then(({ valid }) => {
                                if (valid) {
                                    resolve({
                                        participantType:
                                            this.participantVal?.type, // 参与者类型
                                        selectVal: this.participantVal?.value, // 参与者
                                    });
                                } else {
                                    reject();
                                }
                            })
                            .catch(reject);
                    });
                }
                return {
                    participantType: this.participantVal?.type, // 参与者类型
                    selectVal: this.participantVal?.value, // 参与者
                };
            },
        },
    };
});
