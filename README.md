# JSON Schema Validator

## Schemas v3 vs v4

Note that current JSON contracts written with schema v3 specs in mind, when the validator used under the hood assuming schema v4 syntax. To avoid false validation the conversion v3 to v4 applied to all schemas. [Here](https://github.com/json-schema/json-schema/wiki/ChangeLog#required) you could find what exactly differences between them.

In addition to schema conversion there is unnecessary - `id` and invalid - `name` properties are stripped out in order to have cleaner schema views.

## How to Get it

### Long way

1. Get the source from this repo and put it somewhere on your machine.

2. Copy file from `./snippets/schema_validator.rc.js` to `./schema_validator.rc.js`. This is configuration file.

3. Open up for editing `./schema_validator.rc.js` and set up proper `schemaSrc`. This property represents path to the folder where JSON schema contracts are stored, e.g. `C:\\xxxxxxx\\json-contracts`, the path has to be absolute. Also for Windows you will need escape backslashes (\ to \\). The `ip`, `port` and `mailto` are optional.

4. Cd into `schema_validator` or whatever you call it source root directory using Git bash console, or any other console of your choice with bash support.

4. Make sure install dependencies running `npm install` and `bower install`, if you do not have bower installed make sure install it first with `npm install -g bower`. Assuming you already have up and running nodeJs, otherwise you will need install it first.

5.  Execute `script/start.sh` and observe any console messages. If everything set up properly you should see "Server started" message. To stop server at anytime hit `ctrl+c` into this console. In case you'll run start script twice without stopping the server you'll get error message from the script about ip/port being in use although it should not affect already running server.

6. In case you've got lucky and have "Server started" message, check if you could open following script into your browser `http://<ip>:<port>/jsonSchemaValidator.js`, <ip> and <port> taken from `./schema_validator.rc.js` respectively. If you can see javascript on the page you have to be good. Otherwise start over.

7. Now use any of your favorite ways to make sure inject this script into the page which you want to test. I was using Fiddrer2 custom script for this, see snippet example into `./snippets/customRules_fiddler_snippet.js`, now I'm using `dotjs` extension for Chrome. But old good script include into `jsp` will also work same way, do not forget remove it before commit though.

### Short way

1. I'm running server on my PS on regular basis, if you want, you may use it, but beware it could be unstable.

2. The client listener script to be injected usually could be found here: `http://xxxxxxx:1338/jsonSchemaValidator.js`. Include it the same way as it is described into the long way instruction's last clause number 7.).

3. Simple web interface page: `http://xxxxxxx:1338/`.


## How it Works and How to Use it

1. After you did client script injection it will be listening for any XHR calls made and will hijack the once any made to uri containing `ajaxController.ajax` string and will try get request/response JSON data from them.

2. In addition this script will try get page load JSON from the `<script>` tag. Because there is no straight mapping between JSON contract file names and pageload data it is highly unstable and has to be figured out somehow, see `./script/pageLoadMapping.yaml` to get one possible idea.

3. Any valid JSON which is retrieved from steps 1.) or/and 2.) is being sent separately to the nodeJs server with the schema name into the uri path, as a transport cross domain XHR used for now.

4. After request being proceed three outcomes could be send into response.

		a. Schema is not found.
		b. Schema is found and JSON is valid against it.
		c. Schema is found and JSON is not valid against it.

 In the latter outcome in addition to validation boolean flag array of errors passed into response.

5. Client script log the outcome details into console with `JsonSchemaValidator:` prefix sting, so you may use it to filter results.
![json schema validation screenshot](/dmitriilapshukov/json-schema-validator/raw/master/client_src/img/schemaValidatorConsole.png)

6. In addition to on-fly client validation there is simple webform which may be used for manual validation. To see it just open `http://<ip>:<port>/` address into browser.

## Development

1. `npm install -g gulp`

2. While working on the `client_src` you may use `gulp watch`

3. For server changes as of now manual restart required.

4. Check yourself with plato (`npm install -g plato`) by running report `scripts/report.sh` report generated into `report` folder accordingly.


### @TODOs

- [ ] Tests (nodeunit)
- [x] Config (rc) file at least for domain:port and original json schemas/examples locations for schemasGrabber.js.
- [ ] Pageload schemas mapping with xhr requests.
- [ ] Watch for and find out reason for `FATAL ERROR: JS Allocation failed - process out of memory` (I've got it once yet - hint: use streams).