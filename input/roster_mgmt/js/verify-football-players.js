$(document).ready(function() {

    var playersToVerify = [];
    var playerJsonData=serverCallJSON('/api/missing',"GET","");

	if(playerJsonData.length > 0){
		$("#noDataVerification").hide();
		$("#verify_data").show();

    $('select[name="playerClass"]').on('change', function() {
        if (this.value == "NA")
            $(this).parent().parent().find('[class="invalid-feedback"]').show();
        else
            $(this).parent().parent().find('[class="invalid-feedback"]').hide();
    });

    $('#edit').on('show.bs.modal', function(e) {
      $(e.currentTarget).find('[class="invalid-feedback"]').hide();
      //var playerData = $(e.relatedTarget).data('player-data');
      var playerName = $(e.relatedTarget).data('player-name');
      $(e.currentTarget).find('input[name="playerName"]').val(playerName);
      //$(e.currentTarget).find('input[name="playerName"]').data('player-data', playerData);
      var playerClass = $(e.relatedTarget).data('player-class');
      $(e.currentTarget).find('[name="playerClass"]').val(playerClass);
      var playerId = $(e.relatedTarget).data('player-id');
      $(e.currentTarget).find('input[name="playerName"]').data('player-id', playerId);
  });

    $("#verifyPlayers").on('click', function(e) {
    var result=serverCallJSON('/api/verify','POST',JSON.stringify(playersToVerify));
    var data = serverCallJSON('/api/missing',"GET","");
		if(data.length === 0){
			location.href = "football-players.html";
    }
    else {
      location.reload(true);
    }
    });

    $("#updatePlayers").on('click', function(e) {

        var playerClass = $(this).parent().parent().find('[name="playerClass"]').val();

        if (playerClass == "NA") {
            $(this).parent().parent().find('[name="playerClass"]').addClass("errorClass");
            $(this).parent().parent().find('[class="invalid-feedback"]').show();
        } else {
            $(this).parent().parent().find('[name="playerClass"]').val();

            //var playerData = $(this).parent().parent().find('[name="playerName"]').data("player-data");
            var playerId=$(this).parent().parent().find('input[name="playerName"]').data("player-id");
            var playerData = playerJsonData.find(x => x.playerId  == playerId);
            playerData["playerClass"] = playerClass;
            playerData["playerName"] = playerData["playerName"];
            playersToVerify.push(playerData);
            $('#dataTables-example').find("span[data-player-id='" + playerData["playerId"] + "']").text(playerClass);
            $('#edit').modal('hide');
        }
    });


    $('#dataTables-example').DataTable({
        "rowCallback": function(row, data) {

            if (data["playerClass"] === "FR" || data["playerClass"] === "SR" || data["playerClass"] === "JR" || data["playerClass"] === "SO") {
                $(row).addClass('playerClass');
            }
        },
        "columns": [
            {
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
                "data": null,
                'searchable': true,
                'orderable': false,
                'className': 'dt-body-center',
                'render': function(data, type, full, meta) {

                    if (data.playerClass == "FR") return '<span class="label label-default" data-player-id=' + data.playerId + '>NA</span>';
                    if (data.playerClass == "SO") return '<span class="label label-primary" data-player-id=' + data.playerId + '>SO</span>';
                    if (data.playerClass == "SR") return '<span class="label label-success" data-player-id=' + data.playerId + '>SR</span>';
                    if (data.playerClass == "JR") return '<span class="label label-info" data-player-id=' + data.playerId + '>JR</span>';
                    return '<span class="label label-info" data-player-id=' + data.playerId + '>' + "NA" + '</span>';
                }
            },
            {
                "data": null,
                'searchable': false,
                'orderable': false,
                'className': 'dt-body-center',
                'render': function(data, type, full, meta) {
                  data.playerClass ="NA";
                  return '<p data-placement="top" data-toggle="tooltip" title="Edit"><button class="btn btn-primary btn-xs" data-title="Edit" data-toggle="modal" data-target="#edit" data-player-id=' 
                          + data.playerId + '  data-player-name ="' + data.playerName + '" data-player-class =' + data.playerClass + '><span class="glyphicon glyphicon-pencil"></span></button></p>';
                }
            },
        ],
        //"ajax": '/api/missing'  // ajax call is enabled remove data
        "data": playerJsonData
    });

	}
	else{
		$("#verify_data").hide();
		$("#noDataVerification").show();
	}
});

var serverCallJSON = function (astrUrl, method, playersToVerify) {
   var jsonData=[];
     $.ajax({
	   type: method,
     url: astrUrl,
     async: false,
	   data: method == "POST" ? playersToVerify : "",
	   success: function(data) {
		 jsonData= data;
	   },
	   error : function (error, status, unlock) {
              alert("Error in sending and receiving data to/from Server: " + status + "\n" + error);
       },
	   contentType: "application/json",
	   dataType: 'json'
	  });
	  return jsonData;
}

