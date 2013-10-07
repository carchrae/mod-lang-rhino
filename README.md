# Rhino Vert.x with Eclipse JSDT support

This fork allows you to debug your Vert.x javascript code in the Eclipse debugger.


See http://wiki.eclipse.org/JSDT/Debug/Rhino/Embedding_Rhino_Debugger#Connecting_to_a_Remote_Rhino_Debugger 

Requirements:

* Eclipse 3.7 installed with the JSDT components (do you see "Remote Javascript" listed under your options for debug launchers in Eclipse?)
* Vertx - tested with 2.0.2-SNAPSHOT (of Oct 7) - probably works with any other version that the mod-land-rhino module works with

It may work with other versions of Eclipse, but you probably need to copy the JSDT jars from other versions of Eclipse into the module's lib directory (you'll see a bunch of them in the module zip file)

Instructions:

* Unpack the module into your project mods directory
* Add the langs.properties file (example is in conf) to your vertx build path (otherwise it will load the default JS module)
* Launch vertx with the System property -Drhino.debug=transport=socket,suspend=y,address=9999
* Vertx should start and say `Waiting to connect to remote Rhino debugger with settings transport=socket,suspend=y,address=9999`  
* Start the Remote Javascript debugger, like this: http://wiki.eclipse.org/JSDT/Debug/Rhino/Embedding_Rhino_Debugger#Connecting_to_a_Remote_Rhino_Debugger
* You'll need to add your JS source path to the Javascript Debugger launch config.  Alternatively, throw a `debugger;` line into your code and it'll prompt you for the source.

Limitations:

* Does not survive auto-redeploy restarts.  You'll need to stop both Vertx and the Rhino Debugger - I tried, but couldn't figure out how to get it to recycle the debugger. 
