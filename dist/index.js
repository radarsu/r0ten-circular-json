"use strict";
const _ = require("lodash");
exports.CircularJSON = {
    _config: {
        leaveRefIfUndefined: true,
        specialChar: "~",
        omitKeys: (key) => {
            if (key.slice(0, 2) === "__") {
                return true;
            }
            return false;
        },
    },
    _default: {
        space: 0,
    },
    config: (options = {}) => {
        _.assign(exports.CircularJSON._config, options);
    },
    parse: (creatorOptions) => {
        const options = _.defaults(creatorOptions || {}, {
            leaveRefIfUndefined: exports.CircularJSON._config.leaveRefIfUndefined,
            specialChar: exports.CircularJSON._config.specialChar,
        });
        return exports.CircularJSON.regenerate(JSON.parse(options.value), options.root);
    },
    regenerate: (data, root = data) => {
        const specialChar = exports.CircularJSON._config.specialChar;
        const leaveRefIfUndefined = exports.CircularJSON._config.leaveRefIfUndefined;
        const omitKeys = exports.CircularJSON._config.omitKeys;
        const seenObjects = [];
        const referRecursive = (currentData) => {
            _.forOwn(currentData, (value, key) => {
                if (omitKeys(key)) {
                    return;
                }
                if (typeof value === "object") {
                    const found = _.find(seenObjects, (object) => {
                        return object === value;
                    });
                    if (found) {
                        return;
                    }
                    seenObjects.push(value);
                    return referRecursive(value);
                }
                if (typeof value !== "string" || value.charAt(0) !== specialChar) {
                    return;
                }
                const path = value.split(specialChar);
                path.shift();
                if (path[0] === "") {
                    currentData[key] = root;
                    return;
                }
                currentData[key] = _.get(root, path);
                if (leaveRefIfUndefined && typeof currentData[key] === "undefined") {
                    currentData[key] = value;
                }
            });
            return currentData;
        };
        return referRecursive(data);
    },
    replace: (data) => {
        data = _.cloneDeep(data);
        const specialChar = exports.CircularJSON._config.specialChar;
        const seenObjectsDict = {
            [specialChar]: data,
        };
        let path = [""];
        const replaceRecursive = (currentData) => {
            _.forOwn(currentData, (value, key) => {
                if (typeof value !== "object") {
                    return;
                }
                const foundKey = _.findKey(seenObjectsDict, (object) => {
                    return object === value;
                });
                if (foundKey) {
                    currentData[key] = foundKey;
                }
                else {
                    const thisPath = `${path.join(specialChar)}${specialChar}${key}`;
                    seenObjectsDict[thisPath] = value;
                    const pathBefore = _.clone(path);
                    path.push(key);
                    currentData[key] = replaceRecursive(value);
                    path = pathBefore;
                }
            });
            return currentData;
        };
        return replaceRecursive(data);
    },
    stringify: (creatorOptions) => {
        const options = _.defaults(creatorOptions || {}, {
            space: exports.CircularJSON._default.space,
        });
        return JSON.stringify(exports.CircularJSON.replace(options.value), options.replacer, options.space);
    },
};
//# sourceMappingURL=index.js.map