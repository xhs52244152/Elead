define([
    'erdc-kit',
    'text!' + ELMP.resource('biz-announcements/components/AnnouncementDetail/template.html'),
    'css!' + ELMP.resource('biz-announcements/components/AnnouncementDetail/index.css')
], function (ErdcKit, template) {
    'use strict';

    return {
        template,
        props: {
            showNext: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-announcements/locale/index.js'),
                i18nMappingObj: {
                    notice: this.getI18nByKey('系统公告'),
                    title: this.getI18nByKey('标题'),
                    attachment: this.getI18nByKey('附件'),
                    content: this.getI18nByKey('内容'),
                    next: this.getI18nByKey('next'),
                    confirm: this.getI18nByKey('确定')
                },

                /**
                 * 公告详情
                 */
                detail: {
                    name: '',
                    content: '',
                    createTime: '',
                    fileList: []
                },
                notice: null,
                visible: false
            };
        },
        methods: {
            show(data) {
                if (data) {
                    this.notice = data;
                    this.getNoticeDetail(data.oid);
                }
                this.visible = true;
            },
            handleConfirm() {
                this.visible = false;
            },
            handleNext() {
                this.$emit('next');
            },
            /**
             * 获取公告详情。包含所有的公告数据
             * @param {*} oid
             */
            getNoticeDetail(oid) {
                return this.$famHttp({
                    url: `/common/notice/${oid}`,
                    method: 'GET'
                })
                    .then((res) => {
                        if (res.success) {
                            const data = res.data;

                            this.detail.name = data.name;
                            this.detail.content = data.content;
                            this.detail.createTime = data.createTime;
                            this.detail.fileList = data.fileList;
                            this.detail.authorizeCode = data.authorizeCode || {}

                            if (this.notice && this.notice.noticeState !== 'readed') {
                                this.$emit('readed', data);
                            }
                        }
                    })
                    .catch((err) => {
                        // this.$message({
                        //     showClose: true,
                        //     message: err?.data?.message,
                        //     type: 'error'
                        // });
                    });
            },
            /**
             * 公告附件预览
             */
            handleFilePreview(file) {
                if(file.storeId && this.detail.authorizeCode &&  this.detail.authorizeCode[file.storeId]) {
                    ErdcKit.downloadFile(file.storeId, this.detail.authorizeCode[file.storeId]);
                }
            }
        }
    };
});
