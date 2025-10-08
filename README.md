# Zurl Helper 油猴脚本

这是一款为 [helloxz/zurl](https://github.com/helloxz/zurl) 短链接服务量身打造的油猴 (Tampermonkey) 脚本，核心目的是为了解决在`zurl`服务上，本身无法设置生成的短链接**过期时间**，但是后台API支持设置过期时间，所以自定义写一个插件，目的就是为了实现**有时效的短链接**。它能实现在任何网页上，无需切换页面，即可方便地调用 Zurl 服务的 API，生成可自定义过期时间和别名的短链接。

脚本拥有现代化、美观的 UI 界面，并能**自动适配**您操作系统的浅色/深色模式，提供一致且舒适的视觉体验。

---

## ✨ 界面预览

#### 浅色模式
![Light Mode Preview](./assets/Light%20Mode%20Preview.png)

#### 深色模式
![Dark Mode Preview](./assets/Dark%20Mode%20Preview.png)

## 🚀 主要功能

> 核心基于`zurl`提供的api：`/api/shorten_url` 实现

*   **手动触发**: 通过油猴菜单手动调用，不干扰您的正常浏览。
*   **自动填充**: 打开生成窗口时，会自动填充当前页面的 URL 到“长链接”输入框。
*   **自定义有效期**: 支持设置以天为单位的有效期，留空则表示链接永不过期。
*   **自定义别名**: 支持为您的短链接设置一个有意义的、个性化的别名。
*   **安全配置**: 您的服务地址和 API Key 被安全地存储在 Tampermonkey 的私有空间中。
*   **智能主题**: 自动适配系统的浅色/深色（夜间）模式。
*   **全局可用**: 可在任何网站上激活并使用。

## 🛠️ 先决条件

1.  您的浏览器已经安装了 [Tampermonkey](https://www.tampermonkey.net/) 插件。
    *   [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
    *   [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
    *   [Firefox Browser ADD-ONS](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
2.  您已经成功部署了 [helloxz/zurl](https://github.com/helloxz/zurl) 短链接服务，并拥有可以访问的**服务地址**和 **API Key**（自行在后台管理界面开通）。

## 🔧 安装

1.  进入油猴管理界面。
2.  点击右上角的 `加号` 按钮添加新脚本，或直接访问此链接：extension://dhdgffkkebhmkfjojejmpbldmpobfkfo/options.html#nav=new-user-script+editor（以*Edge*浏览器的油猴扩展为例）。
3.  **复制粘贴**最新的 **[zurl-helper.js](https://github.com/qiquqiu/zurl-helper/blob/main/tampermonkey/zurl-helper.js)** 完整代码，`Ctrl + S` 保存、重启浏览器即可。

## ⚙️ 配置与使用

初次使用时，您需要先配置您的服务信息。

#### 首次配置

1.  在浏览器右上角点击 Tampermonkey 扩展的图标。
2.  您会看到两个新的菜单项：
    *   点击 **`设置 Zurl 服务地址`**，输入您 Zurl 服务的完整 URL (例如: `https://link.qiquqiu.xyz`) 并确定。
    *   点击 **`设置 API Key`**，输入您生成的 API Key (例如: `sk-xxxxxxxx`) 并确定。

#### 日常使用

1.  在任何您想为其生成短链接的网页上，点击浏览器右上角的 Tampermonkey 图标。
2.  点击 **`手动生成短链接`** 菜单项。
3.  脚本会弹出一个窗口，并且“长链接”输入框已经自动为您填好了当前页面的 URL。
4.  按需填写“有效期”和“自定义短链接”。
5.  点击 `生成` 按钮。
6.  成功后，结果会显示在下方，您可以直接点击 `复制` 按钮获取新的短链接。