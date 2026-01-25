-- Shining in the Darkness Clone - Love2D Edition
-- Enhanced with procedural textures

local SCREEN_WIDTH, SCREEN_HEIGHT = 1024, 768
local FOV = math.pi / 3
local MAX_DEPTH = 20
local MAP_SIZE = 32
local TEX_RES = 128  -- Texture resolution

-- Color constants
local WALL_DARK = {80, 70, 50}
local FLOOR_BASE = {90, 75, 50}
local CEILING_BASE = {20, 15, 10}

-- Directions
local DX = {[0]=0, [1]=1, [2]=0, [3]=-1}
local DY = {[0]=-1, [1]=0, [2]=1, [3]=0}

-- Textures
local wall_textures = {}
local floor_texture = nil
local ceiling_texture = nil

-- Party
local party = {
    {name="BORK", cls="Fighter", hp=28, maxhp=28, mp=0, maxmp=0, atk=10, def=5, lvl=4, xp=0},
    {name="PYRA", cls="Mage", hp=20, maxhp=20, mp=15, maxmp=15, atk=5, def=2, mag=12, lvl=3, xp=0},
    {name="MILO", cls="Monk", hp=24, maxhp=24, mp=8, maxmp=8, atk=8, def=4, mag=6, lvl=3, xp=0}
}
local party_gold = 0
local floor_level = 1

-- Monsters
local monsters = {
    {name="SLIMY OOZE", hp=30, atk=8, def=3, xp=20, gold=15, color={0.3,0.8,0.3}},
    {name="GOBLIN", hp=25, atk=10, def=4, xp=25, gold=20, color={0.6,0.4,0.2}},
    {name="ORC WARRIOR", hp=45, atk=14, def=6, xp=40, gold=35, color={0.4,0.5,0.3}},
    {name="SKELETON", hp=35, atk=12, def=5, xp=30, gold=25, color={0.8,0.8,0.7}},
    {name="DARK KNIGHT", hp=60, atk=18, def=8, xp=60, gold=50, color={0.2,0.2,0.3}}
}

-- Game state
local state = "explore"
local px, py = 2, 2
local dir = 0
local dungeon = {}
local message = "Your party enters the Labyrinth..."
local combat = {monster=nil, turn="party", selected=1}
local monster_delay = 0

-- Generate wall texture with variations (0-3, where 3 is mossy)
function generate_wall_texture(variation)
    local imgdata = love.image.newImageData(TEX_RES, TEX_RES)
    local seed_offset = variation * 1200
    local is_mossy = (variation == 3)
    
    for y = 0, TEX_RES-1 do
        for x = 0, TEX_RES-1 do
            -- Base stone noise
            local n1 = love.math.noise(x*0.06, y*0.06 + seed_offset) * 0.7 + 0.3
            local brightness = 0.5 + n1 * 0.5
            
            -- Cracks/veins
            local crack_n = love.math.noise(x*0.4, y*0.42 + seed_offset + 200)
            local crack = 0
            if crack_n > 0.80 then crack = 0.9
            elseif crack_n > 0.68 then crack = 0.55
            elseif crack_n > 0.58 then crack = 0.25 end
            
            -- Mortar lines
            local mortar = 0
            if (x % 48 < 4 or y % 42 < 3) and math.random() < 0.92 then
                mortar = 0.65
            end
            
            local r = (WALL_DARK[1] * brightness * (1 - crack*0.85) - mortar*30) / 255
            local g = (WALL_DARK[2] * brightness * (1 - crack*0.65) - mortar*25) / 255
            local b = (WALL_DARK[3] * brightness * (1 - crack*0.45) - mortar*20) / 255
            
            -- Speckles
            if love.math.noise(x*0.9, y*0.9 + seed_offset + 500) > 0.96 then
                r = r + 0.08
                g = g + 0.06
                b = b + 0.04
            end
            
            -- Moss variant
            if is_mossy then
                local moss_n = love.math.noise(x*0.18, y*0.22 + seed_offset + 800)
                local moss_amount = 0
                
                -- More moss lower on wall
                local height_factor = y / TEX_RES
                if height_factor > 0.45 then
                    moss_amount = moss_amount + (height_factor - 0.45) * 1.8
                end
                
                -- Moss in cracks
                moss_amount = moss_amount + crack * 1.2
                moss_amount = moss_amount + (moss_n > 0.65 and 0.35 or 0)
                moss_amount = math.min(1, moss_amount)
                
                -- Green tint
                g = g + moss_amount * 0.45
                r = r - moss_amount * 0.12
                b = b - moss_amount * 0.08
            end
            
            imgdata:setPixel(x, y, math.max(0, math.min(1, r)), 
                                   math.max(0, math.min(1, g)), 
                                   math.max(0, math.min(1, b)), 1)
        end
    end
    return love.graphics.newImage(imgdata)
end

-- Generate floor texture
function generate_floor_texture()
    local imgdata = love.image.newImageData(TEX_RES, TEX_RES)
    
    for y = 0, TEX_RES-1 do
        for x = 0, TEX_RES-1 do
            local n = love.math.noise(x*0.05, y*0.05) * 0.6 + 0.4
            local brightness = 0.4 + n * 0.3
            
            -- Tile lines
            local tile = 0
            if (x % 32 < 2 or y % 32 < 2) then
                tile = 0.3
            end
            
            local r = (FLOOR_BASE[1] * brightness - tile*40) / 255
            local g = (FLOOR_BASE[2] * brightness - tile*35) / 255
            local b = (FLOOR_BASE[3] * brightness - tile*30) / 255
            
            imgdata:setPixel(x, y, math.max(0, r), math.max(0, g), math.max(0, b), 1)
        end
    end
    return love.graphics.newImage(imgdata)
end

-- Generate ceiling texture
function generate_ceiling_texture()
    local imgdata = love.image.newImageData(TEX_RES, TEX_RES)
    
    for y = 0, TEX_RES-1 do
        for x = 0, TEX_RES-1 do
            local n = love.math.noise(x*0.08, y*0.08) * 0.5 + 0.5
            local brightness = 0.15 + n * 0.15
            
            local r = (CEILING_BASE[1] * brightness) / 255
            local g = (CEILING_BASE[2] * brightness) / 255
            local b = (CEILING_BASE[3] * brightness) / 255
            
            imgdata:setPixel(x, y, r, g, b, 1)
        end
    end
    return love.graphics.newImage(imgdata)
end

function love.load()
    love.window.setMode(SCREEN_WIDTH, SCREEN_HEIGHT, {resizable=false, vsync=true})
    love.window.setTitle("Shining in the Darkness")
    love.graphics.setDefaultFilter("nearest", "nearest")
    math.randomseed(os.time())
    
    -- Generate textures
    floor_texture = generate_floor_texture()
    ceiling_texture = generate_ceiling_texture()
    
    for i = 0, 3 do
        wall_textures[i+1] = generate_wall_texture(i)
    end
    
    generate_dungeon()
end

function generate_dungeon()
    dungeon = {}
    for y=1,MAP_SIZE do
        dungeon[y] = {}
        for x=1,MAP_SIZE do
            dungeon[y][x] = 1
        end
    end
    
    local stack = {{2,2}}
    dungeon[2][2] = 0
    
    while #stack > 0 do
        local cx,cy = stack[#stack][1], stack[#stack][2]
        local neighbors = {}
        for nd=0,3 do
            local nx,ny = cx+DX[nd]*2, cy+DY[nd]*2
            if nx>1 and nx<MAP_SIZE and ny>1 and ny<MAP_SIZE and dungeon[ny][nx]==1 then
                table.insert(neighbors, {nd, nx,ny})
            end
        end
        if #neighbors > 0 then
            local r = neighbors[math.random(#neighbors)]
            local ndir, nx,ny = r[1], r[2], r[3]
            dungeon[cy + DY[ndir]][cx + DX[ndir]] = 0
            dungeon[ny][nx] = 0
            table.insert(stack, {nx,ny})
        else
            table.remove(stack)
        end
    end
    
    local sx, sy
    repeat
        sx = math.random(10,MAP_SIZE-2)
        sy = math.random(10,MAP_SIZE-2)
    until dungeon[sy][sx] == 0
    dungeon[sy][sx] = 2
end

function love.keypressed(k)
    if state == "explore" then
        local moved = false
        if k=="up" or k=="w" then
            local nx,ny = px + DX[dir], py + DY[dir]
            if dungeon[ny] and dungeon[ny][nx] and dungeon[ny][nx] ~= 1 then
                px,py = nx,ny
                moved = true
            else
                message = "The way is blocked."
            end
        elseif k=="down" or k=="s" then
            local nx,ny = px - DX[dir], py - DY[dir]
            if dungeon[ny] and dungeon[ny][nx] and dungeon[ny][nx] ~= 1 then
                px,py = nx,ny
                moved = true
            else
                message = "You cannot go that way."
            end
        elseif k=="left" or k=="a" then 
            dir = (dir - 1) % 4
            message = "You turn left."
        elseif k=="right" or k=="d" then 
            dir = (dir + 1) % 4
            message = "You turn right."
        elseif k=="space" then search_area()
        end
        
        if moved then
            check_stairs()
            if math.random() < 0.3 then 
                enter_combat() 
            else
                message = "You move forward..."
            end
        end
        
    elseif state == "combat" then
        if combat.turn == "party" then
            local alive = {}
            for i=1,3 do 
                if party[i].hp > 0 then 
                    table.insert(alive, i) 
                end 
            end
            if #alive == 0 then state = "gameover" return end
            
            if k=="space" then 
                player_attack() 
            elseif k=="tab" then 
                combat.selected = combat.selected % 3 + 1
                while party[combat.selected].hp <= 0 do
                    combat.selected = combat.selected % 3 + 1
                end
            elseif k=="escape" then 
                try_run() 
            end
        end
    elseif state == "gameover" then
        if k=="r" then
            for i=1,3 do
                party[i].hp = party[i].maxhp
                party[i].mp = party[i].maxmp
            end
            px, py = 2, 2
            dir = 0
            floor_level = 1
            generate_dungeon()
            state = "explore"
            message = "Your party returns to the Labyrinth..."
        end
    end
end

function search_area()
    if math.random() < 0.2 then
        local gold = math.random(30,100)
        party_gold = party_gold + gold
        message = "You found " .. gold .. " gold!"
    else
        message = "You search the area but find nothing."
    end
end

function check_stairs()
    if dungeon[py][px] == 2 then
        floor_level = floor_level + 1
        generate_dungeon()
        px,py = 2,2
        dir = 0
        message = "You descend to floor " .. floor_level .. "!"
        for i=1,3 do
            party[i].hp = party[i].maxhp
            party[i].mp = party[i].maxmp
        end
    end
end

function enter_combat()
    local template = monsters[math.min(floor_level, #monsters)]
    combat.monster = {
        name = template.name,
        hp = template.hp + floor_level * 5,
        maxhp = template.hp + floor_level * 5,
        atk = template.atk + floor_level * 2,
        def = template.def + floor_level,
        xp = template.xp * floor_level,
        gold = template.gold * floor_level,
        color = template.color
    }
    combat.turn = "party"
    combat.selected = 1
    while party[combat.selected].hp <= 0 do
        combat.selected = combat.selected % 3 + 1
    end
    state = "combat"
    message = combat.monster.name .. " appears!"
    monster_delay = 0
end

function player_attack()
    local attacker = party[combat.selected]
    if attacker.hp <= 0 then return end
    
    local hit_roll = math.random(1,20)
    if hit_roll == 1 then
        message = attacker.name .. " misses!"
    else
        local dmg = math.max(1, attacker.atk + math.random(0,5) - combat.monster.def)
        combat.monster.hp = combat.monster.hp - dmg
        message = attacker.name .. " attacks for " .. dmg .. " damage!"
        
        if combat.monster.hp <= 0 then
            victory()
            return
        end
    end
    
    combat.turn = "monster"
    monster_delay = 0
end

function monster_turn(dt)
    monster_delay = monster_delay + dt
    if monster_delay >= 1.5 then
        monster_delay = 0
        
        local targets = {}
        for i=1,3 do 
            if party[i].hp > 0 then 
                table.insert(targets, i) 
            end 
        end
        
        if #targets == 0 then
            state = "gameover"
            message = "Your party has been defeated!"
            return
        end
        
        local tgt = targets[math.random(#targets)]
        local dmg = math.max(1, combat.monster.atk + math.random(-2,3) - party[tgt].def)
        party[tgt].hp = math.max(0, party[tgt].hp - dmg)
        
        message = combat.monster.name .. " attacks " .. party[tgt].name .. " for " .. dmg .. " damage!"
        
        if party[tgt].hp <= 0 then 
            message = message .. " " .. party[tgt].name .. " has fallen!"
        end
        
        combat.turn = "party"
    end
end

function victory()
    local xp = combat.monster.xp
    local gold = combat.monster.gold
    party_gold = party_gold + gold
    
    message = "Victory! Gained " .. xp .. " XP and " .. gold .. " gold!"
    
    for i=1,3 do
        if party[i].hp > 0 then
            party[i].xp = party[i].xp + xp
            if party[i].xp >= party[i].lvl * 100 then
                party[i].lvl = party[i].lvl + 1
                party[i].maxhp = party[i].maxhp + math.random(5,10)
                party[i].hp = party[i].maxhp
                party[i].maxmp = party[i].maxmp + math.random(2,5)
                party[i].mp = party[i].maxmp
                party[i].atk = party[i].atk + 1
                party[i].def = party[i].def + 1
                message = message .. " " .. party[i].name .. " reached level " .. party[i].lvl .. "!"
            end
        end
    end
    
    state = "explore"
end

function try_run()
    if math.random() < 0.5 then
        state = "explore"
        message = "You escaped!"
    else
        message = "You cannot escape!"
        combat.turn = "monster"
        monster_delay = 0
    end
end

function love.draw()
    love.graphics.clear(0, 0, 0)

    if state == "explore" then
        draw_dungeon_view()
        draw_party_ui()
    elseif state == "combat" then
        draw_combat_scene()
    elseif state == "gameover" then
        love.graphics.setColor(0.8, 0.1, 0.1)
        love.graphics.printf("PARTY DEFEATED", 0, SCREEN_HEIGHT/2 - 100, SCREEN_WIDTH, "center", 0, 4, 4)
        love.graphics.setColor(1, 1, 1)
        love.graphics.printf("Press R to retry", 0, SCREEN_HEIGHT/2, SCREEN_WIDTH, "center", 0, 2, 2)
    end
    
    -- Message box
    love.graphics.setColor(0, 0, 0, 0.8)
    love.graphics.rectangle("fill", 50, SCREEN_HEIGHT - 120, SCREEN_WIDTH - 100, 100)
    love.graphics.setColor(1, 1, 1)
    love.graphics.rectangle("line", 50, SCREEN_HEIGHT - 120, SCREEN_WIDTH - 100, 100)
    love.graphics.printf(message, 70, SCREEN_HEIGHT - 100, SCREEN_WIDTH - 140, "left")
end

function draw_dungeon_view()
    local view_w, view_h = 800, 500
    local view_x, view_y = (SCREEN_WIDTH - view_w)/2, 80
    
    -- Draw ceiling
    love.graphics.setColor(1, 1, 1)
    love.graphics.draw(ceiling_texture, view_x, view_y, 0, view_w/TEX_RES, view_h/(2*TEX_RES))
    
    -- Draw floor
    love.graphics.draw(floor_texture, view_x, view_y + view_h/2, 0, view_w/TEX_RES, view_h/(2*TEX_RES))
    
    -- Raycasting for walls
    local rays = 160
    local ray_angle = FOV / rays
    
    for ray = 0, rays do
        local angle = (dir * math.pi/2) - FOV/2 + (ray * ray_angle)
        local sin_a, cos_a = math.sin(angle), math.cos(angle)
        
        local dist = 0
        local hit = false
        local max_dist = 20
        
        while not hit and dist < max_dist do
            dist = dist + 0.05
            local test_x = px + cos_a * dist
            local test_y = py + sin_a * dist
            local map_x, map_y = math.floor(test_x), math.floor(test_y)
            
            if dungeon[map_y] and dungeon[map_y][map_x] == 1 then
                hit = true
            end
        end
        
        if hit then
            local corrected_dist = dist * math.cos((ray * ray_angle) - FOV/2)
            local wall_height = (view_h * 0.8) / (corrected_dist + 0.1)
            wall_height = math.min(wall_height, view_h)
            
            local shade = math.max(0.2, 1 - (corrected_dist / max_dist))
            
            -- Choose texture with moss bias on deeper floors
            local base_var = math.floor(dist * 4 + ray) % 4
            local tex_idx = base_var + 1
            
            if floor_level >= 3 then
                if math.random() < 0.45 then
                    tex_idx = 4  -- mossy variant
                end
            end
            
            local tex = wall_textures[tex_idx]
            
            local strip_w = view_w / rays
            local wall_x = view_x + ray * strip_w
            local wall_y = view_y + (view_h - wall_height) / 2
            
            local tex_scale_y = wall_height / TEX_RES
            local tex_offset = (dist * 30 + ray * 5) % TEX_RES
            
            love.graphics.setColor(shade, shade, shade, 1)
            love.graphics.draw(tex,
                wall_x, wall_y,
                0,
                (strip_w + 1) / TEX_RES, tex_scale_y,
                tex_offset, 0)
        end
    end
    
    -- Border
    love.graphics.setColor(0.6, 0.5, 0.3)
    love.graphics.setLineWidth(4)
    love.graphics.rectangle("line", view_x, view_y, view_w, view_h)
    love.graphics.setLineWidth(1)
end

function draw_party_ui()
    local box_w = 250
    local box_h = 60
    local box_y = 10
    
    for i = 1, 3 do
        local box_x = 50 + (i-1) * (box_w + 20)
        
        if party[i].hp > 0 then
            love.graphics.setColor(0, 0, 0.5, 0.8)
        else
            love.graphics.setColor(0.3, 0, 0, 0.8)
        end
        love.graphics.rectangle("fill", box_x, box_y, box_w, box_h)
        love.graphics.setColor(1, 1, 1)
        love.graphics.rectangle("line", box_x, box_y, box_w, box_h)
        
        love.graphics.setColor(1, 1, 0)
        love.graphics.print(party[i].name, box_x + 10, box_y + 5)
        love.graphics.setColor(0.8, 0.8, 0.8)
        love.graphics.print(party[i].cls .. " LV " .. party[i].lvl, box_x + 10, box_y + 20)
        
        love.graphics.setColor(0.3, 0, 0)
        love.graphics.rectangle("fill", box_x + 10, box_y + 38, 100, 12)
        if party[i].hp > 0 then
            love.graphics.setColor(0, 0.8, 0)
            local hp_width = (party[i].hp / party[i].maxhp) * 100
            love.graphics.rectangle("fill", box_x + 10, box_y + 38, hp_width, 12)
        end
        love.graphics.setColor(1, 1, 1)
        love.graphics.print("HP " .. party[i].hp, box_x + 120, box_y + 38)
        
        if party[i].maxmp > 0 then
            love.graphics.setColor(0, 0, 0.3)
            love.graphics.rectangle("fill", box_x + 180, box_y + 38, 60, 12)
            love.graphics.setColor(0, 0.5, 1)
            local mp_width = (party[i].mp / party[i].maxmp) * 60
            love.graphics.rectangle("fill", box_x + 180, box_y + 38, mp_width, 12)
            love.graphics.setColor(1, 1, 1)
            love.graphics.print("MP", box_x + 180, box_y + 24)
        end
    end
    
    love.graphics.setColor(1, 1, 0)
    love.graphics.print("GOLD: " .. party_gold, SCREEN_WIDTH - 150, 20, 0, 1.5, 1.5)
    love.graphics.print("FLOOR: " .. floor_level, SCREEN_WIDTH - 150, 45, 0, 1.5, 1.5)
end

function draw_combat_scene()
    draw_dungeon_view()
    
    local mon_x, mon_y = SCREEN_WIDTH/2, 300
    
    love.graphics.setColor(combat.monster.color)
    love.graphics.circle("fill", mon_x, mon_y, 80)
    love.graphics.setColor(0, 0, 0)
    love.graphics.circle("line", mon_x, mon_y, 80)
    love.graphics.circle("line", mon_x, mon_y, 82)
    
    love.graphics.setColor(1, 1, 1)
    love.graphics.printf(combat.monster.name, 0, mon_y + 100, SCREEN_WIDTH, "center", 0, 1.5, 1.5)
    
    local hp_w = 300
    local hp_x = (SCREEN_WIDTH - hp_w)/2
    local hp_y = mon_y + 140
    
    love.graphics.setColor(0.3, 0, 0)
    love.graphics.rectangle("fill", hp_x, hp_y, hp_w, 20)
    love.graphics.setColor(0.8, 0, 0)
    local hp_fill = (combat.monster.hp / combat.monster.maxhp) * hp_w
    love.graphics.rectangle("fill", hp_x, hp_y, hp_fill, 20)
    love.graphics.setColor(1, 1, 1)
    love.graphics.rectangle("line", hp_x, hp_y, hp_w, 20)
    love.graphics.printf("HP: " .. combat.monster.hp .. "/" .. combat.monster.maxhp, 0, hp_y + 2, SCREEN_WIDTH, "center")
    
    local party_y = SCREEN_HEIGHT - 200
    for i = 1, 3 do
        local party_x = 100 + (i-1) * 300
        
        if i == combat.selected and party[i].hp > 0 then
            love.graphics.setColor(1, 1, 0)
            love.graphics.setLineWidth(3)
            love.graphics.rectangle("line", party_x - 5, party_y - 5, 280, 70)
            love.graphics.setLineWidth(1)
        end
        
        local box_color = party[i].hp > 0 and {0, 0, 0.5, 0.9} or {0.3, 0, 0, 0.9}
        love.graphics.setColor(box_color)
        love.graphics.rectangle("fill", party_x, party_y, 270, 60)
        love.graphics.setColor(1, 1, 1)
        love.graphics.rectangle("line", party_x, party_y, 270, 60)
        
        love.graphics.setColor(1, 1, 1)
        love.graphics.print(party[i].name .. " (Lv" .. party[i].lvl .. ")", party_x + 10, party_y + 5)
        
        love.graphics.setColor(0.2, 0, 0)
        love.graphics.rectangle("fill", party_x + 10, party_y + 30, 150, 15)
        if party[i].hp > 0 then
            love.graphics.setColor(0, 0.7, 0)
            love.graphics.rectangle("fill", party_x + 10, party_y + 30, (party[i].hp/party[i].maxhp)*150, 15)
        end
        love.graphics.setColor(1, 1, 1)
        love.graphics.print("HP:" .. party[i].hp, party_x + 170, party_y + 30)
    end
    
    if combat.turn == "party" then
        love.graphics.setColor(1, 1, 0)
        love.graphics.printf("TAB: Switch | SPACE: Attack | ESC: Run", 0, SCREEN_HEIGHT - 250, SCREEN_WIDTH, "center", 0, 1.5, 1.5)
    else
        love.graphics.setColor(1, 0.5, 0.5)
        love.graphics.printf("Enemy Turn...", 0, SCREEN_HEIGHT - 250, SCREEN_WIDTH, "center", 0, 1.5, 1.5)
    end
end

function love.update(dt)
    if state == "combat" and combat.turn == "monster" then
        monster_turn(dt)
    end
end