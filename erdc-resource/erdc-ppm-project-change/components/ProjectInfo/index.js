define([
    'erdcloud.kit',
    ELMP.resource('ppm-https/common-http.js'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/utils.js')
], function (ErdcKit, commonHttp, projectUtils, utils) {
    return {
        template: `
            <erd-contraction-panel
                :unfold.sync="panelUnfold"
                :title="title"
                style="margin:calc(var(--bigSpace)* 2) 0"
            >
                <template v-slot:content>
                    <div style="padding: 0 var(--superSpace)">
                        <edit-basic-info
                            v-if="!readonly"
                            :current-data="formData"
                            ref="basicInfo"
                            :change-form-configs="changeFormConfigs"
                        ></edit-basic-info>
                        <fam-advanced-form
                            ref="form"
                            :model.sync="formData"
                            :form-id="formId"
                            :class-name="className"
                            :oid="formOid"
                            :object-oid="oid"
                            :model-mapper="modelMapper"
                            :query-layout-params="queryLayoutParams()"
                            @fieldChange="fieldChange"
                        >
                        </fam-advanced-form>
                    </div>
                </template>
                <template v-slot:header-right>
                    <erd-button v-if="panelUnfold && readonly" type="primary" @click="changeInfo">{{ i18n.changeInfo }}</erd-button>
                </template>
            </erd-contraction-panel>
        `,
        components: {
            EditBasicInfo: ErdcKit.asyncComponent(
                ELMP.resource('project-space/views/project-info/components/EditBasicInfo/index.js')
            ),
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js'))
        },
        props: {
            businessData: {
                type: Array,
                default: () => []
            },
            processInfos: {
                type: Object,
                default: () => {}
            },
            readonly: Boolean
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-ppm-project-change/locale/index.js'),
                panelUnfold: true,
                formData: {},
                className: 'erd.cloud.ppm.project.entity.Project',
                originData: {}
            };
        },
        computed: {
            title() {
                return this.i18n.projectInfo;
            },
            formId() {
                return this.readonly ? 'DETAIL' : 'UPDATE';
            },
            oid() {
                return this.businessData?.[0]?.oid || this.businessData[0]?.projectBasicInfo?.oid;
            },
            formOid() {
                return this.readonly ? '' : this.oid;
            },
            modelMapper() {
                if (!this.readonly)
                    return {
                        'lifecycleStatus.status': (data) => {
                            return data['lifecycleStatus.status']?.displayName;
                        },
                        'templateInfo.templateReference': (data) => {
                            return data['templateInfo.templateReference']?.oid || '';
                        },
                        'typeReference': (data) => {
                            return data['typeReference']?.oid || '';
                        },
                        'projectRef': (data) => {
                            return data['projectRef'].displayName;
                        }
                    };
                else {
                    return {
                        'lifecycleStatus.status': () => {
                            return this.i18n.underChange;
                        },
                        'templateInfo.templateReference': (data) => {
                            return data['templateInfo.templateReference']?.displayName || '';
                        },
                        'typeReference': (data) => {
                            return data['typeReference']?.displayName || '';
                        },
                        'projectRef': (data) => {
                            return data['projectRef']?.displayName || '';
                        },
                        'timeInfo.scheduledStartTime': (data) => {
                            return data['timeInfo.scheduledStartTime'].displayName;
                        },
                        'timeInfo.scheduledEndTime': (data) => {
                            return data['timeInfo.scheduledEndTime'].displayName;
                        },
                        'timeInfo.actualStartTime': (data) => {
                            return data['timeInfo.actualStartTime'].displayName;
                        },
                        'timeInfo.actualEndTime': (data) => {
                            return data['timeInfo.actualEndTime'].displayName;
                        },
                        'organizationRef': (data) => {
                            return data['organizationRef'].displayName;
                        }
                    };
                }
            }
        },
        watch: {
            businessData: {
                handler(val) {
                    if (val.length) {
                        if (this.processInfos.processStatusEnum || val[0]?.roleBObjectRef) {
                            let res = val[0]?.formData;
                            this.originData = ErdcKit.deepClone(res);
                            setTimeout(() => {
                                this.$refs.form?.resolveResponseData({ data: res });
                            }, 1000);
                        }
                    }
                },
                immediate: true
            }
        },
        methods: {
            queryLayoutParams() {
                return {
                    name: this.readonly ? 'PROJECT_CHANGE_DETAIL' : 'PROJECT_CHANGE_UPDATE',
                    objectOid: this.oid,
                    attrRawList: [
                        // {
                        //     attrName: 'layoutSelector',
                        //     value: this.readonly ? 'PROJECT_CHANGE_DETAIL' : 'PROJECT_CHANGE_UPDATE'
                        // }
                    ]
                };
            },
            changeFormConfigs(formConfigs) {
                return formConfigs.map((item) => {
                    if (item.field === 'templateInfo.templateReference') item.readonly = true;
                    return item;
                });
            },
            fieldChange({ field }, oldVal, nVal) {
                if (this.readonly) return;
                let { formData } = this;
                let params = {
                    field,
                    oid: formData?.oid,
                    formData,
                    nVal
                };
                params.changeFields = ['timeInfo.scheduledStartTime', 'timeInfo.scheduledEndTime', 'duration'];
                params.fieldMapping = {
                    scheduledStartTime: 'timeInfo.scheduledStartTime',
                    scheduledEndTime: 'timeInfo.scheduledEndTime',
                    duration: 'duration'
                };
                projectUtils.fieldsChange(params);
            },
            validate(type) {
                return new Promise((resolve, reject) => {
                    let result = this.getData();
                    if (type === 'draft') {
                        return resolve(result);
                    }
                    const basicInfoValidate = this.$refs.basicInfo.$refs.form.validate;
                    const formInfoValidate = this.$refs.form.$refs.dynamicForm.validate;
                    Promise.all([basicInfoValidate(), formInfoValidate()])
                        .then(() => {
                            resolve(result);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            },
            // 集团数据
            getOrganizationData(oid, attrName, old) {
                console.log(old, 'old');
                return new Promise((resolve) => {
                    this.$famHttp({
                        url: '/fam/listAllTree',
                        method: 'GET',
                        data: {
                            className: 'erd.cloud.foundation.principal.entity.Organization'
                        }
                    }).then((res) => {
                        const data = res.data;
                        // 遍及data数组如果有childList递归遍历，找到与oid相同的对象并返回
                        const findObject = (data) => {
                            for (let i = 0; i < data.length; i++) {
                                if (data[i].oid === oid) {
                                    if (data[i].childList?.length) {
                                        data[i].children = data[i].childList;
                                    }
                                    return data[i];
                                }
                                if (data[i].childList?.length) {
                                    const result = findObject(data[i].childList);
                                    if (result) {
                                        if (result.childList?.length) {
                                            result.children = result.childList;
                                        }
                                        return result;
                                    }
                                }
                            }
                        };
                        const value = findObject(data);
                        delete value.childList;
                        const organizations = ErdcKit.deepClone(value);
                        delete organizations.childList;
                        delete organizations.children;
                        const obj = {
                            ...old,
                            value,
                            organizations,
                            id: oid,
                            oid: oid,
                            displayName: value.displayName
                        };
                        resolve(obj);
                    });
                });
            },
            // 获取产品线和集团数据
            getObjectData(oid, attrName, oldValue) {
                return new Promise((resolve) => {
                    commonHttp.commonAttr({ data: { oid } }).then((res) => {
                        let rawData = res.data.rawData;
                        const [or, key, id] = oid.split(':');
                        const value = {
                            id,
                            key
                        };
                        let result = {
                            ...oldValue,
                            displayName: rawData?.nameI18nJson?.displayName || '',
                            attrName,
                            value,
                            oid: rawData?.oid?.value || ''
                        };
                        resolve(result);
                    });
                });
            },
            changeInfo() {
                let changeOid = this.businessData[0].roleBObjectRef;
                const changeContentValue = this.businessData[0].changeObject.attrRawList.find(
                    (item) => item.attrName === 'changeContent'
                )?.value;
                const changeContent = changeContentValue
                    ?.split(',')
                    .find((item) => ['PROJECT_ATTRIBUTE'].includes(item));
                let props = {
                    showDialog: true,
                    changeOid,
                    compareType: 'projectInfo',
                    projectOid: this.oid,
                    changeContent
                };
                let { destroy } = utils.useFreeComponent({
                    template: `
                    <change-info
                        v-bind="params"
                        @cancel="cancel">
                    </change-info>
                    `,
                    components: {
                        ChangeInfo: ErdcKit.asyncComponent(
                            ELMP.func('erdc-ppm-project-change/components/ChangeInfo/index.js')
                        )
                    },
                    data() {
                        return {
                            params: {}
                        };
                    },
                    created() {
                        this.params = props;
                    },
                    methods: {
                        cancel() {
                            destroy();
                        }
                    }
                });
            },
            async getData() {
                let basicInfos = this.$refs.basicInfo.$refs.form.serializeEditableAttr();
                let detailInfos = this.$refs.form.serializeEditableAttr();
                let attrRawList = [...detailInfos, ...basicInfos];
                this.originData = _.keys(this.originData).length
                    ? this.originData
                    : ErdcKit.deepClone(this.$refs.form.sourceData);
                let typeReference = this.originData.rawData.typeReference.oid;
                for (let i = 0; i < attrRawList.length; i++) {
                    const keyMap = ['productLineRef', 'organizationRef'];
                    let { attrName, value } = attrRawList[i];
                    if (keyMap.includes(attrName) && value) {
                        let oid = _.isObject(value) ? value.oid : value;
                        attrRawList[i].value = oid;
                        value = oid;
                        if (attrName === 'organizationRef') {
                            this.originData.rawData[attrName] = await this.getOrganizationData(
                                value,
                                attrName,
                                this.originData.rawData[attrName]
                            );
                        } else {
                            this.originData.rawData[attrName] = await this.getObjectData(
                                value,
                                attrName,
                                this.originData.rawData[attrName]
                            );
                        }
                    } else {
                        this.originData.rawData[attrName].displayName = value;
                        this.originData.rawData[attrName].value = value;
                    }
                }
                attrRawList.push({
                    attrName: 'typeReference',
                    value: typeReference
                });
                return {
                    formData: this.originData,
                    projectChange: {
                        attrRawList,
                        action: 'UPDATE',
                        oid: this.oid,
                        typeReference
                    }
                };
            }
        }
    };
});
