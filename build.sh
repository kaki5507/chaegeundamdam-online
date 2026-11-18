#!/bin/bash
# 소스(head.html + parts/*.js + tail.html)를 합쳐 단일 파일 index.html 을 만든다.
cd "$(dirname "$0")"
cat head.html parts/01_core.js parts/02_art.js parts/03_data.js parts/04_art2.js parts/05_world.js parts/06_entities.js parts/07_boss.js parts/08_ui.js parts/09_main.js parts/10_story.js parts/11_social.js parts/12_extra.js parts/13_world2.js parts/14_dream.js parts/15_hunt.js parts/16_polish.js parts/17_access.js parts/18_combat_fx.js parts/19_jobtowns.js parts/20_events.js tail.html > index.html
cat parts/*.js > /tmp/_all.js
node --check /tmp/_all.js && echo SYNTAX_OK
wc -c index.html
