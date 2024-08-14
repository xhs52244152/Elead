define([], function () {
    return {
        template: `
        <div class="select-box w-100p">
            <span v-if="readonly">{{currentFolder.path}}</span>
            <erd-tree-select
                v-else-if="!readonly && folderOptions.length"
                class="select-box w-100p"
                v-model="folderRef"
                node-key="oid"
                default-expand-all
                :data="folderOptions"
                :props="folderProps"
                @change="change"
            ></erd-tree-select>
        </div>
        `,
        props: {
            getContainerRef: Function,
            value: String | Object,
            vm: Object,
            folderChange: Function,
            readonly: {
                type: Boolean,
                default: false
            },
            // 回显文件夹oid
            currentFolderOid: String,
            // 是否禁用当前文件夹以及子文件夹
            isDisabled: Boolean,
            // 需要禁用文件夹oid
            disabledFolderOid: String,
            // 默认选择第一个
            defaultFirst: Function
        },
        data() {
            return {
                folderOptions: [],
                folderProps: {
                    children: 'childList',
                    label: 'displayName'
                },
                containerRef: '',
                currentFolder: {},
                currentOid: '',
                disabledOid: ''
            };
        },
        watch: {
            'containerRef'(val) {
                if (val) this.getFolderOptions(val);
            },
            // 因为平台插槽原因folderRef会转成folder-ref，导致在编辑的时候，attr接口获取到的值，通过双向绑定传不过来
            'vm.formData.folderRef': {
                handler(val) {
                    this.openType === 'edit' && (this.folderRef = val);
                },
                immediate: true
            },
            'canRefresh': {
                handler(val) {
                    val && this.setTreeDisabled(this.folderOptions, this.currentOid || this.disabledOid);
                },
                immediate: true
            },
            'currentOid': {
                handler(val) {
                    this.folderRef = val;
                },
                immediate: true
            }
        },
        computed: {
            isDefaultFirst() {
                return _.isFunction(this.defaultFirst) ? this.defaultFirst() : false;
            },
            folderRef: {
                get() {
                    return this.value;
                },
                set(val) {
                    let oid = _.isObject(val) ? val.oid : val;
                    this.$emit('input', oid);
                    this.$emit('update:value', oid);
                }
            },
            openType() {
                return this.$route.meta.openType || '';
            },
            canRefresh() {
                return this.folderOptions.length && (this.currentOid || this.disabledOid);
            }
        },
        async created() {
            this.containerRef = await this.getContainerRef();
        },
        mounted() {
            this.currentOid = this.currentFolderOid || this.$route.query.defaultFolder;
            this.disabledOid = this.disabledFolderOid || this.$route.query.disabledFolderOid;
            if (this.openType === 'create') {
                this.$set(this.vm.formData, 'folderRef', this.currentOid);
            }
        },
        activated() {
            if (this.currentOid !== this.$route.query.defaultFolder && this.currentOid !== this.currentFolderOid)
                this.currentOid = this.currentFolderOid || this.$route.query.defaultFolder;
            if (this.disabledOid !== this.disabledFolderOid && this.disabledOid !== this.$route.query.disabledFolderOid)
                this.disabledOid = this.disabledFolderOid || this.$route.query.disabledFolderOid;
        },
        methods: {
            change(oid) {
                this.folderRef = oid;
                _.isFunction(this.folderChange) && this.folderChange(this.vm, oid);
            },
            getFolderOptions(containerRef) {
                this.$famHttp({
                    url: '/fam/folder/listAllTree',
                    method: 'GET',
                    data: {
                        className: this.$store.getters.className('subFolder'),
                        containerRef
                    }
                }).then((res) => {
                    this.folderOptions = res.data;
                    this.isDefaultFirst && (this.folderRef = this.folderOptions[0].oid);
                });
            },
            // 所处位置不允许移动到自己节点或自己的子节点，设置禁用
            setTreeDisabled(tree, oid) {
                tree.forEach((item) => {
                    if (item.oid === oid) {
                        this.currentFolder = item;
                        if (this.isDisabled) {
                            item.disabled = true;
                            if (item.childList?.length) {
                                return this.setTreeChildListDisabled(item.childList);
                            }
                        }
                    } else if (item.childList?.length) {
                        item.disabled = false;
                        this.setTreeDisabled(item.childList, oid);
                    } else {
                        item.disabled = false;
                    }
                });
            },
            setTreeChildListDisabled(childList) {
                childList.forEach((item) => {
                    item.disabled = true;
                    if (item.childList?.length) {
                        this.setTreeChildListDisabled(item.childList);
                    }
                });
            }
        }
    };
});
