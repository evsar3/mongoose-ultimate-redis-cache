/* eslint-disable new-cap */

import { createHash } from 'crypto'
import { promisify } from 'util'
import { Query, Document, QueryCursor } from 'mongoose'
import { createClient as createRedisClient } from 'redis'

const DEFAULT_TTL = 60

export interface IMongooseRedisOptions {
  redisServer: string
  defaultTTL?: number
}

export interface IMongooseCacheOptions {
  ttl?: number
  key?: string
  flag?: boolean | string
  ttlExtend?: boolean
}

export default function mongooseRedisCacheSetup (mongoose: any, options: IMongooseRedisOptions): void {
  const mainOptions: IMongooseRedisOptions = {
    ...{
      defaultTTL: DEFAULT_TTL
    },
    ...options
  }

  const originalExec = mongoose.Query.prototype.exec
  const redisClient = createRedisClient(mainOptions.redisServer)
  const redisClientGet = promisify(redisClient.get).bind(redisClient)

  mongoose.Query.prototype.cache = function (options?: IMongooseCacheOptions | number): Query<any> {
    this._cacheEnabled = true
    this._ttl = mainOptions.defaultTTL
    this._key = null

    if (typeof options === 'number') {
      this._ttl = options
    } else if (options !== undefined) {
      this._ttl = options.ttl ?? mainOptions.defaultTTL
      this._key = options.key
      this._ttlExtend = options.ttlExtend
      this._flag = typeof options.flag === 'boolean'
        ? options.flag
          ? 'cache'
          : undefined
        : options.flag
    }

    return this
  }

  mongoose.Query.prototype.exec = async function (): Promise<QueryCursor<Document>> {
    if (this._cacheEnabled !== true) {
      return originalExec.apply(this, arguments)
    }

    const key = this._key ?? createHash('md5').update(JSON.stringify({
      ...{
        name: this._collection.collectionName,
        conditions: this._conditions,
        fields: this._fields,
        options: this._options
      }
    })).digest('hex')

    const cachedResult = await redisClientGet(key)

    if (cachedResult !== null) {
      const result: Object | Object[] = JSON.parse(cachedResult)

      if (this._ttlExtend === true) {
        redisClient.set(key, cachedResult, 'EX', this._ttl)
      }

      let models = []

      if (Array.isArray(result)) {
        result.forEach(item => {
          const model = new this.model(item)

          model[this._flag] = true

          models.push(model)
        })
      } else {
        const model = new this.model(result)

        model[this._flag] = true

        models = model
      }

      return models
    }

    const result = await originalExec.apply(this, arguments)

    if (result !== null) {
      redisClient.set(key, JSON.stringify(result), 'EX', this._ttl)
    }

    return result
  }

  mongoose.Model.purgeCacheKey = function (key: string): void {
    redisClient.del(key)
  }
}
