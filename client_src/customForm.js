/*jshint jquery:true, browser:true*/
/*globals Fuse, JSONTree*/
$(function(){
	var
        path = location.pathname,
        schemaNode = $('#schema'),
        jsonNode = $('#json'),
        jsonArea = $('textarea', jsonNode),
        resultNode = $('#result'),
        resultArea = $('textarea', resultNode),
        mailNode = $('#mailResults a'),
        mailTmpl = mailNode[0].href,
        fuzSearch = $('#fuzSearch'),
        schemasMenuNode = $('#schemasMenu'),
        schemaTmpl = schemasMenuNode.html(),
        menuData,
        fuzMenuData,
        menuHtml = '',
        schemasCount;

    function parseData(str) {
        var
            out;

        try {

            out = JSON.parse(str);
        } catch(e) {
            console.error('Invalid JSON');
        }

        return out;
    }

    function htmlEncode(str) {
        var
            out;

        out = encodeURIComponent(str);
        return out;
    }

    function showResult(msg) {

        resultArea.val(msg);
        resultNode.show();
    }

    function hideResult() {
        resultArea.val('');
        resultNode.hide();
    }

    mailNode.click(function(e) {
        var
            subject = htmlEncode('Data/schema mismatch found for ' + path.replace('/', '')),
            body = htmlEncode(
                'Hi Team.' +
                    '\n\nValidation errors:\n' + resultArea.val() +
                    // '\nJSON data:\n' + jsonArea.val() +
                    '\nJSON data:\n>>>PASTE JSON HERE<<<' +
                '\n\n\nBest.'),
            bodyShort = htmlEncode(
                'Hi Team.' +
                    '\n\nValidation errors:\n>>>PASTE ERRORS HERE<<<' +
                    // '\nJSON data:\n' + jsonArea.val() +
                    '\nJSON data:\n>>>PASTE JSON HERE<<<' +
                '\n\n\nBest.'),
            mailStr;

        e.preventDefault();

        mailStr = mailTmpl.replace('{{subject}}', subject);
        mailStr = mailStr.replace('{{body}}', body);

        if ( mailStr.length > 780 ) {
            mailStr = mailTmpl.replace('{{subject}}', subject);
            mailStr += mailStr.replace('{{body}}', bodyShort);
        }

        console.log('JsonSchemaValidator: mailStr.length = ' + mailStr.length);
        location.href = mailStr;
    });

    menuData = parseData($('#flist').html());
    fuzMenuData = new Fuse(menuData, {
        threshold: 0.2
    });
    schemasCount = menuData? menuData.length: 0;

    $(menuData).each(function(ix, it){
        menuHtml += schemaTmpl.replace(/{{schemaName}}/gm, it);
    });

    schemasMenuNode.html(menuHtml);

    fuzSearch
    .focus(
        function() {
            schemasMenuNode.show();
        })
    .blur(
        function() {
            setTimeout(
                function() {
                    schemasMenuNode.hide();
                },
                300
            );
        });

    fuzSearch[0].placeholder = 'Search ' + schemasCount + ' schemas...';
    fuzSearch.keyup(function(){
        var
            result = fuzMenuData.search(this.value),
            _menuHtml = '';

        if ( this.value ) {

            $(result).each(function(ix, it){
                _menuHtml += schemaTmpl.replace(/{{schemaName}}/gm, menuData[it]);
            });
        } else {

            _menuHtml = menuHtml;
        }
        schemasMenuNode.empty().html(_menuHtml);
    });


    if ( path.replace('/', '') ) {

        schemaNode.show();
        jsonNode.show();
    }

    $('.wrapper').change(function() {
        var
            isValid,
            str = jsonArea.val(),
            json = (str && parseData(str)),
            _json,
            send,
            result;

        isValid = typeof json !== 'undefined';

        if ( isValid && str ) {
            _json = JSON.stringify(json, null, '\t');
            jsonArea.removeClass().val(_json);
            send = JSON.stringify({
                json: json,
                options: {
                    banUnknownProperties: $('#banUnknownProperties')[0].checked
                }
            });
            hideResult();

            $.post(path, send).done(
                function( data ) {
                    var
                        isValid = data.isValid;

                    if ( isValid ) {

                        jsonArea.addClass('valid');
                    } else {

                        jsonArea.addClass('invalid');
                        result = '';
                        $(data.details).each(function(ix, it) {
                            var
                                path = it.dataPath;

                            path = path? path + ': ':'';
                            result += path + it.message + '\n';
                        });
                        showResult(result);
					}

			});
		} else if ( !isValid && str ) {

			jsonArea.addClass('invalid');
			showResult('Invalid JSON');
		} else if ( !str ) {

			jsonArea.removeClass();
			hideResult();
		}
	});
});

$(function() {
    var
        // jsonTree = new JSONTree(),
        schemaNode = $('#schema'),
        schemaArea = $('textarea', schemaNode),
        treeView = $('#treeView', schemaNode),
        switcher = $('#treeViewSwitch'),
        json = JSON.parse(schemaArea.val());

    treeView.html(JSONTree.create(json)).show();

    switcher.change(function() {

        if ( this.checked ) {

            schemaArea.hide();
            treeView.show();
        } else {

            schemaArea.show();
            treeView.hide();
        }
    });

    switcher.prop('checked', true);
    schemaArea.hide();
});