/**
 * 图标 fontClass 映射处理。key 值是 iconfont 网站上的源名称，value值是映射后的名称，亦即实际生效的图标名称。
 * value 可以是一个数组，代表同一个图标被映射成多个图标（常用于兼容历史数据）
 * @type {{ string: string|string[] }}
 */
module.exports = {
    'standard-library': ['standard-library', 'library', 'library-insert'],
    'view-management': ['view-management', 'view-managemenet']
};
