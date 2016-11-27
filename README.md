# r0ten-circular-json

Currently available only via npm-github:
`npm i radarsu/r0ten-circular-json -S`;

In my tests it appeared around 3x faster than <https://github.com/WebReflection/circular-json> in both stringifying and parsing big JSON.

Also, there is available root customisation, which is very useful for sending circular objects from server to client-side, so that client can rebuild his circular references based on provided data. An example below:

```
// let's say u have such object on client side
let dict = {
  items: {},
  rooms: {
    1: {
        name: "tavern"
    }
  },
};

// you want to add item object, that will automatically refer to rooms and will not reload whole dict object
dict.items[1] = CircularJSON.parse({
    value: `{
        "name": "sword",
        "rooms": "~rooms~1"
    }`,
    root: dict,
});

// references are restored
console.log(dict.items[1].room.name);
// logs: tavern
```

Another example:
```
let game: any = {
    name: "shard",
    rooms: [],
    items: [],
};
let room: any = {
    name: "tavern",
};
game.rooms.push(room);
room.game = game;
let item: any = {
    name: "sword",
    hero: {},
};
game.items.push(item);
room.items = [item];
item.room = room;
item.hero.room = room;
item.hero.game = game;

let start = Date.now();
let circular = CircularJSON.stringify({
    value: game,
    space: 4,
});
console.log(`stringify time`, Date.now() - start);
console.log(`STRINGIFIED`, circular);

start = Date.now();
let parsedBack = CircularJSON.parse({
    value: circular,
});
console.log(`parse time`, Date.now() - start);
console.log(`PARSED`, parsedBack);
console.log(parsedBack.items[0] === parsedBack.rooms[0].items[0]);
console.log(parsedBack.items[0]);
console.log(parsedBack.rooms[0].items[0]);
```
