const Player = require('./Player');

module.exports = class Queue {

    queue = [];
    params = [];
    player = new Player();

    getQueue(){
        return this.queue;
    }

    getQueueFirstElement(){
        return this.queue[0];
    }

    newQueue(queue){
        this.queue = queue;
    }

    appendQueue(item){
        this.queue.push(item);
    }

    appendQueueWithArray(items){
        items.forEach(element => {
            this.queue.push(element); 
        });
    }

    clearQueue(){
        this.queue = [];
    }

    shiftQueue(){
        this.queue.shift();
    }

    getParameters(){
        return this.params;
    }

    newParameter(params){
        this.params = params;
    }
    
    appendParameter(param){
        this.params.push(param);
    }
}
