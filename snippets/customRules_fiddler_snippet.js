// Put this snipped into onBeforeResponse callback function

if (
    oSession.oResponse.headers.ExistsAndContains("Content-Type", "html") &&
    (
        oSession.HostnameIs("<your domain>") ||
        oSession.HostnameIs("xxxxxxxx.something.com")
    )
) {

    // Remove any compression or chunking
    oSession.utilDecodeResponse();

    var oBody = System.Text.Encoding.UTF8.GetString(oSession.responseBodyBytes);

    // Match the flow script tag
    var oRegEx = /(<script[^>]*flow.*\.js"><\/script>)/gi;
    // replace the script tag with itself (no change) + prepend custom script tag
    oBody = oBody.replace(oRegEx, "<script src=\"http://<domain for schema validator>:<port for schema validator>/jsonSchemaValidator.js\"></script>$1");

    // Set the response body to the changed body string
    oSession.utilSetResponseBody(oBody);
}