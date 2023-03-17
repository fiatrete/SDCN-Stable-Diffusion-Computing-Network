local utils = require "scripts.utils"
local globalstate = require "scripts.globalstate"

local result, err = globalstate.get_all_node_statistics()
if result == nil then
    ngx.status = 500
    ngx.print('{"msg":"' .. err .. '"}')
    return
end
for _, v in pairs(result) do
    ngx.say(v)
end