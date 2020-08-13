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

| key                  | Options | Type   | value                    | comment                                  |
| -------------------- | ------- | ------ | ------------------------ | ---------------------------------------- |
| `h[Options]`         | 0       | Number | downloaded_latest_height | 已下载的最新高度                         |
| `h[Options]`         | 1       | Number | latest_height            | 本地已验证的最新高度                     |
| `b[Options][hash]`   | 0       | Object | block header             | 已下载的待验证的区块头                   |
| `b[Options][hash]`   | 0       | Object | block header             | 已下载的待验证的区块头                   |
| `b[Options][hash]`   | 1       | Object | block header             | 已验证的区块头                           |
| `e[Options][hash]`   | 0       | Object | block event              | 已下载的区块事件                         |
| `e[Options][hash]`   | 1       | Object | block event              | 已验证的区块事件                         |
| `l[Options][height]` | 0       | Array  | [block event hash]       | 在该高度下待下载的所有区块事件 Hash 列表 |
| `l[Options][height]` | 1       | Array  | [block event hash]       | 已下载的该高度的所有区块事件 Hash 列表   |
| `l[Options][height]` | 2       | Array  | [block event hash]       | 已验证的该高度的所有区块事件 Hash 列表   |
| `l[Options][height]` | 3       | String | block header hash        | 该高度的区块头 Hash                      |
