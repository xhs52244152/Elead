define([], function () {
    const languageObj = {
        confirm: {
            CN: '确定',
            EN: 'Confirm'
        },
        cancel: {
            CN: '取消',
            EN: 'Cancel'
        },
        clickUpload: {
            CN: '点击上传',
            EN: 'Click upload'
        },
        import: {
            CN: '导入',
            EN: 'Import'
        },
        onlyUpdateAndAppend: {
            CN: '仅更新及追加',
            EN: 'Only update and append'
        },
        replaceAll: {
            CN: '替换全部',
            EN: 'Replace All'
        },
        importTipsInfo: {
            CN: '请先导出，填写数据后，再上传此文件。',
            EN: 'Please export first, fill in the data, and then upload this file.'
        },
        fileUploadedSuccessfully: {
            CN: '文件上传成功',
            EN: 'File uploaded successfully'
        },
        uploadFile: {
            CN: '上传文件',
            EN: 'Upload file'
        },
        importMethod: {
            CN: '导入方式',
            EN: 'Import method'
        },
        pleaseSelect: {
            CN: '请选择',
            EN: 'Please select'
        },
        excelFileTypeError: {
            CN: '导入格式不正确，请导入Excel。',
            EN: 'File type error'
        },
        mppFileTypeError: {
            CN: '导入格式不正确，请导入mpp文件。',
            EN: 'File type error'
        },
        fileTypeError: {
            CN: '导入格式不正确。',
            EN: 'File type error'
        },
        pressDeleteToDeleteFile: {
            CN: '按 delete 键可删除',
            EN: 'Press delete to delete the file'
        }
    };

    return { i18n: languageObj };
});
