fx_version 'cerulean'
game 'gta5'
lua54 'yes'
author 'pappu'
description 'pappu-multicharacter Allows players to create characters Updated by JericoFX'
version '1.0.4'

shared_scripts {
    '@ox_lib/init.lua',
    '@qb-core/shared/locale.lua',
    'locales/en.lua',
    'locales/*.lua',
    'config.lua'
}

client_scripts {
    'client/main.lua'
}


server_scripts  {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua'
}

ui_page 'html/index.html'

files {
    'html/image/*.png',
    'html/image/*.gif',
    "html/js/*",
    'html/index.html',
    'html/css/*',
}

dependencies {
    'qb-core',
    'qb-spawn'
}