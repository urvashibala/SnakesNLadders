## Nomenclature
Snakes and ladders, gyan chaupar, jnana bazi and so many more. As this game has evolved over time, which do we settle on for the platform's name? The answer I settled on: none. I didn't want to call it the colonised albeit recognisable English name, or single out any of the Indian original game versions to represent them all.
This is Neither Snakes Nor Ladders.
<br><br><br><br>

## Materiality & Game Experience
Our ancient gameboards usually sit behind a glass pane in a library or museum that we may never see in person, and most definitely will never touch or play with. This decontextualises the game from its original and only purpose: play. 
<br><br>
The versions of the game that we *do* have access to are commercial, colonial products and not our historical pieces, and so we remain alienated from the history of these games. Personally, I never knew of the rich Indian history behind snakes and ladders growing up, and I wonder if that is because the game never *looked* Indian. 
<br><br>
In "modern" versions, all of the gameboards' history is **abstracted away**. What purpose does this abstraction serve? It cuts away the ornamentation, the philosophy, and the culture. This, of course, was often the product of economic considerations, as a painter could not always be hired to produce royal, richly-ornamented boards. 
<br><br>
This was also caused by colonisation and the game's Western variants, which replaced the original religions' philosophies with foreign alternatives and even structural components (namely the dice and tokens, the snakes and ladders being equal in number, the virtues and vices they represented, among others).<br><br>
However, the benefit of digitisation is replicating the original and distributing it far and wide. This improves accessibility, but more importantly, it gives each of us the ability to experience the game in a similar context as our ancestors.<br><br>
Imagery and symbolism holds immense value. The American version of the game, for instance, felt that the snake images would scare children and replaced them with chutes, forgetting that the entire purpose of the game was to scare children away from vices.<br><br>
In the creation of this platform, I prioritised material experience. Each aspect of the game from the boardgame image, the background music, the dice roll to what we call the AI or computer player, must be grounded as much as possible in historical truth and authenticity.<br><br>

### The Dice
I animated cowrie shell images to replace the modern dice. It follows these rules:<br><br>
>"Down" if turtle-shell side up<br><br>
>"Up" if mouth of shell is up<br><br>
> Each open mouth of the cowrie shell denotes 1 point.<br><br>
>The back of the cowrie shell denotes 0 points.<br><br>
>If all 6 cowries fall on their open mouths showing only their backs, then it’s a full 12 points<br><br>
>Possible scores: 1, 2, 3, 4, 5, 6, 12.<br><br><br><br>

This was the ruleset I narrowed down on after researching and finding about 6 different ways to play with these dice. Like the boards, every aspect of their gameplay has a huge variety of implementations!<br><br><br><br>
Finally, to perfect the feeling of throwing the dice, I conducted a series of experimentations and continually iterated until I created the final product visible on the platform right now.<br><br>
I also looked into four-sided long dice and plan to incorporate those in the future as an alternative dice option.<br><br>

## The Tokens
All tokens are shells native to India. I plan to collect more images of rocks and pebbles, and figurines if available to further populate the collection!<br><br>

## Nonlinearity
The museum gallery is deliberately *not* organised by timeline or century because this would have created a feeling of *evolution* that would have concluded with the British colonised version of the game. This would have encouraged the thinking that our ancient games were in some way more "primitive", when in fact, they represent a greater amount of artistic effort, ornamentation and notably more complex philosophical ideas and rules.
Rather, I have chosen while designing this site to embrace the game's philosophy of nonlinearity. The boards need not be ordered in any way, and the player is free to navigate, explore and select one to play. There is aslo a "Random Board" option that allows them to roll the dice on *which* game they play, which reflects the idea of the Gods determining your experiences in life.<br><br>
These micro-decisions about the platform experience attempt to extend the logic and philosophy of the game (in a rather meta way) to our learning experiences *about* the game.<br><br>

## Expert Historical Narrative
While researching for this project, I have learnt a great deal about the history and cultural significance of these games. However, I also realise that the depth of their significance is so great, especially when they have religious roots and such variety, that I should not be considered a central authority on them.<br><br>
I included a historyText field to briefly descibe the board in 50 words or less, but have also set up structures for actual experts to contribute their knowledge of each specific gameboard, that would load in parallel to the game. This would allow players to learn about the board *as* they play, making the learning experience more dynamic, interesting and grounded in play.<br><br>

## Developing a Non-Technical, Accessible Game Archiving Tool
The game engine is designed to work irrespective of what the board image looks like. 
The game engine takes in:<br><br>
* Square grid coordinates (the first (1) square is at x : 3.1402, y: 1.012, for example), 
* Transitions (ie, the snakes and ladders), represented as mappings from one (x,y) coordinate to another. 
* ID: Used to uniquely refer to this board
* Name: display name (non unique) for the game page
* historyText: a paragraph of text to display before the game begins, describing the material and medium of the board, the board versions' significance and details about ownership and rights to the image or artefact. This is kept open-ended as to not discourage amateur archivists  (who may not be history experts) from contributing their board versions.
* The board image
* totalSquares, 
* winSquare 
* startSquare: where all tokens start the game. This can be 0 (zero indexed logic) or 1 whether the board numbering starts at 1 or 0.<br><br><br><br>

Then it takes all this data in as a JSON and applies the logic to every board data coordinates without ever looking at the actual image. This allows *every* board to become playable, regardless of its shape, grid structure, ornamentation, language or readability. 
This allowed me to upload circular boards and many whose Hindi and Tamil number systems made me squint and frequently check my number sheet over and over. <br><br>
At the time of this platform's creation, I have digitised about nine boards by hand pre-tool. I will continue to upload about twelve or fifteen in total before I publish this project formally. This is an individual effort of archiving over and above the software development efforts to build the platform.<br><br>
I wanted more people to be able to contribute their boards, but how? The game engine I built requires structured input and some technical know-how on how to write and format JSON data, which would have been a barrier to many amateur archivists. <br><br>
Our ancient paintings, carvings and games are often very difficult for computers to parse and see, and thus we must be their eyes. <br><br>
To break this barrier down, I build the Annotation Tool.<br><br>
>The annotation tool allows a user to click each square from start to finish. Some boards begin at 0, and others at 1. Some end at a nice, even number like 100 and others at 73. There is significance to every decision, and this annotation tool accommodates this.
>To mark the snakes and ladders, simply follow the direction of the drawings and click where it starts from and where it ends. The annotator tool automatically knows that if the start is less than the end number, it must be a ladder, and vice versa a snake.
>Before you submit for review, you can view all your grid annotations and snakes and ladders visually.
> Once submitted for review, I will receive an email with your submitted annotation, check that nothing fishy is going on and perhaps ask you to redo a portion if something is truly incorrect, and then approve it. Once approved, your board is auto-uploaded to the website.<br><br>
Before this Annotation Tool, I had struggled to view numbers, had to undo and redo many boards, experimented with pixel and image segmentation and computer vision before settling on a much simpler reliable solution: the annotator tool simply captures where I click, records the mouseX and mouseY coordinates, and formats it as required for my JSON.
In many ways, the trials and errors I experienced in the process of annotation have informed its design. <br><br>
Though I initially developed it for my own ease of use, I truly hope that making this archiving and board digitisation process will allow this platform to host a large variety of ancient and less-ancient noncommercial boards.<br><br>
Snakes and ladders, moksha patam, gyan chaupar and other versions of this game are plentiful in their board designs, material decisions, and philosophies, each reflecting their makers' and players' unique cultural contexts. <br><br>
In opening up this digitisation and archiving process to all users, I hope this platform becomes more and more representative of this game's multide of versions across histories and geographies. <br><br>
I imagine it's also rather exciting finding a board that you are usually not allowed to physically handle or play with become something you can actively engage with and play games over, and that feeling makes me very proud of this project.

## Future Work
* Multilingual support for annotation and boardgame view
* Historical information and insights for each board, dynamically displayed as the user plays
* More user-uploaded boards!
* Other ancient game galleries