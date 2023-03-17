local cjson = require "cjson"
local utils = require "scripts.utils"
local globalstate = require "scripts.globalstate"

ngx.req.read_body()
local reqParams = ngx.req.get_body_data()
reqParams = cjson.decode(reqParams)

-- TODO: More checks
if reqParams.worker == nil then
    ngx.print('{"msg":"invalid worker"}')
    ngx.status = 400
    return
end

local ok, err = globalstate.unregister_worker(reqParams.worker)
if not ok then
    ngx.status = 500
    ngx.print('{"msg":"' .. err .. '"}')
end

