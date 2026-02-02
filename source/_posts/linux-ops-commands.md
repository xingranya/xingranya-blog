---
title: Linux 运维命令详解
date: 2026-02-02 10:00:00
banner: "掌握这些命令，服务器管理不再头大"
cover: /images/main_bg.jpg
tags:
  - Linux
  - 运维
  - 命令行
---

当你第一次面对那个黑乎乎的终端窗口，是不是感觉无从下手？别担心，今天我就来带你了解那些服务器运维中最常用的 Linux 命令。掌握了这些，你就能像个真正的黑客一样（咳咳，是运维工程师）在服务器上纵横驰骋啦。

### 文件管理命令

首先，我们来说说文件管理。这可是日常操作中使用频率最高的命令了。

**`ls` - 列出目录内容**

```bash
ls                    # 列出当前目录的文件和文件夹
ls -l                 # 以详细信息（长格式）列出
ls -la                # 显示所有文件（包括隐藏文件）的详细信息
ls -lh                # 以人类可读的格式显示文件大小（如 1K、234M、2G）
```

**`cd` - 切换目录**

```bash
cd /home              # 切换到 /home 目录
cd ..                 # 返回上一级目录
cd ~                  # 切换到当前用户的家目录
cd -                  # 切换到上一次所在的目录
```

**`pwd` - 显示当前目录**

```bash
pwd                   # 显示当前所在的工作目录
```

**`mkdir` - 创建目录**

```bash
mkdir myfolder        # 创建一个名为 myfolder 的目录
mkdir -p a/b/c        # 递归创建多级目录
```

**`rm` - 删除文件或目录**

```bash
rm file.txt           # 删除文件
rm -r folder          # 递归删除目录及其内容
rm -rf folder         # 强制递归删除（慎用！一旦删除无法恢复）
```

> **警告**：`rm -rf` 是一把双刃剑，用好了效率翻倍，用不好了...你懂得。执行前务必确认路径，别把自己辛苦写的代码给删了哈哈哈哈。

**`cp` - 复制文件或目录**

```bash
cp file1.txt file2.txt        # 复制文件
cp -r folder1 folder2         # 递归复制目录
cp -p file1.txt file2.txt     # 复制时保留文件属性
```

**`mv` - 移动或重命名文件**

```bash
mv file1.txt file2.txt        # 重命名文件
mv file.txt /home/            # 移动文件到 /home 目录
```

**`find` - 查找文件**

```bash
find . -name "*.log"          # 在当前目录查找所有 .log 文件
find / -name "nginx.conf"     # 在整个系统中查找 nginx.conf
find . -type f -mtime -7      # 查找 7 天内修改过的文件
```

### 权限管理命令

Linux 的权限系统是其安全性的基石，理解它很重要。

**`chmod` - 修改文件权限**

```bash
chmod 755 script.sh           # 设置权限为 rwxr-xr-x
chmod +x script.sh            # 添加执行权限
chmod u+x,g+r file.txt        # 用户添加执行权限，组添加读权限
```

权限数字的含义：
- 4 = 读权限（r）
- 2 = 写权限（w）
- 1 = 执行权限（x）

所以 755 就是：所有者(4+2+1=7)读写执行，组用户(4+1=5)读执行，其他人(4+1=5)读执行。

**`chown` - 修改文件所有者**

```bash
chown user file.txt           # 将文件所有者改为 user
chown user:group file.txt     # 同时修改所有者和组
chown -R user:group /var/www  # 递归修改目录及其内容的所有者
```

**`chgrp` - 修改文件所属组**

```bash
chgrp staff file.txt          # 将文件所属组改为 staff
```

### 进程管理命令

服务器上跑着什么程序？怎么关掉卡死的进程？这些命令告诉你答案。

**`ps` - 查看进程**

```bash
ps aux               # 查看所有进程的详细信息
ps -ef               # 另一种查看所有进程的方式
ps aux | grep nginx  # 查找 nginx 相关进程
```

**`top` / `htop` - 实时监控系统状态**

```bash
top                  # 实时显示进程信息（按 q 退出）
htop                 # 更友好的交互式进程管理器（需要安装）
```

**`kill` - 结束进程**

```bash
kill 1234                    # 优雅地结束 PID 为 1234 的进程
kill -9 1234                 # 强制结束进程（慎用）
killall nginx                # 结束所有 nginx 进程
pkill -f "python script.py"  # 根据命令名匹配并结束进程
```

**`systemctl` - 服务管理**

```bash
systemctl status nginx       # 查看 nginx 服务状态
systemctl start nginx        # 启动 nginx 服务
systemctl stop nginx         # 停止 nginx 服务
systemctl restart nginx      # 重启 nginx 服务
systemctl enable nginx       # 设置开机自启
systemctl disable nginx      # 禁用开机自启
```

### 网络命令

网络问题排查是运维工作的重头戏。

**`ping` - 测试网络连通性**

```bash
ping google.com              # 测试与 google.com 的连通性
ping -c 4 8.8.8.8            # 只发送 4 个 ping 包
```

**`curl` - 发送 HTTP 请求**

```bash
curl https://api.example.com                    # 发送 GET 请求
curl -X POST -d "name=value" https://api.example.com  # 发送 POST 请求
curl -I https://example.com                     # 只查看响应头
curl -o file.jpg https://example.com/image.jpg  # 下载文件
```

**`wget` - 下载文件**

```bash
wget https://example.com/file.zip              # 下载文件
wget -c https://example.com/file.zip           # 断点续传
wget -r https://example.com/                   # 递归下载整个网站
```

**`netstat` / `ss` - 查看网络连接**

```bash
netstat -tuln                   # 查看监听的端口
netstat -tulnp                  # 显示进程信息
ss -tulnp                       # 更快的替代命令
lsof -i :80                     # 查看占用 80 端口的进程
```

**`ssh` - 远程登录**

```bash
ssh user@192.168.1.100          # 登录远程服务器
ssh -p 2222 user@example.com    # 指定端口登录
ssh -i ~/.ssh/key.pem user@host # 使用密钥登录
```

### 日志查看命令

排查问题的时候，日志是你的好朋友。

**`tail` - 查看文件末尾**

```bash
tail -f /var/log/nginx/access.log    # 实时追踪日志（最常用！）
tail -n 100 /var/log/syslog          # 查看最后 100 行
tail -n +50 file.txt                 # 从第 50 行开始显示
```

**`grep` - 文本搜索**

```bash
grep "error" /var/log/nginx/error.log           # 搜索包含 error 的行
grep -i "error" /var/log/nginx/error.log        # 忽略大小写搜索
grep -v "debug" /var/log/app.log                # 排除包含 debug 的行
grep "500" /var/log/nginx/access.log | tail -20 # 组合使用：搜索 500 错误并显示最后 20 行
```

**`less` - 分页查看文件**

```bash
less /var/log/syslog           # 分页查看日志（/ 向下搜索，? 向上搜索，q 退出）
less +F /var/log/syslog        # 类似 tail -f 的实时追踪模式
```

### 总结

Linux 命令就像是一套瑞士军刀，每个命令都有其特定的用途。刚开始可能会觉得多而杂，但随着使用次数的增加，你会越来越顺手。记住几个要点：

1. **善用 `man` 命令**：忘记命令用法时，`man 命令名` 可以查看详细文档
2. **Tab 补全是神器**：输入命令或文件名的前几个字符后按 Tab，自动补全
3. **管道 `|` 的力量**：将多个命令组合起来，能发挥更大威力
4. **安全第一**：删除操作前多确认，用好 `--help` 参数

熟能生巧，多在服务器上实践，你会发现命令行其实比图形界面更高效、更强大。加油吧，未来的运维大牛！
