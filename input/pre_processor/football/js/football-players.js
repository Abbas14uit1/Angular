$(document).ready(function() {
  var playersToVerify = [];
  var playerJsonData = serverCallJSON('/api/unverified', 'GET', "");
  if (playerJsonData.length > 0) {
      $("#noDataVerification").hide();
      $("#verify_data").show();
      $('#edit').on('show.bs.modal', function(e) {
          var playerName = $(e.relatedTarget).data('player-name');
          $(e.currentTarget).find('input[name="playerName"]').val(playerName);
          var playerData = $(e.relatedTarget).data('player-data');
          $(e.currentTarget).find('input[name="playerName"]').data('player-data', playerData);
      });
      // $("#verifyFootballPlayers").on('click', function(e) {
      //     var data=serverCallJSON('/api/verify','POST',JSON.stringify(playersToVerify));
      // });

      $("#verifyFootballPlayers").on('click', function(e) {
        var verifyData=playersToVerify.map(function(elem){
                      if(!Array.isArray(elem.playerName)){
                        var a = [];
                        a.push(elem.playerName);
                        elem.playerName = a;
                      }
                      return elem;
             });
       var data=serverCallJSON('/api/verify','POST',JSON.stringify(verifyData));
   });

$("#SaveNewFootballPlayers").on('click', function(e) {
  var manualVerifyData=playerJsonData.map(function(elem){
        elem.statusCateogy = 'Manually Verified';
        elem.status = 'Verified';
        return elem;
   });
          var data=serverCallJSON('/api/verify','POST',JSON.stringify(manualVerifyData));
          location.reload(true);
      });

      $("#updateFootballPlayers").on('click', function(e) {
          var playerName = $(this).parent().parent().find('input[name="playerName"]').val();
          var playerData = $(this).parent().parent().find('input[name="playerName"]').data("player-data");
          playerData["playerName"] = playerName;
          playersToVerify.push(playerData);
          $('#dataTables-example').find("span[data-player-code='" + playerData["playerId"] + "']").text(playerName);
          $('#edit').modal('hide');
      });

      $('#dataTables-example').DataTable({
              "rowCallback": function(row, data) {
                  $('td:eq(1)', row).html('<span data-player-code=' + data["playerId"] + '>' + data["playerName"] + '</span>');;
              },
              "columns": [{
                      "data": "code"
                  },
                  {
                      "data": "playerName[,]"
                  },
                  {
                      "data": "teamCode"
                  },
                  {
                      "data": "season"
                  },
                  {
                      "data": "status"
                  },
                  {
                      "data": "played"
                  },
                  {
                      "data": "playerClass"
                  },
                  {
                      "data": null,
                      'searchable': false,
                      'orderable': false,
                      'className': 'dt-body-center',
                      'render': function(data, type, full, meta) {
                        //data.playerClass = "SO";
                          return '<p data-placement="top" data-toggle="tooltip" title="Edit"><button class="btn btn-primary btn-xs" data-title="Edit" data-toggle="modal" data-target="#edit" data-player-id=' + data.playerId + '  data-player-name =' + data.playerName + ' data-player-class =' + data.playerClass + ' data-player-data=' + JSON.stringify(data) + ' ><span class="glyphicon glyphicon-pencil"></span></button></p>';
                      }
                  },
                ],

                "data": playerJsonData,

              });
            }
          else {
              $("#verify_data").hide();
              $("#noDataVerification").show();
          }
});



var serverCallJSON = function(astrUrl, method, playersToVerify) {
      var jsonData = [];
      $.ajax({
          type: method,
          url: astrUrl,
          async: false,
          data: method == "POST" ? playersToVerify : "",
          success: function(data) {
              jsonData = data;
          },
          error: function(error, status, unlock) {
              alert("Error in sending and receiving data to/from Server: " + status + "\n" + error);
          },
          contentType: "application/json",
          dataType: 'json'
      });
      return jsonData;
}
