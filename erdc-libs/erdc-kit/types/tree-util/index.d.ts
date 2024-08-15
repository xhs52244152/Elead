export default TreeUtil;
declare namespace TreeUtil {
    function buildTree(array: any[], { parentField, childrenField, isRoot, isChildOf, every }?: {
        parentField?: string;
        childrenField?: string;
    }): any[];
    function doPreorderTraversal(tree: any, { childrenField, every, done }?: {
        childrenField?: string;
    }): void;
    function flattenTree2Array(tree: any, { childrenField }?: {
        childrenField?: string;
    }): any[];
    function findPath(tree: any, { childrenField, target, isSome }?: {
        childrenField?: string;
        target?: any;
        isSome?: boolean;
    }): any[];
    function isTargetNode(node: any, target: any, isSome?: boolean): boolean;
    function getNode(tree: any, { childrenField, target, isSome }?: {
        childrenField?: string;
        target?: any;
        isSome?: boolean;
    }): any;
    function doLayerTraversal(tree: any, { childrenField, every, doneLayer, done }?: {
        childrenField?: string;
    }): any[];
    function filterTreeTable(dataList: any[], value: string, opt?: {
        children: string;
        attrs: string;
    }): any[];
}
