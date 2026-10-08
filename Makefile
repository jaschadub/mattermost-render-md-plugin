ID      := $(shell sed -n 's/.*"id": *"\([^"]*\)".*/\1/p' plugin.json)
VERSION := $(shell sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' plugin.json)
BUNDLE  := dist/$(ID)-$(VERSION).tar.gz

.PHONY: all test lint clean

all: $(BUNDLE)

$(BUNDLE): plugin.json webapp/main.js
	rm -rf dist/$(ID)
	mkdir -p dist/$(ID)/webapp
	cp plugin.json dist/$(ID)/
	cp webapp/main.js dist/$(ID)/webapp/
	tar -C dist -czf $@ $(ID)

test:
	node --check webapp/main.js
	node webapp/test.js

lint:
	npx --yes @biomejs/biome@1.9.4 lint webapp/

clean:
	rm -rf dist
