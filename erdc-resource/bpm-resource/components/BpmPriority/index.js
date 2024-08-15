define(['text!' + ELMP.resource('bpm-resource/components/BpmPriority/template.html'), 'underscore'], function (
    template
) {
    const _ = require('underscore');
    return {
        name: 'BpmPriority',
        template,
        props: {
            // 优先级
            priority: {
                type: Number,
                default: 0,
                required: true
            },
            // 标题
            title: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('bpm-resource/components/BpmPriority/locale/index.js'),
                i18nMappingObj: this.getI18nKeys(['高', '中', '低'])
            };
        },
        computed: {
            priorityList() {
                return [
                    {
                        label: this.i18nMappingObj['高'],
                        color: '#F04134',
                        value: 100
                    },
                    {
                        label: this.i18nMappingObj['中'],
                        color: '#333',
                        value: 50
                    },
                    {
                        label: this.i18nMappingObj['低'],
                        color: '#666',
                        value: 0
                    }
                ];
            },
            priorityObject() {
                let [priorityObject = this.priorityList[this.priorityList.length - 1]] = _.filter(
                    this.priorityList,
                    (item) => +this.priority > item.value
                );
                return priorityObject;
            },
            priorityTitle() {
                let { label } = this.priorityObject || {};
                return this.title || label || '';
            },
            priorityColor() {
                let { color } = this.priorityObject || {};
                return color || '';
            }
        }
    };
});
