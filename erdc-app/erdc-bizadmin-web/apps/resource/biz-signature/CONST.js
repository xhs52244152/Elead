define(['erdc-kit'], function (ErdcKit) {
    let contentTypes = {
        signature_personal: '1',
        signature_system: '2',
        signature_picture: '3',
        text: '4'
    };
    const fileTypes = {
        word: 'WORD',
        excel: 'EXCEL',
        pdf: 'PDF'
    };
    let lan = localStorage.getItem('lang_current') || 'zh-cn';
    let tenantId = '';
    try {
        tenantId = JSON.parse(localStorage.getItem('tenantId'));
    } catch (e) {
        console.error(e);
    }
    let CONST = {
        className: {
            docTmplMaster: 'erd.cloud.signature.entity.SignatureTmplMaster',
            //
            docTmpl: 'erd.cloud.signature.entity.SignatureTmpl',
            docTmplHistory: 'erd.cloud.signature.entity.SignatureTmpl',
            watermark: 'erd.cloud.watermark.entity.DocWatermark',
            signature: 'erd.cloud.signature.entity.SignaturePicture'
        },
        defaultHeaders: ErdcKit.defaultHeaders(),
        language: lan,
        tenantId: tenantId,
        operationKey: {
            docTmpl: {
                table: 'SIGNATURE_TMPL_TABLE_ACTION',
                row: 'SIGNATURE_TMPL_ROW_ACTION'
            },
            docTmplHistory: {
                table: '',
                row: 'SIGNATURE_TMPL_VER_ROW_ACTION'
            },
            watermark: {
                table: 'DOC_WATERMARK_TABLE_ACTION',
                row: 'DOC_WATERMARK_ROW_ACTION'
            },
            signature: {
                table: 'SIGNATURE_PICTURE_TABLE_ACTION',
                row: 'SIGNATURE_PICTURE_ROW_ACTION'
            }
        },
        tableKey: {
            docTmpl: 'signatureTmpl',
            docTmplMaster: 'signatureTmplMaster',
            watermark: 'DocWatermark',
            docTmplHistory: 'signatureTmplHistory',
            signature: 'SignatureManage'
        },
        layoutKey: {
            create: 'CREATE',
            edit: 'UPDATE',
            update: 'UPDATE',
            detail: 'DETAIL'
        },
        contentTypeOptions: [
            { id: contentTypes.signature_personal, name: '个人签章', lang: 'signaturePersonal' },
            { id: contentTypes.signature_system, name: '系统签章', lang: 'signatureSystem' },
            { id: contentTypes.signature_picture, name: '图片', lang: 'signaturePicture' },
            { id: contentTypes.text, name: '文本', lang: 'signatureText' }
        ],
        paveStyles: [
            { label: '居中放大', lang: 'signatureWatermarkCenteredMagnification', value: '1' },
            { label: '稀疏平铺', lang: 'signatureWatermarkSparseTile', value: '2' },
            { label: '密集平铺', lang: 'signatureWatermarkDenseTile', value: '3' }
        ],

        contentTypes: contentTypes,
        fileTypes: fileTypes,
        i18nPath: ELMP.resource('biz-signature/locale'),
        docTmplFileType: [
            {
                id: fileTypes.pdf,
                label: fileTypes.pdf,
                desc: 'signature_design_upload_pdf_tip',
                fileType: '.pdf',
                fileTips: 'pdfFileTips'
            },
            {
                id: fileTypes.word,
                label: fileTypes.word,
                desc: 'signature_design_upload_word_tip',
                fileType: '.docx',
                fileTips: 'wordFileTips'
            },
            {
                id: fileTypes.excel,
                label: fileTypes.excel,
                desc: 'signature_design_upload_excel_tip',
                fileType: '.xlsx;.xls',
                fileTips: 'excelFileTips'
            }
        ],
        convertFileList: [
            {
                id: 'djvu',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotm' },
                    { name: 'dotx' },
                    { name: 'epub' },
                    { name: 'fb2' },
                    { name: 'gif' },
                    { name: 'html' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'doc',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotm' },
                    { name: 'dotx' },
                    { name: 'fb2' },
                    { name: 'gif' },
                    { name: 'html' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'docm',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotm' },
                    { name: 'dotx' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'docx',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'dotm' },
                    { name: 'dotx' },
                    { name: 'epub' },
                    { name: 'fb2' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'dot',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotm' },
                    { name: 'dotx' },
                    { name: 'epub' },
                    { name: 'fb2' },
                    { name: 'gif' },
                    { name: 'html' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'dotm',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotx' },
                    { name: 'fb2' },
                    { name: 'gif' },
                    { name: 'html' },
                    { name: 'jpg' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'dotx',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotm' },
                    { name: 'fb2' },
                    { name: 'gif' },
                    { name: 'html' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'epub',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotm' },
                    { name: 'dotx' },
                    { name: 'fb2' },
                    { name: 'gif' },
                    { name: 'html' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'fb2',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotm' },
                    { name: 'dotx' },
                    { name: 'epub' },
                    { name: 'gif' },
                    { name: 'html' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'png' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'fodt',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotm' },
                    { name: 'dotx' },
                    { name: 'fb2' },
                    { name: 'gif' },
                    { name: 'html' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'htm',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotm' },
                    { name: 'dotx' },
                    { name: 'gif' },
                    { name: 'html' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'html',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotm' },
                    { name: 'dotx' },
                    { name: 'epub' },
                    { name: 'fb2' },
                    { name: 'gif' },
                    { name: 'html' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'mht',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotm' },
                    { name: 'dotx' },
                    { name: 'epub' },
                    { name: 'fb2' },
                    { name: 'gif' },
                    { name: 'html' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'mhtml',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotm' },
                    { name: 'dotx' },
                    { name: 'epub' },
                    { name: 'fb2' },
                    { name: 'gif' },
                    { name: 'html' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'oxps',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotm' },
                    { name: 'dotx' },
                    { name: 'epub' },
                    { name: 'fb2' },
                    { name: 'gif' },
                    { name: 'html' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'pdf',
                list: [{ name: 'bmp' }, { name: 'jpg' }, { name: 'pdfa' }]
            },
            {
                id: 'rtf',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotm' },
                    { name: 'dotx' },
                    { name: 'epub' },
                    { name: 'fb2' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'stw',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotm' },
                    { name: 'dotx' },
                    { name: 'epub' },
                    { name: 'fb2' },
                    { name: 'gif' },
                    { name: 'html' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'sxw',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotm' },
                    { name: 'dotx' },
                    { name: 'epub' },
                    { name: 'fb2' },
                    { name: 'gif' },
                    { name: 'html' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'txt',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotm' },
                    { name: 'dotx' },
                    { name: 'epub' },
                    { name: 'fb2' },
                    { name: 'gif' },
                    { name: 'html' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' }
                ]
            },
            {
                id: 'wps',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotm' },
                    { name: 'dotx' },
                    { name: 'epub' },
                    { name: 'fb2' },
                    { name: 'gif' },
                    { name: 'html' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'wpt',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotm' },
                    { name: 'dotx' },
                    { name: 'epub' },
                    { name: 'fb2' },
                    { name: 'gif' },
                    { name: 'html' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'xml',
                list: [
                    { name: 'bmp' },
                    { name: 'docm' },
                    { name: 'docx' },
                    { name: 'dotm' },
                    { name: 'dotx' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'odt' },
                    { name: 'ott' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'rtf' },
                    { name: 'txt' }
                ]
            },
            {
                id: 'xps',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' }
                ]
            },
            {
                id: 'csv',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'ods' },
                    { name: 'ots' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'xlsm' },
                    { name: 'xltm' },
                    { name: 'xltx' }
                ]
            },
            {
                id: 'et',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'ods' },
                    { name: 'ots' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'xlsm' },
                    { name: 'xltm' },
                    { name: 'xltx' }
                ]
            },
            {
                id: 'ett',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'ods' },
                    { name: 'ots' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'xlsm' },
                    { name: 'xltm' },
                    { name: 'xltx' }
                ]
            },
            {
                id: 'fods',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' }
                ]
            },
            {
                id: 'ods',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'ots' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'xlsm' },
                    { name: 'xltm' },
                    { name: 'xltx' }
                ]
            },
            {
                id: 'ots',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'ods' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'xlsm' },
                    { name: 'xltm' },
                    { name: 'xltx' }
                ]
            },
            {
                id: 'sxc',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'ods' },
                    { name: 'ots' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'xlsm' },
                    { name: 'xltm' },
                    { name: 'xltx' }
                ]
            },
            {
                id: 'xls',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'ods' },
                    { name: 'ots' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'xlsm' },
                    { name: 'xltm' },
                    { name: 'xltx' }
                ]
            },
            {
                id: 'xlsb',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'ods' },
                    { name: 'ots' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'xlsm' },
                    { name: 'xltm' },
                    { name: 'xltx' }
                ]
            },
            {
                id: 'xlsm',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'ods' },
                    { name: 'ots' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'xltm' },
                    { name: 'xltx' }
                ]
            },
            {
                id: 'xlsx',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'ods' },
                    { name: 'ots' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'xlsm' },
                    { name: 'xltm' },
                    { name: 'xltx' }
                ]
            },
            {
                id: 'xlt',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'ods' },
                    { name: 'ots' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'xlsm' },
                    { name: 'xltm' },
                    { name: 'xltx' }
                ]
            },
            {
                id: 'xltm',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'ods' },
                    { name: 'ots' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'xlsm' },
                    { name: 'xltx' }
                ]
            },
            {
                id: 'xltx',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'ods' },
                    { name: 'ots' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'xlsm' },
                    { name: 'xltm' }
                ]
            },
            {
                id: 'xlm',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' }
                ]
            },
            {
                id: 'dps',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'odp' },
                    { name: 'otp' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'potm' },
                    { name: 'potx' },
                    { name: 'ppsm' },
                    { name: 'ppsx' },
                    { name: 'pptm' },
                    { name: 'pptx' }
                ]
            },
            {
                id: 'dpt',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'odp' },
                    { name: 'otp' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'potm' },
                    { name: 'potx' },
                    { name: 'ppsm' },
                    { name: 'ppsx' },
                    { name: 'pptm' },
                    { name: 'pptx' }
                ]
            },
            {
                id: 'fodp',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'odp' },
                    { name: 'otp' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'potm' },
                    { name: 'potx' },
                    { name: 'ppsm' },
                    { name: 'ppsx' },
                    { name: 'pptm' },
                    { name: 'pptx' }
                ]
            },
            {
                id: 'odp',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'otp' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'potm' },
                    { name: 'potx' },
                    { name: 'ppsm' },
                    { name: 'ppsx' },
                    { name: 'pptm' },
                    { name: 'pptx' }
                ]
            },
            {
                id: 'otp',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'odp' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'potm' },
                    { name: 'potx' },
                    { name: 'ppsm' },
                    { name: 'ppsx' },
                    { name: 'pptm' },
                    { name: 'pptx' }
                ]
            },
            {
                id: 'pot',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'odp' },
                    { name: 'otp' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'potm' },
                    { name: 'potx' },
                    { name: 'ppsm' },
                    { name: 'ppsx' },
                    { name: 'pptm' },
                    { name: 'pptx' }
                ]
            },
            {
                id: 'potm',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'odp' },
                    { name: 'otp' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'potx' },
                    { name: 'ppsm' },
                    { name: 'ppsx' },
                    { name: 'pptm' },
                    { name: 'pptx' }
                ]
            },
            {
                id: 'potx',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'odp' },
                    { name: 'otp' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'potm' },
                    { name: 'ppsm' },
                    { name: 'ppsx' },
                    { name: 'pptm' },
                    { name: 'pptx' }
                ]
            },
            {
                id: 'pps',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'odp' },
                    { name: 'otp' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'potm' },
                    { name: 'potx' },
                    { name: 'ppsm' },
                    { name: 'ppsx' },
                    { name: 'pptm' },
                    { name: 'pptx' }
                ]
            },
            {
                id: 'ppsm',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'odp' },
                    { name: 'otp' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'potm' },
                    { name: 'potx' },
                    { name: 'ppsx' },
                    { name: 'pptm' },
                    { name: 'pptx' }
                ]
            },
            {
                id: 'ppsx',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'odp' },
                    { name: 'otp' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'potm' },
                    { name: 'potx' },
                    { name: 'ppsm' },
                    { name: 'pptm' },
                    { name: 'pptx' }
                ]
            },
            {
                id: 'ppt',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'odp' },
                    { name: 'otp' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'potm' },
                    { name: 'potx' },
                    { name: 'ppsm' },
                    { name: 'ppsx' },
                    { name: 'pptm' },
                    { name: 'pptx' }
                ]
            },
            {
                id: 'pptm',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'odp' },
                    { name: 'otp' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'potm' },
                    { name: 'potx' },
                    { name: 'ppsm' },
                    { name: 'ppsx' },
                    { name: 'pptx' }
                ]
            },
            {
                id: 'pptx',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'odp' },
                    { name: 'otp' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'potm' },
                    { name: 'potx' },
                    { name: 'ppsm' },
                    { name: 'ppsx' },
                    { name: 'pptm' }
                ]
            },
            {
                id: 'sxi',
                list: [
                    { name: 'bmp' },
                    { name: 'gif' },
                    { name: 'jpg' },
                    { name: 'odp' },
                    { name: 'otp' },
                    { name: 'pdf' },
                    { name: 'pdfa' },
                    { name: 'png' },
                    { name: 'potm' },
                    { name: 'potx' },
                    { name: 'ppsm' },
                    { name: 'ppsx' },
                    { name: 'pptm' },
                    { name: 'pptx' }
                ]
            }
        ],
        taskTypeList: {
            FileConvert: 'convert',
            DocWatermark: 'watermarkTask',
            SignatureTask: 'signatureSign'
        }
    };
    return CONST;
});
