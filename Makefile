#Configure these for your situation
JSFDIR=.
CLOSURECOMPILER=/opt/closureCompiler/compiler.jar
YUICOMPRESSOR=/opt/yuicompressor-2.4.7/build/yuicompressor-2.4.7.jar

#CONFIGJS=$(JSFDIR)/Demos/config.js

#Some constants and variables
SRCDIR=$(JSFDIR)/Source
#CONFIGJS=$(JSFDIR)/Demos/config.js
CLIENTSDIR=$(JSFDIR)/Clients
MOOTOOLSCORECLIENT=$(CLIENTSDIR)/mootools-core.js
MOOTOOLSCORESOURCE=$(SRCDIR)/mootools-core.js
TARGETDIR=BuildTest
CATTEDDIR=uncompressed
COMPRESSEDDIR=yuiCompressor
COMPILEDDIR=closureCompiler
#The jsf dependencies
JSF=$(SRCDIR)/Core/APE.js $(SRCDIR)/Core/Events.js $(SRCDIR)/Core/Core.js $(SRCDIR)/Pipe/Pipe.js $(SRCDIR)/Pipe/PipeProxy.js $(SRCDIR)/Pipe/PipeMulti.js $(SRCDIR)/Pipe/PipeSingle.js $(SRCDIR)/Request/Request.js $(SRCDIR)/Request/Request.Stack.js $(SRCDIR)/Request/Request.CycledStack.js $(SRCDIR)/Transport/Transport.longPolling.js $(SRCDIR)/Transport/Transport.SSE.js $(SRCDIR)/Transport/Transport.XHRStreaming.js $(SRCDIR)/Transport/Transport.JSONP.js $(SRCDIR)/Transport/Transport.WebSocket.js $(SRCDIR)/Core/Utility.js $(SRCDIR)/Core/JSON.js
JSFSESSION = $(JSF) $(SRCDIR)/Core/Session.js

#let's make all

all: 										targetdirs compressedstuff

compressedstuff:			compiledstuff
	java -jar $(YUICOMPRESSOR) -o $(TARGETDIR)/$(COMPRESSEDDIR)/apeClientJS.js $(TARGETDIR)/$(COMPILEDDIR)/apeClientJS.js
	java -jar $(YUICOMPRESSOR) -o $(TARGETDIR)/$(COMPRESSEDDIR)/apeClientMoo.js $(TARGETDIR)/$(COMPILEDDIR)/apeClientMoo.js
	java -jar $(YUICOMPRESSOR) -o $(TARGETDIR)/$(COMPRESSEDDIR)/apeCore.js $(TARGETDIR)/$(COMPILEDDIR)/apeCore.js
	java -jar $(YUICOMPRESSOR) -o $(TARGETDIR)/$(COMPRESSEDDIR)/apeCoreSession.js $(TARGETDIR)/$(COMPILEDDIR)/apeCoreSession.js


compiledstuff:			$(TARGETDIR)/$(CATTEDDIR)/apeClientJS.js $(TARGETDIR)/$(CATTEDDIR)/apeClientMoo.js $(TARGETDIR)/$(CATTEDDIR)/apeCore.js $(TARGETDIR)/$(CATTEDDIR)/apeCoreSession.js
	java -jar $(CLOSURECOMPILER) --js $(TARGETDIR)/$(CATTEDDIR)/apeClientJS.js --js_output_file $(TARGETDIR)/$(COMPILEDDIR)/apeClientJS.js
	java -jar $(CLOSURECOMPILER) --js $(TARGETDIR)/$(CATTEDDIR)/apeClientMoo.js --js_output_file $(TARGETDIR)/$(COMPILEDDIR)/apeClientMoo.js
	java -jar $(CLOSURECOMPILER) --js $(TARGETDIR)/$(CATTEDDIR)/apeCore.js --js_output_file $(TARGETDIR)/$(COMPILEDDIR)/apeCore.js
	java -jar $(CLOSURECOMPILER) --js $(TARGETDIR)/$(CATTEDDIR)/apeCoreSession.js --js_output_file $(TARGETDIR)/$(COMPILEDDIR)/apeCoreSession.js

#concatting needs some logic
$(TARGETDIR)/$(CATTEDDIR)/apeClientJS.js:		$(CLIENTSDIR)/JavaScript.js  $(CONFIGJS)
	cat > $@ $^

$(TARGETDIR)/$(CATTEDDIR)/apeClientMoo.js: 	$(CLIENTSDIR)/MooTools.js  $(CONFIGJS)
	cat > $@ $^

$(TARGETDIR)/$(CATTEDDIR)/apeCore.js:		$(MOOTOOLSCORESOURCE) $(JSF)
	cat >$@ $^

$(TARGETDIR)/$(CATTEDDIR)/apeCoreSession.js:	$(MOOTOOLSCORESOURCE) $(JSFSESSION)
	cat > $@ $^
	
#startup and cleanup
targetdirs: 
	mkdir -p $(TARGETDIR)/$(CATTEDDIR) $(TARGETDIR)/$(COMPRESSEDDIR) $(TARGETDIR)/$(COMPILEDDIR)

.PHONEY: clean targetdirs

clean:
	rm -rf $(TARGETDIR)
