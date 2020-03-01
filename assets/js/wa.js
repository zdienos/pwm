generateQr = (code) => {
  $('#qr').qrcode({
    // render method: 'canvas', 'image' or 'div'
    render: 'canvas',

    // version range somewhere in 1 .. 40
    minVersion: 1,
    maxVersion: 40,

    // error correction level: 'L', 'M', 'Q' or 'H'
    ecLevel: 'H',

    // offset in pixel if drawn onto existing canvas
    left: 0,
    top: 0,

    // size in pixel
    size: 300,

    // code color or image element
    fill: '#000',

    // background color or image element, null for transparent background
    background: null,

    // content
    text: code.trim(),

    // corner radius relative to module width: 0.0 .. 0.5
    radius: 0.5,

    // quiet zone in modules
    quiet: 3,

    // modes
    // 0: normal
    // 1: label strip
    // 2: label box
    // 3: image strip
    // 4: image box
    mode: 2,

    mSize: 0.1,
    mPosX: 0.5,
    mPosY: 0.5,

    label: 'kurob.web.id',
    fontname: 'sans',
    fontcolor: '#feb72b',

    image: null
  });
}

$('#get_qr').click(function () {

  $(".fa-spinner").removeClass("d-none")
  io.socket.get('/get_qr', function gotResponse(data, jwRes) {
    console.log(data);
  });

});

io.socket.on('qr', function (data) {
  $('#qr').html('');
  console.log(data);
  
  if (data.qr) {
    generateQr(data.qr);
  }else{
    $('#qr').html(data.msg);
  }
  
  $(".fa-spinner").addClass("d-none");
})