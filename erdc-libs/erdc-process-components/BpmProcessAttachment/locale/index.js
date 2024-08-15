/**
 * i18n国际化文件
 * **/
define([], function () {
    /**
     * 国际化key建议 短文本统一用中文作为key  长文本用英文作key utf-8 编码 作用方便页面引入与维护
     * 书写规则 扩展后面追加对应语言key
     * key --> {CN:'',EN:'' ,'more-lan':''}
     * **/

    // 配置国际化key-value
    const languageObj = {
        uploadAttachment: { CN: '上传附件', EN: 'Upload Attachment(s)' },
        attachmentName: { CN: '附件名称', EN: 'Attachment Name' },
        size: { CN: '大小', EN: 'Size' },
        uploader: { CN: '上传人', EN: 'Uploader' },
        uploadTime: { CN: '上传时间', EN: 'Upload time' },
        replace: { CN: '替换', EN: 'Replace' },
        confirmDelete: { CN: '确认删除？', EN: 'Are you sure you want to delete this attachment?' },
        cannotExceed: { CN: '文件大小不能超过', EN: 'The file size cannot exceed' },
        preview: { CN: '预览', EN: 'preview' },
        download: { CN: '下载', EN: 'download' }
    };

    return {
        i18n: languageObj
    };
});
