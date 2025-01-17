Version:

2025-01-17T04:16Z



# General Error

对于所有的API，可能会产生以下的非200响应：

A. `406 NOT_ACCEPTABLE`
请求格式错误, 不应当出现

B. `500 INTERNAL_SERVER_ERROR`
服务器内部错误。请将返回内容直接显示给用户。

C. `400 BAD REQUEST`
请将返回内容直接显示给用户。
可能的返回内容是(就是一个字符串， 没有引号)：
1. `Invalid query`, 当传入参数不合法
2. `Invalid session`, 当请求中携带不合法的cookie
3. `Not logged in`, 当没有登录 
4. `Not in a team`, 当没有在队伍中的用户以队伍名义发起请求
5. `Insufficient Token`, 账户余额不足
6. `Unauthorized access`, 当用户的权限不足以完成请求



# API

## 获取解密密钥（GET）
`/decipher_key?decipher_id=`

无请求体。

回复例子（只含200）：

成功获取Key：
```json
{"Success":"2b2b9f336a746bad7279703e1cfcc6e98aa7dd6d80a53cbad4fbb43088735bb2"} 
```

可以以下价格购买：
```json
{"Price": 800} 
```


注：对于题目内容的decipher_key可能会变化（不同的密钥使用chain_decrypt可以解密出对应的cipher数组的不同长度的前缀）。


## 购买解密密钥（POST）

`/unlock?decipher_id=￼￼`

无请求体。

回复例子（只含200）：

成功购买Key：
```json
 {"Success":{"key":"2b2b9f336a746bad7279703e1cfcc6e98aa7dd6d80a53cbad4fbb43088735bb2","price":2000,"new_balance":35056}}
```

已经购买过：
```json
{"AlreadyUnlocked":"2b2b9f336a746bad7279703e1cfcc6e98aa7dd6d80a53cbad4fbb43088735bb2"}
```



## 提交答案（POST）
 `/submit_answer`
请求体：
```python
{
	"puzzle_id" : puzzle_id,
	"answer" : hashlib.sha256((key + user_input).encode()).hexdigest()
}
```
这里的puzzle_id是一个int类型。详见前端数据示例。
key是 **当前** 的题目内容的解密密钥！
注意：对于题目内容，提交中间答案

answer是一个长度64的小写十六进制数字符串。


回复例子（只含200）



提交一个错误答案。请将penalty_token和new_balance告知用户，并在前端禁止用户在try_again_after时间前提交答案:
```json
{"WrongAnswer":{"penalty_token":20,"try_again_after":1736799014,"new_balance":84972}}
```

在禁止提交期间提交：
```json
{"TryAgainAfter":1736799014}
```

第一次提交正确(中间/最终)答案。请将 award_token和new_balance告知用户, 并用 key 更新题目内容的解密密钥！ 如果这里的finish是true, 请额外提示用户通过了本题。
```json
{"Success":{"puzzle_id":10,"award_token":9787,"new_balance":533614,"key":"5ed89c84a8d406a38c3fdeb1a55b339da80ad524c43d1abf11b927dc96a2fdd5","finish":true}}

```
请求前端发起一个Toast

```json
{"PleaseToast":"正确的冷笑话答案3"}
```



重复提交正确答案：

```json
"HasSubmitted"
```

## 查询题目通过情况(GET)

`/puzzle_status`


```
{"updated":1736805494,"data":[{"puzzle_id":1,"passed":1,"unlocked":1},{"puzzle_id":2,"passed":1,"unlocked":1}]}
```



以上的统计信息的语义是， "passed"表示已经通过某题目的队伍数量，"unlocked"表示已经解锁某题目的队伍数量。


# 查询基本信息（GET）

`/info`
无请求体

有队伍：
```json
{"user_id":16,"privilege":4,"team_id":6,"token_balance":39727} 
```

没有队伍：
```json
{"user_id":16,"privilege":4,"team_id":null,"token_balance":null} 
```



