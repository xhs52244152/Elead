define([ELMP.resource('erdc-app/api/organization.js'), 'erdcloud.kit', 'underscore'], function (api) {
    const _ = require('underscore');
    const store = require('fam:store');
    const ErdcKit = require('erdcloud.kit');

    const cache = {};

    return {
        /*html*/
        template: `
            <erd-tree-select
                ref="treeSelect"
                v-model="selected"
                :data="defaultDisplayData"
                node-key="oid"
                :lazy="lazy"
                icon-class="el-icon-arrow-right"
                :load="loadOrganization"
                :props="{ label: 'name', children: 'children', isLeaf: 'leaf', value: 'oid' }"
                :expand-on-click-node="false"
                :filterable="filterable"
                :clearable="clearable"
                :multiple="innerMultiple"
                :disabled="disabled"
                show-node-context
                v-bind="$attrs"
            >
                <template v-for="(slot, name) in $scopedSlots" v-slot:[name]="scope">
                    <slot :name="name" v-bind="scope"></slot>
                </template>
            </erd-tree-select>
        `,
        props: {
            value: {
                type: [Object, Array, String],
                default: null
            },
            clearable: Boolean,
            disabled: Boolean,
            filterable: Boolean,
            multiple: Boolean,
            lazy: {
                type: Boolean,
                default: true
            },
            dataType: String,
            row: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                defaultDisplayData: []
            };
        },
        computed: {
            selected: {
                get() {
                    return this.value;
                },
                set(selected) {
                    const ids = selected ? (_.isArray(selected) ? selected : _.compact([selected])) : [];
                    const value =
                        this.dataType === 'string'
                            ? selected
                            : _.chain(ids)
                                  .map((id) => {
                                      const $tree = this.$refs.treeSelect.$refs.tree;
                                      if ($tree) {
                                          return $tree.getNode(id).data;
                                      }
                                      return null;
                                  })
                                  .compact()
                                  .value();
                    const selectedArr = _.chain(ids)
                        .map((id) => {
                            const $tree = this.$refs.treeSelect.$refs.tree;
                            if ($tree) {
                                return $tree.getNode(id);
                            }
                            return null;
                        })
                        .compact()
                        .value();
                    this.$emit('input', value, selectedArr);
                    this.$emit('change', value, selectedArr);
                }
            },
            innerMultiple() {
                return this.multiple || ['IN', 'NOT_IN'].includes(this.row?.operator);
            }
        },
        watch: {
            value: {
                immediate: true,
                async handler(value) {
                    const valueArr = Array.isArray(value) ? value : [value];
                    const stringArr = valueArr.filter((item) => typeof item === 'string');
                    let result = valueArr;
                    if (stringArr.length) {
                        result = await Promise.all(stringArr.map(this.fetchAndSetData));
                    }
                    this.defaultDisplayData = result.filter(Boolean);
                }
            }
        },
        methods: {
            loadOrganization({ data }, resolve) {
                let parentParams = data ? { parentKey: data.key } : {};
                parentParams = { ...parentParams, isDefault: this.row?.isDefault ?? true };
                this.fetchOrgByLayer(parentParams).then((data) => {
                    // 过滤虚拟部门
                    let specialOrg = store.getters.specialConstName('specialOrganization') || [];
                    let filterData = (data?.data || []).filter((item) => !specialOrg.includes(item.number));
                    this.cache = _.extend(this.cache, _.indexBy(filterData, 'oid'));
                    resolve(filterData);
                });
            },
            fetchOrgByLayer(parentKey) {
                return api.fetchOrganizationListByParentKey(parentKey);
            },
            fetchAndSetData(value) {
                if (cache[value]) {
                    return Promise.resolve(cache[value]);
                }
                return this.$famHttp({
                    url: '/fam/attr',
                    className: value.split(':')[1],
                    errorMessage: false,
                    params: {
                        oid: value
                    }
                }).then((res) => {
                    const rawData = res.data?.rawData;
                    let object = {};
                    if (rawData) {
                        object = ErdcKit.deserializeAttr(rawData);
                        object.name = ErdcKit.translateI18n(rawData.nameI18nJson.value);
                        cache[value] = object;
                    }
                    return Promise.resolve(object);
                });
            }
        }
    };
});
