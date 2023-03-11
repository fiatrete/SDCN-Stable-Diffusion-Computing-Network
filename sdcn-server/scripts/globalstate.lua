local config = require "scripts.config"

next_worker = 1

function get_next_worker()
    local w = config.kBackEndWorkers[next_worker]
    if next_worker + 1 > #config.kBackEndWorkers then
        next_worker = 1
    else
        next_worker = next_worker + 1
    end
    return w
end

return {
    get_next_worker = get_next_worker,
}