local cjson = require "cjson"
local utils = require "scripts.utils"
local globalstate = require "scripts.globalstate"

ngx.req.read_body()
local reqParams = ngx.req.get_body_data()
reqParams = cjson.decode(reqParams)

-- TODO: More checks
if reqParams.worker == nil or reqParams.nodeId == nil or reqParams.owner == nil then
    ngx.print('{"msg":"Missing `worker`, `node_id` or `owner` field"}')
    ngx.status = 400
    return
end

local ok, err = globalstate.register_or_update_worker(reqParams.worker, reqParams.nodeId, reqParams.owner)
if not ok then
    ngx.status = 500
    ngx.print('{"msg":"' .. err .. '"}')
end

