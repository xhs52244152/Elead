define([], function () {
    const languageObj = {
        notImageTip: {
            CN: '请上传图片格式',
            EN: 'Please upload the picture format.'
        },
        notCorrectFormatTip: {
            CN: '上传图片只能是{format}格式！',
            EN: 'Uploading pictures can only be in {format} format!'
        },
        notIncludedSize: {
            CN: '上传图片大小不能超过 {limitSize} MB',
            EN: 'The size of the uploaded image cannot exceed {limitSize} MB'
        }
    };

    return { i18n: languageObj };
});
