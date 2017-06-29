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
 * Tests the microservice generator
 */
'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

const FRAMEWORK = 'liberty';

//external modules
const liberty = require('@arf/generator-liberty');
const tests = require('@arf/java-common');

//internal libraries
const command = tests.test('command');
const bluemix = require('../lib/test-bluemix.js');
const kube = require('../lib/test-kube.js');
const core = require('../lib/core');
const extend = require('extend');

class Options extends core.Options {

  constructor(createType, buildType, technologies) {
    super();
    this.assertTech = new liberty.integrationAsserts.technologies();
    extend(this.values, {
      headless :  "true",
      buildType : buildType,
      createType : createType,
      technologies : technologies,
      appName : core.APPNAME,
      artifactId : core.ARTIFACTID
    });
  }
  
  assert() {
    super.assert(this.values.appName, this.values.appName, false, false);
    tests.test(this.values.buildType).assertApplication(core.APPNAME, core.GROUPID, core.ARTIFACTID, core.VERSION);
    this.assertTech.assert(core.APPNAME);
  }

  //this is the default assertion for a technology type that just delegates to the Liberty checker, 
  //override with a local assert<Tech> function to perform additional checks
  defaultAssertTech(type) {
    this.assertTech['assert' + type](this.values.buildType);
  }
  assertCompiles() {
    command.run(tests.test(this.values.buildType).getCompileCommand());
  }
  assertpicnmix() {
    this.assert(this.values.appName, false);    //there are no additional files to check for
    kube.test(this.values.appName, false);
  }
  assertmsbuilder() {
    this.assert(this.values.appName, false);    //there are no additional files to check for
    kube.test(this.values.appName, true);
  }
}

var technologies = ['rest', 'microprofile', 'persistence', 'websockets', 'servlet', 'watsonsdk', 'swagger', 'springboot_web'];
var buildTypes = ['gradle', 'maven'];

execute('picnmix', 'picnmix', technologies);
//execute('technologies/msbuilder', 'msbuilder', technologies);

function execute(createType, assertFunc, technologiesToTest) {

  describe('java generator : technologies integration test', function () {

    for(var i = 0; i < technologiesToTest.length; i++) {
      for(var j = 0; j < buildTypes.length; j++) {
        describe('Generates a ' + createType + ' project for ' + technologiesToTest[i] + ' (' + buildTypes[j] + ', no bluemix)', function () {
          var options = new Options(createType, buildTypes[j], [technologiesToTest[i]], technologiesToTest[i] === 'springboot_web');
          before(options.before.bind(options));
          options['assert' + assertFunc]();
          var func = options['assert' + technologiesToTest[i]];
          //see if there is a local override in place or default through to the underlying technology checker
          if(func) {
            func();
          } else {
            options.defaultAssertTech(technologiesToTest[i]);
          }
          if(technologiesToTest[i] === 'springboot_web' && createType === 'picnmix') {
            options.assertTech.assertspringboot_webonly(options.values.buildType);
          }
          options.assertCompiles();
        });
      }
    }

  });
}

describe('java generator : technologies integration test', function () {

  for(var i = 0; i < buildTypes.length; i++) {
    describe('Generates a project for (no services or technologies)', function () {
      var options = new Options('picnmix', buildTypes[i], [], false);
      before(options.before.bind(options));
      options.assert();
      options.assertTech.asserthealthdeps(options.values.buildType);
    });
  }

});