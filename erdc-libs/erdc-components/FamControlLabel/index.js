define([
    'erdc-kit',
    'fam:kit',
    'underscore',
    'css!' + ELMP.resource('erdc-components/FamControlLabel/style.css')
], function (utils) {
    const FamKit = require('fam:kit');
    const _ = require('underscore');

    return {
        /*html*/
        template: `
            <div id="FamControlLabel" class="flex">
                <div>
                    <erd-tag
                    v-for="tag in selectTags"
                    :key="tag.id"
                    closable
                    :color="tag.value"
                    :style="tagStyle(tag)"
                    @close="onClose(tag)">
                        {{tag.displayName}}
                    </erd-tag>
                </div>

                <div class="addFont">
                    <el-dropdown trigger="click" :hide-on-click="false">
                        <i class="erd-iconfont erd-icon-create"></i>
                        <el-dropdown-menu class="control-lable" slot="dropdown">
                            <el-dropdown-item 
                            v-for="item in tags"
                            :key="item.id"
                            :class="{
                                'tag-width': true
                            }"
                            :style="style(item)"
                            @click.native="selectTag(item)"
                            >
                                {{item.displayName}}
                                <i class="el-icon-check check-tag" v-if="item.isSelect"></i>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>
            </div>
        `,

        props: {
            value: {
                type: [Number, String, Array],
                default: () => {
                    return [];
                }
            },
            width: {
                type: [Number, String],
                default: () => {
                    return 'auto';
                }
            },
            maxWidth: {
                type: [Number, String],
                default: () => {
                    return '100%';
                }
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-components/FamI18nbasics/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    pleaseInput: this.getI18nByKey('请输入'),
                    pleaseClick: this.getI18nByKey('请点击'),
                    confirm: this.getI18nByKey('确定'),
                    cencel: this.getI18nByKey('取消')
                },
                lan: this.$store.state.i18n?.lang || 'zh_cn',
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
                ],
                selectTags: [],
                dropDown: false
            };
        },
        computed: {
            selectVal: {
                get() {
                    const value = (_.isArray(this.value) ? this.value : this.value.split(',')) || [];
                    return value || [];
                },
                set(val) {
                    this.$emit('input', val.join(','));
                }
            }
        },
        watch: {
            value: function (n, o) {
                this.setSelectTag();
            }
        },
        mounted() {
            this.setSelectTag();
        },
        methods: {
            onClose(tag) {
                this.selectVal.forEach((item, index) => {
                    if (item == tag.id) {
                        this.selectVal.splice(index, 1);
                    }
                });
                this.setSelectTag();
            },
            style(item) {
                return `background-color: ${item.value};`;
            },
            tagStyle(item) {
                let width = item.width || this.width;
                width = !width.includes('px') && !width.includes('%') ? width + 'px' : width;
                let maxWidth = item.maxWidth || this.maxWidth;
                maxWidth = !maxWidth.includes('px') && !maxWidth.includes('%') ? maxWidth + 'px' : maxWidth;
                return `width: ${width}; max-width: ${maxWidth};`;
            },
            selectTag(data) {
                if (!this.selectVal.includes(data.id)) {
                    this.selectVal.push(data.id);
                    this.setSelectTag();
                } else {
                    this.selectVal.forEach((item, index) => {
                        if (item == data.id) {
                            this.selectVal.splice(index, 1);
                        }
                    });
                    this.setSelectTag();
                }
                this.$emit('input', this.selectVal.join(','));
                this.$emit('onsumbit', this.selectVal.join(','));
            },
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
        },
        components: {}
    };
});
