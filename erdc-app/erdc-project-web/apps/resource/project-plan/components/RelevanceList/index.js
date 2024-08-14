define([
    'vue',
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    'text!' + ELMP.resource('project-plan/components/RelevanceList/index.html'),
    'css!' + ELMP.resource('project-plan/components/RelevanceList/style.css')
], function (Vue, ErdcKit, store, template) {
    const listComponent = {
        name: 'plan_list_component',
        template: template,
        props: {
            poid: String,
            containerRefOid: String,
            fromObject: String,
            excludeItems: Array, // 不需要显示的关联项
            taskTableKey: String,
            relateTaskProps: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                readonly: false,
                selectList: [],
                lefttableList: [],
                showList: true, // 显示列表还是表单数据
                i18nMappingObj: {
                    task: this.getI18nByKey('task')
                },
                i18nLocalePath: ELMP.resource('project-plan/locale/index.js'),
                state: '', // 表单状态
                relevanList: [],
                panelUnfold: true
            };
        },
        computed: {
            idKey() {
                let { fromObject } = this;
                if (fromObject === 'handleTask') {
                    return 'oid';
                } else {
                    return 'planOid';
                }
            },
            panelList() {
                let { poid } = this;
                console.log(this.taskTableKey);
                return [].concat(
                    this.excludeItems?.includes('task') // 是否不显示 任务
                        ? []
                        : [
                              {
                                  name: 'taskRelevance',
                                  title: this.i18nMappingObj.task,
                                  isShow: true,
                                  unfold: true,
                                  props: { poid, taskTableKey: this.taskTableKey, ...this.relateTaskProps }
                              }
                          ]
                );
            },
            relatedData() {
                let { poid } = this;
                const query = {
                    isCreateRelation: true,
                    roleAObjectRef: poid,
                    pid: this.$route.query.pid || '',
                    relationClassName: 'erd.cloud.ppm.common.entity.BusinessLink'
                };
                return []
                    .concat(
                        this.excludeItems?.includes('issue') // 是否不显示 问题
                            ? []
                            : [
                                  {
                                      businessKey: 'issue',
                                      actionConfigName: 'PPM_TASK_ISSUE_OPERATE_MENU',
                                      rowActionConfigName: 'PPM_TASK_ISSUE_OPERATE_LIST_MENU',
                                      createPageRoute: {
                                          path: '/erdc-ppm-issue/issue/create',
                                          query
                                      }
                                  }
                              ]
                    )
                    .concat(
                        this.excludeItems?.includes('risk') // 是否不显示 风险
                            ? []
                            : [
                                  {
                                      businessKey: 'risk',
                                      actionConfigName: 'PPM_TASK_RISK_OPERATE_MENU',
                                      rowActionConfigName: 'PPM_TASK_RISK_OPERATE_LIST_MENU',
                                      createPageRoute: {
                                          path: '/erdc-ppm-risk/create',
                                          query
                                      }
                                  }
                              ]
                    )
                    .concat(
                        this.excludeItems?.includes('require') // 是否不显示 需求
                            ? []
                            : [
                                  {
                                      businessKey: 'require',
                                      actionConfigName: 'PPM_TASK_REQ_OPERATE_MENU',
                                      rowActionConfigName: 'PPM_TASK_REQ_OPERATE_LIST_MENU',
                                      createPageRoute: {
                                          path: '/requirement-list/require/create',
                                          query
                                      }
                                  }
                              ]
                    );
            }
        },
        methods: {},
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            taskRelevance: ErdcKit.asyncComponent(
                ELMP.resource('project-plan/components/RelevanceList/TaskRelevance/index.js')
            ),
            requirementRelevance: ErdcKit.asyncComponent(
                ELMP.resource('project-plan/components/RelevanceList/RequireRelevance/index.js')
            ),
            problemRelevance: ErdcKit.asyncComponent(
                ELMP.resource('project-plan/components/RelevanceList/IssueRelevance/index.js')
            ),
            CommonRelated: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/Related/index.js'))
        }
    };
    return listComponent;
});
