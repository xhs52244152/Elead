define([ELMP.resource('ppm-store/index.js'), 'css!' + ELMP.resource('project-calendar/index.css')], function (store) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template: `
            <system-calendar
                class="project-calendar-container"
                ref="sysCalendar"
                :get-attr-raw-list="getAttrRawList"
                :calendar-title="title"
                :custom-init-data="customInitData"
                :cannot-delete-tips="cannotDeleteTips"
                :cannot-update-tips="cannotUpdateTips"
                :cannot-create-tips="cannotCreateTips"
                :is-disabled-create-btn="!isSysCalendar"
                :is-editable="!isSysCalendar"
                :is-can-set-data="!isSysCalendar"
                @after-update="setCalendarData"
                @change-holiday="changeHoliday"
            >
                <template v-slot:select-calendar>
                    <erd-input
                        class="w-200"
                        type="text" 
                        :value="calendarName"
                        :disabled="true"
                    ></erd-input>
                </template>
            </system-calendar>
        `,
        components: {
            'system-calendar': ErdcKit.asyncComponent(ELMP.resource('system-calendar/views/CalendarManage/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('project-calendar/locale/index.js'),
                i18nMappingObj: {
                    projectCalendar: this.getI18nByKey('projectCalendar'),
                    cannotDeleteTips: this.getI18nByKey('cannotDeleteTips'),
                    cannotUpdateTips: this.getI18nByKey('cannotUpdateTips'),
                    onlyHaveOneCalendar: this.getI18nByKey('onlyHaveOneCalendar')
                },
                options: [],
                calendarOid: '',
                calendarName: '',
                isMounted: true
            };
        },
        computed: {
            containerRef() {
                return store.state?.projectInfo?.containerRef || {};
            },
            title() {
                return this.i18nMappingObj.projectCalendar;
            },
            // 日历实例
            sysCalendar() {
                return this.$refs?.sysCalendar || {};
            },
            cannotDeleteTips() {
                return this.i18nMappingObj.cannotDeleteTips;
            },
            cannotUpdateTips() {
                return this.i18nMappingObj.cannotUpdateTips;
            },
            cannotCreateTips() {
                return this.i18nMappingObj.onlyHaveOneCalendar;
            },
            isSysCalendar() {
                return this.options?.[0]?.calendarType === '0';
            }
        },
        mounted() {
            let timer = setTimeout(() => {
                clearTimeout(timer);
                this.isMounted = false;
            }, 2000);
        },
        methods: {
            getAttrRawList(data) {
                let { id, key } = this.containerRef;
                data.forEach((item) => {
                    if (item.attrName === 'calendarType') item.value = '1';
                });
                data.push({
                    attrName: 'containerRef',
                    value: `OR:${key}:${id}`
                });
                return data;
            },
            customInitData(type, resolve) {
                const dayjs = require('dayjs');
                this.$famHttp({
                    url: '/fam/calendar/getSystemCalendarByContainer',
                    method: 'GET',
                    params: {
                        containerId: this.containerRef.id
                    }
                }).then((res) => {
                    let result = res.data;
                    if (!type) {
                        result = {
                            ...result,
                            stDate: dayjs(result?.startTime).$d || '',
                            fsDate: dayjs(result?.finishTime).$d || ''
                        };
                        this.setCalendarData(result);
                    } else if (type === 'updateRules') {
                        result = {
                            ...result,
                            stDate: dayjs(result?.startTime).$d || '',
                            fsDate: dayjs(result?.finishTime).$d || '',
                            fewWeeks: result?.fewWeeks || -1,
                            repeatCycle: result?.lastMonth || 1
                        };
                        this.changeHoliday();
                        this.setCalendarData(result);
                    }
                    resolve(result);
                });
            },
            setCalendarData(currentData) {
                let { sysCalendar } = this;
                this.calendarOid = currentData.oid;
                this.calendarName = currentData.displayName;
                sysCalendar.currentData = currentData;
                sysCalendar.currentCalendarOid = currentData?.oid;
                sysCalendar.newOid = currentData?.oid;
                sysCalendar.calendarId = currentData?.id;
                sysCalendar.isContextCalendar = currentData.calendarType === '0';
                this.options = [currentData];
                sysCalendar.cldList = [currentData];
                if (sysCalendar?.calendarId) {
                    sysCalendar.getIncludeException(sysCalendar?.calendarId).then((res) => {
                        sysCalendar.currentData = { ...currentData, repetitionsCount: res.data };
                    });
                }
            },
            changeHoliday() {
                // 首次进来不调用该接口
                if (this.isMounted) return;
                this.$famHttp({
                    url: '/ppm/project/convolutionWorkload',
                    method: 'POST',
                    className: store.state.classNameMapping.project,
                    data: {
                        calendarId: this.options[0]?.id || '',
                        objectOid: store.state.projectInfo.oid
                    }
                });
            }
        }
    };
});
