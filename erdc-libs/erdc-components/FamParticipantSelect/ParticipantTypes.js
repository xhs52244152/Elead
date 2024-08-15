define(['erdcloud.i18n', ELMP.resource('erdc-components/FamParticipantSelect/locale/index.js')], function (
    i18n,
    i18nMappingObj
) {
    return [
        {
            value: 'ROLE',
            name: i18n.wrap(i18nMappingObj).roleName,
            icon: 'erd-iconfont erd-icon-team',
            props() {
                return {
                    leftConfig: {
                        defaultExpandAll: true
                    },
                    multiple: this.multiple,
                    filterable: true
                };
            },
            listeners: {
                change: (oid, data) => {
                    this.$emit('change', oid, data);
                },
                callback: (data) => {
                    this.$emit('selectChange', data);
                }
            }
        },
        {
            name: i18n.wrap(i18nMappingObj).userName,
            value: 'USER',
            icon: 'erd-iconfont erd-icon-user',
            props() {
                return {
                    leftConfig: {
                        defaultExpandAll: true
                    },
                    fixedHeight: true,
                    clearable: true,
                    disabled: this.componentDisabled,
                    disabledArray: this.disableIds,
                    searchScop: 'group',
                    customUrl: this.customMemberSelectUrl,
                    showWordLimit: this.collapseTags || false,
                    isgetdisable: this.isgetdisable
                };
            },
            listeners: {
                change: (oid, data) => {
                    this.$emit('change', oid, data);
                }
            }
        },
        {
            name: i18n.wrap(i18nMappingObj).groupName,
            value: 'GROUP',
            icon: 'erd-iconfont erd-icon-group',
            props() {
                return {
                    disabledArray: this.disableIds,
                    clearable: true,
                    filterable: true,
                    collapseTags: this.collapseTags || false
                };
            },
            listeners: {
                change: (oid, data) => {
                    this.$emit('change', oid, data);
                },
                callback: (data) => {
                    this.$emit('selectChange', data);
                }
            }
        },
        {
            name: i18n.wrap(i18nMappingObj).organizationName,
            value: 'ORG',
            icon: 'erd-iconfont erd-icon-department',
            props: {
                clearable: true
            },
            listeners: {
                change: (oid, data) => {
                    this.$emit('change', oid, data);
                }
            }
        }
    ];
});
