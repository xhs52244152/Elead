import classnames from 'classnames';

import * as ComponentKit from './component';
import * as DomKit from './dom';
import * as ObjectKit from './object';
import * as QueueKit from './queue';
import * as StringKit from './string';
import * as FileKit from './file';

import uuid from './uuid';
import deferredUntilTrue from './deferredUntilTrue';
import throttle from './throttle';
import structActionButton from './structActionButton';
import queryString from './queryString';
import getParam from './getParam';
import getParams from './getParams';
import getHash from './getHash';
import joinUrl from './joinUrl';
import removeParams from './removeParams';
import normalizePath from './normalizePath';
import getResourceKeyByPath from './getResourceKeyByPath';
import randomString from './randomString';
import TreeUtil from './tree-util/index';

export * from './object';
export * from './component';
export * from './queue';
export * from './string';
export * from './file';
export {
    uuid,
    deferredUntilTrue,
    throttle,
    structActionButton,
    queryString,
    getParams,
    getParam,
    getHash,
    joinUrl,
    removeParams,
    normalizePath,
    getResourceKeyByPath,
    classnames,
    TreeUtil,
    randomString
};

export default {
    ...ComponentKit,
    ...DomKit,
    ...ObjectKit,
    ...QueueKit,
    ...StringKit,
    ...FileKit,
    classnames,
    uuid,
    deferredUntilTrue,
    throttle,
    structActionButton,
    queryString,
    getParams,
    getParam,
    getHash,
    joinUrl,
    removeParams,
    normalizePath,
    getResourceKeyByPath,
    TreeUtil,
    randomString
};
