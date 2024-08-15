define([
    'text!' + ELMP.resource('system-operation-menu/views/UsageScenario/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('system-operation-menu/views/UsageScenario/style.css'),
    'underscore'
], function (template, utils) {
    const _ = require('underscore');
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        components: {
            ResizableContainer: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js')),
            ScenarioDetails: ErdcKit.asyncComponent(
                ELMP.resource('system-operation-menu/components/ScenarioDetails/index.js')
            ),
            UsageScenarioTree: ErdcKit.asyncComponent(
                ELMP.resource('system-operation-menu/components/UsageScenarioTree/index.js')
            )
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-operation-menu/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    application: this.getI18nByKey('application'),
                    nameI18nJson: this.getI18nByKey('nameI18nJson'),
                    businessName: this.getI18nByKey('businessName'),
                    name: this.getI18nByKey('name'),
                    appName: this.getI18nByKey('appName'),
                    typeName: this.getI18nByKey('typeName'),
                    icon: this.getI18nByKey('icon'),
                    sselectIcon: this.getI18nByKey('sselectIcon'),
                    IconTips: this.getI18nByKey('IconTips'),
                    enabled: this.getI18nByKey('enabled'),
                    descriptionI18nJson: this.getI18nByKey('descriptionI18nJson'),
                    increase: this.getI18nByKey('increase'),
                    pName: this.getI18nByKey('pName'),
                    reset: this.getI18nByKey('reset'),
                    save: this.getI18nByKey('save'),
                    ok: this.getI18nByKey('ok'),
                    cancel: this.getI18nByKey('cancel')
                },
                functionButton: {
                    loading: false
                },
                // 按钮组信息
                buttonInfo: {}
            };
        },
        computed: {
            isEdit() {
                return this.buttonInfo?.edit ?? true;
            }
        },
        methods: {
            fnOnSubmit() {
                let status = this.$refs?.scenarioDetails?.validRow();
                if (status) {
                    this.$confirm('你确定要修改按钮别名吗？', '提示', {
                        type: 'warning',
                        confirmButtonText: this.i18nMappingObj.ok,
                        cancelButtonText: this.i18nMappingObj.cancel
                    })
                        .then(() => {
                            this.updateButtonOper({ row: this.$refs?.scenarioDetails?.editRow });
                        })
                        .catch(() => {});
                }
            },
            remake() {
                this.$refs?.scenarioDetails?.getButtonDetails();
            },
            // 点击树
            onNodeClick(treeItem) {
                this.buttonInfo = treeItem || {};
            },
            // 更新按钮别名
            updateButtonOper({ row = {} }) {
                let value = _.extend({}, row?.anotherName || {});
                utils.trimI18nJson(value);
                let data = {
                    className: 'erd.cloud.foundation.core.menu.entity.MenuModuleActionLink',
                    attrRawList: [
                        {
                            attrName: 'nameI18nJson',
                            value
                        }
                    ],
                    action: 'UPDATE',
                    oid: row.oid
                };
                this.$famHttp({
                    url: `/fam/update`,
                    data,
                    method: 'post'
                })
                    .then((res) => {
                        if (res.success) {
                            this.$message.success('按钮别名修改成功');
                        }
                    })
                    .catch((error) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: error?.data?.message || '请求失败'
                        // })
                    })
                    .finally((err) => {
                        setTimeout(() => {
                            // this.$refs?.scenarioDetails?.editRow && (this.$refs?.scenarioDetails?.editRow = {});
                            this.$refs?.scenarioDetails?.aaaaa();
                        }, 500);
                    });
            }
        }
    };
});
