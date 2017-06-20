/*
 * Copyright IBM Corporation 2017
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//common test functions in a handy module

'use strict'
const path = require('path');
var assert = require('yeoman-assert');

function getCheck(exists) {
  return {
    file : exists ? assert.file : assert.noFile,
    desc : exists ? 'should create ' : 'should not create ',
    content : exists ? assert.fileContent : assert.noFileContent
  }
}

var assertCommonFiles = function() {
  it('should create common files are present for all configurations', function () {
    assert.file('README.md');
    //Docker files
    assert.file('Dockerfile');
    assert.file('Dockerfile-tools');
    assert.noFile('Dockerfile-run');//deprecated name
    // Bluemix files
    assert.file('manifest.yml');
    assert.file('.bluemix/deploy.json');
    assert.file('.bluemix/pipeline.yml');
    assert.file('.bluemix/toolchain.yml');
    assert.file('manifests/kube.deploy.yml');
    // Liber8 files
    assert.file('Jenkinsfile');
    assert.file('.gitignore');
  });
}

//asserts that there are no source code files for bluemix
var assertBluemixSrc = function(exists) {
  var check = getCheck(exists);
  it(check.desc + 'source code files for bluemix', function () {
    check.file('src/main/java/application/bluemix/InvalidCredentialsException.java');
    check.file('src/main/java/application/bluemix/VCAPServices.java');
  });
}

//asserts that any none of the supplied services are included in the dev-ops pipeline
var assertServices = function(exists) {
  if(arguments.length < 2) {
    throw "assertServices error : requires at least 2 arguments, base and a service to check";
  }
  var check = getCheck(exists);
  for(var i=1; i < arguments.length; i++) {
    if (arguments[i] && typeof arguments[i] === 'string') {
      var value = arguments[i];
      it(check.desc + 'configuration files for bluemix contains ' + value, function () {
        check.content('manifest.yml', value);
        check.content('.bluemix/pipeline.yml', value);
      });
    }
  }
}

//asserts that files required for the CLI are present and correct
var assertCLI = function(appname) {
  it('files required for the CLI are present and correct', function () {
    var check = getCheck(true);
    check.content('cli-config.yml','image-name-run : "' + appname.toLowerCase() + '"');  //make sure lowercase app name
    check.content('cli-config.yml', 'version : 0.0.2');
  });
}

//asserts all files exist relative to a given base location
var assertFiles = function(base, exists) {
  if(arguments.length < 3) {
    throw "assertFiles error : requires at least 3 arguments, base, exists and a file to check";
  }
  var check = getCheck(exists);
  for(var i=2; i < arguments.length; i++) {
    if (arguments[i] && typeof arguments[i] === 'string') {
      var name = arguments[i];
      it(check.desc + 'file ' + name, function () {
        check.file(path.join(base, name));
      });
    }
  }
}

//checks that Cloudant java files are either present (exists = true, or not exists = false)
var assertCloudantJava = function(exists) {
  var check = getCheck(exists);
  it(check.desc + 'Cloudant java files', function () {
    check.file('src/main/java/application/cloudant/Cloudant.java');
    check.file('src/main/java/application/cloudant/CloudantCredentials.java');
  });
}

//checks that Object Storage java files are either present (exists = true, or not exists = false)
var assertObjectStorageJava = function(exists) {
  var check = getCheck(exists);
  it(check.desc + 'Object Storage java files', function () {
    check.file('src/main/java/application/objectstorage/ObjectStorage.java');
    check.file('src/main/java/application/objectstorage/ObjectStorageCredentials.java');
  });
}

//assert that K8s specific files are present
var assertK8s = function(appname) {
  var check = getCheck(true);
  it(check.desc + 'K8s files', function () {
    check.content('manifests/kube.deploy.yml', 'name: "' + appname + '-service"')
    check.content('Jenkinsfile', 'image = \''+ appname.toLowerCase() + '\'');
  });
}

var assertManifestYml = function(ymlName, exists) {
  it('manifest yml contains application name ' + ymlName, function () {
    assert.fileContent('manifest.yml', 'name: ' + ymlName);
  });
  var check = getCheck(exists);
  it(check.desc + 'manifest yml service entries', function () {
    check.content('manifest.yml', 'services:');
    check.content('manifest.yml', 'host: host');
    check.content('manifest.yml', 'domain: domain');
  });
}

var assertObjectStorage = function(exists) {
  var check = getCheck(exists);
  it(check.desc + 'manifest yml Object Storage entries', function () {
    check.content('manifest.yml', '- objectStorage', 'Object-Storage=config');
    check.content('manifest.yml', 'Object-Storage=config');
  });
  assertObjectStorageJava(exists);
  assertServices(exists, 'Object-Storage');
}

var assertCloudant = function(exists) {
  var check = getCheck(exists);
  it(check.desc + 'manifest yml Cloudant entries', function () {
    check.content('manifest.yml', '- cloudant', 'cloudantNoSQLDB=config');
    check.content('manifest.yml', 'cloudantNoSQLDB=config');
  });
  assertCloudantJava(exists);
  assertServices(exists, 'cloudant');
}

module.exports = {
  assertCommonFiles : assertCommonFiles,
  assertBluemixSrc : assertBluemixSrc,
  assertManifestYml : assertManifestYml,
  assertFiles : assertFiles,
  assertCLI : assertCLI,
  assertCloudantJava : assertCloudantJava,
  assertObjectStorageJava : assertObjectStorageJava,
  assertServices : assertServices,
  assertK8s : assertK8s,
  assertObjectStorage : assertObjectStorage,
  assertCloudant : assertCloudant
}
