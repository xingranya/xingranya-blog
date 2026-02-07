---
title: Go 并发模式：Worker Pool + Context + 限流
date: "2026-02-06 12:30:00"
banner: 并发不是“起更多 goroutine”，而是“可控地并发”
cover: "https://images.unsplash.com/photo-1756575802474-b2348cef95c3?auto=format&fit=crop&w=1600&q=80&ixlib=rb-4.1.0"
categories:
  - 编程实践
tags:
  - Go
  - 并发
  - Context
  - 性能优化
---

Go 的并发很容易写出“能跑的版本”，但把并发写到**可控、可取消、不会泄漏 goroutine**，才是线上代码的分水岭。

这篇用三个最常用的积木，拼出一套可以直接复用的并发骨架：

- **Worker Pool**：控制并发数
- **Context**：统一取消与超时
- **限流**：保护下游与自己

![并发的关键是“布线”：谁生产、谁消费、何时停止](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80&ixlib=rb-4.1.0)

### 1) 先把目标说清楚：为什么要 Worker Pool

如果你对每个任务都 `go func(){...}`，在高峰期可能出现：

- goroutine 数暴涨
- 内存/调度开销上升
- 下游（DB/HTTP）被打爆

Worker Pool 的作用就是：**把并发数限定在可承受范围内**。

### 2) 一个可复用的 Worker Pool（带 Context 取消）

下面代码尽量保持“够用且好读”，并用简体中文注释说明关键点。

```go
package workerpool

import (
	"context"
	"sync"
)

// Task 表示一个可执行任务。
// 约定：任务必须尊重 ctx 的取消信号，避免 goroutine 泄漏。
type Task func(ctx context.Context) error

// RunWorkerPool 以固定并发数执行 tasks。
// - concurrency: 并发 worker 数量（建议按下游容量设置）
// - 返回值：只要有一个任务返回错误，就会触发取消，最终返回该错误
func RunWorkerPool(ctx context.Context, tasks []Task, concurrency int) error {
	if concurrency <= 0 {
		concurrency = 1
	}

	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	taskCh := make(chan Task)
	errCh := make(chan error, 1) // 只关心第一个错误

	var wg sync.WaitGroup
	worker := func() {
		defer wg.Done()
		for {
			select {
			case <-ctx.Done():
				return
			case t, ok := <-taskCh:
				if !ok {
					return
				}
				if err := t(ctx); err != nil {
					// 只投递第一个错误，并触发全局取消
					select {
					case errCh <- err:
					default:
					}
					cancel()
					return
				}
			}
		}
	}

	wg.Add(concurrency)
	for i := 0; i < concurrency; i++ {
		go worker()
	}

	// 投递任务（尊重取消）
	go func() {
		defer close(taskCh)
		for _, t := range tasks {
			select {
			case <-ctx.Done():
				return
			case taskCh <- t:
			}
		}
	}()

	wg.Wait()

	select {
	case err := <-errCh:
		return err
	default:
		return nil
	}
}
```

### 3) 限流：别让“成功的并发”变成“成功的事故”

最简单的限流方式之一：用 `time.Ticker` 做固定速率。

思路：

- 你允许每秒最多 N 次调用下游
- 每次调用前先“拿到一个 tick”

> 更复杂/更稳的限流建议用令牌桶（token bucket）等成熟实现，这里先强调思路。

### 4) 最容易踩的坑：goroutine 泄漏

常见原因：

- 生产者还在写 channel，但消费者已经退出
- 任务内部忽略 `ctx.Done()`，一直阻塞在 IO 上
- channel 没有按约定关闭，导致 worker 永远等不到结束

解决原则就一句话：

> **所有阻塞点都要能被 ctx 取消；所有 channel 都要有清晰的关闭责任。**

### 总结

Go 并发写得好，靠的不是“起很多 goroutine”，而是：

- 有上限（Worker Pool）
- 可停止（Context）
- 有保护（限流）

把这三个骨架用熟，你的并发代码基本就能稳定上线了。

> 封面与配图来自 Unsplash（免费使用授权）。

