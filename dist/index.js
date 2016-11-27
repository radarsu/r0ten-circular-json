"use strict";
const _ = require("lodash");
let replace = (data) => {
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
};
let refer = (data, root = data) => {
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
};
exports.CircularJSON = {
    _config: {
        leaveRefIfUndefined: true,
        space: 0,
        specialChar: "~",
    },
    config: (options = {}) => {
        this._config = options;
    },
    parse: (creatorOptions) => {
        let options = _.defaults(creatorOptions || {}, {
            leaveRefIfUndefined: exports.CircularJSON._config.leaveRefIfUndefined,
            specialChar: exports.CircularJSON._config.specialChar,
        });
        if (typeof options.value !== "string") {
            options.value = exports.CircularJSON.stringify({
                value: options.value,
            });
        }
        return refer(JSON.parse(options.value), options.root);
    },
    stringify: (creatorOptions) => {
        let options = _.defaults(creatorOptions || {}, {
            space: exports.CircularJSON._config.space,
            specialChar: exports.CircularJSON._config.specialChar,
        });
        return JSON.stringify(replace(options.value), options.replacer, options.space);
    },
};
//# sourceMappingURL=index.js.map