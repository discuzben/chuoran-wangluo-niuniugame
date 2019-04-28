window.configData = {
    isDebug: true,
    apiServerUrl: 'http://api.qisq.top',
    socketServer: {url: 'http://localhost:3003'}
}
window.CD = window.ConstantData = {
    gameTypes: {
        '1': {name: '炸金花', gameId: 30, gameSceneName: 'game_zhajinhua', roomListScene: 'roomlist_zhajinhua'},
        '2': {name: '百人牛牛', gameId: 50, gameSceneName: 'game_bairenniuniu', roomListScene: ''},
        '3': {name: '德州扑克', gameId: 70, gameSceneName: 'game_xxxx', roomListScene: ''}
    }
};
window.GD = {current: {}};

GD.gameRoomType = 3; 

GD.current.hallItem = {
    "hallId": 6,
    "hallName": "初级场",
    "hallImg": null,
    "gameId": 70,
    "less": 500,
    "bottom": 0.1,
    "banker": 30000,
    "round": 1,
    "timeout": 15,
    "tax": 0.01
  };
 var texasHoldem=new TexasHoldem();
 texasHoldem.socket=ZR_IO;
 window.texasHoldem=texasHoldem;
  GD.texasHoldem=texasHoldem;