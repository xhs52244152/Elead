define(['erdcloud.kit'], function (ErdcloudKit) {
    return [
        // 数据字典
        {
            path: 'dictConfig/dict',
            component: ErdcloudKit.asyncComponent(ELMP.resource('biz-dict/index.js')),
            name: 'dictionaryManagement'
        },
        // 枚举
        {
            path: 'dictConfig/enum',
            component: ErdcloudKit.asyncComponent(ELMP.resource('erdc-app/AbnormalPages/Planning.js')),
            name: 'enum'
        }
    ];
});
