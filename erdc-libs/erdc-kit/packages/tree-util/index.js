import { deepClone } from '../../src/index';

const TreeUtil = {
    /**
     * 构建树
     * @param { Object[] } array - 数组
     * @param { string } [keyField = 'id'] - 默认判断条件
     * @param { string } [parentField = 'parentId'] - 父节点所在字段
     * @param { string } [childrenField = 'children'] - 构建后子节点所在字段
     * @param { function(node: Object): boolean } [isRoot] - 判断某个节点是根节点的依据
     * @param { function(node: Object, parentNode: Object): boolean } [isChildOf] - 判断某个节点是另一个节点的子节点的依据
     * @param { function(node: Object, parentNode: Object, treeArray: Object[], nodePath: Object[]) } [every] - 针对每个节点的处理
     * @returns { array } - 最终树结构
     */
    buildTree: function (
        array,
        {
            keyField = 'id',
            parentField = 'parentId',
            childrenField = 'children',
            isRoot = (node) => ['', false, null, undefined, -1, '-1'].includes(node[parentField]),
            isChildOf = (children, parent) => children[parentField] === parent[keyField],
            every = () => ({})
        } = {}
    ) {
        const _array = deepClone(array);
        if (!_array) {
            return null;
        }
        const judge = function (judgment) {
            if (typeof judgment === 'function') {
                return judgment.apply(TreeUtil, Array.prototype.splice.call(arguments, 1));
            }
        };
        const findAllRootNodes = function (array) {
            return _.filter(array, function (item) {
                return judge(isRoot, item);
            });
        };
        const nodePath = [];
        const makeTreeNode = function (roots, array, every) {
            _.each(roots, function (parent) {
                nodePath.push(parent);
                _.each(array, function (child) {
                    nodePath.push(child);
                    if (judge(isChildOf, child, parent)) {
                        if (!parent[childrenField] || parent[childrenField].constructor !== Array) {
                            parent[childrenField] = [];
                        }
                        if (typeof every === 'function') {
                            every(child, parent, array, nodePath);
                        }
                        parent[childrenField].push(child);
                    }
                    nodePath.pop();
                });
                if (parent[childrenField] && parent[childrenField].constructor === Array) {
                    makeTreeNode(parent[childrenField], array, every);
                }
                nodePath.pop();
            });
        };

        const roots = findAllRootNodes(_array);

        if (typeof every === 'function') {
            _.each(roots, function (root) {
                every(root, null, _array, [root]);
            });
        }
        makeTreeNode(roots, _array, every);
        return roots;
    },
    /**
     * 先序遍历
     * @param { Object[] | Object } tree - 树
     * @param { string } [childrenField = 'children'] -  子节点所在字段
     * @param { function(node: Object, tree: Object[]) } [every = () => {}] - 每节点处理方法，传入当前节点、树结构为参数
     * @param { function(tree: Object[])  } [done = () => {}] - 遍历结束回调，传入树结构为参数
     */
    doPreorderTraversal: function (tree, { childrenField = 'children', every = () => {}, done = () => {} } = {}) {
        if (!tree || tree.length === 0) {
            return;
        }
        if (Object.prototype.toString.call(tree) === '[object Array]') {
            _.each(tree, function (root) {
                if (Object.prototype.toString.call(every) === '[object Function]') {
                    every(root, tree);
                }
                TreeUtil.doPreorderTraversal(root[childrenField], {
                    childrenField,
                    every
                });
            });
        } else {
            TreeUtil.doPreorderTraversal(tree, {
                childrenField,
                every
            });
        }
        if (typeof done === 'function') {
            done(tree);
        }
    },
    /**
     * 将树结构平铺到数组里
     * @param { Object[] | Object } tree - 树
     * @param { string } [childrenField = 'children'] - 子节点所在字段
     * @return { Object[] } 展平的数组
     */
    flattenTree2Array: function (tree, { childrenField = 'children' } = {}) {
        childrenField = childrenField ? childrenField : 'children';
        const rst = [];
        if (!tree || tree.length === 0) {
            return rst;
        }
        TreeUtil.doPreorderTraversal(tree, {
            childrenField,
            every(node) {
                rst.push(node);
            }
        });
        return rst;
    },
    /**
     * 寻找到某个节点的路径
     * @param { Object[] | Object } tree - 树
     * @param { string } [childrenField = 'children'] -  子节点所在字段
     * @param { Object | function(node): boolean } target - 目标节点识别方式，如 {id: '1.1'}, node => node.id === '1.1'
     * @param { boolean } [isSome=true] (当children传入方式是map时)是否全量对比。即是否比对完children的键值对。
     * @return { array } - 查找到的路径
     */
    findPath: function (tree, { childrenField = 'children', target = () => false, isSome = true } = {}) {
        const path = [];
        try {
            const getNodePath = function (node) {
                path.push(node);
                if (target && TreeUtil.isTargetNode(node, target, isSome)) {
                    throw 'Got the target node.';
                }
                if (node[childrenField] && node[childrenField].length > 0) {
                    _.each(node[childrenField], function (child) {
                        getNodePath(child);
                    });
                    path.pop();
                } else {
                    path.pop();
                }
            };
            _.each(tree, function (node) {
                getNodePath(node);
            });
        } catch (e) {
            return path;
        }
        return [];
    },
    /**
     * 按照条件判断某个节点是否是需要的节点
     * @param { Object } node - 当前节点
     * @param { Object | function(node): boolean } target - 子节点识别方式，可以是对象按字段比对，也可以一个返回布尔值的函数
     * @param { boolean } [isSome = true] 当target是对象时使用，表示是否全量对比。即是否比对完children的键值对。
     * @return { boolean } - 当前节点是否需要的节点
     */
    isTargetNode: function (node, target, isSome) {
        let rst = false;
        const results = [];
        if (node) {
            if (typeof target === 'function') {
                rst = !!target(node);
                return rst;
            } else if (target) {
                _.keys(target).forEach(function (key) {
                    if (isSome) {
                        if (!rst) {
                            rst = node[key] === target[key];
                        }
                    } else {
                        results.push(node[key] === target[key]);
                    }
                });
            }
        }
        return isSome
            ? rst
            : !_.some(results, function (result) {
                  return !result;
              });
    },
    /**
     * 根据条件查找某个节点
     * @param { Object[] | Object } tree - 树
     * @param { string } [childrenField = 'children'] - 子节点所在字段
     * @param { Object | function(node): boolean } target - 子节点识别方式，可以是对象按字段比对，也可以一个返回布尔值的函数
     * @param { boolean } [isSome = true] 当target是对象时使用，表示是否全量对比。即是否比对完children的键值对。
     * @return { Object }
     */
    getNode: function (tree, { childrenField = 'children', target = () => false, isSome = true } = {}) {
        if (tree.constructor !== Array) {
            return TreeUtil.getNode([tree], {
                childrenField,
                target,
                isSome
            });
        }
        let targetNode;
        TreeUtil.doPreorderTraversal(tree, {
            childrenField,
            every(node) {
                if (!targetNode) {
                    if (target && TreeUtil.isTargetNode(node, target, isSome)) {
                        targetNode = node;
                    }
                }
            }
        });
        return targetNode;
    },
    /**
     * 按层遍历树结构
     * @param { Object[] | Object } tree - 树
     * @param { string } [childrenField = 'children'] - 子节点所在字段
     * @param { node: Object, tree: Object[] } [every] - 每节点处理方法，传入当前节点、树结构为参数
     * @param { function(layer: Object[], tree: Object[]) } [doneLayer] - 每层处理方法，传入当前层节点，树结构为参数
     * @param { function(tree: Object[]) } [done] - 遍历结束回调，传入树结构为参数
     * @returns { array } - 按层遍历展平的数组
     */
    doLayerTraversal: function (
        tree,
        { childrenField = 'children', every = () => {}, doneLayer = () => {}, done = () => {} } = {}
    ) {
        if (!tree || tree.length === 0) {
            return [];
        }
        let rstTree = [];
        if (tree.constructor === Array) {
            const queue = [].concat(tree);
            let node = null;
            while (queue.length > 0) {
                let layer = [];
                let size = queue.length;
                for (let i = 0; i < size; i++) {
                    node = queue.shift();
                    layer.push(node);
                    if (typeof every === 'function') {
                        every(node, tree);
                    }
                    if (node[childrenField] && node[childrenField].length !== 0) {
                        node[childrenField].forEach(function (child) {
                            queue.push(child);
                        });
                    }
                }
                if (typeof doneLayer === 'function') {
                    doneLayer(layer, tree);
                }
                rstTree = rstTree.concat(layer);
            }
            if (typeof done === 'function') {
                done(tree);
            }
            tree = rstTree;
            return tree;
        } else {
            return TreeUtil.doLayerTraversal([tree], {
                childrenField,
                every,
                doneLayer,
                done
            });
        }
    },
    /**
     *
     * @param { Array } dataList 树表格数据
     * @param { String } value 树表格搜索字段
     * @param { Object } opt 树表格搜索配置，其中attrs必须是表格所显示的字段，这个字段接口返回的数据不能为对象
     * @returns
     */
    filterTreeTable: function (
        dataList,
        value,
        opt = {
            children: 'children',
            attrs: ['displayName']
        }
    ) {
        return dataList.filter((item) => {
            if (item?.[opt.children]?.length) {
                item[opt.children] = TreeUtil.filterTreeTable(
                    JSON.parse(JSON.stringify(item[opt.children])),
                    value,
                    opt
                );
            }
            const attrs = opt.attrs || [];
            if (Array.isArray(attrs)) {
                return attrs.some((sitem) => String(item[sitem]).includes(value)) || item?.[opt.children]?.length;
            }
            return (
                Object.keys(attrs).some((sitem) => String(item[sitem]).includes(value)) || item?.[opt.children]?.length
            );
        });
    }
};

export default TreeUtil;
