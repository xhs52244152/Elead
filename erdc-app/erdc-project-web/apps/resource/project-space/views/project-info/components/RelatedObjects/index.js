define([
    'text!' + ELMP.resource('project-space/views/project-info/components/RelatedObjects/index.html'),
    'erdcloud.kit',
    'css!' + ELMP.resource('project-space/views/project-info/components/RelatedObjects/style.css')
], function (template, ErdcKit) {
    return {
        template,
        props: {
            // 当前项目oid
            oid: String
        },
        components: {
            ParentObjects: ErdcKit.asyncComponent(
                ELMP.resource('project-space/views/project-info/components/RelatedObjects/parent/index.js')
            ),
            ChildObjects: ErdcKit.asyncComponent(
                ELMP.resource('project-space/views/project-info/components/RelatedObjects/child/index.js')
            ),
            IterationObjects: ErdcKit.asyncComponent(
                ELMP.resource('project-space/views/project-info/components/RelatedObjects/iteration/index.js')
            ),
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('FamContractionPanel/index.js', 'erdc-components'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-space/views/project-info/locale/index.js'),
                i18nMappingObj: {
                    parentProject: this.getI18nByKey('parentProject'),
                    childProject: this.getI18nByKey('childProject')
                },
                paneUnfold: {
                    ParentObjects: true,
                    ChildObjects: true,
                    IterationObjects: true
                }
            };
        },
        created() {},
        computed: {
            projectType() {
                return 'pubu';
            },
            panelList() {
                let { i18nMappingObj, oid, projectType } = this;
                return [
                    {
                        name: 'ParentObjects',
                        title: i18nMappingObj.parentProject,
                        isShow: true,
                        props: { oid }
                    },
                    {
                        name: 'ChildObjects',
                        title: i18nMappingObj.childProject,
                        isShow: true,
                        props: { oid }
                    },
                    {
                        name: 'IterationObjects',
                        title: '迭代',
                        isShow: projectType === 'minjie',
                        props: { oid }
                    }
                ];
            }
        },
        methods: {
            /**
             * 获取各个表格数据，用于外部调用
             **/
            getTableData() {
                return {
                    parentProject: [],
                    childProject: []
                };
            }
        }
    };
});
