# Millionaire With Friends

---

## Overview

_Millionaire With Friends_ is a multiplayer web app intended to recreate the iconic gameplay of Who Wants to Be a Millionaire, with extra twists added to make online play with friends a fun competitive experience.

It is STRONGLY recommended to play this game with friends over some sort of group voice chat or video call.

## Running Locally

If you would like to run the game on your own machine:

1. Clone the repo.

1. Navigate to the repo directory.

1. Make sure all dependencies are present by running `npm install`.

1. Check `package.json` for any startup command you would like to use to run the game. There are different options to choose what question data to use and what level of logging to allow. For example, if you want to run the game with real questions and log only errors, you would run `npm run clean_prod_error`.

### Questions

Included in the repo is the `script` directory, which contains `PopulateHotSeatQuestions.js`. Run `node script/PopulateHotSeatQuestions.js` to generate questions, which are not included in the repo.

### Fonts

You may notice upon running the game that the fonts do not look all that good. This is because the fonts I use should not be hosted on GitHub, as they are licensed. See the `.gitignore` for more details.

## Gameplay

_Millionaire With Friends_ is intended to run just like a real game of _Who Wants to Be a Millionaire_, from the fastest finger to the million dollar question. The only difference is that everyone playing, whether in the hot seat or not, is always in the game.

### Logging In

When you first navigate to the web page of the game, you will be prompted with two text boxes: one for a __username__ and one for a __room code__. The username will be your displayed name in whichever room you join. The room code is pretty self explanatory; it's the identifying code of the room you wish to join.

Underneath those boxes you should see two buttons: __Create Room__ and __Join Room__.

#### Creating a Room

Should you want to create a new room rather than join an existing one, no room code is necessary. Just provide a username and click on the "Create Room" button. You should now be in a lobby with an auto-generated room code.

#### Joining a Room

If you would like to join a room that has already been created, enter a username and a valid room code in the room code text box then hit the "Join Room" button.

### Starting the Game

Once the desired amount of players are in, whoever created the room can set options and start the game. Right now the only option is for setting a show host.

#### The Show Host

The show host is a special role reserved for at most one player during a game. The show host forgoes playing the game to instead control the flow of the game and act as the host of the game, just like Regis Philbin, Chris Tarrant, or Meredith Vieira.

This role is only recommended for players who are either very familiar with the show or who have played the game a lot.

### Fastest Finger

The game will start with a round of fastest finger if multiple players are eligible for the hot seat. Otherwise, this round will be skipped as its only purpose is to select the hot seat player.

A question will be asked that requires four answers to be given back in the correct order.

Whoever gets it right and in the quickest time will become the next hot seat player.

### The Hot Seat

The hot seat player will play the game as a traditional contestant on the show. They will attempt the gauntlet of questions with the help of lifelines along the way.

### Other Contestants

All other players who are not in the hot seat (but also not being the show host) are still in the game at this point. Rather than rack up potential big money per question that can be walked away with, contestants will earn guaranteed partial money per question, should they answer correctly. The quicker they get it right, the more percentage of the question value they get in their pocket.

### Lifelines

Lifelines help the hot seat player along their trip to the million dollar question, but in doing so also help out the other contestants when used.

Any time a lifeline is used by the hot seat player, all other contestants will get the best possible ratio of partial money should they get the answer right.

#### Fifty Fifty

Removes two incorrect answers from the possible choices. This is the only lifeline that requires no input from other contestants.

#### Ask the Audience

Polls from both the other contestants and from an AI audience to give aggregate results to the hot seat player. Should contestants recommend a choice that is picked by the hot seat player, they will either be rewarded for success or punished for failure.

#### Phone a Friend

Lets the hot seat player pick one contestant to get a recommendation from. Whoever is called upon will give a confidence percentage of their choice. The higher the confidence, the more extreme the risk/reward ratio becomes. Recommending an incorrect choice will result in money loss, while recommending a correct choice will result in money gain, the value being dependent on the given confidence.