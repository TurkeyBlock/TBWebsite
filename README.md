# Turkeyblock.org - A Hobby Website
This repository contains the documentation and website code for [Turkeyblock.org](https://Turkeyblock.org).

## Background Information
Turkeyblock.org is a serverless React website hosted on [Vercel](https://vercel.com), using [Supabase](https://supabase.com/)'s serverless-database API. It uses the [Vercel x Supabase](https://vercel.com/templates/next.js/supabase) starter, which contains middleware to filter registered users and styling for Supabase components.  Costs are limited to that of the site's domain name.

Turkeyblock.org is me poking my toes into web development; I began with the above starter and a client-side Tic-Tac-Toe tutorial, and I wrote the rest from the ground up.

> [!NOTE]
> The majority of pages are locked behind an account login; Anonymous logins are available and recommended.

## The Site Itself
The site hosts the following asynchronous multiplayer-games:
- Tic-TacToe
- Connect-Four
- Checkers

Each of the above games use a Lobby system, with gamestate and server-side verfication facilitated by the supabase SQL storage and edge-function APIs respectively.

<img width="1072" height="700" alt="image" src="https://github.com/user-attachments/assets/b4bdebf0-b838-4201-b74a-1d3c2ad6458b" />


### Singleplayer, Personal Computer

<img width="1072" height="700" alt="image" src="https://github.com/user-attachments/assets/a6a8657d-75a8-4ca1-b9ba-94467ad5d4d7" />

### Multiplayer, Phone/Tablet

<img width="540" height="913" alt="image" src="https://github.com/user-attachments/assets/36ba76cf-bab0-4db3-97f4-eec2be5c227a" />



- All pages are vertical-scrolling only.
- All game pages can have the sidebar collapsed to remove vertical scrolling.
- The website uses flexboxes over media querries and should reasonably adapt to your screen.





## Why the Supabase backend?
Serverless infrastructure can not support multiplayer games, asynchronous or otherwise, without either a peer-to-peer connection or a facilitating API. Though action-verification remains possible through server calls, objective game-state verification and persistance near-require a database.

For my own implimentation of an asyncronous game, my primary requirements were Unique user IDs; messaging queue subscriptions; persistant messages; and messages that could be dynamically permitted, dependent on previous messages.
> Ex: If a user is not a _Player_, or it is not said Player's turn, the messaging queue will reject their update to the gamestate. Otherwise, commit the action and update all players.
  







