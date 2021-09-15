# Types

## battle
see [pvp.js](https://github.com/LightningWB/the-travelers-plus/blob/main/src/pvp.js#21)

## eventData
see [event type](https://github.com/LightningWB/the-travelers-plus/blob/main/src/event%20types.ts#L136)

## eventRoom
see [room type](https://github.com/LightningWB/the-travelers-plus/blob/main/src/event%20types.ts#L50)

## storage
```ts
type storage = {
	[key: string]: number
}
```
item keys are the item id and the number is their count in the storage.

## structure
see [structure type](https://github.com/LightningWB/the-travelers-plus/blob/main/src/building.d.ts#L1)

# Events in `travelers` namespace

## addCraftableItem
* id `string`
* level `number`

Adds an item to be unlocked at a given level.

## addEvent
* type `string`
* eventData `eventData`

Registers an event of a given type.

## addEventTile
* x `number`
* y `number`
* char `string`
* id? `string`
* type? `string`

Places a tile that contains an event of a given id and type.

## addExeJs
* player
* js `string`

Adds javascript for the client to run.

## addExpiry
* type `string`
* time `number`

Sets how long an event should last for in ms.

## addGameItem
* id `string`
* item

Adds an item of a given id to the game.

## addGameItems
* data `{[key: string]: item}`

Adds items to the game.

## addItem
* id `string`
* amount `number`
* storage

Adds a certain amount of items from a storage.

## addItem
* data `structure`

Registers a type of structure.

## `battles` namespace
---

### battleChoice
* option `string`
* player
* cancel `out<boolean>`
* battle

Triggered when a player selects a battle choice.

### chatMessage
* message `string`
* sender `player`
* cancel `out<boolean>`
* battle

Triggered when a player sends an in battle chat message.

### computeAttack
* mover `player`
* victim `player`
* cancel `out<boolean>`
* battle

Triggered when a player (mover) has their move calculated against another player (victim). Cancel will stop the default action.

### end
* battle

Triggered when a battle ends, either from abstaining or death.

### execute
* killer `player`
* victim `player`
* cancel `out<boolean>`
* battle

Triggered when a player executes the looser at the end of a fight.

### fightOpened
* battle

Triggered when a battle starts

### fightStart
* battle

Triggered when the battle moves past the ready stage

### newRound
* battle

Triggered when a new combat round starts.

### playerReady
* player
* battle

Triggered when a player submits their weapon for the fight and marks them self are ready.

### reviewRound
* battle

Triggered when a "review round" happens in a battle. This is the part when everyone's stats change.

### tick
* battle

Triggered once a cycle. Please note this triggers even if its still in the countdown.

## breakStructure
* x `number`
* y `number`
* player

Emitted when a player's break timer reaches 0.

## calcPlayerEvent
* player

Fired when a player needs an event screen rendered.

## calcWeight
* player

Fired when a player needs its weight recalculated.

## canPlayerMoveOn
* player
* obj `world object`
* out `out<boolean>`

Emitted for every step. If out is true, will cancel movement.

## canPlayerMoveOnTile
* player
* tile `string`
* out `out<boolean>`

Emitted for every step. If out is true, will cancel movement.

## canPlayerSee
* viewer `player`
* viewee `player`
* out `out<boolean>`

Emitted to check if a player is visible to another player. Only done if they are within 15 tiles and the viewee isn't dead. Out can be used to mark them as invisible to the viewer.

## canScanPlayer
* scanner `player`
* scanned `player`
* out `out<boolean>`

Emitted to check if a player is scannable to another player. Only done if they are within scanner range and the scanned isn't dead. Out can be used to mark them as unscannable to the scanner.

## eventLog
* message `string`
* player

Sends an event log to a player.

## eventLogUnsafe
* message `string`
* player

Sends an event log that isn't xss safe to a player.

## generateLoot
* room `eventRoom`
* items `storage`

Fired when an event needs loot to be generated.

## getItem
* id `string`
* ptr `object`

Returns an item of a given id through ptr by applying item properties to prt.

## getMovementSpeed
* player
* out `int`

Gets a player's base movement speed. 1 by default.

## getRewards
* out `out<{[key:string]: number}>`

Gets the xp rewards for each event.

## getTime
* out `int`

Gets the current game time.

## givePlayerItem
* id `string`
* amount `number`
* player

Gives a certain amount of items of a given id to a player.

## isChallenge
* attacker `player`
* opponent `player`
* out `out<boolean>`

Determines if an attacker has to challenge the opponent before starting a battle.

## killPlayer
* player

Kills a player.

## levelUpPlayer
* player

Fired when a player is supposed to level up.

## movePlayer
* player

Fired when a player is supposed to move.

## movePlayerToEvent
* player
* type `"city" | "house"`

Fired when a player is supposed to get transferred into an event.
Will generate a new event if type is provided.

## onPlayerStep
* player
* out `out<boolean>`
Emitted when a player steps. Can cancel any further movement.

## placeStructure
* data `object`
* player

Places a structure given the player's currently placing data.

## playerJoinInteraction
* player
Moves a player steps joins an interaction.

## removeItem
* id `string`
* amount `number`
* storage

Removes a certain amount of items from a storage.

## renderCrafting
* player

Renders a player's crafting items.

## renderItems
* player
* addToQueue `boolean`

Renders a player's items. If addToQueue is false, then it won't send to the client.

## setReward
* type `string`
* reward `number`

Sets the xp reward for a given event type.

## setTime
* out `int`

Sets the current game time.

## stopPlayerMovement
* player

Fired when a player is supposed to stop moving.

## structureBroke::{structure}
* worldObject
* player

Emitted when a certain structure is broken.

## structurePlaced::{structure}
* worldObject
* player

Emitted when a certain structure is placed.

## takePlayerItem
* id `string`
* amount `number`
* player

Takes a certain amount of items of a given id from a player.

## unlockCraftingForPlayer
* player
* learningItem `string`

Adds an item to a player's bp list.

# `equip_actions` namepsace
all events in this name space are related to equipment.
the way an event is emitted is `equip_actions::{equipment id}::{action}`.
there is also a dequip action for every equipment item.
the only parameter is the player who performed the action.
ex. `equip_actions::shovel::dig`.

# other
a new property is added to every online player known as `message`. this is used to trigger a message popup for the player.

## parameters passed
* id `string`
* cb `string => void`
* size = Infinity `number`

id is the message id to wait for from the client. cb is the callback called when the player sends the message.
size is the max length of the message.