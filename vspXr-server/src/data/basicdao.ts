import { DeepPartial, EntityManager, EntityTarget, FindManyOptions, FindOneOptions, FindOptionsWhere, getConnection, ObjectLiteral, QueryBuilder, Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { BasicDAO as InterfaceDAO } from "./database";

export class BasicDAO<T> implements InterfaceDAO<T> {
    private manager: EntityManager | undefined;

    protected get repo(): Repository<T> {
        if (this.manager) {
            const repository = this.manager.getRepository<T>(this.repoType);
            this.manager = undefined;
            return repository;
        }

        return getConnection().getRepository<T>(this.repoType);
    }

    setEntityManager(manager: EntityManager): this {
        this.manager = manager;
        return this;
    }

    constructor(private repoType: EntityTarget<T>) {
    }

    async exists(options: FindOneOptions<T>): Promise<boolean> {
        return !!await this.get(options);
    }

    async create(entity: QueryDeepPartialEntity<T>): Promise<ObjectLiteral[]> {
        const result = await this.repo.insert(entity);
        return result.identifiers;
    }

    async save(entity: DeepPartial<T>): Promise<T> {
        return this.repo.save(entity);
    }

    async getAll(): Promise<T[]> {
        return this.repo.find();
    }

    async get(options: FindOneOptions<T>): Promise<T | null> {
        return this.repo.findOne(options);
    }

    async update(options: FindOneOptions<T> & { where: FindOptionsWhere<T> }, entity: QueryDeepPartialEntity<T>): Promise<T | null> {
        await this.repo.update(options.where, entity);
        return this.get(options);
    }

    async delete(id: string): Promise<void> {
        await this.repo.delete(id);
    }

    async find(value: FindManyOptions<T>): Promise<T[]> {
        return this.repo.find(value)
    }

    get builder(): QueryBuilder<T> {
        return this.repo.createQueryBuilder();
    }
}