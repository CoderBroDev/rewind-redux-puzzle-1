namespace SpriteKind {
    export const Math = SpriteKind.create()
    export const Scanline = SpriteKind.create()
    export const WallyDown = SpriteKind.create()
    export const WallyUp = SpriteKind.create()
    export const ButtonTester = SpriteKind.create()
}
namespace NumProp {
    export const lastX = NumProp.create()
    export const lastY = NumProp.create()
}
namespace NumArrayProp {
    export const xPositions = NumArrayProp.create()
    export const yPositions = NumArrayProp.create()
}
namespace BoolProp {
    export const rewinding = BoolProp.create()
    export const following = BoolProp.create()
}
scene.onOverlapTile(SpriteKind.Player, assets.tile`myTile1`, function (sprite, location) {
    if (!(blockObject.getBooleanProperty(blockObject.getStoredObject(sprite), BoolProp.rewinding))) {
        takeDamage()
    }
})
function setWallyState (upIsInCharge: boolean) {
    wallyUpIsDefinitelyInCharge = upIsInCharge
    if (upIsInCharge) {
        for (let value of sprites.allOfKind(SpriteKind.WallyUp)) {
            sprites.setDataBoolean(value, "moving", true)
            value.vy = 0 - wallySpeed
        }
        for (let value of sprites.allOfKind(SpriteKind.WallyDown)) {
            sprites.setDataBoolean(value, "moving", true)
            value.vy = 0 - wallySpeed
        }
    } else {
        for (let value of sprites.allOfKind(SpriteKind.WallyUp)) {
            sprites.setDataBoolean(value, "moving", true)
            value.vy = wallySpeed
        }
        for (let value of sprites.allOfKind(SpriteKind.WallyDown)) {
            sprites.setDataBoolean(value, "moving", true)
            value.vy = wallySpeed
        }
    }
}
function doAJump (sprite: Sprite, jumpHeight: number) {
    if (sprite.isHittingTile(CollisionDirection.Bottom)) {
        sprite.vy = 0 - Math.sqrt(2 * gravity * jumpHeight)
    }
}
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    doARewind(false)
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    doAJump(notRichard, jumpHeight)
})
function doARewind (richardToo: boolean) {
    for (let index = 0; index < 10; index++) {
        scanline = shader.createImageShaderSprite(img`
            ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
            ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
            `, shader.ShadeLevel.One)
        scanline.setKind(SpriteKind.Scanline)
        scanline.setFlag(SpriteFlag.RelativeToCamera, true)
        scanline.vy = randint(50, 100)
        scanline.y += randint(-80, 80)
        if (Math.percentChance(50)) {
            scanline.vy = scanline.vy * -1
        }
    }
    if (richardToo) {
        rewind(notRichard)
    }
    for (let value of sprites.allOfKind(SpriteKind.Enemy)) {
        rewind(value)
    }
    timer.background(function () {
        while (wallyEvents.length > 0) {
            if (wallyUpIsDefinitelyInCharge != wallyEvents.pop()) {
                setWallyState(!(wallyUpIsDefinitelyInCharge))
                pause(rewindTimeStep)
            }
        }
    })
}
function rewind (sprite: Sprite) {
    if (!(blockObject.getBooleanProperty(blockObject.getStoredObject(sprite), BoolProp.rewinding))) {
        blockObject.setBooleanProperty(blockObject.getStoredObject(sprite), BoolProp.rewinding, true)
        controller.moveSprite(sprite, 0, 0)
        sprite.ay = 0
        sprite.follow(notRichard, 0)
        timer.background(function () {
            while (blockObject.getNumberArrayProperty(blockObject.getStoredObject(sprite), NumArrayProp.xPositions).length > 0) {
                moveTo(sprite, blockObject.getNumberArrayProperty(blockObject.getStoredObject(sprite), NumArrayProp.xPositions).pop(), blockObject.getNumberArrayProperty(blockObject.getStoredObject(sprite), NumArrayProp.yPositions).pop(), rewindTimeStep)
            }
            blockObject.setBooleanProperty(blockObject.getStoredObject(sprite), BoolProp.rewinding, false)
            sprite.ay = gravity
            if (sprite == notRichard) {
                controller.moveSprite(sprite, 60, 0)
            }
            if (sprite.kind() == SpriteKind.Enemy) {
                if (blockObject.getNumberProperty(blockObject.getStoredObject(sprite), NumProp.lastX) < sprite.x) {
                    sprite.vx = 0 - notKoopaSpeed
                } else {
                    sprite.vx = notKoopaSpeed
                }
            }
            for (let value of sprites.allOfKind(SpriteKind.Scanline)) {
                value.destroy()
            }
        })
    }
}
scene.onOverlapTile(SpriteKind.Player, assets.tile`myTile3`, function (sprite, location) {
    game.showLongText("You have solved this puzzle, good job! Move to the next one!", DialogLayout.Bottom)
    pause(1000)
    game.over(true)
})
function updateTheWallyButton () {
    for (let value of sprites.allOfKind(SpriteKind.WallyUp)) {
        if (sprites.readDataBoolean(value, "moving")) {
            return
        }
    }
    for (let value of sprites.allOfKind(SpriteKind.WallyDown)) {
        if (sprites.readDataBoolean(value, "moving")) {
            return
        }
    }
    for (let value of sprites.allOfKind(SpriteKind.ButtonTester)) {
        if (!(value.overlapsWith(notRichard))) {
            for (let value of tiles.getTilesByType(assets.tile`myTile8`)) {
                tiles.setTileAt(value, assets.tile`myTile5`)
            }
            value.destroy()
        }
    }
}
scene.onOverlapTile(SpriteKind.WallyUp, assets.tile`myTile`, function (sprite, location) {
    tiles.placeOnTile(sprite, tiles.locationOfSprite(sprite))
    if (sprite.vy < 0) {
        fillLineFrom(sprite, false, assets.tile`myTile9`, true)
    } else if (sprite.vy > 0) {
        fillLineFrom(sprite, true, assets.tile`myTile0`, false)
    }
    sprite.setVelocity(0, 0)
})
function createTimeStore (sprite: Sprite) {
    tempObject = blockObject.create()
    blockObject.setNumberArrayProperty(tempObject, NumArrayProp.xPositions, [])
    blockObject.setNumberArrayProperty(tempObject, NumArrayProp.yPositions, [])
    blockObject.storeOnSprite(tempObject, sprite)
}
function takeDamage () {
    timer.background(function () {
        story.printDialog("Ouch... Let's try that again", 80, 60, 50, 80, 10, 0)
    })
    info.changeLifeBy(-1)
    doARewind(true)
}
function moveTo (sprite: Sprite, x: number, y: number, time: number) {
    mathSprite.setPosition(x, y)
    blockObject.setNumberProperty(blockObject.getStoredObject(sprite), NumProp.lastX, sprite.x)
    blockObject.setNumberProperty(blockObject.getStoredObject(sprite), NumProp.lastY, sprite.y)
    spriteutils.setVelocityAtAngle(sprite, spriteutils.angleFrom(sprite, mathSprite), spriteutils.distanceBetween(sprite, mathSprite) / (time / 1000))
    pause(time)
    sprite.setVelocity(0, 0)
    sprite.setPosition(x, y)
}
scene.onOverlapTile(SpriteKind.Player, assets.tile`myTile5`, function (sprite, location) {
    tiles.setTileAt(location, assets.tile`myTile8`)
    setWallyState(!(wallyUpIsDefinitelyInCharge))
    buttonTester = sprites.create(img`
        2 2 2 2 2 2 2 2 
        2 2 2 2 2 2 2 2 
        2 2 2 2 2 2 2 2 
        2 2 2 2 2 2 2 2 
        2 2 2 2 2 2 2 2 
        2 2 2 2 2 2 2 2 
        2 2 2 2 2 2 2 2 
        2 2 2 2 2 2 2 2 
        `, SpriteKind.ButtonTester)
    buttonTester.setFlag(SpriteFlag.Invisible, true)
    tiles.placeOnTile(buttonTester, location)
})
scene.onOverlapTile(SpriteKind.WallyDown, assets.tile`myTile`, function (sprite, location) {
    tiles.placeOnTile(sprite, tiles.locationOfSprite(sprite))
    if (sprite.vy < 0) {
        fillLineFrom(sprite, false, assets.tile`myTile0`, false)
    } else if (sprite.vy > 0) {
        fillLineFrom(sprite, true, assets.tile`myTile9`, true)
    }
    sprite.setVelocity(0, 0)
})
function recordPosition (sprite: Sprite) {
    if (!(blockObject.getBooleanProperty(blockObject.getStoredObject(sprite), BoolProp.rewinding))) {
        blockObject.getNumberArrayProperty(blockObject.getStoredObject(sprite), NumArrayProp.xPositions).push(sprite.x)
        blockObject.getNumberArrayProperty(blockObject.getStoredObject(sprite), NumArrayProp.yPositions).push(sprite.y)
        if (blockObject.getNumberArrayProperty(blockObject.getStoredObject(sprite), NumArrayProp.xPositions).length > 10) {
            blockObject.getNumberArrayProperty(blockObject.getStoredObject(sprite), NumArrayProp.xPositions).shift()
            blockObject.getNumberArrayProperty(blockObject.getStoredObject(sprite), NumArrayProp.yPositions).shift()
        }
    }
}
function fillLineFrom (sprite: Sprite, up: boolean, tile: Image, isWall: boolean) {
    sprites.setDataNumber(sprite, "startx", sprite.x)
    sprites.setDataNumber(sprite, "starty", sprite.y)
    timer.background(function () {
        while (!(tiles.tileIs(tiles.locationOfSprite(sprite), assets.tile`myTile`))) {
            pause(10)
            tiles.setTileAt(tiles.locationOfSprite(sprite), tile)
            tiles.setWallAt(tiles.locationOfSprite(sprite), isWall)
            if (up) {
                tiles.placeOnTile(sprite, tiles.locationInDirection(tiles.locationOfSprite(sprite), CollisionDirection.Top))
            } else {
                tiles.placeOnTile(sprite, tiles.locationInDirection(tiles.locationOfSprite(sprite), CollisionDirection.Bottom))
            }
        }
        sprite.setPosition(sprites.readDataNumber(sprite, "startx"), sprites.readDataNumber(sprite, "starty"))
        sprites.setDataBoolean(sprite, "moving", false)
    })
}
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    if (!(blockObject.getBooleanProperty(blockObject.getStoredObject(sprite), BoolProp.rewinding))) {
        takeDamage()
    }
})
let enemySpotToCheck: tiles.Location = null
let buttonTester: Sprite = null
let tempObject: blockObject.BlockObject = null
let scanline: Sprite = null
let wallyUpIsDefinitelyInCharge = false
let wallyEvents: boolean[] = []
let wally: Sprite = null
let anEnemy: Sprite = null
let notKoopaSpeed = 0
let rewindTimeStep = 0
let mathSprite: Sprite = null
let jumpHeight = 0
let gravity = 0
let notRichard: Sprite = null
let wallySpeed = 0
music.beamUp.play()
scene.setBackgroundImage(img`
    9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999
    9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999
    9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999
    9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999995555599999999999999999999999999999999999999
    9998888888888888888889999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999995aaa599999999999999999955555599999999999999
    9998822222222222222889999999999999999999999999999999999999999995555555555559999999999999999999999999999999999999999995aaa599999999999999999955aaa599999999999999
    99988222222222222228899999999999999999999999999999999999999999995aaaaaaaaa55999999999999999999999999999999999999999995555599999999999999999955aaa599999999999999
    99988222222222222228899999999999999999999999999888888888899999995aaaa5555aa5999999955555555555955555599999999999999999999999999999999999999955aaa599999999999999
    99988222222222222228898888899888888899998888999822222222899999995aaaa5555aa59999995aaaaaaaaaa595aaaa59991111955559955555599955555555555955555aaaa599999999999999
    99988222222222222228818228898222222889982228899822222222899999995aaaa5555aa59999995aaaa55555a595aaaa5991111115aa5995aaaa5995aaaaaaaaaa595aaaaaaaa599999999999999
    99988888888222288888818888898222222289982222899828888882899999995aaaa5555aa55999995aaaa55555a595aaaa5995555515aa5995aaaa5995aaaaaaaaaa595aaaaaaaa599999999999999
    99988888888222289911111111198222222288982222899828888882899999995aaaaaaaaaaa5555995aaaaaaaaaa595aaaa5115aaa515aa5115aaaa5995aaaaaaaaaa595aa5555aa599999999999999
    99999999988222289111188888818222222228882222899828888882899999995aaaaaaaaaaaaa55595aaaaaaaaaa595aaaa5115aaa515aa5115aaaa5995aa5555aaaa595aa5555aa599999999999999
    99999999988222281111182222818222888822222222899822222222899999995aaaa5555aaaaa55555aaa5555555595aaaa5555aaa555aa5115aaaa5995aa5995aaaa595aa5555aa555555599999999
    99999999988222281111182222818222881882228822899828888888899999995aaaa5595aaaaaaaa55aaa5999999995aaaaaaaaaaaaaaaa5115aaaa5995aa5995aaaa595aa5555aaaaa555599999999
    99999999988222289111182222818222281182288822899828999999999999995aaaa5595555555aa55aaaa555555995aaaaaaaaaaaaaaaa5115aaaa5115aa5995aaaa595aaaaaaaaaaaaaa599999999
    99999999988222281911182222818222281188881822899828888888899999995aaaa5599999995aa55aaaaaaaaa5995aaaaaaaaaaaaaaaa5115aaaa5115555995aaaa59555555555555555599999999
    99999999988222281191182222818222881999111882899822222228899999995aaaa55999999955555aaaaaaaaa59115555555555555555511555555111119999555559999999999999999999999999
    9999999998888888111118888881888881911111118889988888888889999999555555599999999955555555555599111111111111111111111191111111119999999999999999999999999999999999
    9999999999991111111111111111111111111111111199999999999999999999999999999999999999999999999999111111111111111111111111111111119999999999999999999999999999999999
    9999999999999111111111111111111111111111111199999999999999999999999999999999999999999999999999911111111111111111111111111111119999999999999999999999999999999999
    9911199991111911111111111111111111111111111991199999999999991111999999999999999999991119999111191111111111111111111111111111199119999999999999111199999999999999
    9111119911111111111111111111111111111111111911119999999999911111199999999999999999911111991111111111111111111111111111111111191111999999999991111119999999999999
    9111119111111111111111111111111111111111111911119999999999911111191119999999999999911111911111111111111111111111111111111111191111999999999991111119111999999999
    9911111111111111111111111111111111111111111111119999999999999111111111999999999999991111111111111111111111111111111111111111111111999999999999911111111199999999
    9111111111111111111111111111111111111111111111199999999911119111111111999999999999911111111111111111111111111111111111111111111119999999991111911111111199999999
    1111111111111111111111111111111111111111111111119999999111111111111119999999999199111111111dd1111111111111111111111111111111111111999999911111111111111999999999
    1111111111111111111111111111111111111111111111111911199111111111111111111999999ddd111111111ddd111111111111111111111111111111111111191119911111111111111111199999
    1111111111111111111111111111111111111111111111111111111111111111111111111199991ddd111111111ddd111111111111111111111111111111111111111111111111111111111111119999
    11111111111111111111111111111111111111111111111111111111111111111111111111999ddddddd111111ddddd11111111111111111111111111111111111111111111111111111111111119999
    11111111111111111111111111111111111111111ddddddddd111111111111111111111111111ddddddd111111ddddd111111111111111111111111111111111111111111dddddddddd1111111111111
    11111111111111111111111111111111111111111ddddddddd111111111111111111111111111ddddddd111111ddddd111111111111111111111111111111111111111111dddddddddd1111111111111
    1111111111111111111ddd1111111111111111111d11dddddd111111111111111111111111111d11dddd11111ddddddd11111111111111111111dd1111111111111111111dd1d1ddddd1111111111111
    111111111111111111ddddd111111111111111111ddddddd1d111111111111111111111111111ddddddd11111ddddddd1111111111111111111dddd111111111111111111dddddd11dd1111111111111
    11111111111111111dddddd111111111111111111ddddddddd1111111111d11111111ddddd111d1ddddd11111ddddddd11111111111111111dddddd111111111111111111dddddddddd1111111111111
    11111111111111111ddd1d111111d111111111111ddddddddd111111111dd11111111ddddd111ddddddd11111ddddddd11111111111111111ddd1d111111dd11111111111dddd1ddddd11111111dd111
    11111111111111111dddddd11111d111111111111ddddddd1d111111111dd11111111ddddd111ddddddd11111ddddddd11111111111111111dddddd11111dd11111111111ddddddd1dd11111111dd111
    11111111ddd111111dd11d11111ddd11111111111ddddddddd11dddddd1dd11111111ddddd111ddddddd11111ddddddd111111111dd111111ddd1d11111ddd11111111111dddddddddd1ddddddddd111
    d1dd1111ddddddddddd1ddd111ddddd1111111111ddddddd1d11d11ddd1dd111111111dd1dd11ddddddd111dddddddddd1dd1111ddddddddddddd1d1111dddd1111111111dddddd11dd1d11dddddd111
    dddd11111d1dd1ddddddddd111ddddd1111111111ddddddddd11dddd1d1dd11111111dddddd11dd1dddd111ddddddddddddd1111dd1ddd1dddddddd1111dddd1111111111dddddddddd1dddd1dddd111
    dd1d11111ddd1111ddddddd111ddddd1111111111ddddddddd11dddd1dddd11111111dddddd11ddddddd111ddddddddddd1d1111dddd1d11ddddddd1111dddd1111111111dddddddddd1dddd1dddd111
    dddd1111dddddddddddddddd11dddddd11dd1dd1ddddddddddd1d11dddddd11111111dddddd11ddddddd111ddddddddddddd1111dddddddddddddddd11dddddd111d11ddddddddddddd1d11dddddd111
    dd1d1111dddddddddddddddd11dddddd11ddddddddddddddddd1ddddddddd11d11d11dddddd11ddddddd111ddddddddddd1d1111dddddddddddddddd11dddddd111dddddddddddddddd1ddddddddd111
    ddddd1dd1d1ddddddddddddd11ddddddd1dddd11ddddddddddddd11bbddddddd1ddd11dd1dd11ddddddd111ddddddddddddddd1ddd1ddddddddddddd11ddddddd111d11ddddddbddddddd11bbbddd1dd
    ddddd1dddddddddddddddddddd1dddddd1dddddddddbbbdddddddddbbbdddddd1ddd1dddddd11ddddddd111ddddddddddddddd1dddddddddddddddddddddddddd1ddddddddddbbdddddddddbbbddd1dd
    ddddd1ddddddddddddddddddddddddddd1dddddddddbbbdddddddddbbbdddddddddddddddddddddddddd111ddddddddddddddd1dddddddddddddddddddddddddd1ddddddddddbbdddddddddbbbdddddd
    ddddd1ddddddddddddddddddddddddddd1dddddddbbbbbbbddddddbbbbbddddddddddddddddddddddddddd1ddddddddddddddd1dddddddddddddddddddddddddd1d1ddddddbbbbbbbdddddbbbbbddddd
    dddddbbbbbbbbbddddddddddddddddddd1dddddddbbbbbbbddddddbbbbbddddddddddddddddddddddddddd1ddddddddddddddbbbbbbbbbbdddddddddddddddddd1ddddddddbbbbbbbdddddbbbbbddddd
    dddddbbbbbbbbbddddddddddddddddddd1dddddddbbbbbbbddddddbbbbbddddddddddddddddddddddddddd1ddddddddddddddbbbbbbbbbbdddddddddddddddddd1ddddddddbbbbbbbdddddbbbbbddddd
    dddddbddbbbbbbddddddddddddddddddd1dddddddbddbbbbdddddbbbbbbbdd111dddddddddddddddbbdddd1ddddddddddddddbbdbdbbbbbdddddddddddddddddd1ddddddddbbbbbbbddddbbbbbbbb11d
    dddddbbbbbbbdbddddddddddddddddddd1dddddddbbbbbbbdddddbbbbbbbddd11ddddddddddddddbbbbddd1ddddddddddddddbbbbbbddbbdddddddddddddddddd1ddddddddbbbbbbbddddbbbbbbbbddd
    dddddbbbbbbbbbddddddddddbddddddddbbbbbdddbdbbbbbdddddbbbbbbbddddddddddd1dddddbbbbbbddd1ddddddddddddddbbbbbbbbbbdddddddddddddddddddbbbbddddbbbdbbbddddbbbbbbbbddd
    dddddbbbbbbbbbdddddddddbbddddddddbbbbbdddbbbbbbbdddddbbbbbbbdd1ddddddddddddddbbbdbddddddbbdddddddddddbbbbdbbbbbddddddddbbdddddddddbbbbddddbbbdbbbddddbbbbbbbbd1d
    dddddbbbbbbbdbdddddddddbbddddddddbbbbbdddbbbbbbbdddddbbbbbbbdd111ddddddddddddbbbbbbdddddbbdddddddddddbbbbbbbdbbddddddddbbddddddddbbbbbbdddbbbbbbbddddbbbbbbbb11d
    dddddbbbbbbbbbddbbbbbbdbbddddddddbbbbbdddbbbbbbbdddddbbbbbbbdddddddddbb1dddddbbbdbdddddbbbdddddddddddbbbbbbbbbbdbbbbbbbbbddddddddbbbbbbdddbbbdbbbddddbbbbbbbbddd
    dddddbbbbbbbdbddbddbbbdbbdddddddddbbdbbddbbbbbbbdddbbbbbbbbbbdbbddddbbbbbbbbbbbbbdbddddbbbbddddddddddbbbbbbddbbdbddbbbbbbddddddddbbbbbbbddbbbbbbbddbbbbbbbbbbbbb
    dddddbbbbbbbbbddbbbbdbdbbddddddddbbbbbbddbbdbbbbdddbbbbbbbbbbbbbddddbbdbbbdbbbbbbbbddddbbbbddddddddddbbbbbbbbbbdbbbbdbbbbddddddddbbbbbbbddbbbbdbbddbbbbbbbbbbbbb
    dddddbbbbbbbbbddbbbbdbbbbddddddddbbbbbbddbbbbbbbdddbbbbbbbbbbbdbddddbbbbdbddbbbbbbbddddbbbbddddddddddbbbbbbbbbbdbbbbdbbbbddddddddbbbbbbbddbbbbbbbddbbbbbbbbbbbbb
    dbbdbbbbbbbbbbbdbddbbbbbbddddddddbbbbbbddbbbbbbbdddbbbbbbbbbbbbbddddbbbbbbbbbbbbbbbbddbbbbbbdddbddbbbbbbbbbbbbbdbddbbbbbbddddddddbbbbbbbddbbbbbbbddbbbbbbbbbbbbb
    bbbbbbbbbbbbbbbdbbbbbbbbbddbddbddbbbbbbddbbbbbbbdddbbbbbbbbbbbdbddddbbbbbbbbbbbbbbbbddbbbbbbdddbbbbbbbbbbbbbbbbdbbbbbbbbbdddddbddbbbbbbbddbbbbbbbddbbbbbbbbbbbbb
    bbddbbbbbbbbbbbbbddddbbbbbbbdbbbddbbdbbddbbbbbbbdddbbbbbbbbbbbbbbbdbbbdbbbbbbbbbbbbbddbbbbbbbdddbddbbbbbbbbbbbbbbddbdbbbbdbbdbbbdbbbbbbbddbbbbbbbddbbbbbbbbbbbbb
    bbbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbdbbbbbbddbbbbbbbdddbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbbbbbbbbbbbbbdbbdbbbbbbbbbbbddbbbbdbbddbbbbbbbbbbbbb
    bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdddbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbddbbbbbbbbbbbbb
    bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbbbbbbbbbbbbdbdbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbbbb
    bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbbbb
    bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbbbb
    bbbbbbbbbbbbbbbbbbbbbbbbbbdddbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbbbbbbbbbbbbbddbdbdbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
    bbbbbbbbbbbbbbbbbbbbbbbbbbbddbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdbdbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
    bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbbdbbbbbbbbbbbbbbbbbbbbbbbbbbbb
    bbbbbbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
    bbbbbbbbbbbbbbbbbbbbbbbbbbdddbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbddbdbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
    bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
    bbbbbbbbbbbbbbbbb7bbbbbbbbbbbbbbbb7bbbbbbbbbbbbbbbbbbbbbb7bbbbbbbbbbbbbbbb7bbbbbbbbbbbbbbbbbbbbbb7bbbbbbbbbbbbbbbb7bbbbbbbbbbbbbbbbbbbbbb7bbbbbbbbbbbbbbbb7bbbbb
    bbbbbb7bbb77bbbbb77bbbb7bbb7bbbb7b77bbb7bbbbbb7bbb77bbbbb77bbbb7bbb7bbbb7b77bbb7bbbbbb7bbb77bbbbb77bbbb7bbb7bbbb7b77bbb7bbbbbb7bbb77bbbbb77bbbb7bbb7bbbb7b77bbb7
    bb7bbb77b77bb7bbb77bbb77bbb77bbb7bb77b77bb7bbb77b77bb7bbb77bbb77bbb77bbb7bb77b77bb7bbb77b77bb7bbb77bbb77bbb77bbb7bb77b77bb7bbb77b77bb7bbb77bbb77bbb77bbb7bb77b77
    bb77bb77b77bb77bbb77b77bbbb77b7b77b7777bbb77bb77b77bb77bbb77b77bbbb77b7b77b7777bbb77bb77b77bb77bbb77b77bbbb77b7b77b7777bbb77bb77b77bb77bbb77b77bbbb77b7b77b7777b
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    `)
game.showLongText("Welcome to this puzzle. Solve the first one to go to the next one! Press A to continue.", DialogLayout.Bottom)
wallySpeed = 5000
tiles.setSmallTilemap(tilemap`level2`)
notRichard = sprites.create(img`
    . . . . . . . . 
    . . . . . b b b 
    . . b b b b b b 
    . b b d d d d . 
    . b d d f d f . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . . a a a a . . 
    . . a . . a . . 
    `, SpriteKind.Player)
tiles.placeOnRandomTile(notRichard, assets.tile`myTile2`)
character.loopFrames(
notRichard,
[img`
    . . . . . . . . 
    . . . . . b b b 
    . . b b b b b b 
    . b b d d d d . 
    . b d d f d f . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . . a a a a e . 
    . . a . . a e . 
    `,img`
    . . . . . . . . 
    . . b b b b b b 
    . b b d d d d b 
    . b d d f d f . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . . a a a a e . 
    . . a . . a e . 
    . . . . . a e . 
    `,img`
    . . . . . b b b 
    . . b b b b b b 
    . b b d d d d . 
    . b d d f d f . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . . a a a a e . 
    . . . a a . e . 
    . . . . a . e . 
    `,img`
    . . . . . b b b 
    . . b b b b b b 
    . b b d d d d . 
    . b d d f d f . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . . a a a a e . 
    . . . a a . e . 
    . . . a . . e . 
    `,img`
    . . . . . b b b 
    . . b b b b b b 
    . b b d d d d . 
    . b d d f d f . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . . a a a a e . 
    . . a . . a e . 
    . . a . . . e . 
    `,img`
    . . . . . b b . 
    . . . . b b b . 
    . . b b b b b . 
    . b b d d d d . 
    . b d d f d f . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . . a a a a e . 
    . . a . . a e . 
    `],
100,
character.rule(Predicate.FacingRight, Predicate.HittingWallDown, Predicate.MovingRight)
)
character.loopFrames(
notRichard,
[img`
    . . . . . . . . 
    . . . . . b b b 
    . . b b b b b b 
    . b b d d d d . 
    . b d d f d f . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . . a a a a . . 
    . . a . . a . . 
    `,img`
    . . . . . . . . 
    . . b b b b b b 
    . b b d d d d b 
    . b d d f d f . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . . a a a a . . 
    . . a . . a . . 
    . . a . . a . . 
    `,img`
    . . . . . b b b 
    . . b b b b b b 
    . b b d d d d . 
    . b d d f d f . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . . a a a a . . 
    . . a . . a . . 
    . . a . . a . . 
    `,img`
    . . . . . b b . 
    . . . . b b b . 
    . . b b b b b . 
    . b b d d d d . 
    . b d d f d f . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . . a a a a . . 
    . . a . . a . . 
    `],
100,
character.rule(Predicate.FacingRight, Predicate.HittingWallDown, Predicate.NotMoving)
)
character.loopFrames(
notRichard,
[img`
    . . . . . . . . 
    b b b . . . . . 
    b b b b b b . . 
    . d d d d b b . 
    . f d f d d b . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . e a a a a . . 
    . e a . . a . . 
    `,img`
    . . . . . . . . 
    b b b b b b . . 
    b d d d d b b . 
    . f d f d d b . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . e a a a a . . 
    . e a . . a . . 
    . e a . . . . . 
    `,img`
    b b b . . . . . 
    b b b b b b . . 
    . d d d d b b . 
    . f d f d d b . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . e a a a a . . 
    . e . a a . . . 
    . e . a . . . . 
    `,img`
    b b b . . . . . 
    b b b b b b . . 
    . d d d d b b . 
    . f d f d d b . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . e a a a a . . 
    . e . a a . . . 
    . e . . a . . . 
    `,img`
    b b b . . . . . 
    b b b b b b . . 
    . d d d d b b . 
    . f d f d d b . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . e a a a a . . 
    . e a . . a . . 
    . e . . . a . . 
    `,img`
    . b b . . . . . 
    . b b b . . . . 
    . b b b b b . . 
    . d d d d b b . 
    . f d f d d b . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . e a a a a . . 
    . e a . . a . . 
    `],
100,
character.rule(Predicate.FacingLeft, Predicate.HittingWallDown, Predicate.MovingLeft)
)
character.loopFrames(
notRichard,
[img`
    . . . . . . . . 
    b b b . . . . . 
    b b b b b b . . 
    . d d d d b b . 
    . f d f d d b . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . . a a a a . . 
    . . a . . a . . 
    `,img`
    . . . . . . . . 
    b b b b b b . . 
    b d d d d b b . 
    . f d f d d b . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . . a a a a . . 
    . . a . . a . . 
    . . a . . a . . 
    `,img`
    b b b . . . . . 
    b b b b b b . . 
    . d d d d b b . 
    . f d f d d b . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . . a a a a . . 
    . . a . . a . . 
    . . a . . a . . 
    `,img`
    . b b . . . . . 
    . b b b . . . . 
    . b b b b b . . 
    . d d d d b b . 
    . f d f d d b . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . . a a a a . . 
    . . a . . a . . 
    `],
100,
character.rule(Predicate.FacingLeft, Predicate.HittingWallDown, Predicate.NotMoving)
)
character.loopFrames(
notRichard,
[img`
    . . . . . . . . 
    b b b b b b . . 
    b d d d d b b . 
    . f d f d d b . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . . a a a a . . 
    . . a . . a . . 
    . . a . . a . . 
    `],
100,
character.rule(Predicate.FacingLeft, Predicate.MovingUp)
)
character.loopFrames(
notRichard,
[img`
    . b b . . . . . 
    . b b b . . . . 
    . b b b b b . . 
    . d d d d b b . 
    . f d f d d b . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . . a a a a . . 
    . . a . . a . . 
    `],
100,
character.rule(Predicate.FacingLeft, Predicate.MovingDown)
)
character.loopFrames(
notRichard,
[img`
    . . . . . . . . 
    . . b b b b b b 
    . b b d d d d b 
    . b d d f d f . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . . a a a a . . 
    . . a . . a . . 
    . . a . . a . . 
    `],
100,
character.rule(Predicate.FacingRight, Predicate.MovingUp)
)
character.loopFrames(
notRichard,
[img`
    . . . . . b b . 
    . . . . b b b . 
    . . b b b b b . 
    . b b d d d d . 
    . b d d f d f . 
    . d d d d d d . 
    . . c c c c . . 
    . d c c c c d . 
    . . a a a a . . 
    . . a . . a . . 
    `],
100,
character.rule(Predicate.FacingRight, Predicate.MovingDown)
)
controller.moveSprite(notRichard, 60, 0)
gravity = 500
jumpHeight = 26
notRichard.ay = gravity
createTimeStore(notRichard)
mathSprite = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    `, SpriteKind.Math)
rewindTimeStep = 250
notKoopaSpeed = 50
info.setLife(5)
for (let value of tiles.getTilesByType(assets.tile`myTile4`)) {
    tiles.setTileAt(value, assets.tile`myTile0`)
    anEnemy = sprites.create(img`
        . . . . . . . . 
        . . . . . . . . 
        . c 2 2 2 c . . 
        . 2 c 2 c 2 2 . 
        . f 2 2 2 f 2 . 
        6 2 2 2 2 2 2 6 
        6 4 4 4 4 4 6 6 
        . 4 4 4 4 4 4 . 
        `, SpriteKind.Enemy)
    character.loopFrames(
    anEnemy,
    [img`
        . . . . . . . . 
        . . . . . . . . 
        . c 2 2 2 c . . 
        . 2 c 2 c 2 2 . 
        . f 2 2 2 f 2 . 
        6 2 2 2 2 2 2 6 
        6 4 4 4 4 4 6 6 
        . 4 4 4 4 4 4 . 
        `,img`
        . . . . . . . . 
        . c 2 2 2 c . . 
        . 2 c 2 c 2 2 . 
        . f 2 2 2 f 2 . 
        6 2 2 2 2 2 2 6 
        6 4 4 4 4 4 6 6 
        . 4 4 4 4 4 4 . 
        . 4 4 4 4 4 4 . 
        `],
    300,
    character.rule(Predicate.FacingLeft, Predicate.HittingWallDown, Predicate.MovingLeft)
    )
    character.loopFrames(
    anEnemy,
    [img`
        . . . . . . . . 
        . . . . . . . . 
        . . c 2 2 2 c . 
        . 2 2 c 2 c 2 . 
        . 2 f 2 2 2 f . 
        6 2 2 2 2 2 2 6 
        6 6 4 4 4 4 4 6 
        . 4 4 4 4 4 4 . 
        `,img`
        . . . . . . . . 
        . . c 2 2 2 c . 
        . 2 2 c 2 c 2 . 
        . 2 f 2 2 2 f . 
        6 2 2 2 2 2 2 6 
        6 6 4 4 4 4 4 6 
        . 4 4 4 4 4 4 . 
        . 4 4 4 4 4 4 . 
        `],
    300,
    character.rule(Predicate.FacingRight, Predicate.HittingWallDown, Predicate.MovingRight)
    )
    tiles.placeOnTile(anEnemy, value)
    anEnemy.ay = gravity
    anEnemy.vx = notKoopaSpeed
    createTimeStore(anEnemy)
}
for (let value of tiles.getTilesByType(assets.tile`myTile6`)) {
    tiles.setTileAt(value, assets.tile`myTile0`)
    wally = sprites.create(img`
        3 3 3 3 3 3 3 3 
        3 3 3 3 3 3 3 3 
        3 3 3 3 3 3 3 3 
        3 3 3 3 3 3 3 3 
        3 3 3 3 3 3 3 3 
        3 3 3 3 3 3 3 3 
        3 3 3 3 3 3 3 3 
        3 3 3 3 3 3 3 3 
        `, SpriteKind.WallyDown)
    tiles.placeOnTile(wally, value)
    wally.setFlag(SpriteFlag.GhostThroughWalls, true)
    wally.setFlag(SpriteFlag.Invisible, true)
}
for (let value of tiles.getTilesByType(assets.tile`myTile7`)) {
    tiles.setTileAt(value, assets.tile`myTile0`)
    wally = sprites.create(img`
        3 3 3 3 3 3 3 3 
        3 3 3 3 3 3 3 3 
        3 3 3 3 3 3 3 3 
        3 3 3 3 3 3 3 3 
        3 3 3 3 3 3 3 3 
        3 3 3 3 3 3 3 3 
        3 3 3 3 3 3 3 3 
        3 3 3 3 3 3 3 3 
        `, SpriteKind.WallyUp)
    tiles.placeOnTile(wally, value)
    wally.setFlag(SpriteFlag.GhostThroughWalls, true)
    wally.setFlag(SpriteFlag.Invisible, true)
}
wallyEvents = []
setWallyState(true)
game.onUpdate(function () {
    scene.centerCameraAt(notRichard.x, 0)
})
game.onUpdate(function () {
    for (let value of sprites.allOfKind(SpriteKind.Enemy)) {
        if (value.vx < 0) {
            enemySpotToCheck = tiles.locationInDirection(tiles.locationOfSprite(value), CollisionDirection.Left)
        } else {
            enemySpotToCheck = tiles.locationInDirection(tiles.locationOfSprite(value), CollisionDirection.Right)
        }
        if (tiles.tileIsWall(enemySpotToCheck) || !(tiles.tileIsWall(tiles.locationInDirection(enemySpotToCheck, CollisionDirection.Bottom)))) {
            value.vx = 0 - value.vx
        }
    }
})
game.onUpdate(function () {
    updateTheWallyButton()
})
game.onUpdateInterval(400, function () {
    recordPosition(notRichard)
    for (let value of sprites.allOfKind(SpriteKind.Enemy)) {
        recordPosition(value)
    }
    wallyEvents.push(wallyUpIsDefinitelyInCharge)
    if (wallyEvents.length > 10) {
        wallyEvents.shift()
    }
})
forever(function () {
    music.playMelody("B F A G A G A G ", 113)
})
game.onUpdateInterval(100, function () {
    for (let value of sprites.allOfKind(SpriteKind.Scanline)) {
        if (value.y < 10) {
            scanline.vy = Math.abs(scanline.vy)
        } else if (value.y > 110) {
            scanline.vy = 0 - Math.abs(scanline.vy)
        } else if (Math.percentChance(20)) {
            scanline.vy = randint(50, 100)
            if (Math.percentChance(50)) {
                scanline.vy = scanline.vy * -1
            }
        }
    }
})
