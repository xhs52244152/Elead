define(['erdcloud.kit', ELMP.resource('ppm-https/common-http.js'), ELMP.resource('ppm-store/index.js')], function (
    ErdcKit,
    commonHttp,
    ppmStore
) {
    return {
        template: `
            <object-permission-manage
                v-if="knowledgeDetail"
                :product-oid="containerRef"
                :custom-context-detail="knowledgeDetail"
                :include-ancestor-domain="includeAncestorDomain"
            ></object-permission-manage>
        `,
        components: {
            ObjectPermissionManage: ErdcKit.asyncComponent(
                ELMP.resource(`erdc-product-components/PermissionManagement/ObjectPermissionManage/index.js`)
            )
        },
        data() {
            return {
                oid: 'OR:erd.cloud.ppm.knowledge.entity.KnowledgeLibrary:1793486205244080129',
                containerRef: null,
                knowledgeDetail: null,
                includeAncestorDomain: false
            };
        },
        mounted() {
            this.$nextTick(() => {
                this.containerRef = ppmStore.state.knowledgeInfo?.containerRef || '';
                this.getContainerDetail(this.containerRef);
            });
        },
        methods: {
            getContainerDetail(oid) {
                commonHttp
                    .commonAttr({
                        data: {
                            oid
                        }
                    })
                    .then((res) => {
                        this.knowledgeDetail = ErdcKit.deserializeAttr(res.data.rawData, {
                            valueMap: {
                                defaultDomainRef({ oid }) {
                                    return oid;
                                },
                                domainRef({ oid }) {
                                    return oid;
                                }
                            }
                        });
                        this.knowledgeDetail.pathDisplayName = this.knowledgeDetail.name;
                    });
            }
        }
    };
});
