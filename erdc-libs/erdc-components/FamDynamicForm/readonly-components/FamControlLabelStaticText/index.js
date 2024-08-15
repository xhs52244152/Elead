/**
 * readonly component for CustomSelect
 */
define([
    'erdc-kit',
    'css!' + ELMP.resource('erdc-components/FamDynamicForm/readonly-components/FamControlLabelStaticText/style.css'),
    'underscore'
], function (utils) {
    const _ = require('underscore');

    return {
        /*html*/
        template: `
            <div class="FamControlLabelStaticText" v-if="selectTags.length">
                <erd-tag
                v-for="tag in selectTags"
                :key="tag.id"
                :color="tag.value">
                    <erd-tooltip
                        placement="top"
                        :content="tag.displayName"
                        popper-class="fam-tooltip-max-width"
                    >
                        <span
                            v-fam-clamp="{ truncationStyle: 'inline' }"
                        >
                            {{ tag.displayName }}
                        </span>
                    </erd-tooltip>
                </erd-tag>
            </div>
            <div v-else>--</div>
        `,
        props: {
            value: {
                type: [Number, String, Array],
                default: () => {
                    return [];
                }
            }
        },
        data() {
            return {
                staticText: '',
                selectTags: [],
                tags: [
                    {
                        id: 'SYS_30',
                        displayName: '黑色',
                        value: '#333'
                    },
                    {
                        id: 'SYS_32',
                        displayName: '棕色',
                        value: '#996633'
                    },
                    {
                        id: 'SYS_33',
                        displayName: '青蓝',
                        value: '#00D8FF'
                    },
                    {
                        id: 'SYS_34',
                        displayName: '紫色',
                        value: '#9933CC'
                    },
                    {
                        id: 'SYS_37',
                        displayName: '粉红',
                        value: '#FF99CC'
                    },
                    {
                        id: 'SYS_eb0e87374aa49a793dfcb480d817',
                        displayName: '红色',
                        value: '#CC3333'
                    }
                ]
            };
        },
        computed: {},
        mounted() {
            this.setSelectTag();
        },
        methods: {
            setSelectTag() {
                if (!this.value) return;
                this.selectVal = _.isArray(this.value) ? this.value : this.value.split(',').filter((item) => item);

                this.selectTags = this.tags
                    .map((item) => {
                        item.isSelect = false;
                        if (this.selectVal.includes(item.id)) {
                            item.isSelect = true;
                            return item;
                        }
                    })
                    .filter((item) => item);
            }
        }
    };
});
