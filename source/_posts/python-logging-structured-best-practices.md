---
title: Python 日志最佳实践：从 print 到结构化
date: "2026-02-06 11:30:00"
banner: 让日志可搜索、可聚合、可定位，而不是“刷屏”
cover: "https://images.unsplash.com/photo-1627399270231-7d36245355a9?auto=format&fit=crop&w=1600&q=80&ixlib=rb-4.1.0"
categories:
  - 编程实践
tags:
  - Python
  - 日志
  - 工程化
  - 可观测性
---

很多项目早期都靠 `print()` 走天下：能看到输出就行。但当你把服务放到服务器/容器里，问题会立刻变成：

- 日志太多，**查不到关键行**
- 多进程/多实例，**不知道是哪台机器出的错**
- 没有 request_id，**一条链路串不起来**

这篇用标准库 `logging` 给你一套“够用且可扩展”的日志方案。

![代码会撒谎，但日志不会（前提是你写对了）](https://images.unsplash.com/photo-1541728472741-03e45a58cf88?auto=format&fit=crop&w=1600&q=80&ixlib=rb-4.1.0)

### 1) 日志的目标：可定位、可聚合、可追踪

建议你至少做到：

- **分级**：debug/info/warning/error/critical
- **结构化**：字段化（service、env、request_id、user_id…）
- **可切割**：按天/按大小滚动（不把磁盘写爆）

### 2) 一个可直接用的 logging 配置（推荐 dictConfig）

```python
"""
日志配置：示例为单进程/单实例的通用写法。
在容器环境中更推荐把日志打到 stdout，让平台收集。
"""

from __future__ import annotations

import logging
import logging.config


def setup_logging(level: str = "INFO") -> None:
    """初始化全局日志配置（建议在程序入口调用一次）。"""
    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": (
                    "%(asctime)s %(levelname)s "
                    "[%(name)s] %(message)s"
                )
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "default",
            }
        },
        "root": {
            "handlers": ["console"],
            "level": level,
        },
    }

    logging.config.dictConfig(logging_config)
```

### 3) 结构化日志：把“关键信息”变成字段

最简单的方式：用 `extra` 注入字段，再在 formatter 里输出。

```python
import logging

logger = logging.getLogger("api")

def log_request(request_id: str, path: str) -> None:
    """记录请求入口日志（示例）。"""
    logger.info(
        "request_in",
        extra={"request_id": request_id, "path": path},
    )
```

但注意：标准 formatter 默认不会输出 `extra` 字段。工程上更常见的做法是 **JSON 日志**（方便日志平台解析）。

如果你不想引入太多依赖，可以先把核心字段拼成 JSON 字符串（最小可用）：

```python
import json
import logging

logger = logging.getLogger("api")

def log_json(event: str, **fields: object) -> None:
    """输出 JSON 日志（简化版）。"""
    payload = {"event": event, **fields}
    logger.info(json.dumps(payload, ensure_ascii=False))
```

### 4) 经验法则：哪些信息一定要打

建议最少包含：

- **event**：事件名（比如 request_in / db_error）
- **request_id**：一次请求贯穿全链路
- **latency_ms**：耗时（慢请求必备）
- **status / error_code**：状态码或业务错误码
- **service / env**：服务名、环境（dev/stage/prod）

### 5) 反模式：别这样写日志

- 在循环里每条都 `info`（高 QPS 下会把 IO 打满）
- 把异常吞掉：

```python
try:
    ...
except Exception:
    logger.exception("unexpected_error")  # ✅ 记录堆栈
    raise                               # ✅ 继续抛出，别默默失败
```

- 把敏感信息（token/密码/私钥）写进日志（非常危险）

### 总结

日志是线上排障的“时间机器”。你越早把它做成结构化、可聚合、可追踪，越不容易在深夜靠“猜”救火。

> 封面与配图来自 Unsplash（免费使用授权）。

