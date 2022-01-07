var events = require('events');

module.exports = class Server {

    commandInputMethod = 'slashCommand';

    listener = new events.EventEmitter();

    prefix = '!';

    getPrefix () {
        return this.prefix;
    }

    setPrefix (prefix) {
        this.prefix = prefix;
        return true;
    }

    getCommandInputMethod () {
        return this.commandInputMethod;
    }

    setCommandInputMethod (method) {
        this.commandInputMethod = method;
        return true;
    }

    changeCommandInputMethod () {
        if (this.getCommandInputMethod() == 'slashCommand') {
            this.setCommandInputMethod('messageCommand');
        } else if (this.getCommandInputMethod() == 'messageCommand') {
            this.setCommandInputMethod('slashCommand');
        }
        return true;
    }
}