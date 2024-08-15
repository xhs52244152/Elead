define(['EventBus', 'sockjs', 'stomp', 'underscore'], function (EventBus, SockJS, { Stomp }) {
    const util = {
        defaultUrl: null,
        defaultHeaders: {},
        events: {},
        sock: null,
        stompClient: null,
        connect: function () {
            return new Promise((resolve, reject) => {
                if (util.defaultUrl) {
                    util.sock = new SockJS(util.defaultUrl);
                    util.stompClient = Stomp.over(util.sock);
                    util.stompClient.debug = () => {
                        /// do nothing
                    };
                    util.stompClient.connect(
                        util.defaultHeaders,
                        function (frame) {
                            console.log('Connected: ' + frame);
                            util.sock.onclose = util.connect;
                            resolve();
                        },
                        function () {
                            reject();
                        }
                    );
                } else {
                    reject(new Error('没有设置URL'));
                }
            });
        },
        disconnect: function (callback) {
            util.stompClient.disconnect(callback);
        },
        subscribe: function (topic, listener, headers) {
            util.stompClient && util.unsubscribe(topic);
            util.stompClient.subscribe(
                topic,
                function (resp) {
                    if (_.isFunction(listener) && _.isString(resp.body)) {
                        listener(JSON.parse(resp.body));
                    }
                },
                $.extend(
                    {},
                    {
                        id: 'sub-' + topic,
                        'Content-Type': 'application/json;charset=UTF-8'
                    },
                    headers || {}
                )
            );
        },
        unsubscribe: function (topic) {
            return util.stompClient.unsubscribe('sub-' + topic);
        },
        sendMessage: function (topic, header, body) {
            if (util.stompClient != null) {
                return util.stompClient.send(topic, header, body);
            } else {
                return false;
            }
        }
    };

    function init(url, headers) {
        util.defaultUrl = url;
        util.defaultHeaders = headers;
        return util.connect();
    }

    return {
        init: init,
        subscribe: util.subscribe,
        unsubscribe: util.unsubscribe,
        disconnect: util.disconnect,
        sendMessage: util.sendMessage
    };
});
