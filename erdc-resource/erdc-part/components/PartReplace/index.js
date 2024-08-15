define(['text!' + ELMP.func('erdc-part/components/PartReplace/index.html')], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'PartReplace',
        template,
        components: {
            ReplaceManagement: ErdcKit.asyncComponent(ELMP.resource('erdc-pdm-components/ReplaceManagement/index.js'))
        },
        props: {
            vm: Object
        },
        computed: {
            oid() {
                return this.$route?.query?.oid || '';
            },
            className() {
                return this.$route?.query?.oid?.split(':')[1];
            },
            formData() {
                return { ...this?.vm?.formData, ...{} };
            },
            globalActionConfig() {
                return {
                    // 按钮后端会有前置校验
                    name: 'PART_ALTERNATE_OPERATE',
                    className: this.className,
                    objectOid: this.oid
                };
            }
        },
        methods: {
            handleHeader(data) {
                // 临时BA添加的列配置(后期可能会优化掉)
                let { headers } = data.data;
                headers.push({
                    oid: '',
                    attrName: 'viewRef',
                    attributeCategory: 'FLEX',
                    label: '视图',
                    hide: false,
                    width: 100,
                    baseField: false,
                    filterAble: false,
                    sortAble: false,
                    editAble: false,
                    sortOrder: 1,
                    locked: false,
                    toolTipsAble: false,
                    isHyperlink: false,
                    isShow: true,
                    dataKey: ''
                });
            }
        }
    };
});
