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

/**
 * Tests the basic generator
 */
'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const common = require('../lib/test-common');
const framework = require('../lib/test-framework');
const tests = require('@arf/java-common');
const core = require('../lib/core');

const ARTIFACTID = 'artifact.0.1';
const GROUPID = 'test.group';
const VERSION = '1.0.0';
const APPNAME = 'testApp';
const FRAMEWORK = 'liberty';

class Options extends core.BxOptions {

  assert(appName, ymlName, cloudant, objectStorage, buildType) {
    super.assert(appName, ymlName, cloudant, objectStorage, 'basicweb');
    common.assertFiles('src/main/webapp', true, 'index.html', '/css/default.css', 'js/bundle.js');
    var test = tests.test(buildType);
    test.assertDependency('provided', 'javax.servlet', 'javax.servlet-api', '3.1.0');
    test.assertDependency('provided', 'com.ibm.websphere.appserver.api', 'com.ibm.websphere.appserver.api.servlet', '1.0.10');
    test.assertDependency('provided', 'javax.ws.rs', 'javax.ws.rs-api', '2.0.1');
    test.assertDependency('provided', 'com.ibm.websphere.appserver.api', 'com.ibm.websphere.appserver.api.jaxrs20', '1.0.10');
    framework.test(FRAMEWORK).assertSourceFiles(false);
    framework.test(FRAMEWORK).assertFeatures('jaxrs-2.0');
    framework.test(FRAMEWORK).assertFeatures('servlet-3.1');
  }
}


describe('java generator : basic integration test', function () {
  this.timeout(5000);
  describe('Generates a basic web project (no bluemix), gradle build', function () {
    var options = new Options();
    options.prompts = {extName : 'prompt:patterns', buildType : 'gradle', createType: 'basicweb', services: ['none'], appName: APPNAME, artifactId: ARTIFACTID};
    before(options.before.bind(options));
    options.assert(APPNAME, APPNAME, false, false, 'gradle');
  });

  describe('Generates a basic web project (no bluemix), maven build', function () {
    var options = new Options();
    options.prompts = {extName : 'prompt:patterns', buildType : 'maven', createType: 'basicweb', services: ['none'], appName: APPNAME, artifactId: ARTIFACTID};
    before(options.before.bind(options));
    options.assert(APPNAME, APPNAME, false, false, 'maven');
  });

  describe('Generates a basic web project (bluemix) with cloudant', function () {
    var options = new Options();
    options.prompts = {extName : 'prompt:patterns', buildType : 'maven', createType: 'basicweb', services : ['cloudant'], appName : 'bxName', artifactId: ARTIFACTID};
    before(options.before.bind(options));
    options.assert('bxName', 'bxName', true, false, 'maven');
    options.assertCloudant();
  });

  describe('Generates a basic web project (bluemix) with Object Storage', function () {
    var options = new Options();
    options.prompts = {extName : 'prompt:patterns', buildType : 'maven', createType: 'basicweb', services : ['objectStorage'], appName : 'bxName', artifactId: ARTIFACTID};
    before(options.before.bind(options));
    options.assert('bxName', 'bxName', false, true, 'maven');
    options.assertObjectStorage();
  });

  describe('Generates a basic web project (bluemix) with Cloudant and Object Storage', function () {
    var options = new Options();
    options.prompts = {extName : 'prompt:patterns', buildType : 'maven', createType: 'basicweb', services : ['objectStorage','cloudant'], appName : 'bxName', artifactId: ARTIFACTID};
    before(options.before.bind(options));
    options.assert('bxName', 'bxName', true, true, 'maven');
    options.assertCloudant();
    options.assertObjectStorage();
  });

});
