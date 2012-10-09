xcopy js\infertek.busyindicator.js build\debug\js /Y
xcopy style\loading-image.gif build\debug\style /Y
xcopy style\loading-image.gif build\release\style /Y
cmd /C lessc -x style\infertek.busyindicator.less > build\release\style\infertek.busyindicator.min.css
cmd /C lessc style\infertek.busyindicator.less > build\debug\style\infertek.busyindicator.css
cmd /C uglifyjs -o build\release\js\infertek.busyindicator.min.js build\debug\js\infertek.busyindicator.js