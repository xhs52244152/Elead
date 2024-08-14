define([ELMP.resource('ppm-utils/index.js')], function (utils) {
    return {
        template: `
            <span class="ppm-link-name" @click="onDetail">
                {{ identifierNo }}
            </span>
        `,
        props: {
            sourceData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 自定义link点击方法
            linkClick: Function
        },
        computed: {
            identifierNo() {
                return this.$attrs?.data?.identifierNo;
            }
        },
        methods: {
            onDetail() {
                // 是否有 自定义link点击方法
                if (typeof this.linkClick === 'function') {
                    return this.linkClick(this, 'identifierNo', this.sourceData);
                }
                const ErdcKit = require('erdcloud.kit');
                let row = ErdcKit.deepClone(this.sourceData);
                let result = ErdcKit.deserializeAttr(row.rawData || {}, {
                    valueMap: {
                        projectRef: (e) => {
                            return e.oid;
                        }
                    }
                });
                utils.openDetail(result);
            }
        }
    };
});
