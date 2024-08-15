define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <div style="display: flex;">
                <span style="width: 40px">状态</span>
                <span style="width: 140px">名称</span>
                <span style="width: 80px">数据值</span>
                <span style="width: 40px">删除</span>
            </div>
        `,
        // <el-divider>选项设置</el-divider>
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    border: this.getI18nByKey('带有边框')
                }
            };
        },
        computed: {
            showBorder: {
                get() {
                    return this.schema?.props?.border || false;
                },
                set(val) {
                    const props = this.schema.props || {};
                    this.$set(props, 'border', val);
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
