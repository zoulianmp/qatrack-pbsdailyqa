// Set some defaults and convenience functions
var dateformat = "yyyy-mm-dd";

function convertDate(date) {
    "use strict";
    return $.fn.datepicker.DPGlobal.formatDate(date, dateformat, "en");
}

function parseDate(date) {
    "use strict";
    return $.fn.datepicker.DPGlobal.parseDate(date, dateformat, "en");
}

/****************************************************/
function reviewTestList() {
    "use strict";
    var url = "/qa/session/review/" + $("#testlistinstances").val();
    window.open(url);
}

/****************************************************/
function loadPlot() {
    "use strict";
    var plotOptions = {
        "id": $("#testlistinstances").val(),
        "plot_type": $("#plot-type").val(),
        "annotations": $("#annotations").val()
    };
    if ($("#plot-profile-options").is(":visible")) {
        plotOptions.axis = $("#profile-axis").val();
    }
    $("#plotimg").attr("src", "plot.png?" + $.param(plotOptions));
}

/****************************************************/
function loadDates() {
    "use strict";
    // Check if data exists before loading dates into the datepicker
    if ($("body").data("testlistinstances") !== undefined) {
        // Generate a list of sorted valid dates to select from
        var testlistinstances = $("body").data("testlistinstances").test_list_instances;
        var datelist = Object.keys(testlistinstances).sort();

        // Initialize the datepicker
        $(".date").datepicker({
            format: dateformat,
            autoclose: true,
            beforeShowDay: function(date) {
                if ($.inArray(convertDate(date), datelist) !== -1) {
                    return {
                        classes: "btn-info"
                    };
                }
                return false;
            }
        });

        // Load the selected dates into the Test instance select box
        $(".date").datepicker().on("changeDate", function(e) {
            var date = convertDate(e.date);
            $("#testlistinstances").empty();
            $.each(testlistinstances[date], function(key, value) {
                $("#testlistinstances")
                    .append($("<option></option>")
                        .attr("value", value.id)
                        .text(key + 1 + ". " + value.work_completed));
            });
            $("#numtestlistinstances").html(testlistinstances[date].length);
            // Set the status of the prev / next buttons
            var currdate = datelist.indexOf($("#date").val());
            $("#dateprev").prop("disabled", (currdate === 0));
            $("#datenext").prop("disabled", (currdate === (datelist.length - 1)));
            // Load plot
            loadPlot();
        });

        // Select the most recent date
        $(".date").datepicker("setDate", datelist[datelist.length - 1]);

        function setupPrevNextDate() {
            $(".datenav").click(function() {
                var currdate = datelist.indexOf($("#date").val());
                var date = currdate;
                if ((this.id === "dateprev") && (!($(this).hasClass("disabled")))) {
                    date = ((currdate - 1) < 0) ? currdate : (currdate - 1);
                } else if ((this.id === "datenext") && (!($(this).hasClass("disabled")))) {
                    date = ((currdate + 1) >= datelist.length) ? currdate : (currdate + 1);
                }
                $(".date").datepicker("setUTCDate", parseDate(datelist[date]));

            });
        }

        // Setup the previous and next buttons
        setupPrevNextDate();
    }
}

/****************************************************/
function loadTestlistinstances() {
    "use strict";
    $.ajax({
        type: "get",
        url: "testlistinstance/",
        contentType: "application/json",
        dataType: "json",
        success: function(result) {
            $("body").data("testlistinstances", result);
            loadDates();
        },
        error: function(error) {
            if (typeof console !== "undefined") {
                console.log(error);
            }
        }
    });

}

/****************************************************/
function loadUnits() {
    "use strict";
    $.ajax({
        type: "get",
        url: "units/",
        contentType: "application/json",
        dataType: "json",
        success: function(result) {
            $("body").data("units", result);
            $("#units").empty();
            $.each($("body").data("units").units, function(key, value) {
                $("#units")
                    .append($("<option></option>")
                        .attr("value", key)
                        .text(value.name));
            });
            // Load testlistinstances
            loadTestlistinstances();
        },
        error: function(error) {
            if (typeof console !== "undefined") {
                console.log(error);
            }
        }
    });

}

/***************************************************/
function setPlotOptions() {
    "use strict";
    if ($("#plot-type").val() === "profile") {
        $("#plot-profile-options").show();
    } else {
        $("#plot-profile-options").hide();
    }
}
/**************************************************************************/
$(document).ready(function() {
    "use strict";
    $("#profile-plotcontainer, #instructions").hide();

    $("#plot-type-options").change(setPlotOptions);

    $(".plot-options").change(loadPlot);

    $("#gen-plot").click(loadPlot);
    $("#review-test-list").click(reviewTestList);


    setPlotOptions();
    loadUnits();

    $(this).keydown(function(e) {
        switch (e.which) {
            case 37:
                $("#dateprev").click();
                e.preventDefault();
                break;
            case 39:
                $("#datenext").click();
                e.preventDefault();
                break;
        }
    });

});
