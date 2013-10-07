# Rhino Vert.x - Fork with Eclipse JSDT support

This fork add support so you can debug your Vert.x javascript code in the Eclipse debugger.


See http://wiki.eclipse.org/JSDT/Debug/Rhino/Embedding_Rhino_Debugger#Connecting_to_a_Remote_Rhino_Debugger 

Requirements:

* Eclipse 3.7 installed with the JSDT components (do you see "Remote Javascript" listed under your options for debug launchers in Eclipse?)
* Vertx - tested with 2.0.2-SNAPSHOT (of Oct 7) - probably works with any other version that the mod-land-rhino module works with

It may work with other versions of Eclipse, but you probably need to copy the JSDT jars from other versions of Eclipse into the module's lib directory (you'll see a bunch of them in the module zip file)

Instructions:

* Unpack the module into your project mods directory
* Add the conf/langs.properties file to your vertx conf directory - (otherwise it will load the default JS module)
* Launch vertx with the System property -Drhino.debug=transport=socket,suspend=y,address=9999 (if you exclude that, it'll run as normal)
* Vertx should start and say `Waiting to connect to remote Rhino debugger with settings transport=socket,suspend=y,address=9999`  
* Start the Remote Javascript debugger, like this: http://wiki.eclipse.org/JSDT/Debug/Rhino/Embedding_Rhino_Debugger#Connecting_to_a_Remote_Rhino_Debugger


