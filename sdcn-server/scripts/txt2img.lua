local cjson = require "cjson"
local utils = require "scripts.utils"
local globalstate = require "scripts.globalstate"

ngx.req.read_body()
local reqParams = ngx.req.get_body_data()
reqParams = cjson.decode(reqParams)

-- Parameter convert and check
backReqParams, _ = utils.gateway_params_to_webui_params(reqParams, 0)
backReqParams = cjson.encode(backReqParams)

local worker = globalstate.get_next_worker()
utils.proxy_to_request(worker .. "/sdapi/v1/txt2img", "POST", backReqParams)