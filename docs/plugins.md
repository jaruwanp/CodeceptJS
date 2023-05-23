---
permalink: plugins
sidebarDepth: 
sidebar: auto
title: Plugins
---

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## autoDelay

Sometimes it takes some time for a page to respond to user's actions.
Depending on app's performance this can be either slow or fast.

For instance, if you click a button and nothing happens - probably JS event is not attached to this button yet
Also, if you fill field and input validation doesn't accept your input - maybe because you typed value too fast.

This plugin allows to slow down tests execution when a test running too fast.
It puts a tiny delay for before and after action commands.

Commands affected (by default):

-   `click`
-   `fillField`
-   `checkOption`
-   `pressKey`
-   `doubleClick`
-   `rightClick`

#### Configuration

```js
plugins: {
   autoDelay: {
     enabled: true
   }
}
```

Possible config options:

-   `methods`: list of affected commands. Can be overridden
-   `delayBefore`: put a delay before a command. 100ms by default
-   `delayAfter`: put a delay after a command. 200ms by default

### Parameters

-   `config`  

## autoLogin

Logs user in for the first test and reuses session for next tests.
Works by saving cookies into memory or file.
If a session expires automatically logs in again.

> For better development experience cookies can be saved into file, so a session can be reused while writing tests.

#### Usage

1.  Enable this plugin and configure as described below
2.  Define user session names (example: `user`, `editor`, `admin`, etc).
3.  Define how users are logged in and how to check that user is logged in
4.  Use `login` object inside your tests to log in:

```js
// inside a test file
// use login to inject auto-login function
Before(({ login }) => {
   login('user'); // login using user session
});

// Alternatively log in for one scenario
Scenario('log me in', ( {I, login} ) => {
   login('admin');
   I.see('I am logged in');
});
```

#### Configuration

-   `saveToFile` (default: false) - save cookies to file. Allows to reuse session between execution.
-   `inject` (default: `login`) - name of the login function to use
-   `users` - an array containing different session names and functions to:
    -   `login` - sign in into the system
    -   `check` - check that user is logged in
    -   `fetch` - to get current cookies (by default `I.grabCookie()`)
    -   `restore` - to set cookies (by default `I.amOnPage('/'); I.setCookie(cookie)`)

#### How It Works

1.  `restore` method is executed. It should open a page and set credentials.
2.  `check` method is executed. It should reload a page (so cookies are applied) and check that this page belongs to logged in user.
3.  If `restore` and `check` were not successful, `login` is executed
4.  `login` should fill in login form
5.  After successful login, `fetch` is executed to save cookies into memory or file.

#### Example: Simple login

```js
autoLogin: {
  enabled: true,
  saveToFile: true,
  inject: 'login',
  users: {
    admin: {
      // loginAdmin function is defined in `steps_file.js`
      login: (I) => I.loginAdmin(),
      // if we see `Admin` on page, we assume we are logged in
      check: (I) => {
         I.amOnPage('/');
         I.see('Admin');
      }
    }
  }
}
```

#### Example: Multiple users

```js
autoLogin: {
  enabled: true,
  saveToFile: true,
  inject: 'loginAs', // use `loginAs` instead of login
  users: {
    user: {
      login: (I) => {
         I.amOnPage('/login');
         I.fillField('email', 'user@site.com');
         I.fillField('password', '123456');
         I.click('Login');
      },
      check: (I) => {
         I.amOnPage('/');
         I.see('User', '.navbar');
      },
    },
    admin: {
      login: (I) => {
         I.amOnPage('/login');
         I.fillField('email', 'admin@site.com');
         I.fillField('password', '123456');
         I.click('Login');
      },
      check: (I) => {
         I.amOnPage('/');
         I.see('Admin', '.navbar');
      },
    },
  }
}
```

#### Example: Keep cookies between tests

If you decide to keep cookies between tests you don't need to save/retrieve cookies between tests.
But you need to login once work until session expires.
For this case, disable `fetch` and `restore` methods.

```js
helpers: {
   WebDriver: {
     // config goes here
     keepCookies: true; // keep cookies for all tests
   }
},
plugins: {
   autoLogin: {
     users: {
       admin: {
         login: (I) => {
           I.amOnPage('/login');
           I.fillField('email', 'admin@site.com');
           I.fillField('password', '123456');
           I.click('Login');
         },
         check: (I) => {
           I.amOnPage('/dashboard');
           I.see('Admin', '.navbar');
         },
         fetch: () => {}, // empty function
         restore: () => {}, // empty funciton
       }
    }
  }
}
```

#### Example: Getting sessions from local storage

If your session is stored in local storage instead of cookies you still can obtain sessions.

```js
plugins: {
   autoLogin: {
    admin: {
      login: (I) => I.loginAsAdmin(),
      check: (I) => I.see('Admin', '.navbar'),
      fetch: (I) => {
        return I.executeScript(() => localStorage.getItem('session_id'));
      },
      restore: (I, session) => {
        I.amOnPage('/');
        I.executeScript((session) => localStorage.setItem('session_id', session), session);
      },
    }
  }
}
```

#### Tips: Using async function in the autoLogin

If you use async functions in the autoLogin plugin, login function should be used with `await` keyword.

```js
autoLogin: {
  enabled: true,
  saveToFile: true,
  inject: 'login',
  users: {
    admin: {
      login: async (I) => {  // If you use async function in the autoLogin plugin
         const phrase = await I.grabTextFrom('#phrase')
         I.fillField('username', 'admin'),
         I.fillField('password', 'password')
         I.fillField('phrase', phrase)
      },
      check: (I) => {
         I.amOnPage('/');
         I.see('Admin');
      },
    }
  }
}
```

```js
Scenario('login', async ( {I, login} ) => {
  await login('admin') // you should use `await`
})
```

### Parameters

-   `config`  

## commentStep

Add descriptive nested steps for your tests:

```js
Scenario('project update test', async (I) => {
  __`Given`;
  const projectId = await I.have('project');

  __`When`;
  projectPage.update(projectId, { title: 'new title' });

  __`Then`;
  projectPage.open(projectId);
  I.see('new title', 'h1');
})
```

Steps prefixed with `__` will be printed as nested steps in `--steps` output:

      Given
        I have "project"
      When
        projectPage update
      Then
        projectPage open
        I see "new title", "h1"

Also those steps will be exported to allure reports.

This plugin can be used

### Config

-   `enabled` - (default: false) enable a plugin
-   `registerGlobal` - (default: false) register `__` template literal function globally. You can override function global name by providing a name as a value.

### Examples

Registering `__` globally:

```js
plugins: {
  commentStep: {
    enabled: true,
    registerGlobal: true
  }
}
```

Registering `Step` globally:

```js
plugins: {
  commentStep: {
    enabled: true,
    registerGlobal: 'Step'
  }
}
```

Using only local function names:

```js
plugins: {
  commentStep: {
    enabled: true
  }
}
```

Then inside a test import a comment function from a plugin.
For instance, you can prepare Given/When/Then functions to use them inside tests:

```js
// inside a test
const step = codeceptjs.container.plugins('commentStep');

const Given = () => step`Given`;
const When = () => step`When`;
const Then = () => step`Then`;
```

Scenario('project update test', async (I) => {
  Given();
  const projectId = await I.have('project');

  When();
  projectPage.update(projectId, { title: 'new title' });

  Then();
  projectPage.open(projectId);
  I.see('new title', 'h1');
});

```

```

### Parameters

-   `config`  

## coverage

Dumps code coverage from Playwright/Puppeteer after every test.

#### Configuration

```js
plugins: {
   coverage: {
     enabled: true
   }
}
```

Possible config options:

-   `coverageDir`: directory to dump coverage files
-   `uniqueFileName`: generate a unique filename by adding uuid

### Parameters

-   `config`  

## customLocator

Creates a [custom locator][1] by using special attributes in HTML.

If you have a convention to use `data-test-id` or `data-qa` attributes to mark active elements for e2e tests,
you can enable this plugin to simplify matching elements with these attributes:

```js
// replace this:
I.click({ css: '[data-test-id=register_button]');
// with this:
I.click('$register_button');
```

This plugin will create a valid XPath locator for you.

#### Configuration

-   `enabled` (default: `false`) should a locator be enabled
-   `prefix` (default: `$`) sets a prefix for a custom locator.
-   `attribute` (default: `data-test-id`) to set an attribute to be matched.
-   `strategy` (default: `xpath`) actual locator strategy to use in query (`css` or `xpath`).
-   `showActual` (default: false) show in the output actually produced XPath or CSS locator. By default shows custom locator value.

#### Examples:

Using `data-test` attribute with `$` prefix:

```js
// in codecept.conf.js
plugins: {
 customLocator: {
   enabled: true,
   attribute: 'data-test'
 }
}
```

In a test:

```js
I.seeElement('$user'); // matches => [data-test=user]
I.click('$sign-up'); // matches => [data-test=sign-up]
```

Using `data-qa` attribute with `=` prefix:

```js
// in codecept.conf.js
plugins: {
 customLocator: {
   enabled: true,
   prefix: '=',
   attribute: 'data-qa'
 }
}
```

In a test:

```js
I.seeElement('=user'); // matches => [data-qa=user]
I.click('=sign-up'); // matches => [data-qa=sign-up]
```

Using `data-qa` OR `data-test` attribute with `=` prefix:

```js
// in codecept.conf.js
plugins: {
 customLocator: {
   enabled: true,
   prefix: '=',
   attribute: ['data-qa', 'data-test'],
   strategy: 'xpath'
 }
}
```

In a test:

```js
I.seeElement('=user'); // matches => //*[@data-qa=user or @data-test=user]
I.click('=sign-up'); // matches => //*[data-qa=sign-up or @data-test=sign-up]
```

```js
// in codecept.conf.js
plugins: {
 customLocator: {
   enabled: true,
   prefix: '=',
   attribute: ['data-qa', 'data-test'],
   strategy: 'css'
 }
}
```

In a test:

```js
I.seeElement('=user'); // matches => [data-qa=user],[data-test=user]
I.click('=sign-up'); // matches => [data-qa=sign-up],[data-test=sign-up]
```

### Parameters

-   `config`  

## eachElement

Provides `eachElement` global function to iterate over found elements to perform actions on them.

`eachElement` takes following args:

-   `purpose` - the goal of an action. A comment text that will be displayed in output.
-   `locator` - a CSS/XPath locator to match elements
-   `fn(element, index)` - **asynchronous** function which will be executed for each matched element.

Example of usage:

```js
// this example works with Playwright and Puppeteer helper
await eachElement('click all checkboxes', 'form input[type=checkbox]', async (el) => {
  await el.click();
});
```

Click odd elements:

```js
// this example works with Playwright and Puppeteer helper
await eachElement('click odd buttons', '.button-select', async (el, index) => {
  if (index % 2) await el.click();
});
```

Check all elements for visibility:

```js
// this example works with Playwright and Puppeteer helper
const assert = require('assert');
await eachElement('check all items are visible', '.item', async (el) => {
  assert(await el.isVisible());
});
```

This method works with WebDriver, Playwright, Puppeteer, Appium helpers.

Function parameter `el` represents a matched element.
Depending on a helper API of `el` can be different. Refer to API of corresponding browser testing engine for a complete API list:

-   [Playwright ElementHandle][2]
-   [Puppeteer][3]
-   [webdriverio element][4]

#### Configuration

-   `registerGlobal` - to register `eachElement` function globally, true by default

If `registerGlobal` is false you can use eachElement from the plugin:

```js
const eachElement = codeceptjs.container.plugins('eachElement');
```

### Parameters

-   `purpose` **[string][5]** 
-   `locator` **CodeceptJS.LocatorOrString** 
-   `fn` **[Function][6]** 

Returns **([Promise][7]&lt;any> | [undefined][8])** 

## fakerTransform

Use the [faker.js][9] package to generate fake data inside examples on your gherkin tests

![Faker.js][10]

#### Usage

To start please install `faker.js` package

    npm install -D faker

    yarn add -D faker

Add this plugin to config file:

```js
plugins: {
   fakerTransform: {
     enabled: true
   }
}
```

Add the faker API using a mustache string format inside examples tables in your gherkin scenario outline

```feature
Scenario Outline: ...
            Given ...
             When ...
             Then ...
        Examples:
  | productName          | customer              | email              | anythingMore |
  | {{commerce.product}} | Dr. {{name.findName}} | {{internet.email}} | staticData   |
```

### Parameters

-   `config`  

## pauseOnFail

Automatically launches [interactive pause][11] when a test fails.

Useful for debugging flaky tests on local environment.
Add this plugin to config file:

```js
plugins: {
  pauseOnFail: {},
}
```

Unlike other plugins, `pauseOnFail` is not recommended to be enabled by default.
Enable it manually on each run via `-p` option:

    npx codeceptjs run -p pauseOnFail

## retryFailedStep

Retries each failed step in a test.

Add this plugin to config file:

```js
plugins: {
    retryFailedStep: {
       enabled: true
    }
}
```

Run tests with plugin enabled:

    npx codeceptjs run --plugins retryFailedStep

#### Configuration:

-   `retries` - number of retries (by default 3),
-   `when` - function, when to perform a retry (accepts error as parameter)
-   `factor` - The exponential factor to use. Default is 1.5.
-   `minTimeout` - The number of milliseconds before starting the first retry. Default is 1000.
-   `maxTimeout` - The maximum number of milliseconds between two retries. Default is Infinity.
-   `randomize` - Randomizes the timeouts by multiplying with a factor between 1 to 2. Default is false.
-   `defaultIgnoredSteps` - an array of steps to be ignored for retry. Includes:
    -   `amOnPage`
    -   `wait*`
    -   `send*`
    -   `execute*`
    -   `run*`
    -   `have*`
-   `ignoredSteps` - an array for custom steps to ignore on retry. Use it to append custom steps to ignored list.
    You can use step names or step prefixes ending with `*`. As such, `wait*` will match all steps starting with `wait`.
    To append your own steps to ignore list - copy and paste a default steps list. Regexp values are accepted as well.

#### Example

```js
plugins: {
    retryFailedStep: {
        enabled: true,
        ignoredSteps: [
          'scroll*', // ignore all scroll steps
          /Cookie/, // ignore all steps with a Cookie in it (by regexp)
        ]
    }
}
```

#### Disable Per Test

This plugin can be disabled per test. In this case you will need to stet `I.retry()` to all flaky steps:

Use scenario configuration to disable plugin for a test

```js
Scenario('scenario tite', () => {
   // test goes here
}).config(test => test.disableRetryFailedStep = true)
```

### Parameters

-   `config`  

## retryTo

Adds global `retryTo` which retries steps a few times before failing.

Enable this plugin in `codecept.conf.js` (enabled by default for new setups):

```js
plugins: {
  retryTo: {
    enabled: true
  }
}
```

Use it in your tests:

```js
// retry these steps 5 times before failing
await retryTo((tryNum) => {
  I.switchTo('#editor frame');
  I.click('Open');
  I.see('Opened')
}, 5);
```

Set polling interval as 3rd argument (200ms by default):

```js
// retry these steps 5 times before failing
await retryTo((tryNum) => {
  I.switchTo('#editor frame');
  I.click('Open');
  I.see('Opened')
}, 5, 100);
```

Default polling interval can be changed in a config:

```js
plugins: {
  retryTo: {
    enabled: true,
    pollInterval: 500,
  }
}
```

Disables retryFailedStep plugin for steps inside a block;

Use this plugin if:

-   you need repeat a set of actions in flaky tests
-   iframe was not rendered and you need to retry switching to it

#### Configuration

-   `pollInterval` - default interval between retries in ms. 200 by default.
-   `registerGlobal` - to register `retryTo` function globally, true by default

If `registerGlobal` is false you can use retryTo from the plugin:

```js
const retryTo = codeceptjs.container.plugins('retryTo');
```

### Parameters

-   `config`  

## screenshotOnFail

Creates screenshot on failure. Screenshot is saved into `output` directory.

Initially this functionality was part of corresponding helper but has been moved into plugin since 1.4

This plugin is **enabled by default**.

#### Configuration

Configuration can either be taken from a corresponding helper (deprecated) or a from plugin config (recommended).

```js
plugins: {
   screenshotOnFail: {
     enabled: true
   }
}
```

Possible config options:

-   `uniqueScreenshotNames`: use unique names for screenshot. Default: false.
-   `fullPageScreenshots`: make full page screenshots. Default: false.

### Parameters

-   `config`  

## selenoid

[Selenoid][12] plugin automatically starts browsers and video recording.
Works with WebDriver helper.

### Prerequisite

This plugin **requires Docker** to be installed.

> If you have issues starting Selenoid with this plugin consider using the official [Configuration Manager][13] tool from Selenoid

### Usage

Selenoid plugin can be started in two ways:

1.  **Automatic** - this plugin will create and manage selenoid container for you.
2.  **Manual** - you create the conatainer and configure it with a plugin (recommended).

#### Automatic

If you are new to Selenoid and you want plug and play setup use automatic mode.

Add plugin configuration in `codecept.conf.js`:

```js
plugins: {
    selenoid: {
      enabled: true,
      deletePassed: true,
      autoCreate: true,
      autoStart: true,
      sessionTimeout: '30m',
      enableVideo: true,
      enableLog: true,
    },
  }
```

When `autoCreate` is enabled it will pull the [latest Selenoid from DockerHub][14] and start Selenoid automatically.
It will also create `browsers.json` file required by Selenoid.

In automatic mode the latest version of browser will be used for tests. It is recommended to specify exact version of each browser inside `browsers.json` file.

> **If you are using Windows machine or if `autoCreate` does not work properly, create container manually**

#### Manual

While this plugin can create containers for you for better control it is recommended to create and launch containers manually.
This is especially useful for Continous Integration server as you can configure scaling for Selenoid containers.

> Use [Selenoid Configuration Manager][13] to create and start containers semi-automatically.

1.  Create `browsers.json` file in the same directory `codecept.conf.js` is located
    [Refer to Selenoid documentation][15] to know more about browsers.json.

_Sample browsers.json_

```js
{
 "chrome": {
   "default": "latest",
   "versions": {
     "latest": {
       "image": "selenoid/chrome:latest",
       "port": "4444",
       "path": "/"
     }
   }
 }
}
```

> It is recommended to use specific versions of browsers in `browsers.json` instead of latest. This will prevent tests fail when browsers will be updated.

**⚠ At first launch selenoid plugin takes extra time to download all Docker images before tests starts**.

2.  Create Selenoid container

Run the following command to create a container. To know more [refer here][16]

```bash
docker create                                    \
--name selenoid                                  \
-p 4444:4444                                     \
-v /var/run/docker.sock:/var/run/docker.sock     \
-v `pwd`/:/etc/selenoid/:ro                      \
-v `pwd`/output/video/:/opt/selenoid/video/      \
-e OVERRIDE_VIDEO_OUTPUT_DIR=`pwd`/output/video/ \
aerokube/selenoid:latest-release
```

### Video Recording

This plugin allows to record and save video per each executed tests.

When `enableVideo` is `true` this plugin saves video in `output/videos` directory with each test by name
To save space videos for all succesful tests are deleted. This can be changed by `deletePassed` option.

When `allure` plugin is enabled a video is attached to report automatically.

### Options:

| Param            | Description                                                                    |
| ---------------- | ------------------------------------------------------------------------------ |
| name             | Name of the container (default : selenoid)                                     |
| port             | Port of selenium server (default : 4444)                                       |
| autoCreate       | Will automatically create container (Linux only) (default : true)              |
| autoStart        | If disabled start the container manually before running tests (default : true) |
| enableVideo      | Enable video recording and use `video` folder of output (default: false)       |
| enableLog        | Enable log recording and use `logs` folder of output (default: false)          |
| deletePassed     | Delete video and logs of passed tests (default : true)                         |
| additionalParams | example: `additionalParams: '--env TEST=test'` [Refer here][17] to know more   |

### Parameters

-   `config`  

## stepByStepReport

![step-by-step-report][18]

Generates step by step report for a test.
After each step in a test a screenshot is created. After test executed screenshots are combined into slideshow.
By default, reports are generated only for failed tests.

Run tests with plugin enabled:

    npx codeceptjs run --plugins stepByStepReport

#### Configuration

```js
"plugins": {
   "stepByStepReport": {
     "enabled": true
   }
}
```

Possible config options:

-   `deleteSuccessful`: do not save screenshots for successfully executed tests. Default: true.
-   `animateSlides`: should animation for slides to be used. Default: true.
-   `ignoreSteps`: steps to ignore in report. Array of RegExps is expected. Recommended to skip `grab*` and `wait*` steps.
-   `fullPageScreenshots`: should full page screenshots be used. Default: false.
-   `output`: a directory where reports should be stored. Default: `output`.
-   `screenshotsForAllureReport`: If Allure plugin is enabled this plugin attaches each saved screenshot to allure report. Default: false.
-   \`disableScreenshotOnFail : Disables the capturing of screeshots after the failed step. Default: true.

### Parameters

-   `config` **any** 

## stepTimeout

Set timeout for test steps globally.

Add this plugin to config file:

```js
plugins: {
    stepTimeout: {
       enabled: true
    }
}
```

Run tests with plugin enabled:

    npx codeceptjs run --plugins stepTimeout

#### Configuration:

-   `timeout` - global step timeout, default 150 seconds
-   `overrideStepLimits` - whether to use timeouts set in plugin config to override step timeouts set in code with I.limitTime(x).action(...), default false
-   `noTimeoutSteps` - an array of steps with no timeout. Default:

    -   `amOnPage`
    -   `wait*`

    you could set your own noTimeoutSteps which would replace the default one.

-   `customTimeoutSteps` - an array of step actions with custom timeout. Use it to override or extend noTimeoutSteps.
    You can use step names or step prefixes ending with `*`. As such, `wait*` will match all steps starting with `wait`.

#### Example

```js
plugins: {
    stepTimeout: {
        enabled: true,
        overrideStepLimits: true,
        noTimeoutSteps: [
          'scroll*', // ignore all scroll steps
          /Cookie/, // ignore all steps with a Cookie in it (by regexp)
        ],
        customTimeoutSteps: [
          ['myFlakyStep*', 1],
          ['scrollWhichRequiresTimeout', 5],
        ]
    }
}
```

### Parameters

-   `config`  

## subtitles

Automatically captures steps as subtitle, and saves it as an artifact when a video is found for a failed test

#### Configuration

```js
plugins: {
 subtitles: {
   enabled: true
 }
}
```

## tryTo

Adds global `tryTo` function inside of which all failed steps won't fail a test but will return true/false.

Enable this plugin in `codecept.conf.js` (enabled by default for new setups):

```js
plugins: {
  tryTo: {
    enabled: true
  }
}
```

Use it in your tests:

```js
const result = await tryTo(() => I.see('Welcome'));

// if text "Welcome" is on page, result => true
// if text "Welcome" is not on page, result => false
```

Disables retryFailedStep plugin for steps inside a block;

Use this plugin if:

-   you need to perform multiple assertions inside a test
-   there is A/B testing on a website you test
-   there is "Accept Cookie" banner which may surprisingly appear on a page.

#### Usage

#### Multiple Conditional Assertions

````js
Add assert requires first:
```js
const assert = require('assert');
````

Then use the assert:
const result1 = await tryTo(() => I.see('Hello, user'));
const result2 = await tryTo(() => I.seeElement('.welcome'));
assert.ok(result1 && result2, 'Assertions were not succesful');

    ##### Optional click

    ```js
    I.amOnPage('/');
    tryTo(() => I.click('Agree', '.cookies'));

#### Configuration

-   `registerGlobal` - to register `tryTo` function globally, true by default

If `registerGlobal` is false you can use tryTo from the plugin:

```js
const tryTo = codeceptjs.container.plugins('tryTo');
```

### Parameters

-   `config`  

## wdio

Webdriverio services runner.

This plugin allows to run webdriverio services like:

-   selenium-standalone
-   sauce
-   testingbot
-   browserstack
-   appium

A complete list of all available services can be found on [webdriverio website][19].

#### Setup

1.  Install a webdriverio service
2.  Enable `wdio` plugin in config
3.  Add service name to `services` array inside wdio plugin config.

See examples below:

#### Selenium Standalone Service

Install `@wdio/selenium-standalone-service` package, as [described here][20].
It is important to make sure it is compatible with current webdriverio version.

Enable `wdio` plugin in plugins list and add `selenium-standalone` service:

```js
plugins: {
   wdio: {
       enabled: true,
       services: ['selenium-standalone']
       // additional config for service can be passed here
   }
}
```

Please note, this service can be used with Protractor helper as well!

#### Sauce Service

Install `@wdio/sauce-service` package, as [described here][21].
It is important to make sure it is compatible with current webdriverio version.

Enable `wdio` plugin in plugins list and add `sauce` service:

```js
plugins: {
   wdio: {
       enabled: true,
       services: ['sauce'],
       user: ... ,// saucelabs username
       key: ... // saucelabs api key
       // additional config, from sauce service
   }
}
```

* * *

In the same manner additional services from webdriverio can be installed, enabled, and configured.

#### Configuration

-   `services` - list of enabled services
-   ... - additional configuration passed into services.

### Parameters

-   `config`  

[1]: https://codecept.io/locators#custom-locators

[2]: https://playwright.dev/docs/api/class-elementhandle

[3]: https://pptr.dev/#?product=Puppeteer&show=api-class-elementhandle

[4]: https://webdriver.io/docs/api

[5]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[6]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function

[7]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise

[8]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined

[9]: https://www.npmjs.com/package/faker

[10]: https://raw.githubusercontent.com/Marak/faker.js/master/logo.png

[11]: /basics/#pause

[12]: https://aerokube.com/selenoid/

[13]: https://aerokube.com/cm/latest/

[14]: https://hub.docker.com/u/selenoid

[15]: https://aerokube.com/selenoid/latest/#_prepare_configuration

[16]: https://aerokube.com/selenoid/latest/#_option_2_start_selenoid_container

[17]: https://docs.docker.com/engine/reference/commandline/create/

[18]: https://codecept.io/img/codeceptjs-slideshow.gif

[19]: https://webdriver.io

[20]: https://webdriver.io/docs/selenium-standalone-service.html

[21]: https://webdriver.io/docs/sauce-service.html