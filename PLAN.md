# Toxen: Poly planning
## User authentication
### Identity token
The identity token is a unique token that is generated when the user first launches the app. This token is stored in the user's local storage and is used to identify the user.

### Auth: localhost
When launching the app through Electron or the localhost in the browser, the user automatically have access to the entire program and the local machine music.

### Auth: LAN (Local Area Network)
A user can connect to another user's machine through the LAN. This will allow the user to play music from the other user's machine.  
This requires the music-holder to invite the user to their machine through the use of a unique code.

A code is generated when the user clicks the "Invite" button. The code is then displayed to the user and the user can then share the code with ONE other user. This code will only work once and will be directly tied to the user's stored identity token.