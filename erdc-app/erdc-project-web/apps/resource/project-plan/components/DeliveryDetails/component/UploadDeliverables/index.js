define([
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    'text!' + ELMP.resource('project-plan/components/DeliveryDetails/component/UploadDeliverables/index.html'),
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    'css!' + ELMP.resource('project-plan/components/DeliveryDetails/index.css')
], function (ErdcKit, store, template, commonActions) {
    return {
        template,
        props: {
            oid: {
                type: String,
                default: ''
            },
            isAddContainerRef: {
                type: Boolean,
                default: false
            },
            // 关联的项目信息
            relationProjectInfos: Object
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-plan/locale/index.js'),
                // 国际化页面引用对象,
                i18nMappingObj: {
                    addFiles: this.getI18nByKey('addFiles'),
                    remove: this.getI18nByKey('remove'),
                    cancel: this.getI18nByKey('cancel'),
                    confirm: this.getI18nByKey('confirm'),
                    tips: this.getI18nByKey('tips'),
                    deleteData: this.getI18nByKey('deleteData'),
                    clickUpload: this.getI18nByKey('clickUpload'),
                    // 表头 前端先写死 后面从接口拿
                    operation: this.getI18nByKey('operation'),
                    createDoc: this.getI18nByKey('createDoc'),
                    attach: this.getI18nByKey('attach'),
                    docClassification: this.getI18nByKey('docClassification'),
                    folder: this.getI18nByKey('folder'),
                    masterFile: this.getI18nByKey('masterFile'),
                    docCreatedSuccessfully: this.getI18nByKey('docCreatedSuccessfully'),
                    removeDocTips: this.getI18nByKey('removeDocTips'),
                    pleaseSelectData: this.getI18nByKey('pleaseSelectData'),
                    pleaseEnter: this.getI18nByKey('pleaseEnter')
                },
                tableData: [],
                originalTableData: [],
                docClassName: 'erd.cloud.ppm.document.entity.ProjectDocument',
                attachTableData: [],
                attachSelectData: [],
                typeOptions: [],
                checkBoxData: [],
                searchKey: ''
            };
        },
        components: {
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        computed: {
            documentClassName() {
                return store.state.classNameMapping.document;
            },
            columns() {
                return [
                    {
                        type: 'seq',
                        title: ' ',
                        minWidth: '60',
                        width: '60'
                    },
                    {
                        prop: 'checkbox',
                        title: '',
                        minWidth: '50',
                        width: '50',
                        type: 'checkbox'
                    },
                    {
                        prop: 'fileType', // 文档分类
                        width: '210',
                        title: this.i18nMappingObj.docClassification
                    },
                    {
                        prop: 'folder', // 所属文件夹
                        width: '160',
                        title: this.i18nMappingObj.folder
                    },
                    {
                        prop: 'fileName', // 主文件
                        title: this.i18nMappingObj.masterFile
                    },
                    {
                        prop: 'operation', // 操作
                        title: this.i18nMappingObj.operation,
                        width: 60,
                        fixed: 'right'
                    }
                ];
            },
            containerRef() {
                return this.$store.state?.space?.object?.containerRef || '';
            }
        },
        methods: {
            searchData() {
                this.tableData = this.originalTableData.filter((item) => item.fileName.indexOf(this.searchKey) !== -1);
            },
            // 移除文档
            removeDeliver(row) {
                this.tableData = this.tableData.filter((item) => item.docId !== row.docId);
                this.originalTableData = this.originalTableData.filter((item) => item.docId !== row.docId);
            },
            checkBoxChange(data) {
                this.checkBoxData = data.records;
            },
            checkBoxSelectAll(data) {
                this.checkBoxData = data.records;
            },
            // 批量移除
            batchRemoveDeliver() {
                if (!this.checkBoxData.length) {
                    return this.$message({
                        type: 'info',
                        message: this.i18nMappingObj.pleaseSelectData
                    });
                }
                this.tableData = this.tableData.filter(
                    (item) => !this.checkBoxData.filter((res) => res.docId === item.docId).length
                );
                this.originalTableData = this.originalTableData.filter(
                    (item) => !this.checkBoxData.filter((res) => res.docId === item.docId).length
                );
            },
            // 获取当前时间
            formatTime() {
                const dayjs = require('dayjs');
                return dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
            },
            // 创建文档
            addNode() {
                const beforeSubmit = (data) => {
                    let containerRef = this.relationProjectInfos
                        ? this.relationProjectInfos.containerRef
                        : this.containerRef;
                    data.attrRawList.push({
                        attrName: 'containerRef',
                        value: containerRef
                    });
                    // 是否有关联项目信息
                    if (this.relationProjectInfos) {
                        data['folderRef'] = this.relationProjectInfos.cabinetRef;
                    }
                    return data;
                };
                let { containerRef, setTableData: afterSubmit, isAddContainerRef } = this;
                commonActions.openDocument(this, {
                    containerRef,
                    afterSubmit,
                    beforeSubmit: isAddContainerRef || this.relationProjectInfos ? beforeSubmit : ''
                });
            },
            setTableData({ data, resData, destroy }) {
                let className = resData.split(':')?.[1] || this.documentClassName;
                this.$famHttp({
                    url: '/document/attr',
                    method: 'GET',
                    className,
                    appName: 'PPM',
                    data: {
                        oid: resData
                    }
                }).then((res) => {
                    let masterRef = res?.data?.rawData?.masterRef?.value || '';
                    let docObj = {
                        docId: resData,
                        fileName: data.fileName,
                        folder: data.folderRef?.displayName,
                        masterRef,
                        fileType: _.find(data.typeOptions, { typeOid: data.typeReference })?.displayName
                    };
                    this.tableData.push(docObj);
                    this.originalTableData.push(docObj);
                    destroy();
                });
            }
        }
    };
});
