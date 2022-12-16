[
  {
    object: 'egg',
    attributes: {
      id: 16,
      uuid: 'a49bed54-cf3b-4b7c-b0a2-d9ab3ff26d37',
      name: 'NodeJS',
      nest: 6,
      author: 'txhost@outlook.fr',
      description: 'Egg Node JS avec Discord JS pour les Serveur Bot TxHost',
      docker_image: 'ghcr.io/parkervcp/yolks:nodejs_17',
      docker_images: [Object],
      config: [Object],
      startup: 'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/node /home/container/{{BOT_JS_FILE}}',
      script: [Object],
      created_at: '2022-04-03T10:59:10+00:00',
      updated_at: '2022-11-23T20:01:52+00:00'
    }
  },
  {
    object: 'egg',
    attributes: {
      id: 25,
      uuid: 'e0a122b5-8ce2-4e44-a731-4313549044a7',
      name: 'Python',
      nest: 6,
      author: 'parker@parkervcp.com',
      description: 'A Discord bot written in Python using discord.py\r\n' +
        '\r\n' +
        'https://github.com/Ispira/pixel-bot',
      docker_image: 'ghcr.io/parkervcp/yolks:python_3.10',
      docker_images: [Object],
      config: [Object],
      startup: 'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z {{PY_PACKAGES}} ]]; then pip install -U --prefix .local {{PY_PACKAGES}}; fi; if [[ -f /home/container/${REQUIREMENTS_FILE} ]]; then pip install -U --prefix .local -r ${REQUIREMENTS_FILE}; fi; /usr/local/bin/python /home/container/{{BOT_PY_FILE}}',
      script: [Object],
      created_at: '2022-09-16T22:50:47+00:00',
      updated_at: '2022-11-23T20:02:30+00:00'
    }
  }
]
[
  {
    object: 'egg',
    attributes: {
      id: 14,
      uuid: 'fc57b4d5-7f2c-4ebf-bb53-fd75f2884ea3',
      name: 'Rust',
      nest: 4,
      author: 'support@pterodactyl.io',
      description: 'The only aim in Rust is to survive. To do this you will need to overcome struggles such as hunger, thirst and cold. Build a fire. Build a shelter. Kill animals for meat. Protect yourself from other players, and kill them for meat. Create alliances with other players and form a town. Do whatever it takes to survive.',
      docker_image: 'quay.io/pterodactyl/core:rust',
      docker_images: [Object],
      config: [Object],
      startup: './RustDedicated -batchmode +server.port {{SERVER_PORT}} +server.identity "rust" +rcon.port {{RCON_PORT}} +rcon.web true +server.hostname \\"{{HOSTNAME}}\\" +server.level \\"{{LEVEL}}\\" +server.description \\"{{DESCRIPTION}}\\" +server.url \\"{{SERVER_URL}}\\" +server.headerimage \\"{{SERVER_IMG}}\\" +server.logoimage \\"{{SERVER_LOGO}}\\" +server.maxplayers {{MAX_PLAYERS}} +rcon.password \\"{{RCON_PASS}}\\" +server.saveinterval {{SAVEINTERVAL}} +app.port {{APP_PORT}}  $( [ -z ${MAP_URL} ] && printf %s "+server.worldsize \\"{{WORLD_SIZE}}\\" +server.seed \\"{{WORLD_SEED}}\\"" || printf %s "+server.levelurl {{MAP_URL}}" ) {{ADDITIONAL_ARGS}}',
      script: [Object],
      created_at: '2022-04-03T01:49:01+00:00',
      updated_at: '2022-04-03T01:49:01+00:00'
    }
  }
]
[
  {
    object: 'egg',
    attributes: {
      id: 6,
      uuid: 'e91143d5-48b5-4d6d-80de-a70ec4f8b121',
      name: 'Ark: Survival Evolved',
      nest: 2,
      author: 'dev@shepper.fr',
      description: 'As a man or woman stranded, naked, freezing, and starving on the unforgiving shores of a mysterious island called ARK, use your skill and cunning to kill or tame and ride the plethora of leviathan dinosaurs and other primeval creatures roaming the land. Hunt, harvest resources, craft items, grow crops, research technologies, and build shelters to withstand the elements and store valuables, all while teaming up with (or preying upon) hundreds of other players to survive, dominate... and escape! — Gamepedia: ARK',
      docker_image: 'quay.io/parkervcp/pterodactyl-images:debian_source',
      docker_images: [Object],
      config: [Object],
      startup: 'rmv() { echo -e "stopping server"; rcon -t rcon -a 127.0.0.1:${RCON_PORT} -p ${ARK_ADMIN_PASSWORD} -c saveworld && rcon -a 127.0.0.1:${RCON_PORT} -p ${ARK_ADMIN_PASSWORD} -c DoExit; }; trap rmv 15; cd ShooterGame/Binaries/Linux && ./ShooterGameServer {{SERVER_MAP}}?listen?SessionName="{{SESSION_NAME}}"?ServerPassword={{ARK_PASSWORD}}?ServerAdminPassword={{ARK_ADMIN_PASSWORD}}?Port={{SERVER_PORT}}?RCONPort={{RCON_PORT}}?QueryPort={{QUERY_PORT}}?RCONEnabled=True$( [ "$BATTLE_EYE" == "1" ] || printf %s \' -NoBattlEye\' ) -server {{ARGS}} -log & until echo "waiting for rcon connection..."; rcon -t rcon -a 127.0.0.1:${RCON_PORT} -p ${ARK_ADMIN_PASSWORD}; do sleep 5; done',
      script: [Object],
      created_at: '2022-04-03T01:49:00+00:00',
      updated_at: '2022-04-03T01:49:00+00:00'
    }
  },
  {
    object: 'egg',
    attributes: {
      id: 7,
      uuid: '1bb728f6-c06e-4d06-90c1-7cd82b2ad855',
      name: 'Counter-Strike: Global Offensive',
      nest: 2,
      author: 'support@pterodactyl.io',
      description: 'Counter-Strike: Global Offensive is a multiplayer first-person shooter video game developed by Hidden Path Entertainment and Valve Corporation.',
      docker_image: 'ghcr.io/pterodactyl/games:source',
      docker_images: [Object],
      config: [Object],
      startup: './srcds_run -game csgo -console -port {{SERVER_PORT}} +ip 0.0.0.0 +map {{SRCDS_MAP}} -strictportbind -norestart +sv_setsteamaccount {{STEAM_ACC}}',
      script: [Object],
      created_at: '2022-04-03T01:49:00+00:00',
      updated_at: '2022-04-03T01:49:00+00:00'
    }
  },
  {
    object: 'egg',
    attributes: {
      id: 8,
      uuid: 'ddc6daef-74ac-429e-9640-6e94e0f8c57c',
      name: 'Custom Source Engine Game',
      nest: 2,
      author: 'support@pterodactyl.io',
      description: 'This option allows modifying the startup arguments and other details to run a custom SRCDS based game on the panel.',
      docker_image: 'ghcr.io/pterodactyl/games:source',
      docker_images: [Object],
      config: [Object],
      startup: './srcds_run -game {{SRCDS_GAME}} -console -port {{SERVER_PORT}} +map {{SRCDS_MAP}} +ip 0.0.0.0 -strictportbind -norestart',
      script: [Object],
      created_at: '2022-04-03T01:49:00+00:00',
      updated_at: '2022-04-03T01:49:00+00:00'
    }
  },
  {
    object: 'egg',
    attributes: {
      id: 9,
      uuid: '696138a0-c130-4965-a369-5a9f99d00c1d',
      name: 'Garrys Mod',
      nest: 2,
      author: 'support@pterodactyl.io',
      description: 'Garrys Mod, is a sandbox physics game created by Garry Newman, and developed by his company, Facepunch Studios.',
      docker_image: 'ghcr.io/pterodactyl/games:source',
      docker_images: [Object],
      config: [Object],
      startup: `./srcds_run -game garrysmod -console -port {{SERVER_PORT}} +ip 0.0.0.0 +host_workshop_collection {{WORKSHOP_ID}} +map {{SRCDS_MAP}} +gamemode {{GAMEMODE}} -strictportbind -norestart +sv_setsteamaccount {{STEAM_ACC}} +maxplayers {{MAX_PLAYERS}}  -tickrate {{TICKRATE}}  $( [ "$LUA_REFRESH" == "1" ] || printf %s '-disableluarefresh' )`,
      script: [Object],
      created_at: '2022-04-03T01:49:00+00:00',
      updated_at: '2022-04-03T01:49:00+00:00'
    }
  },
  {
    object: 'egg',
    attributes: {
      id: 10,
      uuid: '14a7540d-35e9-4bb2-a77e-3554aa08cabd',
      name: 'Insurgency',
      nest: 2,
      author: 'support@pterodactyl.io',
      description: "Take to the streets for intense close quarters combat, where a team's survival depends upon securing crucial strongholds and destroying enemy supply in this multiplayer and cooperative Source Engine based experience.",
      docker_image: 'ghcr.io/pterodactyl/games:source',
      docker_images: [Object],
      config: [Object],
      startup: './srcds_run -game insurgency -console -port {{SERVER_PORT}} +map {{SRCDS_MAP}} +ip 0.0.0.0 -strictportbind -norestart',
      script: [Object],
      created_at: '2022-04-03T01:49:00+00:00',
      updated_at: '2022-04-03T01:49:00+00:00'
    }
  },
  {
    object: 'egg',
    attributes: {
      id: 11,
      uuid: '0721fda2-d602-4495-ae9d-78c7e5384741',
      name: 'Team Fortress 2',
      nest: 2,
      author: 'support@pterodactyl.io',
      description: 'Team Fortress 2 is a team-based first-person shooter multiplayer video game developed and published by Valve Corporation. It is the sequel to the 1996 mod Team Fortress for Quake and its 1999 remake.',
      docker_image: 'ghcr.io/pterodactyl/games:source',
      docker_images: [Object],
      config: [Object],
      startup: './srcds_run -game tf -console -port {{SERVER_PORT}} +map {{SRCDS_MAP}} +ip 0.0.0.0 -strictportbind -norestart +sv_setsteamaccount {{STEAM_ACC}}',
      script: [Object],
      created_at: '2022-04-03T01:49:00+00:00',
      updated_at: '2022-08-09T11:05:27+00:00'
    }
  }
]
[
  {
    object: 'egg',
    attributes: {
      id: 15,
      uuid: 'da7e5907-c903-4712-8f37-3e30a42eee2b',
      name: 'FiveM',
      nest: 5,
      author: 'txhost@outlook.fr',
      description: 'Egg Five M pour les Serveurs Game Fivem TxHost',
      docker_image: 'quay.io/parkervcp/pterodactyl-images:base_debian',
      docker_images: [Object],
      config: [Object],
      startup: `$(pwd)/alpine/opt/cfx-server/ld-musl-x86_64.so.1 --library-path "$(pwd)/alpine/usr/lib/v8/:$(pwd)/alpine/lib/:$(pwd)/alpine/usr/lib/" -- $(pwd)/alpine/opt/cfx-server/FXServer +set citizen_dir $(pwd)/alpine/opt/cfx-server/citizen/ +set sv_licenseKey {{FIVEM_LICENSE}} +set steam_webApiKey {{STEAM_WEBAPIKEY}} +set sv_maxplayers {{MAX_PLAYERS}} +set serverProfile default +set txAdminPort {{TXADMIN_PORT}} $( [ "$TXADMIN_ENABLE" == "1" ] || printf %s '+exec server.cfg' )`,
      script: [Object],
      created_at: '2022-04-03T02:09:20+00:00',
      updated_at: '2022-04-03T02:17:37+00:00'
    }
  }
]
[
  {
    object: 'egg',
    attributes: {
      id: 12,
      uuid: '55921093-3a1a-4f71-b778-3beea9ce6842',
      name: 'Mumble Server',
      nest: 3,
      author: 'support@pterodactyl.io',
      description: 'Mumble is an open source, low-latency, high quality voice chat software primarily intended for use while gaming.',
      docker_image: 'ghcr.io/pterodactyl/yolks:alpine',
      docker_images: [Object],
      config: [Object],
      startup: './murmur.x86 -fg',
      script: [Object],
      created_at: '2022-04-03T01:49:01+00:00',
      updated_at: '2022-04-03T01:49:01+00:00'
    }
  },
  {
    object: 'egg',
    attributes: {
      id: 13,
      uuid: 'b51c2234-6572-4cb5-8de5-073b0782697a',
      name: 'Teamspeak3 Server',
      nest: 3,
      author: 'support@pterodactyl.io',
      description: 'VoIP software designed with security in mind, featuring crystal clear voice quality, endless customization options, and scalabilty up to thousands of simultaneous users.',
      docker_image: 'ghcr.io/pterodactyl/yolks:debian',
      docker_images: [Object],
      config: [Object],
      startup: './ts3server default_voice_port={{SERVER_PORT}} query_port={{QUERY_PORT}} filetransfer_ip=0.0.0.0 filetransfer_port={{FILE_TRANSFER}} license_accepted=1',
      script: [Object],
      created_at: '2022-04-03T01:49:01+00:00',
      updated_at: '2022-04-03T01:49:01+00:00'
    }
  }
]
[
  {
    object: 'egg',
    attributes: {
      id: 22,
      uuid: '4b4af19f-97bf-45f3-9cde-9fc1d3b1d3f9',
      name: 'Uptime Kuma',
      nest: 8,
      author: 'toufix@txhost.fr',
      description: 'It is a self-hosted monitoring tool like "Uptime Robot".',
      docker_image: 'quay.io/parkervcp/pterodactyl-images:debian_nodejs-16',
      docker_images: [Object],
      config: [Object],
      startup: 'UPTIME_KUMA_PORT={{SERVER_PORT}} node server/server.js',
      script: [Object],
      created_at: '2022-05-16T17:27:36+00:00',
      updated_at: '2022-05-16T17:27:36+00:00'
    }
  }
]
[
  {
    object: 'egg',
    attributes: {
      id: 1,
      uuid: 'dbd7544a-b197-4fc7-86dd-836fd5bc37a3',
      name: 'Bungeecord',
      nest: 1,
      author: 'support@pterodactyl.io',
      description: "For a long time, Minecraft server owners have had a dream that encompasses a free, easy, and reliable way to connect multiple Minecraft servers together. BungeeCord is the answer to said dream. Whether you are a small server wishing to string multiple game-modes together, or the owner of the ShotBow Network, BungeeCord is the ideal solution for you. With the help of BungeeCord, you will be able to unlock your community's full potential.",
      docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
      docker_images: [Object],
      config: [Object],
      startup: 'java -Xms128M -XX:MaxRAMPercentage=95.0 -jar {{SERVER_JARFILE}}',
      script: [Object],
      created_at: '2022-04-03T01:49:00+00:00',
      updated_at: '2022-08-09T11:05:27+00:00'
    }
  },
  {
    object: 'egg',
    attributes: {
      id: 2,
      uuid: '9c9762e8-f0bf-44c6-9870-568df7779eec',
      name: 'Forge Minecraft',
      nest: 1,
      author: 'support@pterodactyl.io',
      description: 'Minecraft Forge Server. Minecraft Forge is a modding API (Application Programming Interface), which makes it easier to create mods, and also make sure mods are compatible with each other.',
      docker_image: 'ghcr.io/pterodactyl/yolks:java_18',
      docker_images: [Object],
      config: [Object],
      startup: 'java -Xms128M -XX:MaxRAMPercentage=95.0 -Dterminal.jline=false -Dterminal.ansi=true $( [[  ! -f unix_args.txt ]] && printf %s "-jar {{SERVER_JARFILE}}" || printf %s "@unix_args.txt" )',
      script: [Object],
      created_at: '2022-04-03T01:49:00+00:00',
      updated_at: '2022-12-07T10:22:36+00:00'
    }
  },
  {
    object: 'egg',
    attributes: {
      id: 3,
      uuid: 'dfe43d53-a2d6-4ce0-8b74-a01c102fee70',
      name: 'Paper',
      nest: 1,
      author: 'parker@pterodactyl.io',
      description: 'High performance Spigot fork that aims to fix gameplay and mechanics inconsistencies.',
      docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
      docker_images: [Object],
      config: [Object],
      startup: 'java -Xms128M -XX:MaxRAMPercentage=95.0 -Dterminal.jline=false -Dterminal.ansi=true -jar {{SERVER_JARFILE}}',
      script: [Object],
      created_at: '2022-04-03T01:49:00+00:00',
      updated_at: '2022-08-09T11:05:27+00:00'
    }
  },
  {
    object: 'egg',
    attributes: {
      id: 5,
      uuid: '8bdd26a6-0efb-4c29-9956-e209533a6322',
      name: 'Vanilla Minecraft',
      nest: 1,
      author: 'support@pterodactyl.io',
      description: 'Minecraft is a game about placing blocks and going on adventures. Explore randomly generated worlds and build amazing things from the simplest of homes to the grandest of castles. Play in Creative Mode with unlimited resources or mine deep in Survival Mode, crafting weapons and armor to fend off dangerous mobs. Do all this alone or with friends.',
      docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
      docker_images: [Object],
      config: [Object],
      startup: 'java -Xms128M -XX:MaxRAMPercentage=95.0 -jar {{SERVER_JARFILE}}',
      script: [Object],
      created_at: '2022-04-03T01:49:00+00:00',
      updated_at: '2022-08-09T11:05:27+00:00'
    }
  },
  {
    object: 'egg',
    attributes: {
      id: 18,
      uuid: '06d2aa2f-255b-4941-9d76-da1dfe754070',
      name: 'Curseforge',
      nest: 1,
      author: 'parker@parkervcp.com',
      description: 'A generic egg for a forge modpack',
      docker_image: 'ghcr.io/pterodactyl/yolks:java_8',
      docker_images: [Object],
      config: [Object],
      startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar server.jar',
      script: [Object],
      created_at: '2022-04-09T18:03:44+00:00',
      updated_at: '2022-12-06T21:31:31+00:00'
    }
  },
  {
    object: 'egg',
    attributes: {
      id: 21,
      uuid: '17f979f3-80a7-4238-ba4f-e0e0ad12ead1',
      name: 'Spigot',
      nest: 1,
      author: 'support@pterodactyl.io',
      description: 'Spigot is the most widely-used modded Minecraft server software in the world. It powers many of the top Minecraft server networks around to ensure they can cope with their huge player base and ensure the satisfaction of their players. Spigot works by reducing and eliminating many causes of lag, as well as adding in handy features and settings that help make your job of server administration easier.',
      docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
      docker_images: [Object],
      config: [Object],
      startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
      script: [Object],
      created_at: '2022-04-25T15:22:16+00:00',
      updated_at: '2022-04-25T15:22:16+00:00'
    }
  },
  {
    object: 'egg',
    attributes: {
      id: 23,
      uuid: '5d546326-6694-49a0-a4b1-88b7437d4102',
      name: 'SpongeVanilla',
      nest: 1,
      author: 'parker@parkervcp.com',
      description: 'SpongeVanilla is the implementation of the Sponge API on top of Vanilla Minecraft.',
      docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
      docker_images: [Object],
      config: [Object],
      startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
      script: [Object],
      created_at: '2022-07-20T23:56:13+00:00',
      updated_at: '2022-07-20T23:56:13+00:00'
    }
  },
  {
    object: 'egg',
    attributes: {
      id: 24,
      uuid: '771dbe9e-9894-4369-996e-b531dfb0758e',
      name: 'Sponge (SpongeVanilla)',
      nest: 1,
      author: 'support@pterodactyl.io',
      description: 'SpongeVanilla is the SpongeAPI implementation for Vanilla Minecraft.',
      docker_image: 'ghcr.io/pterodactyl/yolks:java_16',
      docker_images: [Object],
      config: [Object],
      startup: 'java -Xms128M -XX:MaxRAMPercentage=95.0 -jar {{SERVER_JARFILE}}',
      script: [Object],
      created_at: '2022-08-09T11:05:27+00:00',
      updated_at: '2022-08-09T11:05:27+00:00'
    }
  }
]
