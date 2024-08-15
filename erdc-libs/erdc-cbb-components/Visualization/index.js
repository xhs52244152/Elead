define([
    'text!' + ELMP.resource('erdc-cbb-components/Visualization/index.html'),
    ELMP.resource('erdc-pdm-mdb/3DWebView/index.js'),
    ELMP.resource('erdc-pdm-nds/index.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    ELMP.resource('erdc-pdm-mdb/eleadCADView/index.js'),
    'erdc-kit',
    'underscore',
    'css!' + ELMP.resource('erdc-cbb-components/Visualization/style.css')
], function (template, CADViewMDB, NDSView, cbbUtils, eleadCADView) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'Visualization',
        mixins: [CADViewMDB, NDSView, eleadCADView],
        template,
        props: {
            vm: {
                type: Object,
                default() {
                    return {};
                }
            },
            showTools: Boolean
        },
        components: {
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js')),
            FamUser: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUser/index.js')),
            ThumbAttachDialog: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/Visualization/components/thumb-attach/index.js')
            ),
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nPath: ELMP.resource('erdc-cbb-components/Visualization/locale/index.js'),
                visualizationUnfold: true,
                expressionUnfold: true,
                tableData: [],
                defaultImgSrc: ELMP.resource('erdc-cbb-components/Images/visualization.jpg'),
                visualizationImgSrc: '',
                imageIsLoading: true,
                thumbVisible: false,
                defaultRep: {
                    taskType: ''
                }
            };
        },
        computed: {
            oid() {
                return this.$attrs.oid || this.vm?.containerOid || this.$route.params.oid;
            },
            slotsField() {
                return [
                    {
                        prop: 'thumbnail',
                        type: 'default',
                        _key: 'thumbnail'
                    },
                    {
                        prop: 'defaultRepresentation',
                        type: 'default',
                        _key: 'defaultRepresentation'
                    },
                    {
                        prop: 'openWith',
                        type: 'default',
                        _key: 'openWith'
                    },
                    {
                        prop: 'owner',
                        type: 'default',
                        _key: 'owner'
                    }
                ];
            },
            slotsNameList() {
                return this.slotsField?.map((item) => ({
                    ...item,
                    slotName: `column:${item.type}:${item.prop}:content`
                }));
            },
            imageClassName() {
                return 'erd.cloud.pdm.viewmarkup.entity.DerivedImage';
            },
            viewTableConfig() {
                let { slotsField, i18n, oid, imageClassName } = this;
                return {
                    vm: this,
                    columns: [
                        {
                            attrName: 'name',
                            label: i18n.name
                        },
                        {
                            attrName: 'thumbnail',
                            label: i18n['可视化'],
                            width: 80
                        },
                        {
                            attrName: 'defaultRepresentation',
                            label: i18n.defaultRep,
                            width: 80
                        },
                        {
                            attrName: 'openWith',
                            label: i18n.openWith,
                            width: 140
                        },
                        {
                            attrName: 'owner',
                            label: i18n.owner
                        },
                        {
                            attrName: 'updateTime',
                            label: i18n.updateTime
                        },
                        {
                            attrName: 'createTime',
                            label: i18n.createTime
                        },
                        {
                            attrName: 'description',
                            label: i18n.description
                        }
                    ],
                    fieldLinkConfig: {},
                    main: 'notViewRender',
                    tableRequestConfig: oid
                        ? {
                              url: '/epm/derivedImage/getDerivedImage',
                              method: 'GET',
                              className: imageClassName,
                              params: { representableOid: oid },
                              transformResponse: [
                                  (respData) => {
                                      let resp = JSON.parse(respData);
                                      resp.data = {
                                          records: (resp.data || []).map((item) => {
                                              return {
                                                  ...item,
                                                  owner: [item.owner],
                                                  thumbnail: 'cad'
                                              };
                                          })
                                      };

                                      // 获取默认表示
                                      this.defaultRep = resp.data.records.find((item) => {
                                          return item.defaultRepresentation;
                                      });
                                      return resp;
                                  }
                              ]
                          }
                        : {},
                    toolbarConfig: {
                        fuzzySearch: {
                            show: false // 是否显示普通模糊搜索，默认显示
                        }
                    },
                    firstLoad: true,
                    slotsField,
                    tableBaseConfig: {
                        maxLine: 5,
                        // 表格UI的配置(使用驼峰命名)，使用的是vxe表格，可参考官网API（https://vxetable.cn/）
                        rowConfig: {
                            isCurrent: true,
                            isHover: true
                        },
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        },
                        showOverflow: true // 溢出隐藏显示省略号
                    },
                    pagination: {
                        // 分页
                        showPagination: false // 是否显示分页
                    }
                };
            }
        },
        watch: {
            oid(val) {
                if (_.isEmpty(val)) return;
                this.refresh();
                // 更新缩略图
                this.updateImageSrc();
            },
            vm() {
                let fileId = this.vm?.sourceData?.thumbnailSmall?.value;
                this.visualizationImgSrc =
                    (fileId && `/file/file/site/storage/v1/img/${fileId}/download`) || this.defaultImgSrc;
            }
        },
        mounted() {
            // 首次加载触发，更新缩略图
            this.updateImageSrc();
        },
        methods: {
            refresh() {
                this.$refs.famViewTable.fnRefreshTable('default');
            },
            viewVisualization() {
                if (!this.defaultRep) {
                    return;
                }
                // 获取预览图的oid
                const oid = this.defaultRep?.oid;
                // 存给预览插件请求接口时使用的
                localStorage.setItem('derivedImageOid', oid);
                // 获取默认表示类型
                const taskType = this.defaultRep?.taskType;
                // 获取预览role
                const role = this.vm?.sourceData?.previewRoleType?.value;
                // 可扩展任何方式
                const taskTypeMap = {
                    MDB: this.MDBView,
                    NDS: this.NDSView
                };
                taskTypeMap[taskType]({
                    oid,
                    role
                });
            },
            MDBView({ oid, role }) {
                let { defaultRep } = this;
                // MDBweb预览方式(去掉尚炜的web预览方式)
                // if (defaultRep?.['openWith'] === 'web') {
                //     this.MDBWebPreview({ derivedImageOid: oid });
                // }
                // 调用梦溪实验室的预览方式
                if (defaultRep?.['openWith'] == 'web') {
                    this.EleadWebView({ derivedImageOid: oid });
                }
                // MDBclient调用ws预览的方式
                else {
                    cbbUtils.handleClientCAD('PREVIEW', oid, role, 'w');
                }
            },

            // 新迪预览方式
            NDSView() {
                this.checkDefaultRepresentation(this.defaultRep);
            },
            // 切换默认表示
            changeDefault(row) {
                let { oid, i18n } = this;
                this.$famHttp({
                    url: '/epm/derivedImage/setDefaultDerivedImage',
                    method: 'POST',
                    className: oid.split(':')?.[1],
                    params: {
                        representableOid: oid,
                        representationOid: row.oid
                    }
                }).then(() => {
                    this.$message.success(i18n.setSuccess);
                    // 刷新表格
                    this.refresh();
                    // 更新缩略图
                    this.updateImageSrc();
                });
            },
            // 打开缩略图附件弹窗
            viewThumbMain(row) {
                this.$refs.thumbAttach.setRowData(row);
                this.thumbVisible = true;
            },
            // 切换打开方式
            onChangeOpenWidth(row) {
                let { oid, imageClassName, i18n } = this;
                this.$famHttp({
                    url: '/epm/derivedImage/setOpenWith',
                    method: 'POST',
                    className: imageClassName,
                    params: {
                        openWith: row.openWith,
                        representableOid: oid,
                        representationOid: row.oid
                    }
                }).then(() => {
                    this.$message.success(i18n.setSuccess);
                    // 刷新表格
                    this.refresh();
                    // 更新缩略图
                    this.updateImageSrc();
                });
            },
            // 重启轻量化任务（参考老版本逻辑）
            refreshDerivedImage() {
                let { oid } = this;
                let tableData = this.$refs.famViewTable.tableData;
                this.$famHttp({
                    url: '/viewer/derivedImageTask/task/refreshTask',
                    method: 'POST',
                    className: 'erd.cloud.pdm.task.entity.DerivedImageTask',
                    data: {
                        // 这个是对象oid，后端说固定了数据格式得传数组
                        epmOids: [oid],
                        // 这个后端说过滤出来,只要拿到任意oid就行
                        derivedImageOid: _.isEmpty(tableData)
                            ? ''
                            : tableData.filter((v) => {
                                  return v.taskType == 'NDS';
                              })[0]?.oid
                    }
                }).then(() => {
                    // 刷新表格
                    this.refresh();
                });
            },
            // 更新缩略图
            updateImageSrc() {
                let { oid } = this;
                if (_.isEmpty(oid)) {
                    this.visualizationImgSrc = this.defaultImgSrc;
                    return;
                }
                this.$famHttp({
                    url: '/fam/attr',
                    method: 'GET',
                    data: {
                        oid,
                        className: oid?.split(':')?.[1]
                    }
                }).then((resp) => {
                    let fileId = resp.data?.rawData?.thumbnailSmall?.value;
                    this.visualizationImgSrc =
                        (fileId && `/file/file/site/storage/v1/img/${fileId}/download`) || this.defaultImgSrc;
                });
            },
            onImageLoad() {
                this.imageIsLoading = false;
            }
        }
    };
});
