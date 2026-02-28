---
title: Codex CLI 在 PowerShell 中报错「Exception setting CursorPosition: 句柄无效」的修复记录
date: 2026-03-01 00:02:13
banner: 修复codex命令报错问题
cover: "https://img1.tucang.cc/api/image/show/0af3a2559741390b6b7e1722824472cd"
categories: 
  - 故障排查
tags: 
  - Codex CLI
  - PowerShell
  - Windows 终端
  - 故障排查
---
## 问题现象

在 Windows 使用 Codex CLI 时，几乎每条命令后都出现类似报错：

```text
SetValueInvocationException:
Line |
   3 |  $RawUI.CursorPosition = @{X=0;Y=0}
     |  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     | Exception setting "CursorPosition": "句柄无效。"
```

---

## 根因结论

问题不在 Codex CLI 本身，而在 **PowerShell Profile 初始化脚本**：

- `Clear-Host` 或某些终端美化逻辑会间接调用 `RawUI.CursorPosition`
- 在 Codex CLI 这类非标准/重定向句柄环境下，`CursorPosition` 不可用
- 于是每次执行命令后都抛 `句柄无效`

---

## 我的环境中定位结果

实际生效 profile 文件是：

```powershell
F:\OneDrive文档\PowerShell\Microsoft.PowerShell_profile.ps1
```

文件里有：

```powershell
Clear-Host
```

这就是触发点。

---

## 修复方案（推荐）

核心思路：把 `Clear-Host`、`fastfetch` 等"交互终端专属操作"包进交互判断里。

```powershell
# Minimal profile: UTF-8 + Fastfetch (interactive only)
try {
    [Console]::InputEncoding  = [System.Text.Encoding]::UTF8
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    $OutputEncoding = [System.Text.UTF8Encoding]::new($false)
    chcp 65001 > $null
} catch {}

# 仅在交互控制台执行，避免 CursorPosition 句柄无效
$interactive = $Host.Name -eq 'ConsoleHost' -and -not [Console]::IsOutputRedirected

if ($interactive) {
    try { Clear-Host } catch {}

    if (Get-Command fastfetch -ErrorAction SilentlyContinue) {
        try { fastfetch -c "C:/Users/xingr/.config/fastfetch/config.jsonc" } catch {}
    }
}
```

---

## 最小止血方案

如果你只想立刻消除报错：

- 直接删除 profile 里的 `Clear-Host`

---

## 如何确认修复成功

执行几条只读命令，例如：

```powershell
Get-Content README.md -TotalCount 5
Get-Content wiki/Home.md -TotalCount 5
rg -n "mode=phone|认证页" README.md
```

判定标准：

- 不再出现 `Exception setting "CursorPosition": "句柄无效。"` 即修复成功

---

## 补充：为什么报错里显示第 3 行？

报错"第 3 行"通常是 **当前执行上下文** 中触发异常的位置，不一定是你看到的 profile 第 3 行。真实触发点可能是：

- `Clear-Host` 内部调用
- 被 profile 引入的其他脚本
- 主题/美化模块的初始化代码

---

## 一句话总结

这是 **PowerShell Profile 与 Codex CLI 终端句柄兼容性问题**，不是 Codex 命令执行失败；把 `Clear-Host/fastfetch` 改为"仅交互终端执行"即可稳定解决。
