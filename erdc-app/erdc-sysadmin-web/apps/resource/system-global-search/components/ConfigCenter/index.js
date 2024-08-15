define([
    'text!' + ELMP.resource('system-global-search/components/ConfigCenter/template.html'),
    'css!' + ELMP.resource('system-global-search/styles/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        components: {
            configTree: ErdcKit.asyncComponent(ELMP.resource('system-global-search/components/ConfigTree/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-global-search/locale/index.js'),
                i18nMappingObj: {},
            }
        },
        computed: {
            checkedNodes() {
                return this.$store.getters.getGlobalSearchConfig('checkedNodes') || [];
            },
            treeList() {
                const arrayToTree = (arr) => {
                    let result = []; //返回的树结构
                    let treeMap = {}; //用传进来的每个项的id作为键值，建立一棵树
                    arr.forEach((item) => {
                        item.children = [];
                        treeMap[item.oid] = item; //浅拷贝，共享引用
                    });
                    arr.forEach((item) => {
                        if (arr.some((subItem) => subItem.oid === item.parentOid)) {
                            if (treeMap[item.parentOid]) {
                                treeMap[item.parentOid].children.push(item); //修改treeMap的值，result中的值也会随之变化。因为他们复制的是tree的地址(引用类型)。
                            }
                        } else {
                            result.push(item);
                        }
                    });
                    return result; // result 转化后的树形结构数据
                };
                return arrayToTree(this.checkedNodes);
            }
        }
    };
});
