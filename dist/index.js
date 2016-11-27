"use strict";
const _ = require("lodash");
exports.CircularJSON = {
    _config: {
        leaveRefIfUndefined: true,
        specialChar: "~",
    },
    _default: {
        space: 0,
    },
    config: (options = {}) => {
        _.assign(exports.CircularJSON._config, options);
    },
    parse: (creatorOptions) => {
        let options = _.defaults(creatorOptions || {}, {
            leaveRefIfUndefined: exports.CircularJSON._config.leaveRefIfUndefined,
            specialChar: exports.CircularJSON._config.specialChar,
        });
        return exports.CircularJSON.regenerate(JSON.parse(options.value), options.root);
    },
    regenerate: (data, root = data) => {
        let specialChar = exports.CircularJSON._config.specialChar;
        let leaveRefIfUndefined = exports.CircularJSON._config.leaveRefIfUndefined;
        let referRecursive = (currentData) => {
            _.forOwn(currentData, (value, key) => {
                if (typeof value === "object") {
                    return referRecursive(value);
                }
                if (typeof value !== "string" || value.charAt(0) !== specialChar) {
                    return;
                }
                let path = value.split(specialChar);
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
        let specialChar = exports.CircularJSON._config.specialChar;
        let seenObjectsDict = {
            [specialChar]: data,
        };
        let path = [""];
        let replaceRecursive = (currentData) => {
            _.forOwn(currentData, (value, key) => {
                if (typeof value !== "object") {
                    return;
                }
                let foundKey = _.findKey(seenObjectsDict, (object) => {
                    return object === value;
                });
                if (foundKey) {
                    currentData[key] = foundKey;
                }
                else {
                    let thisPath = `${path.join(specialChar)}${specialChar}${key}`;
                    seenObjectsDict[thisPath] = value;
                    let pathBefore = _.clone(path);
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
        let options = _.defaults(creatorOptions || {}, {
            space: exports.CircularJSON._default.space,
        });
        return JSON.stringify(exports.CircularJSON.replace(options.value), options.replacer, options.space);
    },
};
//# sourceMappingURL=index.js.map