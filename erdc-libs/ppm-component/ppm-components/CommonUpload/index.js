define([
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    'erdc-kit',
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/utils.js')
], function (ErdcKit, ppmStore, famUtils, utils, actionsUtils) {
    return {
        name: 'commonUpload',
        template: `
            <div class="flex align-items-center">
                <fam-upload
                    :readonly="openType === 'detail'"
                    ref="famUpload"
                    :limit="limit"
                    :on-remove="removeFile"
                    :auto-upload="true"
                    :file-list="fileList"
                    :on-preview="onPreview"
                    :need-content-id="needContentId"
                    :class-name="documentClassName"
                    :on-success="onSuccess"
                >
                    <erd-button
                        v-if="openType !== 'detail'"
                        type="default"
                        slot="trigger"
                    >
                        {{ $t('clickUpload') }}
                    </erd-button>
                </fam-upload>
                <i 
                    v-if="openType === 'detail'"
                    class="erd-iconfont erd-icon-visible cursor-pointer text-12"
                    @click="previewFile"
                ></i>
            </div>
        `,
        components: {
            FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js'))
        },
        props: {
            limit: {
                type: Number,
                default: 1
            },
            needContentId: {
                type: Boolean,
                default: true
            },
            vm: Object,
            value: String | Object
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('ppm-component/ppm-components/CommonUpload/locale/index.js'),
                fileList: []
            };
        },
        computed: {
            fileId: {
                get() {
                    return this.value;
                },
                set(val) {
                    this.$emit('input', val);
                    this.$emit('update:value', val);
                }
            },
            openType() {
                return this.$route.meta.openType || '';
            },
            documentClassName() {
                return ppmStore.state.classNameMapping.document;
            }
        },
        created() {
            this.oid = this.$route.query.oid;
            if (this.oid) this.getAttachment();
        },
        methods: {
            getAttachment() {
                this.$famHttp({
                    url: '/document/content/attachment/list',
                    params: {
                        objectOid: this.oid
                    }
                }).then((res) => {
                    this.fileList = res.data.attachmentDataVoList
                        .filter((item) => item.role === 'PRIMARY')
                        .map((item) => {
                            item.name = item.displayName;
                            return item;
                        });
                    setTimeout(() => {
                        if (this.vm.formData) this.vm.formData.mainContent = this.fileList[0];
                    }, 1000);
                });
            },
            removeFile() {
                let formData = this.vm.formData || {};
                if (this.openType === 'create') this.$set(formData, 'name', '');
                this.$set(formData, 'mainContent', null);
                this.$emit('removeFile');
            },
            onSuccess(response, file) {
                let formData = this.vm.formData || {};
                this.fileId = response.contentId || '';
                if (this.openType === 'create') {
                    this.$set(formData, 'name', file.name);
                }
                // 为什么要传fileName，是因为保存时候需要文件名称，文档名称可以修改，不一定和文件名一样。
                this.$set(formData, 'mainContent', {
                    id: response.contentId,
                    fileName: file.name
                });
                this.$emit('onSuccess', response, file);
            },
            onPreview(e) {
                famUtils.downloadFile(e.storeId, e.authorizeCode);
            },
            previewFile() {
                actionsUtils.renderFilePreview({ oid: this.oid });
            }
        }
    };
});
