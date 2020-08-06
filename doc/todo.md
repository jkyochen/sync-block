## TODO

1. use webSocket replace HTTP, simulate bitcoin p2p network sync block
2. sync real bitcoin block

## 多个 Worker 操作 Leveldb，导致 db 被锁。

+ 只在主 Worker 进行 db 操作。
+ 对 db 连接进行池化管理。

## Check Point

+ 需要等待的情况
    1. 下载区块进度比验证区块快
    2. 下载事件比验证事件块
    3. 区块的进度比事件的进度快
+ 异常处理
    + 网络异常，Retry 3 / wait 60s / timeout

## reference

+ https://en.bitcoin.it/wiki/Network
+ https://en.bitcoin.it/wiki/Protocol_documentation#Message_types
+ https://developer.bitcoin.org/reference/p2p_networking.html
+ https://developer.bitcoin.org/devguide/p2p_network.html
