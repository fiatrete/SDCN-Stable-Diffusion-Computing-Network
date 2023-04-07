local cjson = require "cjson"
local utils = require "scripts.utils"
local globalstate = require "scripts.globalstate"

ngx.req.read_body()
local reqParams = ngx.req.get_body_data()
reqParams = cjson.decode(reqParams)

-- Parameter convert and check
backReqParams, error = utils.gateway_params_to_webui_params(reqParams, 1)
if error ~= nil then
    ngx.status = 400
    ngx.print('{"msg": "' .. error .. '"}')
    return
end
backReqParams = cjson.encode(backReqParams)

local worker, node_id, err = globalstate.get_next_worker()
if worker == nil then
    ngx.status = 503
    ngx.print(string.format('{"msg":"%s"}', (err == nil and 'No available worker' or err)))
    return
end
utils.proxy_to_request(worker .. "/sdapi/v1/img2img", "POST", backReqParams)
globalstate.incr_task_handled(node_id)