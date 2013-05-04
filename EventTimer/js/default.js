/// <reference path="moment.js" />
// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    WinJS.Utilities.startLog();

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    var placeholder = "/images/spacer.png";
    var slides = [];
    var firstSlide = true;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            args.setPromise(WinJS.UI.processAll());
            ready();
        }
    };

    function ready() {
        setTimerValue();

        filesButton.addEventListener("click", function (e) {
            pickNewFiles();
            allControls.winControl.show();
        }, false);

        targetTime.winControl.addEventListener("change", function (e) {
            setTimerValue();
        }, false);

        timer.winControl.addEventListener("counterTick", function (t) {
            if ((t.value % slideDuration.value === 0) && (t.value !== 0)) {
                advanceSlide();
            }
        }, false);

        timer.winControl.addEventListener("countdownComplete", function (t) {
            if (slides.length <= 0) {
                currentSlide.src = placeholder;
            } else {
                currentSlide.src = slides[0];
            }
            WinJS.Utilities.addClass(timerContainer, "firstSlide");
        }, false);

    }

    function setTimerValue() {
        var timePicker = targetTime.winControl;
        var now = new Date();
        var target = new Date(now.getYear() + 1900, now.getMonth(), now.getDate(), timePicker.current.getHours(), timePicker.current.getMinutes(), timePicker.current.getSeconds());
        var duration = target - now;
        timer.winControl.initialCounterValue = Math.round(duration / 1000);
        timer.winControl.start(); // can be called repeatedly
    }

    function advanceSlide() {
        if (slides.length <= 0) {
            currentSlide.src = placeholder;
            return;
        }

        var currSlideIndex = slides.indexOf(currentSlide.src);

        if (currSlideIndex < 0) {
            currSlideIndex = 0;
        }

        if (!firstSlide) {
            currSlideIndex = (currSlideIndex + 1) % slides.length;
        }
        firstSlide = false;

        WinJS.UI.Animation.fadeOut([currentSlide, timerContainer]);
        currentSlide.src = slides[currSlideIndex];
        if (alwaysInCorner.winControl.checked) {
            WinJS.Utilities.removeClass(timerContainer, "firstSlide");
        } else {
            if (currSlideIndex === 0) {
                WinJS.Utilities.addClass(timerContainer, "firstSlide");
            } else {
                WinJS.Utilities.removeClass(timerContainer, "firstSlide");
            }
        }
        WinJS.UI.Animation.fadeIn([currentSlide, timerContainer]);
    }

    function pickNewFiles() {
        // Verify that we are currently not snapped, or that we can unsnap to open the picker
        var currentState = Windows.UI.ViewManagement.ApplicationView.value;
        if (currentState === Windows.UI.ViewManagement.ApplicationViewState.snapped &&
            !Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
            // Fail silently if we can't unsnap
            return;
        }

        // Create the picker object and set options
        var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
        openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
        openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
        // Users expect to have a filtered view of their folders depending on the scenario.
        // For example, when choosing a documents folder, restrict the filetypes to documents for your application.
        openPicker.fileTypeFilter.replaceAll([".png", ".jpg", ".jpeg"]);
        
        // Open the picker for the user to pick files
        openPicker.pickMultipleFilesAsync().then(function (files) {
            if (files.size > 0) {
                slides = [];
                firstSlide = true;
                // Application now has read/write access to the picked file(s)
                var outputString = "Picked files:\n";
                for (var i = 0; i < files.size; i++) {
                    slides.push(URL.createObjectURL(files[i]));
                    outputString = outputString + files[i].name + "\n";
                }

                WinJS.log && WinJS.log(outputString, "sample", "status");
            } else {
                // The picker was dismissed with no selected file
                WinJS.log && WinJS.log("Operation cancelled.", "sample", "status");
            }
        });

    }


    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    app.start();
})();
