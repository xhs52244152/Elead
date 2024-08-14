/*
组件使用

平台已经封装了上传组件，直接使用平台的上传组件，当前组件commonAttach后期不会维护
    上传组件： FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js')),
    上传组件带表格： FamUploadFileList: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUploadFileList/index.js')),

*/
define(['css!' + ELMP.resource('ppm-component/ppm-components/commonAttach/index.css')], function () {
    const ErdcKit = require('erdcloud.kit');
    return {
        template: `
            <erd-contraction-panel
                :unfold.sync="panelUnfold"
                :title="i18nMappingObj.attach"
                class="ppm-common-attach"
            >
                <template v-slot:header-right>
                    <slot name="header-right">
                        <fam-upload
                            class="upload-button"
                            v-if="showUpload && showBtn && panelUnfold"
                            ref="myUpload"
                            :limit="10"
                            :on-change="onChange"
                            :on-exceed="handleExceed"
                            :auto-upload="false"
                            :file-list="fileList"
                            :show-file-list="false"
                            action=""
                            multiple
                        >
                            <erd-button
                                v-if="showUploadBtn"
                                type="default"
                                slot="trigger"
                            >
                               {{ i18nMappingObj.uploadAttach }}
                            </erd-button>
                        </fam-upload>
                    </slot>
                </template>
                <template v-slot:content>
                    <attach
                        v-model="fileIds"
                        ref="attach"
                        class="common-attach-list"
                        :class-name="classNames"
                        :oid="oid"
                        :show-table-btn="false"
                        :show-search-input="false"
                        :columns="columns"
                        :quickBinding="quickBinding"
                        :realTimeDelete="realTimeDelete"
                        :uploadUrl="uploadUrl"
                        :downloadUrl="downloadUrl"
                        :tableListUrl="tableListUrl"
                        :is-process="isProcess"
                        :operationConfigName="operationConfigName"
                        :extends-props="extendsProps"
                    ></attach>
                </template>
            </erd-contraction-panel>
        `,
        components: {
            FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js')),
            Attach: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/Attach/index.js'))
        },
        props: {
            value: {
                type: Array | String,
                default: () => {
                    return [];
                }
            },
            isProcess: {
                type: Boolean,
                default: false
            },
            businessOid: {
                type: String,
                default: ''
            },
            className: {
                type: String,
                default: ''
            },
            uploadUrl: {
                type: String,
                default: 'ppm/content/file/upload'
            },
            downloadUrl: {
                type: String,
                default: '/ppm/content/file/download'
            },
            tableListUrl: {
                type: String,
                default: 'ppm/content/attachment/list'
            },
            // 快速绑定附件(即上传后立即绑定到对象是，而不是通过保存按钮和其他参数保存)
            quickBinding: {
                type: Boolean,
                default: true
            },
            // 实时删除(即删除不通过保存按钮进行保存)
            realTimeDelete: {
                type: Boolean,
                default: true
            },
            operationConfigName: {
                type: String,
                default: 'PPM_ATTACH_PER_OP_MENU'
            },
            showUploadBtn: {
                type: Boolean,
                default: true
            },
            showUpload: {
                type: Boolean,
                default: true
            }
        },
        computed: {
            classNames() {
                return this.className || this.$route.meta?.className || '';
            },
            showBtn() {
                return this.$route.meta?.openType !== 'detail' && !this.isProcess;
            },
            oid() {
                return this.businessOid || this.$route.query.oid || '';
            },
            fileIds: {
                get() {
                    return this.value;
                },
                set(val) {
                    this.$emit('input', val);
                }
            },
            columns() {
                let columns = [
                    {
                        prop: 'seq', // 列数据字段key
                        type: 'seq', // 特定类型
                        title: ' ',
                        width: 48,
                        align: 'center' //多选框默认居中显示
                    },
                    {
                        prop: 'fileName',
                        title: this.i18nMappingObj['fileName'],
                        minWidth: '200'
                    },
                    {
                        prop: 'uplaodTime',
                        title: this.i18nMappingObj['uplaodTime'],
                        minWidth: '200'
                    },
                    {
                        prop: 'createBy',
                        title: this.i18nMappingObj['createBy'],
                        minWidth: '100'
                    },
                    {
                        prop: 'fileSize',
                        title: this.i18nMappingObj['fileSize'],
                        minWidth: '200'
                    },
                    {
                        prop: 'uploadState',
                        title: this.i18nMappingObj['uploadState'],
                        minWidth: '100'
                    },
                    {
                        prop: 'operation',
                        title: this.i18nMappingObj['operation'],
                        minWidth: '100',
                        width: '60'
                    }
                ];
                return this.isProcess ? columns.filter((item) => item.prop !== 'operation') : columns;
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('ppm-component/ppm-components/commonAttach/locale/index.js'),
                i18nMappingObj: {
                    fileName: this.getI18nByKey('fileName'),
                    uplaodTime: this.getI18nByKey('uplaodTime'),
                    fileSize: this.getI18nByKey('fileSize'),
                    operation: this.getI18nByKey('operation'),
                    uploadLimt10: this.getI18nByKey('uploadLimt10'),
                    finish: this.getI18nByKey('finish'),
                    createBy: this.getI18nByKey('createBy'),
                    attach: this.getI18nByKey('attach'),
                    uploadState: this.getI18nByKey('uploadState'),
                    uploadAttach: this.getI18nByKey('uploadAttach')
                },
                panelUnfold: true,
                fileList: [],
                extendsProps: {
                    'max-line': 5,
                    'auto-resize': true
                }
            };
        },
        methods: {
            getTableData() {
                return this.$refs.attach;
            },
            onChange(e) {
                this.$refs.attach.uploadFile(e);
            },
            handleExceed() {
                this.$message({
                    type: 'info',
                    message: this.i18nMappingObj.uploadLimt10
                });
                return;
            }
        }
    };
});
