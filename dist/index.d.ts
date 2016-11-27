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
export declare const CircularJSON: {
    _config: {
        leaveRefIfUndefined: boolean;
        space: number;
        specialChar: string;
    };
    config: (options?: CircularJSONConfig) => void;
    parse: (creatorOptions?: CircularJSONParseOptions) => any;
    stringify: (creatorOptions?: CircularJSONStringifyOptions) => string;
};
