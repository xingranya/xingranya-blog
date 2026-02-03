---
title: Shell 脚本编程入门
date: "2026-02-02 11:00:00"
banner: 自动化从写好第一个 Shell 脚本开始
cover: "https://img1.tucang.cc/api/image/show/69c1b8e72c22e056f50b82cb91bb6a1b"
categories:
  - 运维技术
tags:
  - Shell
  - 脚本
  - 自动化
---

想象一下这样的场景：每天都要备份一批文件，每周都要清理一次日志，每次部署新版本都要执行一长串命令...这些重复性的工作如果每次都手动输入，不仅浪费时间，还容易出错。这时候，Shell 脚本就来拯救你了！

今天我们就来学习如何用 Shell 脚本把这些繁琐的工作自动化。相信我，学会了这个，你的效率能提升好几个档次。

### Shebang 和基本结构

每个 Shell 脚本的第一行通常是 `shebang`，它告诉系统用哪个解释器来执行这个脚本。

```bash
#!/bin/bash
# 这是注释，用 # 开头的内容会被解释器忽略

echo "Hello, World!"
```

- `#!/bin/bash`：指定使用 bash 解释器
- `#`：注释符号，后面跟着的是注释内容
- `echo`：输出命令，把后面的内容打印到终端

保存为 `hello.sh` 后，需要给它执行权限才能运行：

```bash
chmod +x hello.sh      # 添加执行权限
./hello.sh             # 执行脚本
```

### 变量和数据类型

Shell 中的变量定义很简单，不需要声明类型。

```bash
#!/bin/bash

# 定义变量（注意：等号两边不能有空格）
name="星苒鸭"
age=18

# 使用变量（需要加上 $ 符号）
echo "我的名字是 $name"
echo "今年 $age 岁"

# 变量拼接
greeting="你好，$name！"
echo $greeting

# 只读变量
readonly PI=3.14
# PI=3.1415  # 这行会报错，因为只读变量不能修改

# 删除变量
unset name
echo $name  # 输出为空
```

> **注意**：Shell 中的变量默认都是字符串类型，即使你写 `age=18`，它也还是字符串。做数学运算时需要特殊处理。

### 条件判断

条件判断让脚本可以根据不同情况执行不同的操作。

```bash
#!/bin/bash

# if 语句的基本结构
age=20

if [ $age -ge 18 ]; then
    echo "你已经成年了"
else
    echo "你还是个未成年"
fi

# 多条件判断
score=85

if [ $score -ge 90 ]; then
    echo "优秀"
elif [ $score -ge 80 ]; then
    echo "良好"
elif [ $score -ge 60 ]; then
    echo "及格"
else
    echo "不及格"
fi

# 字符串比较
name="星苒"

if [ "$name" == "星苒" ]; then
    echo "欢迎回来，星苒！"
fi

# 文件判断
file="test.txt"

if [ -f "$file" ]; then
    echo "文件存在"
elif [ -d "$file" ]; then
    echo "这是一个目录"
else
    echo "文件或目录不存在"
fi
```

常用的判断操作符：

- 数值比较：`-eq`（等于）、`-ne`（不等于）、`-gt`（大于）、`-lt`（小于）、`-ge`（大于等于）、`-le`（小于等于）
- 字符串比较：`==`（等于）、`!=`（不等于）、`-z`（空字符串）、`-n`（非空字符串）
- 文件判断：`-f`（存在且是文件）、`-d`（存在且是目录）、`-e`（存在）、`-r`（可读）、`-w`（可写）

### 循环

循环让重复的工作变得简单。

**for 循环**

```bash
#!/bin/bash

# 遍历列表
for fruit in 苹果 香蕉 橙子; do
    echo "我喜欢吃 $fruit"
done

# 遍历数字序列
for i in {1..5}; do
    echo "数字: $i"
done

# C 风格的 for 循环
for ((i=1; i<=5; i++)); do
    echo "第 $i 次循环"
done

# 遍历文件
for file in *.txt; do
    echo "处理文件: $file"
done
```

**while 循环**

```bash
#!/bin/bash

# 基本的 while 循环
count=1
while [ $count -le 5 ]; do
    echo "计数: $count"
    count=$((count + 1))  # 算术运算的写法
done

# 读取文件内容
while IFS= read -r line; do
    echo "行内容: $line"
done < file.txt
```

### 函数定义与调用

函数可以把一段代码封装起来，方便重复使用。

```bash
#!/bin/bash

# 定义函数
greet() {
    echo "你好，$1！欢迎来到 Shell 脚本的世界。"
}

# 调用函数
greet "星苒"
greet "张三"

# 带返回值的函数
add() {
    local result=$(($1 + $2))
    echo $result
}

sum=$(add 10 20)
echo "10 + 20 = $sum"

# 带多个参数的函数
show_info() {
    echo "姓名: $1"
    echo "年龄: $2"
    echo "城市: $3"
}

show_info "李四" 25 "北京"
```

函数中的特殊变量：

- `$1, $2, $3...`：位置参数，代表传递给函数的参数
- `$#`：参数个数
- `$@`：所有参数
- `$?`：上一个命令的退出状态（0 表示成功）
- `local`：声明局部变量

### 实战案例：自动备份脚本

让我们把学到的知识整合起来，写一个实用的自动备份脚本。

```bash
#!/bin/bash
# 自动备份脚本
# 用法: ./backup.sh [源目录] [备份目录]

# 配置变量
SOURCE_DIR=${1:-"/var/www/html"}           # 源目录，默认为 /var/www/html
BACKUP_DIR=${2:-"/backup"}                  # 备份目录，默认为 /backup
DATE=$(date +"%Y%m%d_%H%M%S")               # 当前日期时间
BACKUP_NAME="backup_${DATE}.tar.gz"         # 备份文件名
LOG_FILE="/var/log/backup.log"              # 日志文件

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 检查源目录是否存在
if [ ! -d "$SOURCE_DIR" ]; then
    log "错误：源目录 $SOURCE_DIR 不存在！"
    exit 1
fi

# 创建备份目录（如果不存在）
if [ ! -d "$BACKUP_DIR" ]; then
    log "创建备份目录: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# 开始备份
log "开始备份 $SOURCE_DIR 到 $BACKUP_DIR/$BACKUP_NAME"

# 使用 tar 打包压缩
tar -czf "$BACKUP_DIR/$BACKUP_NAME" -C "$SOURCE_DIR" . 2>/dev/null

if [ $? -eq 0 ]; then
    log "备份成功！文件大小: $(du -h "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)"

    # 清理 7 天前的旧备份
    log "清理超过 7 天的旧备份..."
    find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +7 -delete

    log "备份任务完成"
else
    log "备份失败！请检查日志"
    exit 1
fi
```

把这个脚本保存为 `backup.sh`，然后你可以：

```bash
# 添加执行权限
chmod +x backup.sh

# 使用默认配置备份
./backup.sh

# 指定源目录和备份目录
./backup.sh /home/user/projects /home/user/backups

# 添加到 crontab 实现定时自动备份
# 每天凌晨 2 点执行备份
crontab -e
# 添加这一行：
# 0 2 * * * /path/to/backup.sh >> /var/log/backup_cron.log 2>&1
```

### 总结

Shell 脚本是 Linux 运维的必备技能，它能让你：

1. **自动化重复任务**：把日常操作写成脚本，一键执行
2. **批量处理文件**：循环和条件判断让批量处理变得简单
3. **系统集成**：可以调用各种系统命令和工具
4. **快速原型**：对于简单任务，写个脚本比写 Python/Go 更快

当然，Shell 脚本也有它的局限性：复杂逻辑处理起来比较吃力，性能不如编译型语言。但对于大多数运维自动化任务来说，它已经是绰绰有余了。

接下来你可以：

- 多练习写各种实用的小脚本
- 学习更高级的 Shell 技巧（如信号处理、并发等）
- 探索 `awk` 和 `sed` 这两个强大的文本处理工具
- 了解 `crontab` 定时任务，实现真正的自动化

记住，最好的学习方式就是动手实践。找个实际的问题，试着用脚本解决它，你会发现 Shell 脚本真的很有趣！
