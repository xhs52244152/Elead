define([], function () {
    return {
        /**
         * 文件大小显示计算
         * @param {Number|String} size 文件大小
         * @param {String} unit 初始数据单位，默认为字节，可选值参考units
         * @returns 返回文件大小显示值 xxx MB
         */
        formatSize(size, unit) {
            let units = ['B', 'KB', 'MB', 'GB', 'T'];

            let handler = (size, level) => {
                if (size > 1024) return handler(size / 1024, level + 1);
                else return `${size.toFixed(2)} ${units[level]}`;
            };

            let sizeNumber = Number(size);
            let startIndex = unit ? units.indexOf(unit.toUpperCase()) || 0 : 0;

            return handler(sizeNumber, startIndex);
        }
    };
});
