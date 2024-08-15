define(['fam:kit'], function () {
    const FamKit = require('fam:kit');

    return {
        name: 'TableData',

        /*html*/
        template: `
            <table class="table options-table w_100p" :style="{ maxWidth: readonly ? '1000px' : 'unset', margin: 'auto' }">
                <thead>
                    <tr>
                        <template v-for="column in columns">
                            <th :key="column.field" :width="column.width">{{ translateI18n(column.i18n) || column.header }}</th>
                        </template>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in tableData">
                        <template v-for="(column, columnIndex) in columns">
                            <td :key="index + '-' + columnIndex">
                                <component
                                    :is="columnComponent(column)"
                                    v-model="row[column.field]"
                                    v-bind="column.props"
                                    :disabled="columnDisabled(column)"
                                    @input="handleCustomEvent('input', $event, { column: column, row: row, rowIndex: index, columnIndex: columnIndex })"
                                    @change="handleCustomEvent('change', $event, { column: column, row: row, rowIndex: index, columnIndex: columnIndex })"
                                    @click="handleCustomEvent('click', $event, { column: column, row: row, rowIndex: index, columnIndex: columnIndex })"
                                ></component>
                            </td>
                        </template>
                    </tr>
                    <tr v-if="!readonly">
                        <td :colspan="columns.length">
                            <erd-button style="width: 100%" icon="el-icon-plus" :disabled="disabled" @click="addRow"></erd-button>
                        </td>
                    </tr>
                </tbody>
            </table>
        `,
        props: {
            /**
             * @typedef RowDefinition
             * @property {string} header
             * @property {string} field
             * @property {string} width
             * @property {string} i18n
             * @property {string} component
             * @property {Object} props
             * @property {Object} listeners
             */
            /**
             * @type {RowDefinition[]}
             */
            columns: {
                type: Array,
                default() {
                    return [];
                }
            },
            data: {
                type: Array,
                default() {
                    return [];
                }
            },
            rowSchema: {
                type: [Object, Function, String],
                default() {
                    return {};
                }
            },
            readonly: Boolean,
            disabled: Boolean
        },
        computed: {
            tableData: {
                get() {
                    return this.data || [];
                },
                set(tableData) {
                    this.$emit('update:data', tableData);
                }
            },
            newRowFunctor() {
                const rowSchema = this.rowSchema;
                if (typeof rowSchema === 'function') {
                    return rowSchema;
                }
                if (typeof rowSchema === 'string') {
                    try {
                        return new Function(rowSchema).bind(this);
                    } catch (error) {
                        console.error(error);
                    }
                }
                return () => rowSchema;
            }
        },
        watch: {
            tableData: {
                deep: true,
                handler(tableData) {
                    this.$emit('change', tableData);
                }
            }
        },
        methods: {
            columnComponent(column) {
                return this.readonly || column.props?.readonly
                    ? this.readonlyComponent(column.component)
                    : column.component;
            },
            columnDisabled(column) {
                return this.disabled || column.props?.disabled || this.readonly;
            },
            translateI18n(...args) {
                return FamKit.translateI18n(...args);
            },
            addRow() {
                const tableData = this.tableData || [];
                this.tableData = [...tableData, this.newRowFunctor()];
            },
            removeRow(index) {
                const tableData = this.tableData;
                tableData.splice(index, 1);
                this.tableData = tableData;
            },
            handleCustomEvent(eventName, $event, data) {
                const { column } = data;
                const listeners = column?.listeners || {};
                const customListener = listeners[eventName];
                let functor = customListener;
                let isReturnMode = false;
                if (typeof customListener === 'string') {
                    try {
                        isReturnMode = /^\s*return\b/.test(customListener);
                        functor = new Function(`${customListener}`).bind(this);
                    } catch (error) {
                        console.error(error);
                    }
                }
                if (typeof functor === 'function') {
                    try {
                        if (isReturnMode) {
                            functor.call(this)($event, data, this);
                        } else {
                            functor.call(this, $event, data, this);
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }
                this.$emit('table:' + eventName, $event, data, this);
            },
            readonlyComponent(componentName) {
                if (typeof componentName === 'string') {
                    return (
                        this.$store.getters['component/readonlyComponent'](componentName) || {
                            template: `
                            <span>{{value}}</span>
                        `,
                            props: {
                                value: [String]
                            }
                        }
                    );
                }
                return componentName;
            }
        }
    };
});
