# League of Legends Auto Accept

Lol Auto Accept is an Electron app designed to streamline your League of Legends champion selection process. With this tool, you can easily `Accept` game invitations, `Prepick` your desired champion, and `Preban` those you want to keep out of the match.

## Table of Contents

- [League of Legends Auto Accept](#project-name)
  - [Table of Contents](#table-of-contents)
  - [Description](#description)
  - [How does it works](#how-does-it-works)
  - [Installation](#installation)
  - [Features](#features)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)

## Description

This project is an Electron APP that act as a "pre-action" recorder, where you can preselect what champion you will pick or ban.

## How does it works

The application functions by performing a series of steps to create a personal list of League of Legends characters (depending on your account). Here's an overview of the process:

- <ins>Electron Window Creation:</ins> The main program of the application initiates the Electron Window, providing the user interface for interaction.

- <ins>Data Retrieval:</ins> Concurrently, the application makes the necessary requests to fetch all the League of Legends character information from your account. This data retrieval involves the LCU-connectors package to access the required header information for the HTTPS requests.

- <ins>Data Collection:</ins> With the obtained data, the main program replicates the exact HTTPS requests that the official League of Legends client usually makes. This allows us to gather a complete list of all the characters you can play.

- <ins>Splash Art Retrieval:</ins> Once the character list is scraped, the application proceeds to fetch the splash art images for each character using the Data Dragon official centralized API for Splash Art and independant infos about the game (splash art, voice lines, versions list...).

- <ins>Page Creation:</ins> Utilizing the acquired character data and splash art images, the application generates three distinct pages: the accept page, the pick page, and the ban page.

- <ins>User Interaction:</ins> After launching the application, users can interact with the interface by clicking on character images, akin to the League of Legends client. These interactions enable users to specify the order in which characters will be picked or banned, taking their allies' picks or bans into account.

- <ins>Togglable Features:</ins> The application provides three main toggles for its features, allowing users to turn them on or off as per their preferences.

- <ins>In addition:</ins> The Application will not work during a game, and will be usable again after the completion of the current game.

**Because the API header needs an indentifiant that changes every instance of the LoL-client, the client needs to be opened aside in order for this application to work.**

## Installation

To install the application:
- Go to the `Releases` tab on the GitHub repository and download the `LoLAutoAccept-win32-x64.rar` compressed folder.
- Once downloaded, extract the files using WinRAR or any other compression tool you prefer.
- Next, locate the `"LoLAutoAccept.exe"` executable file within the extracted folder.

If you encounter some problems, try to :
- **Make sure you have the League client opened alongside the app.**
- decompress the file (using winrar)
- Launch the app by selecting "Run as administrator" (last resort)

## Features

The app contains 3 main features :
- The auto accept
- The auto pick
- The aut ban

And some minor features like :
- A search bar

## Contributing

You can contribute to the project by adding new small feature, no major one cause the app needs to stay easy to use, and as simple as possible. Fix some bugs. Or by commenting.

If you need any help anywhere, for exemple about this project but also about how the League of Legends Client LCU API works. Feels free to contact me on discord: `tulkiidra`

## License

This application is not affiliated, endorsed, sponsored, or specifically approved by Riot Games, Inc. or its subsidiaries. The app is an independent creation and is not an official product of Riot Games.

The use of Riot Games' trademarks, logos, and other intellectual property is solely for descriptive and informational purposes. The rights to the mentioned trademarks and copyrighted material belong to Riot Games, Inc.

While utmost care has been taken to ensure that this application operates within the guidelines and policies set forth by Riot Games, Inc., any issues or concerns related to this app should be directed to the app's developer and not to Riot Games, Inc.

Users are advised to refer to the official Riot Games channels and platforms for the most accurate and up-to-date information regarding their products and services.

By using this application, you agree to the terms outlined in this disclaimer and acknowledge that the app is an independent creation and is not associated with Riot Games, Inc. in any way.

## Contact

Feels free to contact me on discord: `tulkiidra` for any issue, or if you need some help
