define([
    'text!' + ELMP.resource('biz-signature/taskCreate/signatureSign/index.html'),
    ELMP.resource('biz-signature/CONST.js'),
    ELMP.resource('biz-signature/mixins/lazyWatermark.js'),
    ELMP.resource('biz-signature/mixins/systemSignature.js'),
    'css!' + ELMP.resource('biz-signature/index.css')
], function (tmpl, CONST, watermarkMixin, systemSignatureMixin) {
    const FamKit = require('fam:kit');
    return {
        name: 'SignatureSignTask',
        template: tmpl,
        mixins: [watermarkMixin, systemSignatureMixin],
        components: {
            FamMemberSelect: FamKit.asyncComponent(ELMP.resource('erdc-components/FamMemberSelect/index.js')),
            FamDynamicForm: FamKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            FamErdTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamUpload: FamKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js')),
            FormatParams: FamKit.asyncComponent(ELMP.resource('biz-signature/taskCreate/formatParams/index.js'))
        },
        watch: {
            'formData.fileType': function () {
                this.formData.docCode = '';
                this.formData.branchId = '';
                const result = CONST.docTmplFileType.find((item) => item.id === this.formData.fileType);
                this.acceptType = result.fileType;
                this.resetFileData();
                this.pointsData = [];
                this.loadSignatureTmpl();
            }
        },
        created() {
            this.loadSignatureTmpl();
        },
        computed: {
            filledMap: function () {
                var filledMap = {};
                for (var point of this.pointsData) {
                    if (point.contentType === CONST.contentTypes.signature_personal && point.value) {
                        filledMap[point.code] = point.value.substring(point.value.lastIndexOf(':') + 1);
                    } else {
                        filledMap[point.code] = point.value || '';
                    }
                }
                return filledMap;
            },
            pointsColumns: function () {
                return [
                    {
                        type: 'seq', // 特定类型
                        title: ' ',
                        width: 48
                    },
                    {
                        prop: 'code',
                        title: '变量名称'
                    },
                    {
                        prop: 'type',
                        title: '类型'
                    },
                    {
                        prop: 'value',
                        title: '值'
                    }
                ];
            },
            formConfigs: function () {
                const { formData } = this;
                return [
                    {
                        col: 24,
                        component: 'FamClassificationTitle',
                        props: {
                            unfold: true
                        },
                        label: this.i18nMappingObj.taskDetail,
                        nameI18nJson: {
                            value: this.i18nMappingObj.taskDetail,
                            zh_cn: ''
                        },
                        children: [
                            {
                                label: this.i18nMappingObj.signatureType,
                                component: 'CustomSelect',
                                readonly: false,
                                required: true,
                                props: {
                                    row: {
                                        referenceList: CONST.docTmplFileType.map((i) => {
                                            return {
                                                id: i.id,
                                                value: i.id,
                                                name: i.id
                                            };
                                        })
                                    },
                                    clearable: false
                                },
                                col: 12,
                                field: 'fileType',
                                nameI18nJson: {
                                    value: this.i18nMappingObj.signatureType
                                }
                            },
                            {
                                component: 'Slot',
                                props: {
                                    name: 'file-slot',
                                    clearable: false
                                },
                                col: 24,
                                field: 'file',
                                required: true,
                                nameI18nJson: {
                                    value: this.i18nMappingObj.fileToSignature,
                                    zh_cn: ''
                                },
                                label: this.i18nMappingObj.fileToSignature
                            },

                            {
                                label: this.i18nMappingObj.taskName,
                                component: 'ErdInput',
                                readonly: false,
                                required: true,
                                props: {
                                    maxlength: 100,
                                    clearable: false
                                },
                                col: 12,
                                field: 'name',
                                nameI18nJson: {
                                    value: this.i18nMappingObj.taskName
                                }
                            },

                            {
                                label: this.i18nMappingObj.docTempl,
                                component: 'Slot',
                                readonly: false,
                                required: true,
                                props: {
                                    name: 'tmpl-slot',
                                    clearable: false
                                },
                                col: 12,
                                field: 'docCode',
                                nameI18nJson: {
                                    value: this.i18nMappingObj.docTempl
                                }
                            },
                            {
                                label: this.i18nMappingObj.version,
                                component: 'Slot',
                                readonly: false,
                                required: true,
                                props: {
                                    name: 'version-slot',
                                    clearable: false
                                },
                                col: 12,
                                field: 'branchId',
                                nameI18nJson: {
                                    value: this.i18nMappingObj.version
                                }
                            },
                            {
                                label: this.i18nMappingObj.addWatermark,
                                component: 'Slot',
                                readonly: false,
                                props: {
                                    name: 'watermark-slot'
                                },
                                col: 12,
                                field: 'watermark',
                                nameI18nJson: {
                                    value: this.i18nMappingObj.addWatermark
                                }
                            },
                            {
                                label: this.i18nMappingObj.convertToPDF,
                                component: 'FamRadio',
                                readonly: false,
                                required: false,
                                props: {
                                    type: 'radio',
                                    options: [
                                        {
                                            label: this.i18nMappingObj.yes,
                                            value: true
                                        },
                                        {
                                            label: this.i18nMappingObj.no,
                                            value: false
                                        }
                                    ]
                                },
                                col: 12,
                                field: 'pdfConvert',
                                nameI18nJson: {
                                    value: this.i18nMappingObj.convertToPDF
                                }
                            },
                            {
                                label: this.i18nMappingObj.paramValue,
                                component: 'Slot',
                                readonly: false,
                                required: false,
                                props: {
                                    name: 'param-slot'
                                },
                                col: 24,
                                nameI18nJson: {
                                    value: this.i18nMappingObj.paramValue
                                }
                            },
                            {
                                label: this.i18nMappingObj.positionValue,
                                component: 'Slot',
                                readonly: false,
                                required: false,
                                disabled: true,
                                props: {
                                    name: 'position-param-slot'
                                },
                                col: 24,
                                nameI18nJson: {
                                    value: this.i18nMappingObj.positionValue
                                }
                            }
                        ]
                    }
                ];
            }
        },
        data() {
            let contentTypeMap = {};
            CONST.contentTypeOptions.forEach((i) => {
                contentTypeMap[i.id] = i;
            });
            return {
                i18nLocalePath: CONST.i18nPath,
                i18nMappingObj: this.getI18nKeys(
                    [
                        'createDocTmpl',
                        'editWatermark',
                        'confirm',
                        'taskDetail',
                        'signatureType',
                        'fileToSignature',
                        'taskName',
                        'version',
                        'docTempl',
                        'convertToPDF',
                        'addWatermark',
                        'paramValue',
                        'positionValue',
                        'yes',
                        'no',
                        'fileExist',
                        'view',
                        'operate',
                        'signatureSearchTips',
                        'createSuccess',
                        'cancel',
                        'signatureUpload',
                        'signature_sign_upload_img',
                        'signatureTmpl',
                        'pdfFileTips',
                        'wordFileTips',
                        'excelFileTips'
                    ].concat(CONST.contentTypeOptions.map((i) => i.lang))
                ),
                formData: {
                    fileType: CONST.docTmplFileType[0].id,
                    docCode: '',
                    branchId: '',
                    name: '',
                    file: '',
                    watermark: '',
                    pdfConvert: true,
                },
                convertParamDto: null,
                acceptType: CONST.docTmplFileType[0].fileType,
                fileList: [],
                // 签名模板可选项
                signatureTmplOptions: [],
                // 签名模板对应的版本号可选项
                signatureTmplVersionsOptions: [],
                temOption: [],
                pointsData: [],
                contentTypeMap: contentTypeMap,
                defaultHeaders: CONST.defaultHeaders,
                CONST: CONST
            };
        },
        methods: {
            handlePositionImgUploadSuccess: function (rowData) {
                let self = this;
                return (resp) => {
                    self.$set(rowData, 'value', resp.data);
                };
            },
            handlePositionImgUploadRemove: function (rowData) {
                let self = this;
                return () => {
                    self.$set(rowData, 'value', '');
                };
            },
            onFileUploadSuccess: function (response, file) {
                this.formData.fileName = file.name;
                this.formData.name = file.name;
                this.formData.file = response.data;
            },
            resetFileData: function () {
                this.formData.fileName = '';
                this.formData.file = '';
                this.formData.name = '';
                this.formData.watermark = '';
                this.fileList = [];
            },
            handleExceed: function () {
                this.$message({
                    message: this.i18nMappingObj.fileExist,
                    type: 'warning'
                });
            },
            onBeforeUpload(file) {
                const type = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                const list = this.acceptType.split(';');
                if (list.indexOf(type) === -1) {
                    const result = CONST.docTmplFileType.find((item) => item.id === this.formData.fileType);
                    this.$message({
                        message: this.i18nMappingObj[result.fileTips],
                        type: 'warning'
                    });
                    return false;
                }
            },
            // 加载签名模板
            loadSignatureTmpl() {
                return this.$famHttp({
                    url: '/fam/search',
                    method: 'post',
                    data: {
                        lastestVersion: false,
                        appName: ['plat'],
                        className: CONST.className.docTmpl,
                        pageIndex: 1,
                        pageSize: 99999,
                        conditionDtoList: [
                            {
                                attrName: 'fileType',
                                oper: 'EQ',
                                value1: this.formData.fileType
                            },
                            {
                                attrName: `lifecycleStatus.status`,
                                oper: 'EQ',
                                value1: 'RELEASED'
                            },
                            {
                                attrName: `iterationInfo.state`,
                                oper: 'EQ',
                                value1: 'CHECKED_IN'
                            }
                        ]
                    }
                }).then((resp) => {
                    if (resp.success) {
                        this.temOption = resp.data.records.map((i) => {
                            let attrRawData = FamKit.deserializeArray(i.attrRawList, {
                                valueKey: 'displayName',
                                isI18n: true
                            });
                            return Object.assign(
                                {
                                    id: i.id,
                                    oid: i.oid
                                },
                                attrRawData
                            );
                        });
                        this.signatureTmplOptions = _.uniq(this.temOption, function (i) {
                            return i.identifierNo;
                        });
                    }
                });
            },
            changeTemp(val) {
                this.formData.docCode = val;
                this.signatureTmplVersionsOptions = this.temOption.filter((i) => {
                    return i.identifierNo === val;
                });
                const version = this.signatureTmplOptions.find((i) => i.identifierNo === val)?.[
                    'iterationInfo.branchId'
                ];
                this.formData.branchId = version;
                this.changeVersion(version);
            },
            changeVersion(val) {
                this.formData.branchId = val;
                const watermark = this.signatureTmplVersionsOptions.find(
                    (item) => item['iterationInfo.branchId'] === val
                )?.watermark;
                this.$set(this.formData, 'watermark', watermark !== undefined ? watermark : '');
                this.loadDocTmplDesignDetail();
            },
            loadDocTmplDesignDetail: function () {
                if (!this.formData.branchId) {
                    this.pointsData = [];
                    return;
                }
                let tmplItem = this.signatureTmplVersionsOptions.find(
                    (i) => i['iterationInfo.branchId'] === this.formData.branchId
                );
                if (!tmplItem) return;
                return this.$famHttp({
                    url: `/doc/signature/v1/tmpl/one/${tmplItem.id}`,
                    params: {
                        className: 'erd.cloud.signature.entity.SignatureTmpl'
                    }
                }).then((resp) => {
                    let result = {};
                    if (resp.success) {
                        let pointsData = resp.data.points || [];
                        pointsData = _.uniq(pointsData, 'code');
                        pointsData.forEach((i) => {
                            if (i.contentType === CONST.contentTypes.signature_system) {
                                i.value = i.defaultValue;
                            }
                        });
                        this.pointsData = pointsData;
                        this.formData.watermark = resp.data.watermark || '';
                    }
                    return result;
                });
            },
            submit: function () {
                return this.$refs.layoutForm.submit().then((result) => {
                    if (result.valid) {
                        if (this.pointsData.length > 0) {
                            return this.$famHttp({
                                url: '/doc/signature/v1/tmpl/create',
                                method: 'post',
                                data: Object.assign(
                                    {
                                        className: 'erd.cloud.signature.entity.SignatureTmpl'
                                    },
                                    {
                                        sourceFileId: this.formData.file,
                                        sourceFileName: this.formData.fileName,
                                        name: this.formData.name,
                                        docCode: this.formData.docCode,
                                        branchId: this.formData.branchId,
                                        signData: this.filledMap,
                                        pdfConvert: this.formData.pdfConvert
                                    },
                                    this.formData.watermark
                                        ? {
                                              watermarkDto: {
                                                  code: this.formData.watermark
                                              }
                                          }
                                        : {}
                                )
                            }).then((resp) => {
                                if (resp.success) {
                                    this.$message({
                                        type: 'success',
                                        message: this.i18nMappingObj.createSuccess,
                                        showClose: true
                                    });
                                }
                            });
                        } else {
                            this.$message({
                                type: 'warning',
                                message: this.i18nMappingObj.emptyTemp,
                                showClose: true
                            });
                            return Promise.reject();
                        }
                    } else {
                        return Promise.reject();
                    }
                });
            },
            openConfig() {
                this.$refs.paramsDiolog.show();
            },
            saveParams(params) {
                this.convertParamDto = params;
            }
        },
        mounted() {
            this.queryWatermark();
            this.loadSystemSignatures();
        }
    };
});
