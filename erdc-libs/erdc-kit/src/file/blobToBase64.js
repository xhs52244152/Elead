/**
 * blob 转 base64
 * @param {Blob} blob
 * @param {callback: (reader: FileReader) => void} [callback]
 * @returns {Promise<result: string>}
 */
export default function blobToBase64(blob, callback) {
    return new Promise((resolve, reject) => {
        if (!blob) {
            reject(new Error('未传入 blob'));
        }
        let reader = new FileReader();
        reader.readAsDataURL(blob); // 转换为base64
        reader.onload = function () {
            callback && callback(reader);
            resolve(reader.result);
        };
    });
}
