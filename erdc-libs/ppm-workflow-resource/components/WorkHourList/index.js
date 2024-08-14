define(['css!' + ELMP.resource('ppm-workflow-resource/components/WorkHourList/index.css')], function () {
    const ErdcKit = require('erdcloud.kit');
    return {
        template: `
            <div class="ppm-process-work-hour">
                <erd-contraction-panel
                    :unfold.sync="basiInfoPanelUnfolds"
                    :title="i18nMappingObj.basicInfo"
                    class="process-base-info"
                >
                    <template v-slot:content>
                        <fam-dynamic-form
                            ref="form"
                            :form.sync="form"
                            :data="formConfig"
                        >
                        </fam-dynamic-form>
                    </template>
                </erd-contraction-panel>
                <template v-for="item in tabs">
                    <div class="position-relative table-container">
                        <erd-contraction-panel
                            :unfold.sync="panelUnfolds[item.name]"
                            :title="item.title || ''"
                        >
                            <template v-slot:content>
                                <work-hour-table
                                    v-if="currentWeek.length"
                                    :week="currentWeek"
                                    :data="tableData[item.name]"
                                    :ref="item.name"
                                    :dialog-config="item.dialogConfig"
                                    :type-reference="item.typeReference"
                                    :work-hour-class-name="item.workHourClassName"
                                    :readonly="true"
                                >
                                </work-hour-table>
                            </template>
                        </erd-contraction-panel>
                    </div>
                </template>
            </div>
        `,
        props: {
            businessData: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        components: {
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js')),
            WorkHourTable: ErdcKit.asyncComponent(ELMP.func('erdc-ppm-work-hour/components/WorkHourTable/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('ppm-workflow-resource/components/WorkHourList/locale/index.js'),
                i18nMappingObj: {
                    basicInfo: this.getI18nByKey('basicInfo'),
                    approvalWeek: this.getI18nByKey('approvalWeek'),
                    name: this.getI18nByKey('name')
                },
                tabs: [],
                tableData: [],
                form: {},
                panelUnfolds: {},
                basiInfoPanelUnfolds: true
            };
        },
        watch: {
            businessData: {
                handler(val) {
                    if (val.length) {
                        let { year, week, currentWeek, tabs, userInfoText, currentWeekText, userId } = val[0];
                        this.tabs = tabs;
                        this.currentWeek = currentWeek;
                        this.userId = userId;
                        this.$set(this.form, 'userInfoText', userInfoText);
                        this.$set(this.form, 'currentWeekText', currentWeekText);
                        this.tabs.forEach(({ name }) => {
                            // this.$set(this.tableData, name, []);
                            this.$set(this.panelUnfolds, name, true);
                        });
                        this.fetchWorkHourData({ year, week }).then((res) => {
                            this.setTableData(res.data.contextInfo || res.data);
                        });
                    }
                },
                immediate: true
            }
        },
        computed: {
            formConfig() {
                return [
                    {
                        field: 'currentWeekText',
                        label: this.i18nMappingObj.approvalWeek,
                        readonly: true,
                        component: 'erd-input',
                        col: 12
                    },
                    {
                        field: 'userInfoText',
                        label: this.i18nMappingObj.name,
                        readonly: true,
                        component: 'erd-input',
                        col: 12
                    }
                ];
            }
        },
        methods: {
            fetchWorkHourData({ year, week }) {
                return this.$famHttp({
                    url: '/ppm/timesheet/selectList',
                    className: 'erd.cloud.ppm.project.entity.Project',
                    method: 'POST',
                    data: {
                        selectType: 'timesheetReport',
                        year,
                        ownedById: this.userId,
                        dimension: 'WEEK',
                        several: week
                    }
                });
            },
            setTableData(data) {
                data.forEach((record) => {
                    let tableKey = record.typeName.split('.').slice(-1)[0];
                    let arr = [];
                    tableKey &&
                        (record.contexts || []).forEach((obj) => {
                            obj.raws.forEach((row) => {
                                let dataRow = {
                                    name: obj.displayName,
                                    dataOid: obj.contextOId,
                                    dataId: Date.now(),
                                    isOrigin: true
                                };
                                if (tableKey === 'TaskTimesheet') dataRow.projectName = obj.projectName;
                                row.timesheet.forEach((time) => {
                                    dataRow[`attr_${time.dayOfWeek - 1}`] = {
                                        oid: time.oid,
                                        id: time.id,
                                        idKey: time.idKey,
                                        description: time.description,
                                        dayOfWeek: time.dayOfWeek,
                                        contextRef: time.contextRef,
                                        workHour: time.workHour,
                                        sortOrder: time.sortOrder
                                    };
                                });
                                arr.push(dataRow);
                            });
                        });
                    this.$set(this.tableData, tableKey, arr);
                });
            }
        }
    };
});
