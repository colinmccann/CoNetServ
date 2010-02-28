include config.mk

NAME=conetserv

.PHONY: all build common firefox chrome opera

all: common firefox chrome opera

common:
	@echo "===================================================================="
	@echo "              CoNetServ - package generator"
	@echo "--------------------------------------------------------------------"
	@echo " * Generates browser-specific extension packages."
	@echo " * Need pre-built libraries for all supported archs and platforms."
	@echo "===================================================================="
	@mkdir -p build/firefox/
	@mkdir -p build/chrome/
	@mkdir -p build/opera/
	@mkdir -p extension/platform/Linux_x86_64-gcc3/plugins/
	@mkdir -p extension/platform/Linux_x86-gcc3/plugins/
	@mkdir -p extension/platform/WINNT_x86-MSVC/plugins/
	@test -f extension/platform/Linux_x86_64-gcc3/plugins/npconetserv.so \
	|| { echo "Missing extension/platform/Linux_x86_64-gcc3/plugins/npconetserv.so"; exit 1; }
	@test -f extension/platform/Linux_x86-gcc3/plugins/npconetserv.so \
	|| { echo "Missing extension/platform/Linux_x86-gcc3/plugins/npconetserv.so"; exit 1; }
	@test -f extension/platform/WINNT_x86-MSVC/plugins/npconetserv.dll \
	|| { echo "Missing extension/platform/WINNT_x86-MSVC/plugins/npconetserv.dll"; exit 1; }

firefox:
	@echo "Building Mozilla Firefox add-on... build/firefox/conetserv.xpi"
	@$(RM) build/firefox/conetserv.xpi
	@cd extension && zip -q ../build/firefox/conetserv.xpi \
	   chrome.manifest install.rdf `find firefox` \
	   `find js` `find images` `find css` index.html `find jquery` \
	   `find platform` `find jquery`

chrome:
	@echo "Building Google Chrome extension... build/chrome/conetserv.crx"
	@$(RM) build/conetserv.crx
	@test -f conetserv.pem || { echo "Missing conetserv.pem"; exit 1; }
	@crxmake --pack-extension=extension/ --extension-output=build/chrome/conetserv.crx \
	  --pack-extension-key=conetserv.pem --ignore-file=chrome.manifest --ignore-file=config.xml \
	  --ignore-file=install.rdf --ignore-dir=firefox

opera:
	@echo "Building Opera widget... build/opera/conetserv-no-plugin.wgt"
	@$(RM) build/opera/conetserv-no-plugin.wgt
	@cd extension && zip -q ../build/opera/conetserv-no-plugin.wgt \
	  config.xml \
	  `find js` `find images` `find css` index.html `find jquery`
	@echo "Copying libraries for Opera... build/opera/{platform}/npconetserv.{so|dll}"
	@mkdir -p build/opera/Linux_x86_64-gcc3/
	@mkdir -p build/opera/Linux_x86-gcc3/
	@mkdir -p build/opera/WINNT_x86-MSVC/
	@cp -t build/opera/Linux_x86_64-gcc3/ extension/platform/Linux_x86_64-gcc3/plugins/npconetserv.so
	@cp -t build/opera/Linux_x86-gcc3/ extension/platform/Linux_x86-gcc3/plugins/npconetserv.so
	@cp -t build/opera/WINNT_x86-MSVC/ extension/platform/WINNT_x86-MSVC/plugins/npconetserv.dll


