define([], function () {
    return {
        /**
         * 将数据处理成树结构，要求数据是平铺的，并且是根据parent来组装树结构
         * @param data 平铺的数据
         * @param property 寻找父节点的属性标识
         * @returns {*[]}
         */
        getTreeTableData(data = [], property) {
            let children = JSON.parse(JSON.stringify(data));

            function handler(parents, children) {
                if (_.isEmpty(children)) {
                    return;
                }
                let nextChildren = [];
                let nextParents = [];

                children.forEach((d) => {
                    let findParent = false;
                    if (d.hasOwnProperty(property)) {
                        parents.forEach((parent) => {
                            if (d[property] === parent.oid) {
                                parent.children = parent.children ? parent.children : [];
                                parent.children.push(d);
                                nextParents.push(d);
                                findParent = true;
                            }
                        });
                    } else {
                        findParent = true;
                        parents.push(d);
                        nextParents.push(d);
                    }

                    if (!findParent) {
                        nextChildren.push(d);
                    }
                });

                if (nextParents.length === 0 && nextChildren.length > 0) {
                    var pa = [];
                    var ch = [];
                    nextChildren.forEach((child) => {
                        var hasParent = false;
                        nextChildren.forEach((otherChild) => {
                            if (child[property] === otherChild.oid) {
                                pa.indexOf(otherChild) > -1 ? '' : pa.push(otherChild);
                                ch.indexOf(child) > -1 ? '' : ch.push(child);
                                // 父亲竟在我身边?
                                hasParent = true;
                            }
                        });
                        if (!hasParent) {
                            pa.indexOf(child) > -1 ? '' : pa.push(child);
                        }
                    });
                    handler(pa, ch);
                    pa.forEach((p) => {
                        parents.push(p);
                    });
                    return;
                }
                handler(nextParents, nextChildren);
            }

            let parents = [];
            handler(parents, children);
            return parents;
        },
        /**
         * 提取出propertyValues中的属性
         * @param data 待处理的数据，Array类型
         */
        flatPropertyValues(data = []) {
            if (!_.isArray(data)) {
                return;
            }
            data.forEach((row) => {
                if (row.hasOwnProperty('propertyValues') && _.isArray(row.propertyValues)) {
                    row.propertyValues.forEach((prop) => {
                        row[prop.name] = prop.i18nValue;
                    });
                } else if (row.hasOwnProperty('propertyMap') && _.isObject(row.propertyMap)) {
                    for (let key in row.propertyMap) {
                        row[row.propertyMap[key].name] = row.propertyMap[key].propertyValue.i18nValue;
                    }
                }
            });
        }
    };
});
