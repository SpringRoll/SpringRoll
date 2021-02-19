import { BasePlugin } from '../base-plugins';

type DataFormat = {data: { name:any, value: any, type:string }, type: string};

export class UserData extends BasePlugin {
    constructor();
    open(): void;
    UserDataRemove($event: DataFormat): void;
    UserDataRead($event: DataFormat): void;
    UserDataWrite($event: DataFormat): void;

    IDBOpen(dbName: string, dbVersion: number | null, additions: object | null, deletions: object | null): void;
    IDBAdd(storeName: string, value: any, key: string | number): void;
    IDBUpdate(storeName: string, key: string | number, value: any): void;
    IDBRemove(storeName: string, key: string | number) : void;
    IDBRead(storeName: string, key: any): void;
    IDBReadAll(storeName: string, count: number): void;
    IDBGetVersion(dbName: string);
    closeDb(): void;
}