---
title: Skyrim Mod Loader
thumbnail: N/A
sourceCodeLink: https://github.com/username/myproject
blogPostLink: N/A
private: true
techUsed:
  - C++
  - Go
  - Wails
year: Current
---
I've been modding Skyrim since I was a kid, and each time I play, I create a new modpack. To automate mod configurations, tools like Wabbajack come in handy. Wabbajack, utilizing the Nexus API, automates the replication of mod setups, streamlining the installation process for complex modpacks.
#
However, I saw room to improve Wabbajack by adding features I'd personally like, and decided to create my own mod loader instead of using Mod Organizer 2 (MO2) for building modpacks.
#
To create a mod loader like MO2, I’m developing a custom virtual file system (VFS) in C++ that is deployed via a DLL that's injected directly into Skyrim to load files from a separate directory. This method maintains the integrity of the game’s installation while loading an entire modpack.
#
For the user interface, I’m experimenting with Wails, a new framework that combines Go for backend operations with a WebView2 frontend. This setup is ideal for rapidly developing a responsive and user-friendly interface. Specifically, this part of the codebase will handle modpack creation and configuration, similar to Wabbajack, replicating modpacks via the Nexus API.
#
The project is still in its early stages, with the repository remaining private as I refine the VFS and start developing the frontend. I plan to make it public once it has matured.
