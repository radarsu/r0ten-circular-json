import * as _ from "lodash";

export interface CircularJSONConfig {
    specialChar?: string;
}

export interface CircularJSONStringifyOptions {
    value?: any;
    replacer?: (key: string, value: any) => any;
    space?: number;
}

export interface CircularJSONParseOptions {
    value?: any;
    root?: any;
    leaveRefIfUndefined?: boolean;
}

let replace = (data: any) => {

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
                path.push(key);
                currentData[key] = replaceRecursive(value);
            }
        });

        return currentData;
    };

    return replaceRecursive(data);
};

let refer = (data: any, root: any = data) => {

    let specialChar = CircularJSON._config.specialChar;
    let leaveRefIfUndefined = CircularJSON._config.leaveRefIfUndefined;

    let referRecursive = (currentData: any) => {
        _.forOwn(currentData, (value: any, key: string) => {
            if (typeof value === "object") {
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

            if (leaveRefIfUndefined) {
                currentData[key] = _.get(root, path) || value;
                return;
            }

            currentData[key] = _.get(root, path);
        });
        return currentData;
    };

    return referRecursive(data);
};

export const CircularJSON = {
    _config: {
        leaveRefIfUndefined: true,
        space: 0,
        specialChar: "~",
    },
    config: (options: CircularJSONConfig = {}) => {
        this._config = options;
    },
    parse: (creatorOptions: CircularJSONParseOptions = {}) => {
        let options = _.defaults(creatorOptions, {
            leaveRefIfUndefined: CircularJSON._config.leaveRefIfUndefined,
            specialChar: CircularJSON._config.specialChar,
        });
        return refer(JSON.parse(options.value), options.root);
    },
    stringify: (creatorOptions: CircularJSONStringifyOptions = {}) => {
        let options = _.defaults(creatorOptions, {
            space: CircularJSON._config.space,
            specialChar: CircularJSON._config.specialChar,
        });
        return JSON.stringify(replace(options.value), options.replacer, options.space);
    },
};
