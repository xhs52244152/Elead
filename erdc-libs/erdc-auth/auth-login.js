(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('axios')) :
  typeof define === 'function' && define.amd ? define(['exports', 'axios'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ErdcAuth = {}, global.axios));
})(this, (function (exports, axios) { 'use strict';

  function _classCallCheck(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o);
    }
  }
  function _createClass(e, r, t) {
    return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", {
      writable: !1
    }), e;
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (String )(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }

  function joinUrl(url, params) {
    if (_.isEmpty(params)) {
      return url;
    }
    _.each(params, function (value, key) {
      if (value) {
        value = value.toString();
        var pattern = new RegExp('\\b' + key + '=([^&]*)');
        var replaceText = key + '=' + encodeURIComponent(value);
        if (_.isEmpty(value)) {
          url = url.replace(new RegExp('[?|&]\\b' + key + '=([^&]*)'), '');
        } else {
          if (url.match(pattern)) {
            url = url.replace(pattern, replaceText);
          } else if (url.match('[?]')) {
            url = url + '&' + replaceText;
          } else {
            url = url + '?' + replaceText;
          }
        }
      }
    });
    return url;
  }

  var prefix = 'Basic ';
  function randomString(length) {
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  var ErdcAuth = /*#__PURE__*/function () {
    /*
     * @param {string} clientId
     * @param {string} clientSecret
     * @param {string} serve
     * @param {string} configUrl
     * @param {string} accessToken
     * @param {boolean} toServeLogin
     */
    function ErdcAuth() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$clientId = _ref.clientId,
        clientId = _ref$clientId === void 0 ? undefined : _ref$clientId,
        _ref$clientSecret = _ref.clientSecret,
        clientSecret = _ref$clientSecret === void 0 ? undefined : _ref$clientSecret,
        _ref$serve = _ref.serve,
        serve = _ref$serve === void 0 ? '/' : _ref$serve,
        _ref$configUrl = _ref.configUrl,
        configUrl = _ref$configUrl === void 0 ? null : _ref$configUrl,
        _ref$accessToken = _ref.accessToken,
        accessToken = _ref$accessToken === void 0 ? null : _ref$accessToken,
        _ref$toServeLogin = _ref.toServeLogin,
        toServeLogin = _ref$toServeLogin === void 0 ? false : _ref$toServeLogin;
      _classCallCheck(this, ErdcAuth);
      this.clientId = clientId;
      this.clientSecret = clientSecret;
      this.serve = serve;
      this.configUrl = configUrl;
      this.accessToken = accessToken;
      this.toServeLogin = toServeLogin;
      this._inited = false;
    }
    return _createClass(ErdcAuth, [{
      key: "init",
      value: function init() {
        var _this = this;
        return new Promise(function (resolve, reject) {
          if (!_this.configUrl || _this._inited) {
            _this._inited = true;
            resolve(_this);
            return;
          }
          axios.get(_this.configUrl).then(function (config) {
            config = config.data;
            var data = config.data;
            _this.clientId = data.clientId;
            _this.clientSecret = data.clientSecret;
            // this.serve = data.url || data.serve;
            _this.toServeLogin = data.toServeLogin;
            if (!_this.clientId || !_this.serve) {
              reject(new Error('Unrecognized config'));
              return;
            }
            _this._inited = true;
            resolve(_this);
          }).catch(function (error) {
            reject(error);
          });
        });
      }
    }, {
      key: "getUrl",
      value: function getUrl(url) {
        return [this.serve, url].join('/').replaceAll(/\/\//g, '/');
      }

      /*
       * @param {string} username
       * @param {string} password
       * @return {Promise<string>}
       */
    }, {
      key: "login",
      value: function login(_ref2) {
        var _this2 = this;
        var username = _ref2.username,
          password = _ref2.password;
        return axios.post(this.getUrl('common/sso/login'), {
          username: username,
          password: password
        }, {
          headers: {
            Authorization: this.clientId && this.clientSecret ? prefix + window.btoa(this.clientId + ':' + this.clientSecret) : undefined,
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
          },
          params: {
            _t: "".concat(new Date().getTime(), "_").concat(randomString(5))
          }
        }).then(function (resp) {
          resp = resp.data;
          if (resp.code * 1 === 200) {
            _this2.accessToken = resp.data;
            return Promise.resolve(resp.data);
          } else {
            return Promise.reject(resp);
          }
        });
      }
    }, {
      key: "loginSchemes",
      value: function loginSchemes() {
        return axios.get(this.getUrl('common/sso/oauth/login-schemes'), {
          errorMessage: false
        }).then(function (resp) {
          resp = resp.data;
          if (resp.code * 1 === 200) {
            return Promise.resolve(resp.data);
          } else {
            return Promise.reject(resp);
          }
        });
      }
    }, {
      key: "loginSSO",
      value: function loginSSO(data) {
        var _this3 = this;
        return axios.post(this.getUrl('common/sso/auth/token'), data, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
          },
          params: {
            _t: "".concat(new Date().getTime(), "_").concat(randomString(5))
          }
        }).then(function (resp) {
          resp = resp.data;
          if (resp.code * 1 === 200) {
            _this3.accessToken = resp.data;
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
    }, {
      key: "validateToken",
      value: function validateToken(token) {
        var _this4 = this;
        return axios.get(this.getUrl('platform/sso/auth'), {
          headers: {
            Authorization: token
          },
          params: {
            clientId: this.clientId || '',
            redirect: window.encodeURI(window.location.href)
          }
        }).then(function (resp) {
          resp = resp.data;
          if (resp.code === 200) {
            _this4.accessToken = token;
            return resp;
          } else if (resp.code === 401) {
            if (_this4.toServeLogin && resp.data) {
              window.location.href = joinUrl(resp.data, {
                clientId: _this4.clientId,
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
    }, {
      key: "logout",
      value: function logout() {
        var _this5 = this;
        return axios.post(this.getUrl('platform/sso/logout'), null, {
          headers: {
            Authorization: this.accessToken
          },
          params: {
            _t: "".concat(new Date().getTime(), "_").concat(randomString(5))
          }
        }).then(function (resp) {
          resp = resp.data;
          if (resp.code === 200) {
            _this5.accessToken = null;
            return Promise.resolve(resp.data);
          } else {
            return Promise.reject(resp);
          }
        });
      }
    }, {
      key: "tempToken",
      value: function tempToken() {
        return axios.get(this.getUrl('platform/sso/token/temporary'), {
          headers: {
            Authorization: this.accessToken
          }
        }).then(function (resp) {
          resp = resp.data;
          if (resp.code * 1 === 200) {
            return Promise.resolve(resp.data);
          } else {
            return Promise.reject(resp);
          }
        });
      }
    }]);
  }();

  function useAuth(configUrl) {
    return new ErdcAuth(configUrl).init();
  }

  exports.ErdcAuth = ErdcAuth;
  exports.default = ErdcAuth;
  exports.useAuth = useAuth;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
