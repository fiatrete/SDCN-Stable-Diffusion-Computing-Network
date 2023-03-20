local utils = require "scripts.utils"
local globalstate = require "scripts.globalstate"

ngx.req.read_body()
local reqParams = ngx.req.get_body_data()
local backReqParams = reqParams

local worker, node_id, err = globalstate.get_next_worker()
if worker == nil then
    ngx.status = 503
    ngx.print(string.format('{"msg":"%s"}', (err == nil and 'No available worker' or err)))
    return
end
utils.proxy_to_request(worker .. "/sdapi/v1/interrogate", "POST", backReqParams)
globalstate.incr_task_handled(node_id)