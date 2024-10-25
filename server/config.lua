local SConfig = {}
SConfig.DefaultNumberOfCharacters = 2 --  Max 4 // Dont Go More Than 4
SConfig.PlayersNumberOfCharacters = { -- Define maximum amount of player characters by rockstar license (you can find this license in your server's database in the player table)
     ["license:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"] = 2 ,
}
SConfig.WebHook = ""
SConfig.EnableDeleteButton = false

return SConfig