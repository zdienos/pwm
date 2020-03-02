$('#get_contacts').click(function () {

  $(".fa-spinner").removeClass("d-none")
  io.socket.get('/get_contacts', function gotResponse(data, jwRes) {
    console.log(data);
  });

});

io.socket.on('contacts', function (data) {
  console.log(data);
  
  if (data.contacts == 'ok') {
    location.reload(true);
  }
  $(".fa-spinner").addClass("d-none");
})