module.exports = class Player {
    currentState = 'idle';
    player = null;
    getCurrentState(){
        return this.currentState;
    }
    setIdleState(){
        this.currentState = 'idle';
        console.log('|||||||||||||||||||||| IDLE  STATE! ||||||||||||||||||||||');
        return true;
    }
    setPlayingState(){
        this.currentState = 'playing';
        console.log('||||||||||||||||||||||PLAYING STATE!||||||||||||||||||||||');
        return true;
    }
    setPlayer(player){
        this.player = player;
        return true;
    }
    getPlayer(){
        return this.player;
    }
    deletePlayer(){
        this.player = null;
        return true;
    }
}
