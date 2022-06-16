# draft-2ed

### A way to play an 8-player draft tournament with classic cards
 
- This project is coming along in development
- Pages have been made for:
    1. sign-up
    2. drafting cards
    3. building a deck
    4. playing games/matches
- Scripts have been created for:
    1. DOM manipulation for showing, selecting, and moving cards
    2. Client requests and server responses/actions for tournament related business
    3. Handling drafting rotations, card exclusion for deck assembly and submission, and
    4. Tournament play, including UI components and functions, card interaction and a few automatic rule-based actions, along with fade transitions between pages
- More work is needed for:
    1. Reconnecting, retrieving saved game states, and routing back to where we left off. It looks like cookies will be the simplest option for saving these states, keeping server requests to a minimum
    2. Creature interaction during combat phase
    3. Labels/counters, arrows, and a few sound effects
    4. Testing, especially with multiple players and, later, multiple drafts

Note: this project requires hundreds of image files which, to save space, are currently not included in the repository.

### Known issues:
- Bug where a card is dropped into the Exile zone and then both Graveyard and Exile zones are shown squeezed against each other (1 should be hidden at all times)
- Cards in play (Lands and Non-lands areas) can overflow, but if scrolling is permitted then elements will be chopped / cut off
- Ghosts in the view: An additional card appears when testing drag & drop to rearrange the top 3 cards.
- Other than that, just figuring out why a temp fix for the issue below was needed in the first place. I suspect it has something to do with overlapping event listeners lingering and acting on data after they're not needed anymore, i.e. write permissions too lax.  

### Prior issues:
- Draft data (arrays cards drafted) for packs 2 & 3 was getting corrupted.  A (temporary) workaround is in place to UN-corrupt the data.