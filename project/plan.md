PROMPT

I am building a website-based museum page of snakes and ladders games, and a game engine that generalises over many board images. Write a game function that takes this JSON as input (from src/boards) and renders each game as an output in a gallery website. 

Read the entire workspace to understand what you are working with. Adhere to the TO DO's mentioned here:

TO DOs:
Since this is a long project, we will do it step by step. After EACH of the following steps, stop and revert to me with a version I can TEST and view:

1. Create the MAIN HOMEPAGE GALLERY website following UI/UX RULES

2. TEMPORARY TESTING STEP -- For each of the four board, show me what you see. Render the coordinates of the grid with their count on the image so I can see what you see. Draw ladders/snake arrow lines from mapped square coordinates. Save this to a folder in this workspace "sanitycheck_labelledboards"

3. Create the generalised GAME ENGINE. This will be the longest step. Ensure correctness and adherence to the plan.md. Let me test each of the four boards and approve each of them.

4. Tell me how to add more boards. I would want to simply add more JSON files named data_boardname.json to src/boards and have you automatically add more games to the main page that are correct and playable.

*** 

The input schema is as follows:

"id" : used to refer to this board only

"name": display name (non unique) for the game page

"historyText": paragraph of text to display before the game begins

"imageUrl": within this workspace, the image (board) is at this url

"totalSquares": total number of grid squares in the game (including start and finish squares)

"startSquare": where all tokens start the game. This can be 0 (zero indexed logic) or 1 (one indexed logic). Be very careful with this and write two separate types of systems for each case to ensure correctness.

"winSquare" when a player lands on this square, they automatically win the game. But they must land on this exact square. If their roll takes them greater than this square, they cannot move in that turn. They must land exactly on the winning square to win.

"squares": [
  {
    "id": 1,
    "x": 508,
    "y": 3419.7
  },
  {
    "id": 2,
    "x": 863.1,
    "y": 3419.7
  },
  {
    "id": 3,
    "x": 1184.8,
    "y": 3411.4
  },

In this example input, you can see the id (grid count) associated with particular coordinates. Render the tokens at this coordinate if they land on this id square. For example, if player 1 was on square 1 but after a roll must move to 3, lookup id 3 in "squares",  animate the player 1 token moving from 1 (at 508,3419.7) to 2 (at 863.1, 3419.7) to 3 (1184.8, 3411.4), thus showing the animated movement until it reaches the destination square. Do this quickly and sequentially as lookups so it is fast. 

Then we have "transitions" (the snakes and ladders in the game)

That look like this for snakes:
{"type": "snake", "from": 55, "to": 2},
Which indicates that if a user lands on 55, it must directly move to 2 (do not animate it moving down square by square, but directly using shortest path from current square coordinates of 55 to specified coordinates of 2.

A player landing on 55 here in this example would move to 2

Similarly, for ladders:
    {"type": "ladder", "from": 17, "to": 69},

A player landing on 17 in this example will move to 69

***
GAME IMPLEMENTATION DETAILS:
This will be a 2D web-based game. Keep it simple with fast rendering. Assess the workspace to figure out which tech stack to implement this with. We need speed and we have moving elements (tokens) that need to be quickly animated as the game progresses. We also have a dice animation to play every turn, so it needs to be fast.

To start us off, I have provided the JSON files of four boards (under src/boards). There are many more that I will add later, so ensure generalisability. If I add more JSON files, it should automatically add more boards (to the homepage, to the gallery to the website etc)

GAME RULES:
Snakes and ladders rules apply. 2-4 Players can play at a time, all locally from the same device (user toggles this as input before entering the "museum" website). There is also an option to play against a computer/AI (which just randomly rolls the dice, exactly as the user) if you are a single player.

The players start with random tokens selected from the folder tokens in the workspace. I can later edit and add more tokens so don't hardcode it, just randomise over the folder's image and use the selected tokens for the entirety of that game session.

1. The first player clicks "roll" button and the cowrie shell dice animation (src/game/DiceAnimator.js) plays, overlaying over the board as it has a transparent background, then lingering for a second so the player can see the score they rolled, and then disappearing
2. The game engine automatically moves the player's token the determined number of steps returned by DiceAnimator
3. Check if the square the player has finally landed on is mapped to either a snake or ladder. If true, move the token further down the snake or up the ladder to the MAPPED COORDINATE of the destination square (available in "transitions"). If false, let the next player roll and repeat step 1
4. The game ends when any player lands EXACTLY on the "winSquare". 

If you need more information about the rules of snakes and ladder, clarify before implementation.
Make an engine that takes the aforementioned JSON input and loads on all the 4 boards. As I add more to the workspace, it should create more boards into the final homepage game that are each fully and correctly playable with their own subpages/subgames.

***

MAIN HOMEPAGE GALLERY:
In the corner of the website, in the teko font (included in workspace), write "Snakes & Ladders" with the subtitle "by Urvashi Balasubramaniam" and make this text editable so I may change it later.

Include a button in the corner to "randomly choose" a board, which randomly opens any of the functioning boards.

For the main body — Create a museum-style gallery of paintings, except each is one of our gameboards (right now, there are 4, but I will add more later). Each painting/board image should be framed and displayed at high resolution, taking up most of the webpage visually). When clicked, it opens up (what looks like a popup but is not) a page (sublime) where you can play that respective boards' game. This respective board subpage should have the board image from the JSON in high resolution occupying the body of the page, large enough to view comfortably at a good resolution, front and centre. It is the board, so it is the main and most important part of the sublime. Refer to GAME RULES for further details of each sub game. 

UI/UX RULES:
Fonts: Teko, under (fonts/Teko) in the directory. Earthy palette that is clearly readable against the background colours.
Colours: Earthy browns and golds,  make sure design is not "Claude-like" or modern. This is an ancient gallery! The design must feel ancient, sacred, earthy, and Indian. Use CSS for these.

The background should NOT be the classic Claude orange. Do not use that default design.The design should NOT feel flat or modern.

Use texture, roughness, earthiness everywhere. 

Before you start, have a "History of this Version" popup with the historyText from the JSON displayed