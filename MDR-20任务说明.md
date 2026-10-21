# MDR-20 数据基础

## 1. 这次完成了什么

- 整理 7 件衣物样例；提供本地衣物增删改查和收藏读写，兼容已有收藏记录。
- 建立衣物识别、帮搭、试衣的异步 Mock AI 统一入口；不调用外部服务。

## 2. 修改了哪些文件

- `src/data/seed.js`：样例数据；`src/data/storage.js`：统一数据接口。
- `src/services/ai.js`：Mock AI；`script.js`：收藏调用数据层；`index.html`：加载模块。
- `tests/data-foundation.test.js`：自动化测试；`ARCHITECTURE.md`、`STATUS.md`：架构和进度。

## 3. 如何自己测试

1. 在项目目录运行 `node --test tests/data-foundation.test.js`，确认测试全部通过。
2. 打开衣橱，收藏一件衣物并刷新页面，确认收藏状态保留。
3. 衣物数据：在浏览器控制台使用数据接口新增测试衣物，刷新后调用 `getItems()`，确认记录仍存在。以上刷新测试已由用户确认通过。

## 4. 给下一位开发者的入口

- `MiudaStorage.createBrowserWardrobeStore()`：取得数据接口，使用 `getItems()`、`addItem(item)`、`updateItem(id, changes)`、`deleteItem(id)`；收藏使用 `getFavoriteIds()`、`setFavorite(id, selected)`。
- `MiudaAI.analyzeClothing(image)`、`generateOutfit(input, items)`、`generateTryOn(input)`：均返回 Promise。衣物模型及参数见 `ARCHITECTURE.md`。

## 5. 已知限制

- 首页和衣橱仍是静态展示，跨页面数据联动尚未验收。
- 识别与试衣返回预置结果，试衣图片不会根据衣物动态变化；帮搭为简单规则，缺上衣、下装或鞋履会报错。未接入真实 AI 或云端同步。
- 数据存于当前浏览器本地；清除浏览器数据可能导致丢失，不同浏览器或访问地址的数据不保证共享。

## 6. 下一步建议

MDR-21 接入衣物录入和保存；MDR-22 接入衣橱及首页动态展示，并验收跨页面联动。

## 7. PR / 分支信息

- 分支：`feature/data-foundation`；当前修改尚未提交或推送，PR 尚未创建。
