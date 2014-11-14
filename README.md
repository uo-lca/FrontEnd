# Front End of the LCA Tool

Single Page Application for data visualization. We expect this page to be loaded in a CalRecycle web page iframe. 
This is an AngularJS app bootstrapped from [angular-seed](https://github.com/angular/angular-seed).
It communicates with the back end via the [web API](https://github.com/uo-lca/CalRecycleLCA/tree/master/vs/LCIAToolAPI).

## Getting Started

Install the dependencies...

### Prerequisites

* Node [http://nodejs.org/](http://nodejs.org/).
* Git - On Windows, it must installed with option to run from Windows command prompt (it must be added to PATH).
* Bower - After Node is installed, and git has been added to PATH, execute 
```
npm install -g bower
```

### Install Dependencies

We have two kinds of dependencies in this project: tools and angular framework code.  The tools help
us manage and test the application.

* We get the tools we depend upon via `npm`, the [node package manager][npm].
* We get the angular code via `bower`, a [client-side code package manager][bower].

Npm has been configured to automatically run bower. In command prompt, cd to this directory and execute

```
npm install
```

*Note: On Ubuntu, if you see
```
npm WARN This failure might be due to the use of legacy binary "node"
```
then you need to install 
```
nodejs-legacy
```
before you can use npm to install this project's dependencies.*

```
npm install
``` calls `bower install`.  When it completes, you should find that you have two new
folders in your project.

* `node_modules` - contains the npm packages for the tools we need
* `app/bower_components` - contains the angular framework files

*Note that the `bower_components` folder would normally be installed in the root folder but
angular-seed changes this location through the `.bowerrc` file.  Putting it in the app folder makes
it easier to serve the files by a webserver.*

### Run the Application

We have preconfigured the project with a simple development web server.  The simplest way to start
this server is:

```
npm start
```

Now browse to the app at `http://localhost:8000/app/index.html`.



## Repository directory structure

* app/                --> all of the source files for the application
    * components/           --> shared modules (services and directives)
        * color-code            --> Maps categories to colors
        * d3-tip                --> d3.tip service
        * idmap                 --> Maps resource ID to resource
        * version/              --> version related components (came with angular-seed)
        * lcia-bar-chart        --> LCIA bar chart directive
        * resources/            --> WebAPI resource service 
        * sankey/               --> Sankey diagram service and directive   
    * fragment-sankey/          --> Fragment sankey view and controller
    * process-lcia/             --> Process LCIA view and controller
    * scenarios/                --> scenarios view and controller
* karma.conf.js         --> config file for running unit tests with Karma
* e2e-tests/            --> end-to-end tests (not currently implemented)


## Testing

There are two kinds of tests in the angular-seed application: Unit tests and End to End tests.

### Running Unit Tests

The angular-seed app comes preconfigured with unit tests. These are written in
[Jasmine][jasmine], which we run with the [Karma Test Runner][karma]. We provide a Karma
configuration file to run them.

* the configuration is found at `karma.conf.js`
* the unit tests are found next to the code they are testing and are named as `..._test.js`.

The easiest way to run the unit tests is to use the supplied npm script:

```
npm test
```

This script will start the Karma test runner to execute the unit tests. Moreover, Karma will sit and
watch the source and test files for changes and then re-run the tests whenever any of them change.
This is the recommended strategy; if your unit tests are being run every time you save a file then
you receive instant feedback on any changes that break the expected code functionality.

You can also ask Karma to do a single run of the tests and then exit.  This is useful if you want to
check that a particular version of the code is operating as expected.  The project contains a
predefined script to do this:

```
npm run test-single-run
```


### End to end testing

The angular-seed app comes with end-to-end tests, again written in [Jasmine][jasmine]. These tests
are run with the [Protractor][protractor] End-to-End test runner.  It uses native events and has
special features for Angular applications.

* the configuration is found at `e2e-tests/protractor-conf.js`
* the end-to-end tests are found in `e2e-tests/scenarios.js`

Protractor simulates interaction with our web app and verifies that the application responds
correctly. Therefore, our web server needs to be serving up the application, so that Protractor
can interact with it.

```
npm start
```

In addition, since Protractor is built upon WebDriver we need to install this.  The angular-seed
project comes with a predefined script to do this:

```
npm run update-webdriver
```

This will download and install the latest version of the stand-alone WebDriver tool.

Once you have ensured that the development web server hosting our application is up and running
and WebDriver is updated, you can run the end-to-end tests using the supplied npm script:

```
npm run protractor
```

This script will execute the end-to-end tests against the application being hosted on the
development server.


## Updating Angular

Previously we recommended that you merge in changes to angular-seed into your own fork of the project.
Now that the angular framework library code and tools are acquired through package managers (npm and
bower) you can use these tools instead to update the dependencies.

You can update the tool dependencies by running:

```
npm update
```

This will find the latest versions that match the version ranges specified in the `package.json` file.

You can update the Angular dependencies by running:

```
bower update
```

This will find the latest versions that match the version ranges specified in the `bower.json` file.


## Loading Angular Asynchronously

The angular-seed project supports loading the framework and application scripts asynchronously.  The
special `index-async.html` is designed to support this style of loading.  For it to work you must
inject a piece of Angular JavaScript into the HTML page.  The project has a predefined script to help
do this.

```
npm run update-index-async
```

This will copy the contents of the `angular-loader.js` library file into the `index-async.html` page.
You can run this every time you update the version of Angular that you are using.


## Serving the Application Files

While angular is client-side-only technology and it's possible to create angular webapps that
don't require a backend server at all, we recommend serving the project files using a local
webserver during development to avoid issues with security restrictions (sandbox) in browsers. The
sandbox implementation varies between browsers, but quite often prevents things like cookies, xhr,
etc to function properly when an html page is opened via `file://` scheme instead of `http://`.


### Running the App during Development

The angular-seed project comes preconfigured with a local development webserver.  It is a node.js
tool called [http-server][http-server].  You can start this webserver with `npm start` but you may choose to
install the tool globally:

```
sudo npm install -g http-server
```

Then you can start your own development web server to serve static files from a folder by
running:

```
http-server -a localhost -p 8000
```

Alternatively, you can choose to configure your own webserver, such as apache or nginx. Just
configure your server to serve the files under the `app/` directory.


### How to Publish on Production Server

Install dependencies as described above.

Copy the `app/` folder to a web server host. In IIS, create a web app that points to the app folder.

Change `API_ROOT` setting to the base URI of the web API. Edit `app/components/resources/resource-service.js`. Update the value of the `API_ROOT` constant at the top of the file.

Configure the web app to enable loading of application JSON files. In IIS, add MIME type extension: `.json`,  MIME type: `application/json`.
