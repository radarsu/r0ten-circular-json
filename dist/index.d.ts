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
export declare const CircularJSON: {
    _config: {
        leaveRefIfUndefined: boolean;
        specialChar: string;
    };
    _default: {
        space: number;
    };
    config: (options?: CircularJSONConfigQuery) => void;
    parse: (creatorOptions: CircularJSONParseOptions) => any;
    regenerate: (data: {}, root?: {}) => any;
    replace: (data: {}) => any;
    stringify: (creatorOptions: CircularJSONStringifyOptions) => string;
};
