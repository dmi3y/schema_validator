YUI().use(
        'get',
        'node',
        'json',
function (Y) {
    "use strict";
    var
        stack = {},
        baseUrl = '{{<<baseUrl>>}}'; // baseUrl being inserted on fly, when server starts

    function validateJson(json, stage, id) {
        var
            it = stack[id],
            xhr = new window.XMLHttpRequest(),
            url = baseUrl + it.name + stage,
            direction,
            fullname = stack[id].name + ':' + stage + ':' + id;

        switch ( stage ) {
            case 'Request':
                direction = '>>>';
                break;
            case 'Response':
                direction = '<<<';
                break;
            case 'Pageload':
                direction = '|||';
                break;
        }

        xhr.open('POST', url, true);
        xhr.onreadystatechange = function() {
            var
                isValid,
                resp;


            if ( xhr.readyState === 4 ) {

                resp = parseData(xhr.responseText);
                if ( resp ) {

                    isValid = resp.isValid;

                        if ( isValid === true ) {
                            it.valid = true;
                            console.log('%cJsonSchemaValidator:' + fullname + direction + 'OK', 'color: green');
                        } else if ( isValid === false ) {
                            it.valid = false;
                            console.groupCollapsed('%cJsonSchemaValidator:' + fullname + direction + 'BAD:' + resp.details.length, 'color: red');
                            Y.each(resp.details, function(it) {
                                var
                                    path = it.dataPath? it.dataPath + ': ':'';

                                console.log('%c' + path + it.message, 'color: red');
                            });
                            console.groupEnd();
                        } else {

                            console.log('%cJsonSchemaValidator: `' + fullname + '` ' + resp.err, 'color: orange');
                        }
                } else {

                    console.log('%cJsonSchemaValidator: could not get response JSON for `' + fullname + '`', 'color: orange');
                }
            }
        };
        xhr.send(Y.JSON.stringify({
            json: json,
            options: {}
        }));

    }

    function parseData(str) {
        var
            out;

        try {

            out = Y.JSON.parse(str);
        } catch(e) {

            out = '';
        }

        return out;
    }

    function validateData(data, stage, id) {
        var
            json,
            fullname;

        json = parseData(data);

        if ( !stack[id] ) {

            stack[id] = {};
        }

        fullname = (stack[id].name || '') + ':' + stage + ':' + id;

        if ( !json ) {

            console.log('%cJsonSchemaValidator: ' + fullname + ' JSON could not be parsed.', 'color: red');
        }

        if ( stage === 'Request' ) {

            if ( json.reqNm ) {

                stack[id].name = json.reqNm.replace('Request', '');
            } else {

                console.log('%cJsonSchemaValidator: ' + fullname + ' has no `reqNm` property in it`.', 'color: red');
                json = '';
            }
        } else if ( stage === 'Pageload') {

            stack[id].name = window.location.pathname.split('/').pop().replace('.do', '');
        }

        return json;
    }

    function proceedOnStack(data, stage, id) {
        var
            json;

        json = validateData(data, stage, id);
        if ( json ) {

            validateJson(json, stage, id);
        }
    }

    function testUri(uri) {

        return uri.indexOf('ajaxController.ajax') !== -1;
    }

    (function XHRSpy(proceed, test) {
        var
            Xhr = window.XMLHttpRequest,
            req = 0;

        function htmlDecode(str) {
            var
                out;

            out = decodeURIComponent(str.replace(/\+/g,  " "));
            return out;
        }

        window.XMLHttpRequest = function() {
            var
                xhr = new Xhr(),
                send = xhr.send,
                open = xhr.open,
                id,
                uri;

            req++;
            id = 'xhr#' + req;

            xhr.open = function() {

                uri = arguments[1];
                open.apply(xhr, arguments);
            };

            xhr.send = function() {

                    if ( test(uri) ) {

                        proceed(htmlDecode(arguments[0]), 'Request', id);
                    }
                    send.apply(xhr, arguments);
                };

            xhr.onload = function() {
                if ( test(uri) ) {

                    proceed(xhr.responseText, 'Response', id);
                }
            };

            return xhr;
        };
    }(proceedOnStack, testUri));

    (function pageLoadJsonGrabber(proceed) {
        var
            pageloadDom = Y.one('[id*=PageLoad],[id*=Pageload],[id*=PgLd]'),
            id;

        if ( pageloadDom ) {

            id = '#' + pageloadDom.get('id');
            proceed(pageloadDom.getHTML(), 'Pageload', id);
        }

    }(proceedOnStack));
});
