import { DeepPartial, FindConditions, FindManyOptions, FindOneOptions, ObjectLiteral } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Vsix } from '../model/vsix';
import { VsixVersion } from '../model/vsixversion';

export interface Database {
    vsix: VsixDAO;
    vsixVersion: VsixVersionDAO;

    init(): Promise<void>;
}

export interface BasicDAO<T> {
    getAll(): Promise<T[]>;
    get(id: string, options?: FindOneOptions<T>): Promise<T | undefined>;
    exists(id: string): Promise<boolean>;
    update(id: string, partialValue: QueryDeepPartialEntity<T>): Promise<T | undefined>;
    delete(id: string): Promise<void>;
    create(value: QueryDeepPartialEntity<T>): Promise<ObjectLiteral[]>;
    save(value: DeepPartial<T>): Promise<T>;
    find(search: FindConditions<T> | FindManyOptions<T>): Promise<T[]>;
}

export interface VsixDAO extends BasicDAO<Vsix> {
}

export interface VsixVersionDAO extends BasicDAO<VsixVersion> {
}