## Design

### 同步流程

1. 获取对应节点的最高高度。
2. 获取本地节点最高高度。
3. 并行开始
    1. 下载区块头
        + 根据高度下载区块头。
    2. 下载区块事件
        + 根据高度拿到，该区块所有的事件 Hash。
        + 根据事件 Hash 下载区块事件。
    3. 验证区块事件
        + 当已下载事件完成时，触发验证区块事件。
    4. 验证区块头
        + 当已验证的事件 Hash 列表等于待下载事件 Hash 列表时，触发验证区块头。

### 存储

| key  |     | value                                       | comment                                  |
| ---- | --- | ------------------------------------------- | ---------------------------------------- |
| info |     | {download_lastest_height:1,latest_heitht:1} | 已下载的最新高度 + 本地已验证的最新高度  |
| hash | 0   | block header                                | 已下载的待验证的区块头                   |
| hash | 1   | block header                                | 已验证的区块头                           |
| hash | 0   | block event                                 | 已下载的区块事件                         |
| hash | 1   | block event                                 | 已验证的区块事件                         |
| list | 0   | [block event]                               | 在该高度下待下载的所有区块事件 Hash 列表 |
| list | 1   | [block event]                               | 已下载的该高度的所有区块事件 Hash 列表   |
| list | 2   | [block event]                               | 已验证的该高度的所有区块事件 Hash 列表   |
