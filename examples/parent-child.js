var ProLog = require('../lib/prolog').ProLog;
var $ = require('chalk');

function makeFormat(level, messageColor) {
  return level + ' ' + $.gray('${padding}') + $[messageColor]('${message}');
}

// Instantiate logger with custom levels.
var parentLog = new ProLog({
  levels: {
    header:     {priority: 0, format: makeFormat('>>>', 'underline')},
    log:        {priority: 1, format: makeFormat('log', 'reset')},
    parentonly: {priority: 2, format: makeFormat($.green('par'), 'green')},
    error:      {priority: 3, format: makeFormat($.red('err'), 'red')},
  },
});

// This child logger will send all logging messages to its parent. Note that
// the "output" option is set to false by default for child loggers.
var childLog = new ProLog(parentLog, {
  levels: {
    // Don't inherit the parent-only level.
    parentonly: null,
    // Create a child-only level.
    childonly: {priority: 2, format: makeFormat($.cyan('chi'), 'cyan')},
  },
});

parentLog.group('Logging levels that don\'t exist on a logger can\'t be called.');
parentLog.log('This log message comes from the parent.');
parentLog.parentonly('This "parentonly" message comes from the parent.');
try {
  parentLog.childonly('This will throw an exception.');
} catch (err) {
  parentLog.error('Exception: %s', err.message);
}
parentLog.groupEnd();

childLog.group('But will be passed-through.');
childLog.log('This log message comes from the child.');
childLog.childonly('This "childonly" message comes from the child.');
try {
  childLog.parentonly('This will throw an exception.');
} catch (err) {
  childLog.error('Exception: %s', err.message);
}
childLog.groupEnd();

// Just a little something to visually differentiate childLog messages.
childLog.filter = function(data) {
  data.message = childLog.eachLine(data.message, $.yellow);
};

parentLog.header('Also, indentation is cumulative!');
parentLog.log('This parent log message should not be indented.');
childLog.log('This child log message should not be indented.');
parentLog.group('[1] Increase parentLog indent');
parentLog.log('This parent log message should be indented once.');
childLog.log('This child log message should be indented once.');
childLog.group('[2] Increase childLog indent');
parentLog.log('This parent log message should still be indented once.');
childLog.log('This child log message should be indented twice.');
childLog.log([['This array will be indented twice'], ['and logged over'], ['multiple lines.']]);
childLog.log('Testing twice-indented child log message %s: %d, %j.', 'A', 1, {a: 1});
childLog.groupEnd();
childLog.header('[2] Decrease childLog indent');
parentLog.log('This parent log message should still be indented once.');
childLog.log('This child log message should be indented once.');
parentLog.groupEnd();
parentLog.header('[1] Decrease parentLog indent');
parentLog.log('This parent log message should not be indented.');
childLog.log('This child log message should not be indented.');
childLog.group('[3] Increase childLog indent');
parentLog.log('This parent log message should not be indented.');
childLog.log('This child log message should be indented once.');
childLog.groupEnd();
childLog.header('[3] Decrease childLog indent');