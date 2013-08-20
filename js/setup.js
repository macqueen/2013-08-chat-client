if(!/(&|\?)username=/.test(window.location.search)){
  var newSearch = window.location.search;
  if(newSearch !== '' & newSearch !== '?'){
    newSearch += '&';
  }
  newSearch += 'username=' + (prompt('What is your name?') || 'anonymous');
  window.location.search = newSearch;
}

// Don't worry about this code, it will ensure that your ajax calls are allowed by the browser
$.ajaxPrefilter(function(settings, _, jqXHR) {
  jqXHR.setRequestHeader("X-Parse-Application-Id", "voLazbq9nXuZuos9hsmprUz7JwM2N0asnPnUcI7r");
  jqXHR.setRequestHeader("X-Parse-REST-API-Key", "QC2F43aSAghM97XidJw8Qiy1NXlpL5LR45rhAVAf");
});

var friendList = [];
var rooms = {};
var friendImgURL = 'http://www.clker.com/cliparts/7/d/9/B/f/R/smiley-face-md.png';

var findRooms = function(msgArray, roomname) {
  for (var i = 0; i < msgArray.length; i++) {
    if (msgArray[i].roomname) rooms[msgArray[i].roomname] = msgArray[i].roomname;
  }
  for (var room in rooms) {
    if (room === roomname) {
      $('<li></li>').attr('class', 'roomItem currentRoom').text(rooms[room]).appendTo($('#dropdownMenu'));
    } else{
      $('<li></li>').attr('class', 'roomItem').text(rooms[room]).appendTo($('#dropdownMenu'));
    }
  }
};

var cleanMessages = function(msgArray, roomName) {
  findRooms(msgArray, roomName);
  for (var i = 0; i < msgArray.length; i++) {
    var msgString = msgArray[i].text;
    var msgCreated = msgArray[i].createdAt.slice(0,10);
    var username = msgArray[i].username || 'anonymous';
    var messageRoom = msgArray[i].roomname || undefined;
    var mainMsgDiv;

    if(friendList.indexOf(username) !== -1) {
      mainMsgDiv = $('<div></div>').attr('class', 'message friend');
    }else {
      mainMsgDiv = $('<div></div>').attr('class', 'message');
    }
    $('<div></div>').attr('class', 'username').text(username).appendTo(mainMsgDiv);
    $('<div></div>').attr('class', 'msgCreated').text(msgCreated).appendTo(mainMsgDiv);
    $('<div></div>').attr('class', 'messageText').text(msgString).appendTo(mainMsgDiv);
    $('<div class="friendImg"><img src="' + friendImgURL + '"/></div>').appendTo(mainMsgDiv);

    if (roomName){
      if (messageRoom === roomName){
        mainMsgDiv.appendTo('#messageArea');
      }
    } else {
      mainMsgDiv.appendTo('#messageArea');
    }
  }
};

var Update = function() {};

Update.prototype.getNewMsgs = function(roomname){
  $.get('https://api.parse.com/1/classes/messages', 'order=-createdAt', function(data) {
      var msgArray = data.results;
      $('#messageArea').html('');
      $('#dropdownMenu').html('');
      cleanMessages(msgArray, roomname);
  });
};

Update.prototype.postNewMsgs =  function(msgObj) {
  $.ajax('https://api.parse.com/1/classes/messages', {
    type: 'POST',
    contentType: 'application/json',
    data: msgObj
  });
};

var ChatView = function(options){
  this.update = options.update;
  var submitChat = $.proxy(this.submitChat, this);
  var refreshChat = $.proxy(this.refreshChat, this);
  var friend = $.proxy(this.friend, this);
  var selectRoom = $.proxy(this.selectRoom, this);
  var createRoom = $.proxy(this.createRoom, this);
  $('#submitMsg').on('click', submitChat);
  $('#refreshButton').on('click', refreshChat);
  $('body').on('click', '.username', friend);
  $('body').on('click', '.roomItem', selectRoom);
  $('#submitRoom').on('click', createRoom);
};

ChatView.prototype.submitChat = function(){
    var userMsg = $('.textBox').val();
    var username = window.location.search;
    username = username.slice(username.indexOf('=')+1);
    var currentRoom = $('.currentRoom').text();
    var msgObj = JSON.stringify({
      username: username,
      text: userMsg,
      roomname: currentRoom
    });
    $('.textBox').val('');
    this.update.postNewMsgs(msgObj);
};


ChatView.prototype.refreshChat = function(){
    var currentRoom = $('.currentRoom').text();
    this.update.getNewMsgs(currentRoom);
};

ChatView.prototype.friend = function(e){
    friendList.push($(e.currentTarget).text());
    var username = $(e.currentTarget).text();
    $('.username:contains('+ username + ')').closest('.message').toggleClass('friend');
    $('.username:contains('+ username + ')').nextAll('.friendImg').toggle();
};

ChatView.prototype.selectRoom = function(e){
    var selectedRoom = $(e.currentTarget).text();
    this.update.getNewMsgs(selectedRoom);
};

ChatView.prototype.createRoom = function(){
    var selectedRoom = $('#newRoom').val();
    $('#newRoom').val('');
    $('#messageArea').html('');
    $('#dropdownMenu').html('');
    rooms[selectedRoom] = selectedRoom;
    cleanMessages([], selectedRoom);
};

$(document).ready(function(){
  var update = new Update();
  var chatView = new ChatView({update: update});

  update.getNewMsgs();

});












































