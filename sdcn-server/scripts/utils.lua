local config = require('scripts.config')
local http_lib = require("resty.http")
local cjson = require "cjson"

local function trim_stirng(s)
    return s:gsub("^%s*(.-)%s*$", "%1")
end

local function split_string(str, sep)
    local splits = {}

    if sep == nil then
        -- return table with whole str
        table.insert(splits, str)
    elseif sep == "" then
        -- return table with each single character
        local len = #str
        for i = 1, len do
            table.insert(splits, str:sub(i, i))
        end
    else
        -- normal split use gmatch
        local pattern = "[^" .. sep .. "]+"
        for str in string.gmatch(str, pattern) do
            table.insert(splits, str)
        end
    end
    return splits
end

local function dumpTableToString(t)
    local result = ""
    if t == nil then
        return "[nil]"
    end
    for k, v in pairs(t) do
        if type(v) == 'table' then
            v = dumpTableToString(v)
        end
        result = result .. (k .. ' = "' .. v .. '"\n')
    end
    return result
end

local function require_string(var, default_value)
    if type(var) == 'string' then
        return var
    end
    return default_value
end

local function require_string_in(var, list)
    for _, v in pairs(list) do
        if var == v then
            return v
        end
    end
    return list[1]
end

local function require_number_range(var, min, max)
    if type(var) == 'number' then
        if var < min then
            var = min
        elseif var > max then
            var = max
        end
        return var
    end
    return min
end

local function require_number_range_or(var, min, max, default_value)
    if type(var) == 'number' then
        if var < min then
            var = min
        elseif var > max then
            var = max
        end
        return var
    end
    return default_value
end

local function require_number_or(var, otherwise)
    if type(var) == 'number' then
        return var
    end
    return otherwise
end

-- req_type: 
--  0 -> txt2img
--  1 -> img2img
local function gateway_params_to_webui_params(gateway_params, req_type)
    local result = {
        prompt = require_string(gateway_params.prompt, ''),
        seed = require_number_or(gateway_params.seed, -1),
        sampler_name = require_string_in(gateway_params.sampler_name, config.kValidSamplers),
        steps = require_number_range(gateway_params.steps, 20, 60),
        cfg_scale = require_number_range(gateway_params.cfg_scale, 1, 30),
        width = (require_number_range(gateway_params.width, 8, 1024)),
        height = (require_number_range(gateway_params.height, 8, 1024)),
        negative_prompt = require_string(gateway_params.negative_prompt, ""),
        override_settings = {
            sd_model_checkpoint = config.kValidModels[gateway_params.model],
        },
        override_settings_restore_afterwards = false
    }
    if result.override_settings.sd_model_checkpoint == nil then
        return nil, "Invalid model"
    end

    result.width = result.width - result.width % 8 -- it seems that openresty's lua version does not support bitwise ops
    result.height = result.height - result.height % 8 -- it seems that openresty's lua version does not support bitwise ops

    if gateway_params.loras then
        if type(gateway_params.loras) ~= 'table' then
            return nil, "Invalid lora param"
        end
        for _, v in pairs(gateway_params.loras) do
            if type(v) ~= 'table' then
                return nil, "Invalid lora param"
            end
            local lora = config.kValidLoras[v[1]]
            local weight = v[2]
            if lora == nil or type(weight) ~= 'number' then
                return nil, "Invalid lora param"
            end
            result.prompt = result.prompt .. ',<lora:' .. lora .. ':' .. tostring(weight) .. '>'
        end
    end

    if req_type == 1 then
        result.init_images = {
            require_string(gateway_params.init_image, '')
        }
        result.denoising_strength = require_number_range_or(gateway_params.denoising_strength, 0, 1, 0.5)
    end
    return result, nil
end

local function proxy_to_request(url, method, body)
    local httpc = http_lib.new()

    local res, err = httpc:request_uri(url, {
        method = method,
        body = body,
        headers = {
            ["Content-Type"] = "application/json",
        },
    })
    
    if not res then
        ngx.log(ngx.ERR, "request failed: ", err)
        ngx.status = 500
        ngx.print('{"msg": "Internal error, backend failed to response"}')
        return
    end
    
    local status = res.status
    local length = res.headers["Content-Length"]
    local body   = res.body
    local json_ojb = cjson.decode(body)
    json_ojb.info = nil
    json_ojb.parameters = nil
    ngx.status = status
    ngx.print(cjson.encode(json_ojb))

end

return {
    trim_stirng = trim_stirng,
    split_string = split_string,
    dumpTableToString = dumpTableToString,
    gateway_params_to_webui_params = gateway_params_to_webui_params,
    proxy_to_request = proxy_to_request,
}