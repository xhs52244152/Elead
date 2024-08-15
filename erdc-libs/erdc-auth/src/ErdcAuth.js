import axios from 'axios';
import joinUrl from './joinUrl';

const prefix = 'Basic ';

function randomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export default class ErdcAuth {
    /*
     * @param {string} clientId
     * @param {string} clientSecret
     * @param {string} serve
     * @param {string} configUrl
     * @param {string} accessToken
     * @param {boolean} toServeLogin
     */
    constructor({
        clientId = undefined,
        clientSecret = undefined,
        serve = '/',
        configUrl = null,
        accessToken = null,
        toServeLogin = false
    } = {}) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.serve = serve;
        this.configUrl = configUrl;
        this.accessToken = accessToken;
        this.toServeLogin = toServeLogin;
        this._inited = false;
    }

    init() {
        return new Promise((resolve, reject) => {
            if (!this.configUrl || this._inited) {
                this._inited = true;
                resolve(this);
                return;
            }
            axios
                .get(this.configUrl)
                .then((config) => {
                    config = config.data;
                    const data = config.data;
                    this.clientId = data.clientId;
                    this.clientSecret = data.clientSecret;
                    // this.serve = data.url || data.serve;
                    this.toServeLogin = data.toServeLogin;
                    if (!this.clientId || !this.serve) {
                        reject(new Error('Unrecognized config'));
                        return;
                    }
                    this._inited = true;
                    resolve(this);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    getUrl(url) {
        return [this.serve, url].join('/').replaceAll(/\/\//g, '/');
    }

    /*
     * @param {string} username
     * @param {string} password
     * @return {Promise<string>}
     */
    login({ username, password }) {
        return axios
            .post(
                this.getUrl('common/sso/login'),
                {
                    username,
                    password
                },
                {
                    headers: {
                        Authorization:
                            this.clientId && this.clientSecret
                                ? prefix + window.btoa(this.clientId + ':' + this.clientSecret)
                                : undefined,
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                    },
                    params: {
                        _t: `${new Date().getTime()}_${randomString(5)}`
                    }
                }
            )
            .then((resp) => {
                resp = resp.data;
                if (resp.code * 1 === 200) {
                    this.accessToken = resp.data;
                    return Promise.resolve(resp.data);
                } else {
                    return Promise.reject(resp);
                }
            });
    }

    loginSchemes() {
        return axios
            .get(this.getUrl('common/sso/oauth/login-schemes'), {
                errorMessage: false
            })
            .then((resp) => {
                resp = resp.data;
                if (resp.code * 1 === 200) {
                    return Promise.resolve(resp.data);
                } else {
                    return Promise.reject(resp);
                }
            });
    }

    loginSSO(data) {
        return axios
            .post(this.getUrl('common/sso/auth/token'), data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                },
                params: {
                    _t: `${new Date().getTime()}_${randomString(5)}`
                }
            })
            .then((resp) => {
                resp = resp.data;
                if (resp.code * 1 === 200) {
                    this.accessToken = resp.data;
                    return Promise.resolve(resp.data);
                } else {
                    return Promise.reject(resp);
                }
            });
    }

    /**
     * @param {string} token
     * @returns {Promise<redirect: string>}
     */
    validateToken(token) {
        return axios
            .get(this.getUrl('platform/sso/auth'), {
                headers: {
                    Authorization: token
                },
                params: {
                    clientId: this.clientId || '',
                    redirect: window.encodeURI(window.location.href)
                }
            })
            .then((resp) => {
                resp = resp.data;
                if (resp.code === 200) {
                    this.accessToken = token;
                    return resp;
                } else if (resp.code === 401) {
                    if (this.toServeLogin && resp.data) {
                        window.location.href = joinUrl(resp.data, {
                            clientId: this.clientId,
                            redirect: window.encodeURI(window.location.href)
                        });
                    }
                    return Promise.reject(resp);
                } else {
                    return Promise.reject(resp);
                }
            });
    }

    /*
     * @return {Promise<string>}
     */
    logout() {
        return axios
            .post(this.getUrl('platform/sso/logout'), null, {
                headers: {
                    Authorization: this.accessToken
                },
                params: {
                    _t: `${new Date().getTime()}_${randomString(5)}`
                }
            })
            .then((resp) => {
                resp = resp.data;
                if (resp.code === 200) {
                    this.accessToken = null;
                    return Promise.resolve(resp.data);
                } else {
                    return Promise.reject(resp);
                }
            });
    }

    tempToken() {
        return axios
            .get(this.getUrl('platform/sso/token/temporary'), {
                headers: {
                    Authorization: this.accessToken
                }
            })
            .then((resp) => {
                resp = resp.data;
                if (resp.code * 1 === 200) {
                    return Promise.resolve(resp.data);
                } else {
                    return Promise.reject(resp);
                }
            });
    }
}
