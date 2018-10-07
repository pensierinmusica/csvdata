declare module 'csvdata' {
    export type Encoding = 'hex' |
                           'utf8' |
                           'ucs2' |
                           'ascii' |
                           'base64' |
                           'latin1' |
                           'binary' |
                           'utf16le'

    export type CSVData = string |
                          object |
                          string[] |
                          object[] |
                          string[][] 

    export interface LoadOptions {
        readonly log?: boolean;
        readonly parse?: boolean;
        readonly stream?: boolean;
        readonly objName?: boolean;
        readonly delimiter?: string;
        readonly encoding?: Encoding;
    }

    export interface WriteOptions {
        readonly log?: boolean;
        readonly empty?: boolean;
        readonly header?: boolean;
        readonly append?: boolean;
        readonly delimiter?: string;
        readonly encoding?: Encoding;
    }

    export interface CheckOptions {
        readonly log?: boolean;
        readonly limit?: boolean;
        readonly delimiter?: string;
        readonly encoding?: Encoding;
        readonly duplicates?: boolean;
        readonly emptyLines?: boolean;
    }

    /**
     * Reads the CSV data (the first line of the CSV file must contain headers)
     * 
     * @param filePath Where the CSV is stored
     * @param options Configurations to how to read this file
     * @returns The read data
     */
    export function load(filePath: string, options: LoadOptions): Promise<CSVData[]>;

    /**
     * Writes the data (be careful, as it overwrites existing files)
     * 
     * @param filePath Where the CSV will be stored
     * @param data What to write
     * @param options Configurations to how to write this file
     * @returns The same data that was sent to be written
     */
    export function write(filePath: string, data: CSVData, options?: WriteOptions): Promise<CSVData[]>;

    /**
     * Checks data integrity of the CSV file. It can look for missing, empty, and duplicate values within columns, or detect empty lines
     * 
     * @param filePath Where the CSV is stored
     * @param options Configurations to how to check this file
     * @returns Whether or not the file is like the specified way
     */
    export function check(filePath: string, options?: CheckOptions): Promise<Boolean>;
}
