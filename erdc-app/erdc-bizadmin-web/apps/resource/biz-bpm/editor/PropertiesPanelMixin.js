define([ELMP.resource('biz-bpm/editor/XmlMixin.js'), 'erdcloud.kit', 'underscore'], function(XmlMixin) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');
    return {
        name: 'PropertiesPanelMixin',
        mixins: [XmlMixin],
        props: {
            // 当前编辑节点
            activeElement: {
                type: Object,
                default() {
                    return {};
                }
            },
            // 当前流程模板信息
            template: {
                type: Object,
                default() {
                    return {};
                }
            },
            bpmnModeler: Object,
            readonly: Boolean,
            isEdit: Boolean
        },
        computed: {
            nodeInfo() {
                return this.template.processActInstDefList?.find(item => item.nodeKey === this.activeElement?.id);
            },
            otherNodes() {
                return this.template.processActInstDefList?.filter(item => item !== this.nodeInfo) || [];
            },
            isGlobalConfiguration() {
                return /\S+:Process/i.test(this.activeElement.type);
            }
        },
        methods: {
            updateNodeInfo(nodeInfo) {
                const processActInstDefList = this.template.processActInstDefList || [];
                const index = processActInstDefList.findIndex((item) => item.nodeKey === this.nodeInfo?.nodeKey);
                if (index !== -1) {
                    processActInstDefList.splice(index, nodeInfo);
                } else {
                    processActInstDefList.push(nodeInfo);
                }
                this.$nextTick(() => {
                    this.$set(this.template, 'processActInstDefList', processActInstDefList);
                    this.$emit('update:template', this.template);
                });
            },
            updateTemplate(global, local, data) {
                const template = ErdcKit.deepClone(this.template);
                if (this.isGlobalConfiguration) {
                    template[global] = data;
                }else {
                    let target = _.find(template.processActInstDefList, node => node.nodeKey === this.activeElement.id);
                    if (target) {
                        target[local] = data;
                    }
                }
                this.$emit('update:template', template);
            },
            forceUpdateTemplate(template) {
                this.$emit('update:template', template);
            },
            /**
             * 格式化属性 数组 -> 对象
             * @param attrRawList
             * @returns {{}}
             */
            formatAttrRawList(attrRawList) {
                let formatObj = {};
                if (_.isArray(attrRawList) && attrRawList.length) {
                    _.each(attrRawList, attr => {
                        formatObj[attr.attrName] = attr.value;
                    })
                }
                return formatObj;
            },
            /**
             * 对象数组去重
             * @param objectArray
             * @param key 对象去重字段
             * @returns {Array}
             */
            objectArrayRemoveDuplication(objectArray, key) {
                const has = {};
                objectArray = objectArray.reduce((pre, next) => {
                    if (!has[next[key]]) {
                        has[next[key]] = true;
                        pre.push(next);
                    }
                    return pre;
                }, []);
                return objectArray;
            },
        }
    };
});
