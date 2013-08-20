if(!/(&|\?)username=/.test(window.location.search)){
  var newSearch = window.location.search;
  if(newSearch !== '' & newSearch !== '?'){
    newSearch += '&';
  }
  newSearch += 'username=' + (prompt('What is your name?') || 'anonymous');
  window.location.search = newSearch;
}


$(document).ready(function(){

  var friendList = [];
  var rooms = {};

  var friendImgURL = 'http://www.clker.com/cliparts/7/d/9/B/f/R/smiley-face-md.png';

  // Don't worry about this code, it will ensure that your ajax calls are allowed by the browser
  $.ajaxPrefilter(function(settings, _, jqXHR) {
    jqXHR.setRequestHeader("X-Parse-Application-Id", "voLazbq9nXuZuos9hsmprUz7JwM2N0asnPnUcI7r");
    jqXHR.setRequestHeader("X-Parse-REST-API-Key", "QC2F43aSAghM97XidJw8Qiy1NXlpL5LR45rhAVAf");
  });

  //
  var cleanMessages = function(msgArray, roomName) {
    // console.log(msgArray);
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

  $.get('https://api.parse.com/1/classes/messages', 'order=-createdAt', function(data) {
    var msgArray = data.results;
    cleanMessages(msgArray);
  });

  $('#submitMsg').on('click', function(){
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
    $.ajax('https://api.parse.com/1/classes/messages', {
      type: 'POST',
      contentType: 'application/json',
      data: msgObj
    });

  });

  $('#refreshButton').on('click', function() {
    var currentRoom = $('.currentRoom').text();
    $.get('https://api.parse.com/1/classes/messages', 'order=-createdAt', function(data) {
      var msgArray = data.results;
      $('#messageArea').html('');
      $('#dropdownMenu').html('');
      cleanMessages(msgArray, currentRoom);
    });
  });

  $('body').on('click', '.username', function() {
    friendList.push($(this).text());
    var username = $(this).text();
    $('.username:contains('+ username + ')').closest('.message').toggleClass('friend');
    $('.username:contains('+ username + ')').nextAll('.friendImg').toggle();
   });

  $('body').on('click', '.roomItem', function(){
    // on click, don't refresh anything, just togggle to hide chats that aren't from the selected room
    var selectedRoom = $(this).text();
    $.get('https://api.parse.com/1/classes/messages', 'order=-createdAt', function(data) {
      var msgArray = data.results;
      $('#messageArea').html('');
      $('#dropdownMenu').html('');
      cleanMessages(msgArray, selectedRoom);
    });
  });

  $('#submitRoom').on('click', function() {
    var selectedRoom = $('#newRoom').val();
    $('#newRoom').val('');
    $('#messageArea').html('');
    $('#dropdownMenu').html('');
    rooms[selectedRoom] = selectedRoom;
    cleanMessages([], selectedRoom);
  });

});












































