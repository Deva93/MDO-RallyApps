/**
	This is the build script that runs the app builder on all projects in the src/ 
	folder and places the App-uncompressed files in the dist/ folder.
	
	This script should really only be run 1 time right before a new release (tag) 
	is made in the git repository.
	
	If sm-rab is installed, it will generate the sm-app files in dist/sm-dist
	(all sm-rab does is make it so the custom-app gets rendered outside of the 
	iframe in rally, which allows you to drag-and-drop with other native rally
	apps, or custom apps built with sm-rab)
*/
require('shelljs/global');

var util = require('util'),
	path = require('path'),
	
	hasSmRab = which('sm-rab'),
	cwd = process.cwd(),
	format = util.format.bind(util),
	
	srcDir = path.resolve('src'),
	rabDeployDir = path.resolve('dist'),
	smDeployDir = path.resolve('dist/sm-dist');
	
function getFiles(targetFileName){
	return find(srcDir)
		.filter(function(fileName){ return new RegExp('\/' + targetFileName).exec(fileName); })
		.map(function(fileName){ return path.resolve(fileName); });
}
function buildEachProject(configFiles, buildCommand, srcFile, deployDir){
	configFiles.forEach(function(configFile){
		var appConfig = require(configFile),
			appName = appConfig.name,
			appDir = path.dirname(configFile),
			deployFile = format('%s/%s.html', deployDir, appName);
		echo('Building ' + appName);
		cd(appDir);
		exec(buildCommand);
		cp(srcFile, deployFile);
		echo('\n');
	});
}
function buildEachRabProject(){
	buildEachProject(getFiles('config.json'), 'rab', 'deploy/App-uncompressed.html', rabDeployDir);
}
function buildEachSmProject(){
	buildEachProject(getFiles('sm-config.json'), 'sm-rab', 'sm-deploy/sm-app.html', smDeployDir);
}

rm('-fr', rabDeployDir);
rm('-fr', smDeployDir);
mkdir(rabDeployDir);
mkdir(smDeployDir);
cd(cwd); buildEachRabProject();
cd(cwd); if(hasSmRab) buildEachSmProject(); else echo('You do not have sm-rab installed');