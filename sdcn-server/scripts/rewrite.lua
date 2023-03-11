local globalState = require("scripts.globalstate")
local utils = require("scripts.utils")

local sid = utils.getSessionId()

if ngx.var.uri == '/allocation' then
    local worker = globalState.getWorkerAndUpdateActiveTime(sid)
    if worker ~= nil then
        ngx.redirect('/')
        ngx.exit(ngx.HTTP_OK)
        return
    end

    sid = globalState.genSessId()
    local worker = globalState.getAFreeWorker(sid)
    if worker ~= nil then
        ngx.header['Set-Cookie'] = {'sid=' .. sid }
        ngx.redirect('/')
        ngx.exit(ngx.HTTP_OK)
        return
    end

    ngx.status = ngx.HTTP_NOT_FOUND
    ngx.say("System busy, please try later")
    -- to cause quit the whole request rather than the current phase handler
    ngx.exit(ngx.HTTP_OK)
    return
end

local worker = globalState.getWorkerAndUpdateActiveTime(sid)

if worker == nil then
    ngx.status = ngx.HTTP_NOT_FOUND
    if ngx.var.uri == '/' then
        ngx.redirect('/allocation')
        ngx.exit(ngx.HTTP_OK)
        return
    end
    ngx.say("You are kicked due to long-time inactive, you need to request '/allocation'")
    -- to cause quit the whole request rather than the current phase handler
    ngx.exit(ngx.HTTP_OK)
    return
end

ngx.ctx.worker_addr = worker.addr
