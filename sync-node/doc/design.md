## Design

### 同步流程

1. 获取对应节点的最高高度。
2. 获取本地节点最高高度。
3. 并行开始
    1. 下载区块头
        + 根据高度下载区块头（以 key 为 hash，值为区块头。）
    2. 下载区块事件
        + 根据高度拿到，该区块所有的事件 Hash。（键为高度，值为待下载事件 Hash 列表。）
        + 根据事件 Hash 下载区块事件。（键为 hash，值为事件，并将 Hash 存储到已下载事件 Hash 列表。）
    3. 验证区块事件
        + 当已下载事件完成时，触发验证区块事件。从已下载的事件 Hash 列表中。验证区块事件。并存入已验证的事件列表中。（键为高度，值为已验证的事件 Hash 列表）
    4. 验证区块头
        + 当已验证的事件 Hash 列表等于待下载事件 Hash 列表时，触发验证区块头。（以 key 为 hash，值为区块头。）
4. 内存优化，存储优化。

### 存储

| key    | value                                       | comment                                  |
| ------ | ------------------------------------------- | ---------------------------------------- |
| info   | {download_lastest_height:1,latest_heitht:1} | 已下载的最新高度 + 本地已验证的最新高度  |
| hash   | block header                                | 已下载的待验证的区块头                   |
| hash   | block header                                | 已验证的区块头                           |
| hash   | block event                                 | 已下载的区块事件                         |
| hash   | block event                                 | 已验证的区块事件                         |
| height | [block event]                               | 在该高度下待下载的所有区块事件 Hash 列表 |
| height | [block event]                               | 已下载的该高度的所有区块事件 Hash 列表   |
| height | [block event]                               | 已验证的该高度的所有区块事件 Hash 列表   |
