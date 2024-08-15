define(['vue', 'erd-quill-editor', 'erdcloud.store'], function (Vue, ErdQuillEditor, store) {
    ErdQuillEditor.useQuillEditor(Vue, {
        modules: {
            imageUploader: {
                upload: async (file) => {
                    const [ErdcKit, ErdcloudHttp] = await require.promise('erdc-kit', 'erdcloud.http');
                    const formData = new FormData();
                    formData.append('file', file);
                    let service = store.state.app.fileSite?.serverAddr || '';
                    let defaultAction = '/file/file/site/storage/v1/upload';
                    let defaultClass = 'erd.cloud.site.console.file.entity.FileInfo';
                    let url = `${service}${ErdcKit.urlServicePrefix(defaultAction, defaultClass)}`;
                    const { data } = await ErdcloudHttp.post(url, formData, {
                        headers: {
                            'App-Name': 'plat'
                        }
                    });
                    let defaultDownloadUrl = `/file/file/site/storage/v1/img/${data}/download`;
                    return `${service}${ErdcKit.urlServicePrefix(defaultDownloadUrl, defaultClass)}`;
                }
            }
        }
    });

    return ErdQuillEditor.ErdQuillEditor;
});
