/*
 * @Author: wyl
 * @Date: 2021-11-11 10:56:59
 * @Description: 一些新迪轻量化常用的自定义混入方法
 * @LastEditTime: 2021-11-22 09:33:17
 */
define([], function () {
    const ErdcStore = require('erdcloud.store');
    return {
        data() {
            return {
                className: 'erd.cloud.pdm.epm.entity.EpmDocument',
                // 国际化locale文件地址
                i18nPath: ELMP.resource('erdc-pdm-nds/locale/index.js')
            };
        },
        computed: {
            // 获取外界挂载在layer指定元素上的数据
            getParams() {
                // return $("#pdm-nds-icon").data('params')
                return { content: this.viewData };
            }
        },
        methods: {
            // 校验批注内容
            checkTag(tag, i) {
                if (_.isEmpty(tag)) {
                    // 批注不能为空
                    this.i18n?.['批注不能为空'];
                    return false;
                } else if (_.isEmpty(i)) {
                    // 批注图片不能为空

                    this.$message.info(this.i18n?.['批注的图片不能为空']);
                    return false;
                }
                return true;
            },
            // 当前登录人员信息
            getCurrentUserInfo() {
                return new Promise((resolve, reject) => {
                    try {
                        let obj = ErdcStore?.state?.user;
                        resolve(obj);
                    } catch (e) {
                        // 获取批注人员信息失败
                        this.$message.error(this.i18n?.['获取批注人员信息失败']);
                        console.error(e);
                        reject(e);
                    }
                });
            },
            /**
             * 保存新迪批注
             * @param {object} tag 外界传入的批注对象
             * @param {base64} i 批注截图
             */
            async saveTagAjax(tag, i, params) {
                // 先校验批注的内容
                if (!!params.checkTag && !this.checkTag(tag, i)) {
                    return false;
                }
                // 获取当前登录人员信息
                let userInfo = await this.getCurrentUserInfo();
                // 获取表示法对象
                let currentEpm = params.content.target;
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        className: this.className,
                        url: '/pdm/cad/comment/add',
                        method: 'POST',
                        data: {
                            // 圈阅批注内容
                            commentContent: JSON.stringify(tag),
                            // 圈阅批注图片
                            commentImage: i,
                            // 圈阅批注人id
                            commentUser: {
                                id: userInfo.id
                            },
                            // 当前表示法
                            derivedImageRef: currentEpm.derivedImageOid
                        }
                    })
                        .then((resp) => {
                            if (resp.code == 200) {
                                // 操作成功
                                this.$message.success(this.i18n?.['操作成功']);
                                resolve(resp.data);
                            } else {
                                // $.msg.error(resp.message || 'error')
                                reject(resp.message || 'error');
                            }
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            },
            async getAllTags(params) {
                const currentEpm = params.content.target;
                const derivedImageId = currentEpm.derivedImageOid;
                let url = `/pdm/cad/comment/${derivedImageId}`;
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        className: this.className,
                        url: url
                    })
                        .then((resp) => {
                            if (resp.code == 200) {
                                resolve(resp.data);
                            } else {
                                reject(resp.message || 'error');
                            }
                        })
                        .catch((error) => {
                            console.error(error || this.i18n?.['获取表示法批注失败']);
                            reject(error);
                        });
                });
            },
            /**
             * 移除指定oid的批注
             * @param {*} oid
             */
            async removeCommentByOid(oid) {
                if (_.isEmpty(oid)) {
                    // oid 不能为空
                    this.$message.error(this.i18n?.['oid不能为空']);
                    return false;
                }
                let url = '/pdm/cad/comment/deleteComments?commentOid=' + oid;
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        className: this.className,
                        url: url,
                        method: 'POST'
                    })
                        .then((resp) => {
                            if (resp.code == 200) {
                                // 操作成功
                                this.$message.success(this.i18n?.['操作成功']);
                                resolve(resp.data);
                            } else {
                                reject(resp.message || 'error');
                            }
                        })
                        .catch((error) => {
                            console.error(error || this.i18n?.['操作失败']);
                            reject(error);
                        });
                });
            },
            /**
             * 新增一条reply评论
             * @param {*} param0 commentRef:评论oid; commentUser: 发起评论的人员id ; replayContent : 回复的内容
             * @returns
             */
            async replayComments({ commentRef, commentUser, replayContent }) {
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        className: this.className,
                        url: '/pdm/cad/comment/replayComments',
                        method: 'POST',
                        data: {
                            commentRef: commentRef,
                            commentUser: commentUser,
                            replayContent: replayContent
                        }
                    })
                        .then((resp) => {
                            if (resp.code == 200) {
                                // 操作成功
                                this.$message.success(this.i18n?.['操作成功']);
                                resolve(resp.data);
                            } else {
                                reject(resp.message || 'error');
                            }
                        })
                        .catch((error) => {
                            console.error(error || this.i18n?.['操作失败']);
                            reject(error);
                        });
                });
            }
        }
    };
});
