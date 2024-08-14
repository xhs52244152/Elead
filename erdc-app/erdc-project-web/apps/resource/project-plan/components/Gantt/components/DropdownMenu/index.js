define(['fam:kit', ELMP.resource('ppm-store/index.js')], function (FamKit, store) {
    return {
        props: {
            actionName: String,
            disabled: Boolean,
            disabledReason: String
        },
        template: `
            <erd-popover
                ref="form"
                v-model="showFlag"
                :append-to-body="false"
                trigger="click"
                placement="bottom-start"
                popper-class="ppm-gantt-menu-container el-dropdown-menu el-popper fam_action_pulldowm el-dropdown-menu--medium"
            >
                <ul>
                    <li v-for="menu in menus"
                        :class="[
                            menu.enabled && !disabled ? '' : 'popover-disabled is-disabled',
                            'el-dropdown-menu__item truncate'
                        ]"
                        :name="menu.name"
                        :title="disabled && disabledReason || ''"
                        before-validator="menu.beforeValidator"
                        @click="onClick(menu)">
                        {{menu.displayName}}
                    </li>
                </ul>
                <span slot="reference" :style="{ position: 'fixed', left: panelX + 'px', top: panelY + 'px' }"></span>
            </erd-popover>
        `,
        data() {
            return {
                UID: '',
                actionDataDtos: [],
                moduleName: '',
                menus: [],
                showFlag: false,
                panelX: 0,
                panelY: 0
            };
        },
        methods: {
            open(UID, { left, top }) {
                this.UID = UID;
                let { actionName } = this;
                // 查询菜单信息，并渲染在指定位置
                this.$famHttp({
                    url: 'ppm/menu/query',
                    method: 'POST',
                    data: {
                        className: store.state.classNameMapping.task,
                        objectOid: UID,
                        name: actionName
                    }
                }).then((resp) => {
                    let { actionLinkDtos, name } = resp.data;
                    this.actionDataDtos = resp.data || [];
                    this.moduleName = name;
                    this.menus = FamKit.structActionButton(actionLinkDtos).filter((item) => !item.hide);
                    this.$nextTick(() => {
                        // 切换位置
                        this.setPosition(left, top);
                        this.showFlag = true;
                    });
                });
            },
            hide() {
                this.showFlag = false;
            },
            setPosition(left, top) {
                this.panelX = left;
                this.panelY = top;
            },
            onClick(menu) {
                if (menu.enabled === false || this.disabled) return;
                const emitClick = () => {
                    this.$emit('item-click', {
                        menu,
                        UID: this.UID
                    });
                };

                if (menu.beforeValidator) {
                    // 接口校验
                    this.validator(menu).then(() => {
                        emitClick();
                        this.hide();
                    });
                } else {
                    emitClick();
                    this.hide();
                }
            },
            // 接口校验
            validator(value) {
                return new Promise((resolve, reject) => {
                    const moduleName = this.getModuleName(value?.name, this.actionDataDtos);
                    this.$famHttp({
                        url: '/fam/menu/before/validator',
                        method: 'POST',
                        data: {
                            actionName: value.name,
                            extractParamMap: {},
                            moduleName: moduleName || this.moduleName || '',
                            multiSelect: [this.UID]
                        }
                    })
                        .then((resp) => {
                            const { data } = resp;
                            if (data?.passed) {
                                resolve();
                                return;
                            }
                            const message = data?.messageDtoList
                                .map((item) => {
                                    return `<span>${item.name} ${item.msg}</br></span>`;
                                })
                                .join('');

                            this.$message({
                                type: 'error',
                                message,
                                showClose: true,
                                dangerouslyUseHTMLString: true
                            });
                            reject();
                        })
                        .catch((error) => {});
                });
            },
            // 获取moduleName
            getModuleName(name, actionDataDtos) {
                let moduleName = '';
                for (let i = 0; i < actionDataDtos?.actionLinkDtos.length; i++) {
                    const item = actionDataDtos?.actionLinkDtos[i];
                    if (item?.actionDto?.name === name) {
                        moduleName = actionDataDtos.name;
                        break;
                    } else if (item?.moduleDto) {
                        moduleName = this.getModuleName(name, item.moduleDto);
                    }
                }
                return moduleName;
            }
        }
    };
});
