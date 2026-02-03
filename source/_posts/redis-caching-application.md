---
title: Redis 缓存应用实战
date: "2026-02-02 15:00:00"
banner: 让你的接口飞起来——Redis 缓存的魔法
cover: "https://img1.tucang.cc/api/image/show/e214b30dbc809f94bd3c562238a27b80"
categories:
  - 运维技术
tags:
  - Redis
  - 缓存
  - 数据库
---

当你的网站用户量从 10 个增长到 10 万个，数据库查询逐渐成为瓶颈时，你会怎么办？加更多数据库服务器？优化 SQL 查询？这些办法有用，但还有一个更简单高效的方案——使用 Redis 缓存。

今天我们就来聊聊 Redis，这个能让你的接口性能提升好几个档次的神奇工具。

### Redis 简介与应用场景

Redis（Remote Dictionary Server，远程字典服务器）是一个开源的内存数据结构存储系统，可以用作数据库、缓存和消息代理。

**为什么选择 Redis？**

- **极快的速度**：基于内存操作，读写速度可达 10 万次/秒
- **丰富的数据类型**：不只是简单的 key-value，还支持列表、集合、有序集合等
- **持久化支持**：可以定期保存到磁盘，重启后数据不丢失
- **分布式支持**：支持主从复制、哨兵、集群等高可用方案

**典型应用场景**

| 场景     | 说明                         |
| -------- | ---------------------------- |
| 缓存     | 缓存热点数据，减轻数据库压力 |
| 会话存储 | 存储用户登录状态、购物车等   |
| 排行榜   | 利用有序集合实现实时排名     |
| 计数器   | 文章阅读数、点赞数等         |
| 分布式锁 | 防止并发操作冲突             |
| 消息队列 | 简单的发布订阅、列表队列     |

### 五大基础数据类型

Redis 支持五种基本数据类型，每种都有其特定的应用场景。

#### 1. String（字符串）

最基本的数据类型，可以存储任何类型的字符串（包括二进制数据）。

```bash
# 设置和获取
SET user:1001 "张三"
GET user:1001

# 设置过期时间（秒）
SET session:abc123 "user_data" EX 3600

# 只有当 key 不存在时才设置（分布式锁常用）
SET lock:order "locked" NX EX 10

# 批量操作
MSET user:1001:name "张三" user:1001:age 25 user:1001:city "北京"
MGET user:1001:name user:1001:age

# 数值操作
SET views:1001 0
INCR views:1001           # 自增 1
INCRBY views:1001 10      # 自增 10
DECR views:1001           # 自减 1
```

#### 2. Hash（哈希）

适合存储对象，一个 key 对应多个字段。

```bash
# 存储用户信息
HSET user:1001 name "张三" age 25 city "北京"

# 获取字段
HGET user:1001 name
HGETALL user:1001          # 获取所有字段

# 字段操作
HINCRBY user:1001 age 1    # age 字段自增 1
HEXISTS user:1001 email    # 检查字段是否存在

# 删除字段
HDEL user:1001 city
```

#### 3. List（列表）

有序的字符串集合，可以重复。

```bash
# 左侧推入（LPUSH）和右侧推入（RPUSH）
LPUSH messages "你好" "世界"          # 创建列表
RPUSH messages "欢迎使用 Redis"

# 获取列表元素
LRANGE messages 0 -1                 # 获取所有元素
LINDEX messages 0                    # 获取第一个元素
LLEN messages                        # 列表长度

# 弹出元素
LPOP messages                        # 弹出最左边的元素
RPOP messages                        # 弹出最右边的元素

# 阻塞弹出（实现简单消息队列）
BLPOP queue 0                       # 阻塞等待，直到有数据
```

#### 4. Set（集合）

无序的唯一字符串集合，适合做去重和交集运算。

```bash
# 添加元素
SADD tags:1001 "技术" "编程" "Redis"

# 获取所有元素
SMEMBERS tags:1001

# 检查是否存在
SISMEMBER tags:1001 "Redis"

# 集合运算
SADD set1 1 2 3 4
SADD set2 3 4 5 6
SINTER set1 set2        # 交集: 3, 4
SUNION set1 set2        # 并集: 1, 2, 3, 4, 5, 6
SDIFF set1 set2         # 差集: 1, 2

# 随机获取
SRANDMEMBER tags:1001   # 随机获取一个元素
SPOP tags:1001          # 随机弹出一个元素
```

#### 5. Sorted Set（有序集合）

类似 Set，但每个元素关联一个分数，按分数排序。适合做排行榜。

```bash
# 添加成员（分数在前，成员在后）
ZADD rank:score 100 "张三" 95 "李四" 88 "王五"

# 获取排名（从低到高）
ZRANGE rank:score 0 -1            # 所有成员
ZRANGE rank:score 0 -1 WITHSCORES # 带分数
ZREVRANGE rank:score 0 2         # 前三名（从高到低）

# 获取排名信息
ZSCORE rank:score "张三"          # 获取分数
ZRANK rank:score "张三"           # 获取排名（从0开始）
ZREVRANK rank:score "张三"        # 获取排名（倒序）

# 分数操作
ZINCRBY rank:score 5 "张三"       # 分数加5
ZCOUNT rank:score 90 100         # 分数在 90-100 之间的数量
```

### 持久化机制

Redis 是内存数据库，但提供了两种持久化方式，防止重启后数据丢失。

**RDB（快照持久化）**

```bash
# Redis 配置
save 900 1          # 900 秒内至少 1 个 key 变化则保存
save 300 10         # 300 秒内至少 10 个 key 变化则保存
save 60 10000       # 60 秒内至少 10000 个 key 变化则保存

# 手动触发
BGSAVE             # 后台异步保存
SAVE               # 同步保存（会阻塞）
```

RDB 特点：

- 文件紧凑，适合备份
- 恢复速度快
- 可能丢失最后一次快照后的数据

**AOF（追加文件）**

```bash
# Redis 配置
appendonly yes                    # 启用 AOF
appendfsync everysec              # 每秒同步一次
appendfsync always                # 每次操作都同步
appendfsync no                    # 由操作系统决定
```

AOF 特点：

- 数据更安全，丢失数据更少
- 文件较大，恢复较慢
- 可以重写压缩文件

**混合持久化（推荐）**

```bash
# Redis 4.0+ 支持
aof-use-rdb-preamble yes
```

结合 RDB 和 AOF 的优点：AOF 文件开头用 RDB 格式，后面是 AOF 格式。

### 分布式锁实现

在分布式系统中，经常需要防止多个进程同时操作同一个资源。Redis 可以用来实现分布式锁。

```bash
# 获取锁（SET NX EX）
# NX: key 不存在时才设置
# EX: 设置过期时间（秒）
SET lock:order "unique_identifier" NX EX 10

# 释放锁（Lua 脚本保证原子性）
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
```

**Node.js 实现**

```javascript
const redis = require("redis");
const client = redis.createClient();

class RedisLock {
  constructor(key, ttl = 10) {
    this.key = `lock:${key}`;
    this.ttl = ttl;
    this.identifier = `${Date.now()}_${Math.random()}`;
  }

  // 获取锁
  async acquire() {
    const result = await client.set(
      this.key,
      this.identifier,
      "NX",
      "EX",
      this.ttl,
    );
    return result === "OK";
  }

  // 释放锁
  async release() {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    await client.eval(script, 1, this.key, this.identifier);
  }
}

// 使用示例
async function processOrder(orderId) {
  const lock = new RedisLock(`order:${orderId}`);

  if (await lock.acquire()) {
    try {
      // 处理订单逻辑
      console.log("处理订单:", orderId);
    } finally {
      await lock.release();
    }
  } else {
    console.log("获取锁失败，订单正在处理中");
  }
}
```

### 缓存穿透/击穿/雪崩

这是使用缓存时常见的三个问题。

**缓存穿透**

问题描述：查询一个不存在的数据，缓存和数据库都没有，每次都打到数据库。

解决方案：

```javascript
// 1. 布隆过滤器（提前判断 key 是否可能存在）
// 2. 缓存空值（短时间）
async function getUser(userId) {
  const key = `user:${userId}`;

  // 查缓存
  let user = await redis.get(key);
  if (user === "NULL") return null; // 空值标记
  if (user) return JSON.parse(user);

  // 查数据库
  user = await db.query("SELECT * FROM users WHERE id = ?", [userId]);

  if (user) {
    await redis.set(key, JSON.stringify(user), "EX", 3600);
  } else {
    // 缓存空值，防止穿透
    await redis.set(key, "NULL", "EX", 60);
  }

  return user;
}
```

**缓存击穿**

问题描述：某个热点 key 过期瞬间，大量请求直接打到数据库。

解决方案：

```javascript
// 1. 热点数据永不过期
// 2. 互斥锁
async function getHotData(key) {
  let data = await redis.get(key);

  if (data) return JSON.parse(data);

  // 获取锁
  const lock = new RedisLock(`lock:${key}`);
  if (await lock.acquire()) {
    try {
      // 双重检查
      data = await redis.get(key);
      if (data) return JSON.parse(data);

      // 从数据库加载
      data = await db.query("...");
      await redis.set(key, JSON.stringify(data), "EX", 3600);
      return data;
    } finally {
      await lock.release();
    }
  }

  // 等待后重试
  await sleep(100);
  return getHotData(key);
}
```

**缓存雪崩**

问题描述：大量 key 同时失效，请求全部打到数据库。

解决方案：

```javascript
// 1. 过期时间加随机值
const expireTime = 3600 + Math.random() * 600; // 3600~4200 秒
await redis.set(key, data, "EX", expireTime);

// 2. 多级缓存（本地缓存 + Redis）
// 3. 缓存预热（系统启动时加载热点数据）
```

### 实战案例：使用 Redis 优化接口性能

假设有一个获取文章详情的接口，每次都查询数据库，响应时间约 200ms。

```javascript
const redis = require("redis");
const client = redis.createClient();

// 未优化：每次查数据库
async function getArticle(articleId) {
  const article = await db.query("SELECT * FROM articles WHERE id = ?", [
    articleId,
  ]);
  return article;
}

// 优化后：使用缓存
async function getArticleCached(articleId) {
  const key = `article:${articleId}`;

  // 1. 先查缓存
  const cached = await client.get(key);
  if (cached) {
    console.log("从缓存获取");
    return JSON.parse(cached);
  }

  // 2. 缓存未命中，查数据库
  console.log("从数据库获取");
  const article = await db.query("SELECT * FROM articles WHERE id = ?", [
    articleId,
  ]);

  // 3. 写入缓存
  await client.set(key, JSON.stringify(article), "EX", 3600);

  return article;
}

// 带互斥锁的版本（防止缓存击穿）
async function getArticleWithLock(articleId) {
  const key = `article:${articleId}`;
  const lockKey = `lock:${articleId}`;

  const cached = await client.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // 尝试获取锁
  const lockAcquired = await client.set(lockKey, "1", "NX", "EX", 10);

  if (lockAcquired) {
    try {
      // 双重检查
      const doubleCheck = await client.get(key);
      if (doubleCheck) {
        return JSON.parse(doubleCheck);
      }

      // 从数据库获取
      const article = await db.query("SELECT * FROM articles WHERE id = ?", [
        articleId,
      ]);

      // 写入缓存
      await client.set(key, JSON.stringify(article), "EX", 3600);

      return article;
    } finally {
      await client.del(lockKey);
    }
  } else {
    // 获取锁失败，等待后重试
    await new Promise((resolve) => setTimeout(resolve, 100));
    return getArticleWithLock(articleId);
  }
}
```

### 总结

Redis 是一个强大而灵活的缓存工具，掌握它能带来：

1. **性能提升**：从数据库查询到内存缓存，性能提升 10-100 倍
2. **减轻数据库压力**：热点数据缓存，减少数据库负载
3. **支持复杂场景**：排行榜、计数器、分布式锁等
4. **简单易用**：丰富的客户端库，学习成本低

关键知识点回顾：

- **数据类型**：String、Hash、List、Set、Sorted Set
- **持久化**：RDB 快照、AOF 日志、混合模式
- **常见问题**：缓存穿透、击穿、雪崩及解决方案
- **最佳实践**：合理设置过期时间、使用互斥锁、多级缓存

接下来你可以探索：

- Redis 主从复制和哨兵
- Redis 集群搭建
- Redis 事务和管道
- Redis 发布订阅

记住，缓存虽好，但也不要滥用。不是所有数据都需要缓存，合理使用才是王道！
