import { DeepPartial, FindManyOptions, FindOneOptions, FindOptionsWhere, ObjectLiteral, QueryBuilder } from 'typeorm';
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
    get(options: FindOneOptions<T>): Promise<T | null>;
    exists(options: FindOneOptions<T> ): Promise<boolean>;
    update(options: FindOneOptions<T> & { where: FindOptionsWhere<T> }, partialValue: QueryDeepPartialEntity<T>): Promise<T | null>;
    delete(id: string): Promise<void>;
    create(value: QueryDeepPartialEntity<T>): Promise<ObjectLiteral[]>;
    save(value: DeepPartial<T>): Promise<T>;
    find(search: FindManyOptions<T>): Promise<T[]>;
    get builder(): QueryBuilder<T>;
}

export interface VsixDAO extends BasicDAO<Vsix> {
}

export interface VsixVersionDAO extends BasicDAO<VsixVersion> {
}