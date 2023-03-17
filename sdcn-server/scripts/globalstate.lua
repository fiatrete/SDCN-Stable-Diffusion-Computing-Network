local config = require "scripts.config"


local function get_redis_con()
    local redis = require "resty.redis"
    local red = redis:new()
    red:set_timeouts(1000, 1000, 1000) -- 1 sec
    local ok, err = red:connect(config.kRedisServerAddr, config.kRedisPort)
    return ok, err, red
end

--[[
The meaning of keys in redis

1. "Svr$" + ${sever} is used as a counter, storing its node ID, the ttl is used to keepalive a worker
2. "WorkQ" is used as a queue of workers, every time a task comming, the first worker in "WorkQ" will take the task
3. "WorkQSet" is written with "WorkQ" simultaneously, thus they contain same elements except order.
    "WorkQSet" is used to determine the existance of an element in "WorkQ"
4. "NodeLoad$" + ${node ID} is used to determing if a node is still alive, it stores how many tasks are waiting to be done by it.
5. "NodeOwner$" + ${node ID} is used to store the node owner
6. "NodeTaskHandled$" + ${node ID} is used to store how many tasks has this node handled
7. "AllNodes" is used to store all nodes online or offline
--]]

local function register_or_update_worker(node_addr, node_id, owner)
    local ok, err, red = get_redis_con()
    if not ok then
        ngx.log(ngx.ERR, err);
        return false, "Failed to connect to database"
    end

    -- First make "Svr$" + ${node_addr} alive
    -- If "WorkQSet" does not contain the ${node_addr}, which means it is a new server, then
    --      Then we add the worker to the queue, waiting for a task
    -- Or do nothing since it has been in the queue already.
    ok, err = red:eval([[
        local nodeId = ARGV[3]
        local loadKey = "NodeLoad$" .. nodeId
        redis.call("SET", "Svr$" .. ARGV[1], nodeId, "EX", ARGV[2])
        redis.call("SETNX", loadKey, "0")
        redis.call("EXPIRE", loadKey, ARGV[2])
        redis.call("SADD", "AllNodes", nodeId)
        if 1 == redis.call("SADD", "WorkQSet", ARGV[1]) then
            redis.call("RPUSH", "WorkQ", ARGV[1])
        end
        redis.call("SET", "NodeOwner$" .. nodeId, ARGV[4])
    ]], 0, node_addr, tostring(config.kWorkerKeepAlive), node_id, owner)
    red:set_keepalive(config.kRedisMaxIdleTimeout, config.kRedisMaxConnections)
    if not ok then
        ngx.log(ngx.ERR, err);
        return false, "An error occurred when registering"
    end
    return true, nil
end

-- temporary
local function unregister_worker(node_addr)
    local ok, err, red = get_redis_con()
    if not ok then
        ngx.log(ngx.ERR, err);
        return false, "Failed to connect to database"
    end

    ok, err = red:eval([[
        local node_addr = KEYS[1]
        local nodeId = redis.call("GET", "Svr$" .. node_addr)
        redis.call("DEL", "Svr$" .. node_addr, "NodeLoad$" .. nodeId)
    ]], 1, node_addr)
    red:set_keepalive(config.kRedisMaxIdleTimeout, config.kRedisMaxConnections)
    if not ok then
        ngx.log(ngx.ERR, err);
        return false, "An error occurred when unregistering"
    end
    return true, nil
end

local function get_next_worker()
    local ok, err, red = get_redis_con()
    if not ok then
        return nil, nil, err
    end
    -- First get the worker at the head of the queue
    --      if the queue is empty ----> return nil
    --      check if the the worker is still alive:
    --          yes ----> put the worker to the end of the queue (so that it is able
    --                      to accept a new task), and return this worker
    --          no -----> this worker has left, find another one, thus goto the first step
    local ret, err = red:eval([[
        while true do
            local result = redis.call("LPOP", "WorkQ")
            if not result then
                return nil
            end
            local nodeId = redis.call("GET", "Svr$" .. result)
            if not nodeId then
                redis.call("SREM", "WorkQSet", result)
            else
                redis.call("RPUSH", "WorkQ", result);
                redis.call("INCR", "NodeLoad$" .. nodeId)
                return { result, nodeId }
            end
        end
    ]], 0)
    
    if err ~= nil then
        ngx.log(ngx.ERR, "Failed " .. err)
    end
    if ret == ngx.null then
        red:set_keepalive(config.kRedisMaxIdleTimeout, config.kRedisMaxConnections)
        return nil, nil, "No available worker"
    end
    red:set_keepalive(config.kRedisMaxIdleTimeout, config.kRedisMaxConnections)
    return tostring(ret[1]), tostring(ret[2]), nil
end

local function incr_task_handled(node_id)
    local ok, err, red = get_redis_con()
    if not ok then
        return nil, err
    end
    red:incr("NodeTaskHandled$" .. node_id)
    red:decr("NodeLoad$" .. node_id)
    red:set_keepalive(config.kRedisMaxIdleTimeout, config.kRedisMaxConnections)
end

local function get_all_node_statistics()
    local ok, err, red = get_redis_con()
    if not ok then
        return nil, err
    end
    local ret, err = red:eval([[
        local allNodes = redis.call("SMEMBERS", "AllNodes")
        local result = {}
        for _, nodeId in pairs(allNodes) do
            local owner = redis.call("GET", "NodeOwner$" .. nodeId)
            local handled = redis.call("GET", "NodeTaskHandled$" .. nodeId)
            if not handled then
                handled = "0"
            end
            local load = redis.call("GET", "NodeLoad$" .. nodeId)
            if not load then
                load = "-1"
            end
            table.insert(result, nodeId .. "|" .. owner .. "|" .. handled .. "|" .. load)
        end
        return result
    ]], 0)
    if err ~= nil then
        red:set_keepalive(config.kRedisMaxIdleTimeout, config.kRedisMaxConnections)
        return nil, err
    end
    red:set_keepalive(config.kRedisMaxIdleTimeout, config.kRedisMaxConnections)
    return ret, nil
end

return {
    get_next_worker = get_next_worker,
    register_or_update_worker = register_or_update_worker,
    unregister_worker = unregister_worker,
    incr_task_handled = incr_task_handled,
    get_all_node_statistics = get_all_node_statistics,
}