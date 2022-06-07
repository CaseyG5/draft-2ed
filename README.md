# draft-2ed

### A way to play an 8-player draft tournament with classic cards
 
- This project is coming along in development
- Pages have been made for:
    1. sign-up
    2. drafting cards
    3. building a deck
    4. playing games/matches
- Scripts have been created for:
    1. DOM manipulation for showing cards on drafting page
    2. Client requests and server responses/actions to handle drafting rotations,
    3. And card exclusion for deck assembly and submission, 
    4. As well as tournament play, including UI components and functions, card interaction and a few automatic rule-based actions
- More work is needed for:
    1. Game/match play screen, especially retrieving saved game states. It looks like cookies will be the simplest option for saving these states, keeping server requests to a minimum
    2. Fade-to/from-black transitions between pages
    3. Creature interaction during combat phase
    4. Testing, especially with multiple players and, later, multiple drafts

Note: this project requires hundreds of image files which, to save space, are currently not included in the repository.

### Known issues:
- Ghosts in the view. An additional card appears when testing drag & drop to rearrange the top 3 cards.
- Other than that, just figuring out why a temp fix for the issue below was needed in the first place. I suspect it has something to do with overlapping event listeners lingering and acting on data after they're not needed anymore, i.e. write permissions too lax.  

### Prior issues:
- Draft data (arrays cards drafted) for packs 2 & 3 was getting corrupted.  A (temporary) workaround is in place to UN-corrupt the data.