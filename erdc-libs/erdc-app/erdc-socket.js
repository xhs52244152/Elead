define(['el-socket', 'erdcloud.store', 'erdc-kit'], function (Socket, ErdcloudStore, ErdcKit) {
    let events = {};
    let topicHandler = {};
    let worker = null;
    let supportWorker = !!window.SharedWorker;
    const currentUserTopic = '/topic/' + ErdcloudStore.state.app.user.id + '/message';
    const currentUserTopicHandler = function (resp) {
        let eventType = resp.event;
        if (events[eventType]) {
            events[eventType].call(null, resp);
        } else if ('script' === eventType) {
            window.eval(resp.res.data);
        } else {
            console.debug('事件未绑定：' + eventType);
        }
    };

    function subscribe(topic, listener, headers) {
        if (!window.ELCONF?.feat?.websocket) {
            return;
        }
        if (supportWorker) {
            topicHandler[topic] = listener;
            worker.port.postMessage({
                type: 'subscribe',
                topic: topic,
                headers: headers
            });
        } else {
            Socket.subscribe(topic, listener, headers);
        }
    }

    function unsubscribe(topic) {
        if (!window.ELCONF?.feat?.websocket) {
            return;
        }
        if (supportWorker) {
            delete topicHandler[topic];
            worker.port.postMessage({
                type: 'unsubscribe',
                topic: topic
            });
        } else {
            Socket.unsubscribe(topic);
        }
    }

    function sendMessage(topic, header, body) {
        if (!window.ELCONF?.feat?.websocket) {
            return;
        }
        if (supportWorker) {
            worker.port.postMessage({
                type: 'sendMessage',
                topic: topic,
                header: header,
                body: body
            });
        } else {
            Socket.sendMessage(topic, header, body);
        }
    }

    if (window.ELCONF?.feat?.websocket) {
        if (supportWorker) {
            worker = new SharedWorker(ELMP.resource('erdc-app/erdc-worker.js'));
            worker.port.onmessage = function (e) {
                switch (e.data.type) {
                    case 'connect':
                        worker.port.postMessage({
                            type: 'initSocket',
                            headers: ErdcKit.defaultHeaders()
                        });
                        break;
                    case 'websocketConnected':
                        subscribe(currentUserTopic, currentUserTopicHandler);
                        break;
                    case 'socketMessage':
                        if (_.isFunction(topicHandler[e.data.topic])) {
                            topicHandler[e.data.topic](e.data.data);
                        }
                        break;
                }
            };
            window.addEventListener('beforeunload', () => {
                worker.port.postMessage({
                    type: 'unload'
                });
            });
        } else {
            let socketNumber = window.LS.get('socketNumber');
            if (!socketNumber) {
                Socket.init('/socket', ErdcKit.defaultHeaders())
                    .then(() => {
                        window.LS.set('socketNumber', 1);
                        window.addEventListener('beforeunload', () => {
                            window.LS.remove('socketNumber');
                        });
                        Socket.subscribe(currentUserTopic, currentUserTopicHandler);
                    })
                    .catch(() => {
                        console.error('socket 连接失败');
                    });
            }
        }
    }

    return {
        addEvent: function (eventType, fn) {
            _.isFunction(fn) && (events[eventType] = fn);
        },
        removeEvent: function (eventType) {
            delete events[eventType];
        },
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        sendMessage: sendMessage
    };
});
