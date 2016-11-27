import * as _ from "lodash";

export interface CircularJSONConfigQuery {
    specialChar?: string;
    leaveRefIfUndefined?: boolean;
}

export interface CircularJSONStringifyOptions {
    value: {};
    replacer?: (key: string, value: any) => any;
    space?: number;
}

export interface CircularJSONParseOptions {
    value: string;
    root?: {};
    leaveRefIfUndefined?: boolean;
}

export const CircularJSON = {
    _config: {
        leaveRefIfUndefined: true,
        specialChar: "~",
    },
    _default: {
        space: 0,
    },
    config: (options: CircularJSONConfigQuery = {}) => {
        _.assign(CircularJSON._config, options);
    },
    parse: (creatorOptions: CircularJSONParseOptions) => {
        let options = _.defaults(creatorOptions || {}, {
            leaveRefIfUndefined: CircularJSON._config.leaveRefIfUndefined,
            specialChar: CircularJSON._config.specialChar,
        });

        return CircularJSON.regenerate(JSON.parse(options.value), options.root);
    },
    // restore circular references from object
    regenerate: (data: {}, root: {} = data) => {

        let specialChar = CircularJSON._config.specialChar;
        let leaveRefIfUndefined = CircularJSON._config.leaveRefIfUndefined;

        let seenObjects: any[] = [];

        let referRecursive = (currentData: any) => {
            _.forOwn(currentData, (value: any, key: string) => {
                if (typeof value === "object") {
                    // check if object is in seenObjects
                    let found = _.find(seenObjects, (object: any) => {
                        return object === value;
                    });

                    // ignore seen objects
                    if (found) {
                        return;
                    }

                    // add to not seen objects
                    seenObjects.push(value);
                    return referRecursive(value);
                }

                // check if value ~like~this
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
                    // leave ref
                    currentData[key] = value;
                }
            });
            return currentData;
        };

        return referRecursive(data);

    },
    // just replace circular references with strings
    replace: (data: {}) => {

        data = _.cloneDeep(data);

        let specialChar = CircularJSON._config.specialChar;

        let seenObjectsDict = {
            [specialChar]: data,
        };

        let path: string[] = [""];

        let replaceRecursive = (currentData: any) => {
            _.forOwn(currentData, (value: any, key: string) => {
                if (typeof value !== "object") {
                    return;
                }

                // check if object is in seenObjects
                let foundKey = _.findKey(seenObjectsDict, (object: any) => {
                    return object === value;
                });

                if (foundKey) {
                    currentData[key] = foundKey;
                } else {
                    let thisPath = `${path.join(specialChar)}${specialChar}${key}`;

                    // not found - add it
                    seenObjectsDict[thisPath] = value;

                    // save previous path
                    let pathBefore = _.clone(path);
                    path.push(key);
                    currentData[key] = replaceRecursive(value);
                    // revert path
                    path = pathBefore;
                }
            });

            return currentData;
        };

        return replaceRecursive(data);
    },
    // replaces and stringifies
    stringify: (creatorOptions: CircularJSONStringifyOptions) => {
        let options = _.defaults(creatorOptions || {}, {
            space: CircularJSON._default.space,
        });
        return JSON.stringify(CircularJSON.replace(options.value), options.replacer, options.space);
    },
};
