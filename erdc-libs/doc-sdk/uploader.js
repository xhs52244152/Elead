define(['vue', ELMP.resource('upload/upload.js', 'doc-sdk')], function (Vue, uploadOptions) {
    'use strict';

    function upload(options) {
        if (!window.globalUploader) {
            const uploader = new Vue(uploadOptions);
            const globalUploader = uploader.$mount();
            document.body.appendChild(globalUploader.$el);

            globalUploader.useUploader(options);
            window.globalUploader = globalUploader;
        } else {
            window.globalUploader.useUploader(options);
        }
    }

    return {
        upload
    };
});
