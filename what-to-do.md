When your claude limit resets, start it up in the terminal by typing in "claude"

Once it is running, hit shift + tab on your keyboard to move it to "Plan Mode" Once it is in plan mode, then write out a super detailed and long prompt telling claude what it is youw ant to build.

Give it as much detail as you can on what it needs to look like, how it should function, etc. and claude will work with you to make a plan for how youre gonna do it It will ask you questions and stuff too to refien this plan back and forth, and you can ask it it refine spefific featrues by telling it. 

Once you have a plan that you're happy with, claude will prompt you to go ahead and build it. If you want a quick life hack, once you start building it, hit "shift + tab" until your cladue shows "Auto Mode". What this does is it lets claude run on its own in the background and it wont ask you to approve things.

Give it a couple of minuites and your whole app will be build. For some context to give during your plan, paste this into your prompt:

I want to containerize my application, so that we can use postgres in a docker container. I want to be able to run the entire app using docker-compose up --build I want this application to use drizzle orm for db interfacing and i want all of the logic to be in the next app, in typescript. No seperate backend or other service, i want this to be a single app that handles the full end to end. For authentication, use better auth, and for the design style, use shad-cn please. Dont use any graidents or serif fonts, I dont want this applicartion to look super AI, I want it to fit the asthetic of an internal enterprise tool.