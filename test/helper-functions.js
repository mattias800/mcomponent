function log(obj) {
    jstestdriver.console.log(JSON.stringify(obj));
}

function logstr(s) {
    jstestdriver.console.log(s);
}

function logs(s, obj) {
    jstestdriver.console.log(s, JSON.stringify(obj));
}

function logsource(c) {
    logs("model=", c.getModel());
    logstr(c._.getSource());
}
