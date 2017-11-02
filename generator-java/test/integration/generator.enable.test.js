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
 * Tests the enable generator
 */

'use strict';

const AssertEnable = require('../../generators/lib/assert.enable');
const constant = require('../lib/constant');
const core = require('../lib/core');

class Options extends core.BxOptions {
  constructor(framework) {
    let backendPlatform = framework === 'spring' ? 'SPRING' : 'JAVA';
    super(backendPlatform)
  }
}

const frameworkTypes = [constant.FRAMEWORK_LIBERTY, constant.FRAMEWORK_SPRING];
const gradle = 'gradle';
const maven = 'maven';

frameworkTypes.forEach(frameworkType => {
  describe('java generator : enable integration test : ' + frameworkType, function () {
    this.timeout(7000);

    describe('Enable a project using a gradle build : ' + frameworkType, function () {
      var options = new Options(frameworkType);
      options.prompts = { extName: 'prompt:patterns', buildType: 'gradle', createType: 'enable/' + frameworkType, services: ['none'], appName: constant.APPNAME, artifactId: constant.ARTIFACTID };
      before(options.before.bind(options));

      const assert = new AssertEnable(frameworkType);
      assert.assert({
        appName: constant.APPNAME,
        buildType: gradle,
        createType: options.prompts.createType,
        frameworkType: frameworkType,
        ymlName: constant.APPNAME
      })
    });

    describe('Enable a project using a maven build : ' + frameworkType, function () {
      const options = new Options(frameworkType);
      options.prompts = { extName: 'prompt:patterns', buildType: 'maven', createType: 'enable/' + frameworkType, services: ['none'], appName: constant.APPNAME, artifactId: constant.ARTIFACTID };
      before(options.before.bind(options));

      const assert = new AssertEnable(frameworkType);
      assert.assert({
        appName: constant.APPNAME,
        buildType: maven,
        createType: options.prompts.createType,
        frameworkType: frameworkType,
        ymlName: constant.APPNAME
      })
    });
  });
});
