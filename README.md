# mongoose-ultimate-redis-cache
Ultimate Redis cache for Mongoose/MongoDB

## Installation
`npm install --save mongoose-ultimate-redis-cache`

## Usage
### Setup
```js
const mongoose = require('mongoose')
const mongooseRedisCacheSetup = require('mongoose-ultimate-redis-cache').default

mongooseRedisCacheSetup(mongoose, {
  redisServer: 'redis://localhost:6379'
})
```
### Caching
```js
MyModel.findById("my-long-id")
  .cache(30)
  .then(myResult => {
    console.log(myResult)
  })
```
If the `.cache` function receives a number as argument, it will be the value of the cache TTL, or you can pass an object containg the options listed below. In the example above it will set a TTL of 30 seconds for that particular cache.

Example using object as argument:
```js
MyModel.findById("my-long-id")
  .cache({
    ttl: 30,
    ttlExtend: true
  })
  .then(myResult => {
    console.log(myResult)
  })
```

Another example:
```js
MyModel.findById("my-long-id")
  .cache({
    ttl: 30,
    key: `my-custom-cache-key`
  })
  .then(myResult => {
    console.log(myResult)
  })
```

Using the helper function `purgeCacheKey` you can remove a previously set cache key from the cache:
```js
MyModel.purgeCacheKey('my-custom-cache-key')
```

## Options
### Setup options
| Option  | Type | Description |
|-|-|-|
| `redisServer` | `string` | The server URI |
| `defaultTTL` | `number` | Default TTL in seconds. Default value is `60`  |

### Caching options
| Option | Type | Description |
|-|-|-|
| `ttl` | `number` | Cache TTL |
| `key` | `string` | Custom cache key |
| `flag` | `boolean`/`string` | Adds a field into the result/resultset flagging if the result comes from cache. If the value is a string, it will be the name of the field. Default field name is `cache` |
| `ttlExtend` | `boolean` | Resets the cache TTL every time it's queried. |

## Helpers
### `MyModel.purgeCacheKey(key)`
This function is present in any mongoose model and it can be used to purge a specific cache value using it's key

## License - MIT
Copyright 2020 Evandro Araújo

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
