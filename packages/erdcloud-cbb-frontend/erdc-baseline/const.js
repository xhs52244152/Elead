define([], function () {
    return {
        className: 'erd.cloud.cbb.baseline.entity.Baseline',
        relationClassName: 'erd.cloud.cbb.baseline.entity.BaselineMember',
        relationTableKey: 'BaselineRelationView',
        containerClass: 'erd.cloud.foundation.core.container.entity.ScalableContainer',
        masterClassName: 'erd.cloud.cbb.baseline.entity.BaselineMaster'
    };
});
