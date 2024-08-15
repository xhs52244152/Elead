/**
 * 清洗图标，key 值为iconfont.json原font_class名，value 为修改的图标名
 * @type {{ [string]: [string|string[]] }}
 */
module.exports = {
    'abstract-class': ['abstract-class', 'cube'],
    related: ['related', 'referrence-object', 'reference-object'],
    'business-object': ['business-object', 'biz-object'],
    location: ['location', 'location2'],
    resource: ['resource', 'list'],
    'access-control-policy': ['access-control-policy', 'classified'],
    time: ['time', 'clock'],
    server: ['server', 'main-server'],
    'property-info': ['property-info', 'attr-definition', 'global-attributes', 'custom-attributes'],
    'classification-definition': ['classification-definition', 'type-definition'],
    manage: ['manage', 'managable-object'],
    container: ['container', 'defect-management'],
    'initiate-process': ['initiate-process', 'workflow'],
    'process-instance': ['process-instance', 'organization'],
    number: ['number', 'constant'],
    'operating-button': ['operating-button', 'click'],
    'lifecycle-state': ['lifecycle-state', 'actived'],
    'lifecycle-phase': ['lifecycle-phase', 'marshalling'],
    'container-template': ['container-template', 'coupling'],
    'preference-configuration-value': ['preference-configuration-value', 'grid'],
    'view-table': ['view-table', 'detail'],
    'platform-management': ['platform-management', 'workshop'],
    'import-export': ['import-export', 'impot-export', 'sortable'],
    unknown: ['unknown', 'writing']
    // 'transform-task': ['transform-task', 'transform-task']
};
