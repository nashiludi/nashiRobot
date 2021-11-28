module.exports = class Args {
    static getArgsForQueue(string){
        if (!string) { 
            return ['d'];
        } else {
            if (string.startsWith('--')) {
                var args = string.split(' ');
                args.forEach((element, i) => {
                    if (element.match(/^--|^-/g)) {
                        args[i] = element.replace(/^--|^-/g, '');
                    }
                });
                args.forEach((element, i) => {
                    if (element.match(/^display$/g)) {
                        args[i] = 'd';
                    }
                    // if (element.match(/^clear$/g)) {
                    //     args[i] = 'c';
                    // }
                });
            } else if (string.startsWith('-')) {
                var args = string.split('');
                args.shift();
            } else {
                return ['d'];
            }
        }
        return args;
    }
}
